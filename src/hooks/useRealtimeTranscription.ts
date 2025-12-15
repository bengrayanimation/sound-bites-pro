import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useRealtimeTranscription() {
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const transcriptionQueue = useRef<string[]>([]);
  const processingRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const processQueue = useCallback(async () => {
    if (processingRef.current || transcriptionQueue.current.length === 0) return;
    
    processingRef.current = true;
    const audioChunk = transcriptionQueue.current.shift();
    
    if (audioChunk) {
      try {
        // Extract mime type from base64 data URI
        const mimeMatch = audioChunk.match(/^data:(audio\/[^;]+)/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'audio/webm';
        
        const { data, error } = await supabase.functions.invoke('realtime-transcribe', {
          body: { audioBase64: audioChunk, mimeType }
        });
        
        if (data?.text && !error) {
          setLiveTranscript(prev => {
            const newText = data.text.trim();
            if (newText && !prev.endsWith(newText)) {
              return prev ? `${prev} ${newText}` : newText;
            }
            return prev;
          });
        }
      } catch (err) {
        console.error('Real-time transcription error:', err);
      }
    }
    
    processingRef.current = false;
  }, []);

  const addAudioChunk = useCallback((audioBase64: string) => {
    transcriptionQueue.current.push(audioBase64);
  }, []);

  const startTranscribing = useCallback(() => {
    setIsTranscribing(true);
    setLiveTranscript('');
    transcriptionQueue.current = [];
    
    // Process queue every 500ms
    intervalRef.current = setInterval(processQueue, 500);
  }, [processQueue]);

  const stopTranscribing = useCallback(() => {
    setIsTranscribing(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    // Process remaining items
    const processRemaining = async () => {
      while (transcriptionQueue.current.length > 0) {
        await processQueue();
      }
    };
    processRemaining();
  }, [processQueue]);

  const resetTranscript = useCallback(() => {
    setLiveTranscript('');
    transcriptionQueue.current = [];
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
