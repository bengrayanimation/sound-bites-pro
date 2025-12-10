import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Library } from 'lucide-react';
import { RecordButton } from '@/components/RecordButton';
import { Waveform } from '@/components/Waveform';
import { Timer } from '@/components/Timer';
import { PinnedRecordings } from '@/components/PinnedRecordings';
import { Paywall } from '@/components/Paywall';
import { Button } from '@/components/ui/button';
import { useRecordingStore } from '@/stores/recordingStore';
import { Recording } from '@/types/recording';
import { toast } from '@/hooks/use-toast';

export default function Home() {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  
  const { 
    recordings, 
    freeRecordingsLeft, 
    isPro, 
    addRecording, 
    decrementFreeRecordings,
    upgradeToPro 
  } = useRecordingStore();

  const pinnedRecordings = recordings.filter((r) => r.isPinned).slice(0, 3);

  const handleRecordToggle = useCallback(() => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      
      // Save recording
      const newRecording: Recording = {
        id: Date.now().toString(),
        title: `Recording ${new Date().toLocaleDateString('en-GB', { 
          day: 'numeric', 
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        })}`,
        duration: recordingDuration,
        createdAt: new Date(),
        isPinned: false,
        isTranscribed: false,
      };
      
      addRecording(newRecording);
      
      toast({
        title: 'Recording saved',
        description: `${newRecording.title} has been saved to your library.`,
      });
      
      // Navigate to the recording
      navigate(`/recording/${newRecording.id}`);
    } else {
      // Start recording
      if (!isPro && freeRecordingsLeft <= 0) {
        setShowPaywall(true);
        return;
      }
      
      if (!isPro) {
        decrementFreeRecordings();
      }
      
      setIsRecording(true);
      setRecordingDuration(0);
    }
  }, [isRecording, recordingDuration, isPro, freeRecordingsLeft, addRecording, decrementFreeRecordings, navigate]);

  const handleSelectRecording = (recording: Recording) => {
    navigate(`/recording/${recording.id}`);
  };

  const handleUpgrade = () => {
    upgradeToPro();
    setShowPaywall(false);
    toast({
      title: 'Welcome to Pro!',
      description: 'You now have unlimited access to all features.',
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4">
        <div className="w-11" /> {/* Spacer */}
        
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

        {/* Pinned recordings */}
        {!isRecording && (
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
              <Timer isRunning={isRecording} onTimeUpdate={setRecordingDuration} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Record button */}
        <RecordButton isRecording={isRecording} onToggle={handleRecordToggle} />
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
