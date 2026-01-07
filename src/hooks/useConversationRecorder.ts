import { useCallback, useEffect, useRef, useState } from "react";

interface ConversationRecorderState {
  isStreaming: boolean;
  duration: number;
  error: string | null;
}

/**
 * Conversation-mode recorder: streams short audio slices to a callback
 * without producing a final recording.
 */
export function useConversationRecorder(onAudioChunk: (audioBase64: string) => void) {
  const [state, setState] = useState<ConversationRecorderState>({
    isStreaming: false,
    duration: 0,
    error: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isStreamingRef = useRef(false);

  const blobToDataUrl = (blob: Blob) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read audio chunk"));
      reader.readAsDataURL(blob);
    });

  const start = useCallback(async () => {
    try {
      setState((p) => ({ ...p, error: null }));

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        },
      });

      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : MediaRecorder.isTypeSupported("audio/mp4")
            ? "audio/mp4"
            : "audio/wav";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      // Convert sequentially to avoid overlapping FileReader work.
      const queue: Blob[] = [];
      let converting = false;
      const drain = async () => {
        if (converting) return;
        converting = true;
        try {
          while (queue.length > 0 && isStreamingRef.current) {
            const next = queue.shift();
            if (!next) continue;
            const base64 = await blobToDataUrl(next);
            onAudioChunk(base64);
          }
        } finally {
          converting = false;
        }
      };

      mediaRecorder.ondataavailable = (e) => {
        if (!isStreamingRef.current) return;
        if (e.data?.size > 0) {
          queue.push(e.data);
          void drain();
        }
      };

      mediaRecorder.onstop = () => {
        // Nothing to finalize for conversation mode.
      };

      // Start with short slices for low-latency transcription
      mediaRecorder.start(1000);
      startTimeRef.current = Date.now();

      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setState((p) => ({ ...p, duration: elapsed }));
      }, 200);

      isStreamingRef.current = true;
      setState({ isStreaming: true, duration: 0, error: null });
    } catch (error) {
      console.error("Error starting conversation mode:", error);
      setState((p) => ({
        ...p,
        error: "Could not access microphone. Please check permissions.",
      }));
    }
  }, [onAudioChunk]);

  const stop = useCallback(() => {
    if (!isStreamingRef.current) return;
    isStreamingRef.current = false;

    try {
      mediaRecorderRef.current?.stop();
    } catch {
      // ignore
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    mediaRecorderRef.current = null;

    setState((p) => ({ ...p, isStreaming: false }));
  }, []);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return {
    ...state,
    start,
    stop,
  };
}
