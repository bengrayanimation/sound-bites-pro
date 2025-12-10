import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square } from 'lucide-react';

interface RecordButtonProps {
  isRecording: boolean;
  onToggle: () => void;
}

export function RecordButton({ isRecording, onToggle }: RecordButtonProps) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Pulse rings when recording */}
      <AnimatePresence>
        {isRecording && (
          <>
            <motion.div
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 1.6, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute w-32 h-32 rounded-full bg-recording/30"
            />
            <motion.div
              initial={{ scale: 1, opacity: 0.4 }}
              animate={{ scale: 1.4, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              className="absolute w-32 h-32 rounded-full bg-recording/20"
            />
          </>
        )}
      </AnimatePresence>

      {/* Main button */}
      <motion.button
        onClick={onToggle}
        whileTap={{ scale: 0.95 }}
        className={`
          relative z-10 w-32 h-32 rounded-full
          flex items-center justify-center
          transition-all duration-300
          ${isRecording 
            ? 'bg-recording shadow-[0_8px_40px_-8px_hsl(var(--recording)/0.5)]' 
            : 'bg-primary shadow-record hover:shadow-[0_12px_50px_-8px_hsl(var(--primary)/0.5)]'
          }
        `}
      >
        <AnimatePresence mode="wait">
          {isRecording ? (
            <motion.div
              key="stop"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Square className="w-10 h-10 text-primary-foreground fill-current" />
            </motion.div>
          ) : (
            <motion.div
              key="mic"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Mic className="w-12 h-12 text-primary-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Instruction text */}
      <motion.p
        initial={false}
        animate={{ opacity: 1 }}
        className="absolute -bottom-12 text-sm text-muted-foreground font-medium"
      >
        {isRecording ? 'Tap to stop' : 'Tap to record'}
      </motion.p>
    </div>
  );
}
