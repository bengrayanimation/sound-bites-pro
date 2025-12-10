import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { TranscriptSegment } from '@/types/recording';
import { formatTime } from '@/lib/formatters';

interface TranscriptViewProps {
  transcript?: TranscriptSegment[];
  onTimeClick?: (time: number) => void;
}

export function TranscriptView({ transcript, onTimeClick }: TranscriptViewProps) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!transcript || transcript.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-foreground mb-2">No transcript yet</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Transcription will be generated automatically after recording
        </p>
      </div>
    );
  }

  const filteredTranscript = transcript.filter((segment) =>
    segment.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search transcript..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Transcript segments */}
      <div className="space-y-1">
        {filteredTranscript.map((segment, index) => (
          <motion.button
            key={segment.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.02 }}
            onClick={() => onTimeClick?.(segment.startTime)}
            className="w-full flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left group"
          >
            <span className="text-xs font-mono text-primary font-medium min-w-[48px]">
              {formatTime(segment.startTime)}
            </span>
            <p className="text-sm text-foreground flex-1 group-hover:text-primary transition-colors">
              {segment.text}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
