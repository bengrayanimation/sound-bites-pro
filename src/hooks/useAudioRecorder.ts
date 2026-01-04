import { useState, useRef, useCallback } from 'react';

interface AudioRecorderState {
  isRecording: boolean;
  audioBlob: Blob | null;
  audioUrl: string | null;
  audioBase64: string | null;
  duration: number;
  error: string | null;
}

export function useAudioRecorder(onAudioChunk?: (audioBase64: string) => void) {
  const [state, setState] = useState<AudioRecorderState>({
    isRecording: false,
    audioBlob: null,
    audioUrl: null,
    audioBase64: null,
    duration: 0,
    error: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRecordingRef = useRef<boolean>(false);

  const startRecording = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null }));
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        }
      });

      streamRef.current = stream;
      chunksRef.current = [];

      // Try to use webm format, fallback to other formats
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/wav';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      // For real-time transcription chunks: send each MediaRecorder slice as-is (valid container)
      const rtConvertQueue: Blob[] = [];
      let rtConverting = false;

      const blobToDataUrl = (blob: Blob) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read audio chunk'));
        reader.readAsDataURL(blob);
      });

      const drainRealtimeQueue = async () => {
        if (!onAudioChunk || rtConverting) return;
        rtConverting = true;
        try {
          while (rtConvertQueue.length > 0 && isRecordingRef.current) {
            const next = rtConvertQueue.shift();
            if (!next) continue;
            const base64 = await blobToDataUrl(next);
            onAudioChunk(base64);
          }
        } catch (e) {
          console.error('Error converting realtime audio chunk:', e);
        } finally {
          rtConverting = false;
        }
      };

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);

          // Push each slice for realtime transcription (about 1 line at a time)
          if (onAudioChunk && isRecordingRef.current) {
            rtConvertQueue.push(e.data);
            void drainRealtimeQueue();
          }
        }
      };

      mediaRecorder.onstop = async () => {
        // Calculate final duration precisely
        const finalDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setState(prev => ({
            ...prev,
            audioBlob,
            audioUrl,
            audioBase64: base64,
            duration: finalDuration,
            isRecording: false,
          }));
        };
        reader.readAsDataURL(audioBlob);
      };

      // 1 second slices are a good balance for "as spoken" updates
      mediaRecorder.start(1000);
      startTimeRef.current = Date.now();

      // Update duration every 100ms for more accurate display
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setState(prev => ({ ...prev, duration: elapsed }));
      }, 100);

      // No separate batching interval needed (we stream slices from ondataavailable)
      if (chunkIntervalRef.current) {
        clearInterval(chunkIntervalRef.current);
        chunkIntervalRef.current = null;
      }

      isRecordingRef.current = true;
      setState(prev => ({ 
        ...prev, 
        isRecording: true, 
        audioBlob: null, 
        audioUrl: null, 
        audioBase64: null,
        duration: 0 
      }));

    } catch (error) {
      console.error('Error starting recording:', error);
      setState(prev => ({
        ...prev,
        error: 'Could not access microphone. Please check permissions.',
      }));
    }
  }, [onAudioChunk]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecordingRef.current) {
      isRecordingRef.current = false;
      
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.error('Error stopping recorder:', e);
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (chunkIntervalRef.current) {
        clearInterval(chunkIntervalRef.current);
        chunkIntervalRef.current = null;
      }
    }
  }, []);

  const reset = useCallback(() => {
    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl);
    }
    setState({
      isRecording: false,
      audioBlob: null,
      audioUrl: null,
      audioBase64: null,
      duration: 0,
      error: null,
    });
    chunksRef.current = [];
  }, [state.audioUrl]);

  return {
    ...state,
    startRecording,
    stopRecording,
    reset,
  };
}
