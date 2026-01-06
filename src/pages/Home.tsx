import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Library, Loader2, Mic, HardDrive } from 'lucide-react';
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
import { usePermissions } from '@/hooks/usePermissions';
import { Recording } from '@/types/recording';
import { toast } from 'sonner';

export default function Home() {
  const navigate = useNavigate();
  const [showPaywall, setShowPaywall] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPermissionsPrompt, setShowPermissionsPrompt] = useState(false);

  const {
    permissions,
    isRequesting: isRequestingPermissions,
    requestAllPermissions,
  } = usePermissions();

  // Check if we need to show permissions prompt on mount
  useEffect(() => {
    if (permissions.microphone === 'prompt' || permissions.microphone === 'unknown') {
      setShowPermissionsPrompt(true);
    }
  }, [permissions.microphone]);
  
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
    liveSegments,
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

  const handleRequestPermissions = useCallback(async () => {
    const granted = await requestAllPermissions();
    if (granted) {
      setShowPermissionsPrompt(false);
      toast.success('Permissions granted! You can now record.');
    } else {
      toast.error('Microphone access is required for recording.');
    }
  }, [requestAllPermissions]);

  const handleRecordToggle = useCallback(async () => {
    // Check permissions first
    if (permissions.microphone === 'denied') {
      toast.error('Microphone access denied. Please enable it in your device settings.');
      return;
    }

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
  }, [isRecording, isPro, freeRecordingsLeft, startRecording, stopRecording, decrementFreeRecordings, resetTranscript, stopTranscribing, permissions.microphone]);

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
              <div className="bg-muted/50 rounded-2xl p-5 min-h-[140px] max-h-[280px] overflow-y-auto">
                <p className="text-sm text-muted-foreground mb-3 font-medium">Live Transcription</p>
                <div className="text-foreground text-2xl leading-relaxed font-medium space-y-2">
                  {liveSegments.length > 0 ? (
                    liveSegments.map((seg, idx) => (
                      <span key={idx} className="inline">
                        <span
                          className={`font-bold mr-1 ${
                            seg.speaker === 'A'
                              ? 'text-primary'
                              : seg.speaker === 'B'
                              ? 'text-green-500'
                              : seg.speaker === 'C'
                              ? 'text-orange-500'
                              : 'text-purple-500'
                          }`}
                        >
                          {seg.speaker}:
                        </span>
                        <span>{seg.text} </span>
                      </span>
                    ))
                  ) : (
                    <span className="text-muted-foreground italic flex items-center gap-2 text-lg">
                      <span className="inline-block w-2 h-2 bg-primary rounded-full animate-pulse" />
                      Listening...
                    </span>
                  )}
                </div>
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

      {/* Permissions prompt modal */}
      <AnimatePresence>
        {showPermissionsPrompt && permissions.microphone !== 'granted' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-3xl p-8 max-w-sm w-full shadow-xl"
            >
              <div className="flex flex-col items-center text-center gap-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Mic className="w-8 h-8 text-primary" />
                </div>
                
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    Permissions Required
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    SoundBites needs access to your microphone to record audio, and storage to save your recordings.
                  </p>
                </div>

                <div className="flex flex-col gap-3 w-full">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                    <Mic className="w-5 h-5 text-primary" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">Microphone</p>
                      <p className="text-xs text-muted-foreground">Record voice memos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                    <HardDrive className="w-5 h-5 text-primary" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">Storage</p>
                      <p className="text-xs text-muted-foreground">Save recordings locally</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 w-full">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowPermissionsPrompt(false)}
                  >
                    Later
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleRequestPermissions}
                    disabled={isRequestingPermissions}
                  >
                    {isRequestingPermissions ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Allow Access'
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
