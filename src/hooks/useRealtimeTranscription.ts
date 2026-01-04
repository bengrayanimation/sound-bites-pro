import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Minimal typings for Web Speech API
interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((ev: any) => void) | null;
  onerror: ((ev: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechCtor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechCtor | null {
  const w = window as any;
  return (w.SpeechRecognition || w.webkitSpeechRecognition || null) as SpeechCtor | null;
}

export function useRealtimeTranscription() {
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Backend fallback queue
  const transcriptionQueue = useRef<string[]>([]);
  const processingRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastAppendedRef = useRef<string>('');

  // Browser speech recognition (preferred for true realtime)
  const speechRef = useRef<SpeechRecognitionLike | null>(null);
  const usingBrowserSpeechRef = useRef(false);
  const finalTranscriptRef = useRef('');

  const processQueue = useCallback(async () => {
    if (processingRef.current || transcriptionQueue.current.length === 0) return;

    processingRef.current = true;
    const audioChunk = transcriptionQueue.current.shift();

    if (audioChunk) {
      try {
        const mimeMatch = audioChunk.match(/^data:(audio\/[^;]+)/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'audio/webm';

        const { data, error } = await supabase.functions.invoke('realtime-transcribe', {
          body: { audioBase64: audioChunk, mimeType },
        });

        if (error) {
          console.error('Real-time transcription function error:', error);
        }

        const newText = (data?.text || '').trim();
        if (newText && newText !== lastAppendedRef.current) {
          lastAppendedRef.current = newText;
          setLiveTranscript((prev) => (prev ? `${prev} ${newText}` : newText));
        }
      } catch (err) {
        console.error('Real-time transcription error:', err);
      }
    }

    processingRef.current = false;
  }, []);

  const addAudioChunk = useCallback((audioBase64: string) => {
    // If browser speech recognition is running, ignore audio chunks
    if (usingBrowserSpeechRef.current) return;
    transcriptionQueue.current.push(audioBase64);
  }, []);

  const startBrowserSpeech = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return false;

    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    usingBrowserSpeechRef.current = true;
    speechRef.current = rec;
    finalTranscriptRef.current = '';

    rec.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const t = (res?.[0]?.transcript || '').trim();
        if (!t) continue;
        if (res.isFinal) {
          finalTranscriptRef.current = finalTranscriptRef.current
            ? `${finalTranscriptRef.current} ${t}`
            : t;
        } else {
          interim = interim ? `${interim} ${t}` : t;
        }
      }

      const combined = [finalTranscriptRef.current, interim].filter(Boolean).join(' ').trim();
      setLiveTranscript(combined);
    };

    rec.onerror = (e: any) => {
      console.error('SpeechRecognition error:', e);
    };

    rec.onend = () => {
      // If still transcribing, restart (some browsers stop after pauses)
      if (isTranscribing) {
        try {
          rec.start();
        } catch {
          // ignore
        }
      }
    };

    try {
      rec.start();
      return true;
    } catch (e) {
      console.error('Failed to start SpeechRecognition:', e);
      usingBrowserSpeechRef.current = false;
      speechRef.current = null;
      return false;
    }
  }, [isTranscribing]);

  const stopBrowserSpeech = useCallback(() => {
    try {
      speechRef.current?.stop();
    } catch {
      // ignore
    }
    speechRef.current = null;
    usingBrowserSpeechRef.current = false;
  }, []);

  const startTranscribing = useCallback(() => {
    setIsTranscribing(true);
    setLiveTranscript('');
    transcriptionQueue.current = [];
    lastAppendedRef.current = '';

    // Prefer true realtime via Web Speech API
    const startedBrowser = startBrowserSpeech();
    if (startedBrowser) return;

    // Fallback: backend chunk transcription
    intervalRef.current = setInterval(processQueue, 300);
  }, [processQueue, startBrowserSpeech]);

  const stopTranscribing = useCallback(() => {
    setIsTranscribing(false);

    stopBrowserSpeech();

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Process remaining backend items
    const processRemaining = async () => {
      while (transcriptionQueue.current.length > 0) {
        await processQueue();
      }
    };
    processRemaining();
  }, [processQueue, stopBrowserSpeech]);

  const resetTranscript = useCallback(() => {
    setLiveTranscript('');
    transcriptionQueue.current = [];
    lastAppendedRef.current = '';
    finalTranscriptRef.current = '';
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      try {
        speechRef.current?.stop();
      } catch {
        // ignore
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    liveTranscript,
    isTranscribing,
    addAudioChunk,
    startTranscribing,
    stopTranscribing,
    resetTranscript,
  };
}
