import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Library, Loader2 } from 'lucide-react';
import { RecordButton } from '@/components/RecordButton';
import { Waveform } from '@/components/Waveform';
import { Timer } from '@/components/Timer';
import { PinnedRecordings } from '@/components/PinnedRecordings';
import { Paywall } from '@/components/Paywall';
import { Button } from '@/components/ui/button';
import { useRecordingStore, createRecordingTemplate } from '@/stores/recordingStore';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useTranscription } from '@/hooks/useTranscription';
import { useRealtimeTranscription } from '@/hooks/useRealtimeTranscription';
import { Recording } from '@/types/recording';
import { toast } from 'sonner';

export default function Home() {
  const navigate = useNavigate();
  const [showPaywall, setShowPaywall] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { 
    recordings, 
    freeRecordingsLeft, 
    isPro, 
    addRecording, 
    updateRecording,
    decrementFreeRecordings,
    upgradeToPro 
  } = useRecordingStore();

  const {
    liveTranscript,
    addAudioChunk,
    startTranscribing,
    stopTranscribing,
    resetTranscript,
  } = useRealtimeTranscription();

  const {
    isRecording,
    audioBase64,
    duration,
    error: recorderError,
    startRecording,
    stopRecording,
    reset: resetRecorder
  } = useAudioRecorder(addAudioChunk);

  const {
    processRecording,
    isProcessing: isTranscribing,
    progress,
    error: transcriptionError
  } = useTranscription();

  const pinnedRecordings = recordings.filter((r) => r.isPinned).slice(0, 3);

  // Handle recording errors
  useEffect(() => {
    if (recorderError) {
      toast.error(recorderError);
    }
  }, [recorderError]);

  useEffect(() => {
    if (transcriptionError) {
      toast.error(transcriptionError);
    }
  }, [transcriptionError]);

  // Start/stop realtime transcription when recording starts/stops
  useEffect(() => {
    if (isRecording) {
      resetTranscript();
      startTranscribing();
    } else {
      stopTranscribing();
    }
  }, [isRecording, startTranscribing, stopTranscribing, resetTranscript]);

  // Process audio when recording stops
  useEffect(() => {
    if (!isRecording && audioBase64 && duration > 0 && !isProcessing) {
      processAudio();
    }
  }, [isRecording, audioBase64]);

  const processAudio = async () => {
    if (!audioBase64 || duration === 0) return;
    
    setIsProcessing(true);
    
    const newRecording: Recording = {
      id: Date.now().toString(),
      title: `Recording ${new Date().toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })}`,
      duration,
      createdAt: new Date(),
      isPinned: false,
      isTranscribed: false,
      audioUrl: audioBase64,
    };
    
    addRecording(newRecording);
    
    toast.loading('Transcribing your recording...', { id: 'transcription' });
    
    try {
      const result = await processRecording(audioBase64, duration, newRecording.title);
      
      if (result) {
        updateRecording(newRecording.id, {
          isTranscribed: true,
          transcript: result.transcript,
          chapters: result.chapters,
          summary: result.summary,
          quoteCards: result.quoteCards,
          highlightReel: result.highlightReel,
        });
        
        toast.success('Recording transcribed and analyzed!', { id: 'transcription' });
      } else {
        // Use template content as fallback
        const template = createRecordingTemplate(
          newRecording.id,
          newRecording.title,
          duration,
          newRecording.createdAt
        );
        updateRecording(newRecording.id, {
          isTranscribed: true,
          transcript: template.transcript,
          chapters: template.chapters,
          summary: template.summary,
          quoteCards: template.quoteCards,
          highlightReel: template.highlightReel,
        });
        
        toast.success('Recording saved with demo content', { id: 'transcription' });
      }
      
      navigate(`/recording/${newRecording.id}`);
    } catch (error) {
      console.error('Processing error:', error);
      toast.error('Failed to process recording', { id: 'transcription' });
    } finally {
      setIsProcessing(false);
      resetTranscript();
      resetRecorder();
    }
  };

  const handleRecordToggle = useCallback(async () => {
    if (isRecording) {
      stopRecording();
      stopTranscribing();
    } else {
      if (!isPro && freeRecordingsLeft <= 0) {
        setShowPaywall(true);
        return;
      }
      
      if (!isPro) {
        decrementFreeRecordings();
      }
      
      resetTranscript();
      await startRecording();
    }
  }, [isRecording, isPro, freeRecordingsLeft, startRecording, stopRecording, decrementFreeRecordings, resetTranscript, stopTranscribing]);

  const handleSelectRecording = (recording: Recording) => {
    navigate(`/recording/${recording.id}`);
  };

  const handleUpgrade = () => {
    upgradeToPro();
    setShowPaywall(false);
    toast.success('Welcome to Pro! You now have unlimited access to all features.');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4">
        <div className="w-11" />
        
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-bold text-foreground"
        >
          SoundBites
        </motion.h1>
        
        <Button 
          variant="icon" 
          size="icon"
          onClick={() => navigate('/settings')}
        >
          <Settings className="w-5 h-5 text-muted-foreground" />
        </Button>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
        {/* Free recordings indicator */}
        {!isPro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <span className="text-sm text-muted-foreground">
              {freeRecordingsLeft} free recording{freeRecordingsLeft !== 1 ? 's' : ''} left
            </span>
          </motion.div>
        )}

        {/* Processing indicator */}
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 flex flex-col items-center gap-3"
          >
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="text-sm text-muted-foreground">
              {isTranscribing ? 'Transcribing...' : 'Processing recording...'}
            </span>
            <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}

        {/* Pinned recordings */}
        {!isRecording && !isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 w-full flex justify-center"
          >
            <PinnedRecordings 
              recordings={pinnedRecordings}
              onSelect={handleSelectRecording}
            />
          </motion.div>
        )}

        {/* Waveform and timer during recording */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mb-8 flex flex-col items-center gap-6"
            >
              <Waveform isAnimating={isRecording} barCount={12} />
              <Timer seconds={duration} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Record button */}
        {!isProcessing && (
          <RecordButton isRecording={isRecording} onToggle={handleRecordToggle} />
        )}

        {/* Live transcription display during recording */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-8 w-full max-w-md px-4"
            >
              <div className="bg-muted/50 rounded-2xl p-4 min-h-[100px] max-h-[200px] overflow-y-auto">
                <p className="text-sm text-muted-foreground mb-2 font-medium">Live Transcription</p>
                <p className="text-foreground text-sm leading-relaxed">
                  {liveTranscript || (
                    <span className="text-muted-foreground italic flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-primary rounded-full animate-pulse" />
                      Listening...
                    </span>
                  )}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 p-4 pb-8 flex justify-end">
        <Button
          variant="outline"
          onClick={() => navigate('/library')}
          className="gap-2"
        >
          <Library className="w-4 h-4" />
          Library
        </Button>
      </nav>

      {/* Paywall modal */}
      <AnimatePresence>
        {showPaywall && (
          <Paywall 
            onClose={() => setShowPaywall(false)}
            onUpgrade={handleUpgrade}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
