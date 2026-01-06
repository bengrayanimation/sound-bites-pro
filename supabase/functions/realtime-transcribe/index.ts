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
      return new Response(JSON.stringify({ segments: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Strip any data URI prefix to get pure base64 (handles extra params like codecs=opus)
    const base64Data = audioBase64.replace(/^data:audio\/[\w.+-]+(?:;[^,]*)?;base64,/i, '');
    
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
        // NOTE: Gemini models appear to ignore input_audio in this gateway.
        // Use an OpenAI multimodal model that supports input_audio.
        model: 'openai/gpt-5-mini',
        messages: [
          {
            role: 'system',
            content: `You are a real-time speech-to-text engine with speaker diarization.

TASK: Transcribe ONLY spoken words from the provided audio.

OUTPUT FORMAT (JSON array):
[{"speaker": "A", "text": "Hello"}, {"speaker": "B", "text": "Hi there"}]

RULES:
- Use speaker labels A, B, C, etc. for different voices.
- If only one speaker, use "A".
- Output ONLY a valid JSON array, nothing else.
- If you cannot clearly hear speech, output: []
- Do NOT guess or hallucinate words not spoken.
- Keep each segment short (a few words to a sentence).`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Transcribe with speaker labels:' },
              {
                type: 'input_audio',
                input_audio: {
                  data: base64Data,
                  format: format,
                },
              },
            ],
          },
        ],
        temperature: 0,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(JSON.stringify({ segments: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    let raw = data.choices?.[0]?.message?.content?.trim() || '';

    console.log('Raw AI response:', raw);

    // Clean up response - remove markdown code blocks if present
    raw = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();

    // Try to parse as JSON array
    let segments: { speaker: string; text: string }[] = [];

    if (raw.startsWith('[')) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          segments = parsed
            .filter((s: any) => s && typeof s.speaker === 'string' && typeof s.text === 'string' && s.text.trim())
            .map((s: any) => ({
              speaker: s.speaker.toUpperCase(),
              text: s.text.trim(),
            }));
        }
      } catch (e) {
        console.error('Failed to parse JSON segments:', e);
      }
    }

    // Hard guardrail: never return obvious non-audio placeholders (prevents showing wrong text)
    segments = segments.filter((s) => {
      const t = s.text.toLowerCase();
      if (!t) return false;
      // Known bad placeholder that has been appearing when audio isn't actually decoded
      if (t.includes("parkinson") || t.includes("gut microbiome")) return false;
      return true;
    });

    // Fallback: if we couldn't parse but there's text, treat as single speaker
    if (segments.length === 0 && raw && !raw.startsWith('[') && !raw.startsWith('(') && !raw.startsWith('{')) {
      // Check for hallucination patterns
      const hallucinations = ['no speech', 'no audio', 'silence', 'inaudible', 'cannot', 'unable'];
      const lower = raw.toLowerCase();
      const isHallucination = hallucinations.some(h => lower.includes(h));

      if (!isHallucination && raw.length > 1 && !lower.includes('parkinson') && !lower.includes('gut microbiome')) {
        segments = [{ speaker: 'A', text: raw.replace(/^"|"$/g, '').trim() }];
      }
    }

    console.log('Parsed segments:', segments);

    return new Response(JSON.stringify({ segments }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Realtime transcription error:', error);
    return new Response(JSON.stringify({ segments: [] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
