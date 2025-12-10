import { motion } from 'framer-motion';
import { Play, Pin } from 'lucide-react';
import { Recording } from '@/types/recording';
import { formatDuration } from '@/lib/formatters';

interface PinnedRecordingsProps {
  recordings: Recording[];
  onSelect: (recording: Recording) => void;
}

export function PinnedRecordings({ recordings, onSelect }: PinnedRecordingsProps) {
  if (recordings.length === 0) return null;

  return (
    <div className="w-full max-w-sm">
      <div className="flex items-center gap-2 mb-3">
        <Pin className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Pinned
        </span>
      </div>
      
      <div className="space-y-2">
        {recordings.slice(0, 3).map((recording, index) => (
          <motion.button
            key={recording.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect(recording)}
            className="w-full flex items-center gap-3 p-3 bg-card rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-soft transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Play className="w-4 h-4 text-primary fill-primary" />
            </div>
            
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {recording.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDuration(recording.duration)}
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
