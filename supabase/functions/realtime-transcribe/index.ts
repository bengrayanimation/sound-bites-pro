import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audioBase64 } = await req.json();
    
    if (!audioBase64) {
      console.log('No audio data received');
      return new Response(JSON.stringify({ text: '' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Processing audio chunk for real-time transcription...');

    // Use Gemini with inline audio data for transcription
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a precise real-time audio transcription system. Your task is to transcribe spoken words from audio chunks accurately.

RULES:
- Output ONLY the exact words spoken, nothing else
- Do not add punctuation unless clearly indicated by speech patterns
- Do not add descriptions, commentary, or metadata
- If there is no speech or audio is unclear, output exactly: [silence]
- Transcribe in the language being spoken
- Keep transcription as a single flowing line of text`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Transcribe the speech in this audio clip. Output only the spoken words:'
              },
              {
                type: 'input_audio',
                input_audio: {
                  data: audioBase64.replace(/^data:audio\/[^;]+;base64,/, ''),
                  format: 'wav'
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(JSON.stringify({ text: '' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    let text = data.choices?.[0]?.message?.content?.trim() || '';
    
    // Filter out silence markers and empty responses
    if (text === '[silence]' || text.toLowerCase().includes('no speech') || text.toLowerCase().includes('no audio')) {
      text = '';
    }
    
    console.log('Transcribed text:', text);

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Realtime transcription error:', error);
    return new Response(JSON.stringify({ text: '' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
