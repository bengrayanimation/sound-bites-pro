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

  // Browser speech recognition (attempted for true realtime)
  const speechRef = useRef<SpeechRecognitionLike | null>(null);
  const finalTranscriptRef = useRef('');
  const browserAttemptActiveRef = useRef(false);
  const browserHasResultRef = useRef(false);
  const browserFallbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  const stopBackendPolling = useCallback(() => {
    if (!intervalRef.current) return;
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

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


  const startBackendPolling = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(processQueue, 250);
  }, [processQueue]);


  const addAudioChunk = useCallback((audioBase64: string) => {
    // IMPORTANT:
    // - When we *attempt* browser speech recognition, we still buffer audio chunks.
    // - If browser speech never produces results (common in Android WebViews), we can instantly
    //   switch to backend transcription and already have chunks queued.
    transcriptionQueue.current.push(audioBase64);
  }, []);

  const startBrowserSpeech = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return false;

    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    speechRef.current = rec;
    finalTranscriptRef.current = '';
    browserAttemptActiveRef.current = true;
    browserHasResultRef.current = false;

    // If we get no results quickly, fall back automatically.
    if (browserFallbackTimerRef.current) clearTimeout(browserFallbackTimerRef.current);
    browserFallbackTimerRef.current = setTimeout(() => {
      if (!browserHasResultRef.current && isTranscribing) {
        console.warn('SpeechRecognition produced no results; falling back to backend realtime transcription.');
        try {
          rec.stop();
        } catch {
          // ignore
        }
        speechRef.current = null;
        browserAttemptActiveRef.current = false;
        startBackendPolling();
      }
    }, 1800);

    rec.onresult = (event: any) => {
      browserHasResultRef.current = true;
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const t = (res?.[0]?.transcript || '').trim();
        if (!t) continue;
        if (res.isFinal) {
          finalTranscriptRef.current = finalTranscriptRef.current ? `${finalTranscriptRef.current} ${t}` : t;
        } else {
          interim = interim ? `${interim} ${t}` : t;
        }
      }

      const combined = [finalTranscriptRef.current, interim].filter(Boolean).join(' ').trim();
      setLiveTranscript(combined);

      // If browser speech works, stop backend polling to save requests.
      stopBackendPolling();
      // Clear queued backend chunks so we don't append duplicate text later.
      transcriptionQueue.current = [];
      lastAppendedRef.current = '';
    };

    rec.onerror = (e: any) => {
      console.error('SpeechRecognition error:', e);
      browserAttemptActiveRef.current = false;
      // Fall back immediately
      if (isTranscribing) startBackendPolling();
    };

    rec.onend = () => {
      if (!isTranscribing) return;

      // If speech has never yielded results, we are likely in a WebView that doesn't support it.
      if (!browserHasResultRef.current) {
        browserAttemptActiveRef.current = false;
        startBackendPolling();
        return;
      }

      // Some browsers stop after pauses; restart.
      try {
        rec.start();
      } catch {
        // ignore
      }
    };

    try {
      rec.start();
      return true;
    } catch (e) {
      console.error('Failed to start SpeechRecognition:', e);
      speechRef.current = null;
      browserAttemptActiveRef.current = false;
      return false;
    }
  }, [isTranscribing, startBackendPolling, stopBackendPolling]);

  const stopBrowserSpeech = useCallback(() => {
    if (browserFallbackTimerRef.current) {
      clearTimeout(browserFallbackTimerRef.current);
      browserFallbackTimerRef.current = null;
    }

    try {
      speechRef.current?.stop();
    } catch {
      // ignore
    }
    speechRef.current = null;
    browserAttemptActiveRef.current = false;
    browserHasResultRef.current = false;
  }, []);

  const startTranscribing = useCallback(() => {
    setIsTranscribing(true);
    setLiveTranscript('');
    transcriptionQueue.current = [];
    lastAppendedRef.current = '';

    stopBackendPolling();

    const startedBrowser = startBrowserSpeech();
    if (!startedBrowser) {
      startBackendPolling();
    }
  }, [startBrowserSpeech, startBackendPolling, stopBackendPolling]);

  const stopTranscribing = useCallback(() => {
    setIsTranscribing(false);

    stopBrowserSpeech();
    stopBackendPolling();

    // Process any remaining backend items quickly once
    const processRemaining = async () => {
      while (transcriptionQueue.current.length > 0) {
        await processQueue();
      }
    };
    void processRemaining();
  }, [processQueue, stopBackendPolling, stopBrowserSpeech]);

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
      if (browserFallbackTimerRef.current) clearTimeout(browserFallbackTimerRef.current);
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
