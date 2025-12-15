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
    const { audioBase64, mimeType } = await req.json();
    
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

    // Strip the data URI prefix to get pure base64
    const base64Data = audioBase64.replace(/^data:audio\/[^;]+;(codecs=[^;]+;)?base64,/, '');
    
    // Determine audio format from mime type
    let format = 'wav';
    if (mimeType?.includes('webm')) {
      format = 'webm';
    } else if (mimeType?.includes('mp4') || mimeType?.includes('m4a')) {
      format = 'mp4';
    } else if (mimeType?.includes('ogg')) {
      format = 'ogg';
    }

    console.log('Processing audio chunk, format:', format, 'data length:', base64Data.length);

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
            content: `You are a real-time speech transcription system. Transcribe ONLY the spoken words from the audio. Output nothing if silent or unclear. No punctuation, no commentary, no brackets, no descriptions. Just the raw spoken words.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Transcribe:'
              },
              {
                type: 'input_audio',
                input_audio: {
                  data: base64Data,
                  format: format
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
    
    // Filter out non-speech responses
    if (text.startsWith('[') || text.toLowerCase().includes('silence') || text.toLowerCase().includes('no speech') || text.toLowerCase().includes('no audio') || text.toLowerCase().includes('inaudible')) {
      text = '';
    }
    
    console.log('Transcribed:', text);

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
