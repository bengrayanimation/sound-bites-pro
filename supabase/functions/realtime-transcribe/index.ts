import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function stripDataUrlPrefix(dataUrl: string) {
  // Handles: data:audio/webm;codecs=opus;base64,AAAA
  return dataUrl.replace(/^data:audio\/[\w.+-]+(?:;[^,]*)?;base64,/i, "");
}

function base64ToBytes(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audioBase64, mimeType } = await req.json();

    if (!audioBase64) {
      return new Response(JSON.stringify({ segments: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Convert data URL -> raw bytes
    const base64Data = stripDataUrlPrefix(audioBase64);
    const bytes = base64ToBytes(base64Data);

    // Best-effort filename for the transcription endpoint
    const ext = mimeType?.includes("webm") ? "webm" : mimeType?.includes("mp4") ? "mp4" : mimeType?.includes("ogg") ? "ogg" : "wav";

    const form = new FormData();
    form.append("file", new Blob([bytes], { type: mimeType || `audio/${ext}` }), `audio.${ext}`);
    form.append("model", "whisper-1");

    // Use the audio transcription endpoint so we ONLY ever return what is actually spoken.
    const response = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: form,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Transcription endpoint error:", response.status, errorText);
      return new Response(JSON.stringify({ segments: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const text = (result?.text || "").trim();

    // Live diarization "approx" isn't reliably possible from 1s chunks without a dedicated diarization model.
    // For realtime correctness, return a single-speaker segment.
    const segments = text ? [{ speaker: "A", text }] : [];

    return new Response(JSON.stringify({ segments }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Realtime transcription error:", error);
    return new Response(JSON.stringify({ segments: [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

