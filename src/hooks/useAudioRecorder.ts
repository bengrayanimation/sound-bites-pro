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

      // For real-time transcription chunks
      let realtimeChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
          realtimeChunks.push(e.data);
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

      mediaRecorder.start(1000); // Collect data every second
      startTimeRef.current = Date.now();

      // Update duration every 100ms for more accurate display
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setState(prev => ({ ...prev, duration: elapsed }));
      }, 100);

      // Send audio chunks for real-time transcription every 2 seconds (faster feedback)
      if (onAudioChunk) {
        chunkIntervalRef.current = setInterval(async () => {
          if (realtimeChunks.length > 0) {
            const chunkBlob = new Blob(realtimeChunks, { type: mimeType });
            realtimeChunks = []; // Clear for next batch
            
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64 = reader.result as string;
              onAudioChunk(base64);
            };
            reader.readAsDataURL(chunkBlob);
          }
        }, 2000);
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
