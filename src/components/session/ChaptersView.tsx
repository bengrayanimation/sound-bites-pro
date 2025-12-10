import { motion } from 'framer-motion';
import { BookOpen, Quote } from 'lucide-react';
import { Chapter } from '@/types/recording';
import { formatTime } from '@/lib/formatters';

interface ChaptersViewProps {
  chapters?: Chapter[];
  onTimeClick?: (time: number) => void;
}

export function ChaptersView({ chapters, onTimeClick }: ChaptersViewProps) {
  if (!chapters || chapters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <BookOpen className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-foreground mb-2">No chapters yet</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          AI-generated chapters will appear here after transcription
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {chapters.map((chapter, index) => (
        <motion.div
          key={chapter.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-card border border-border rounded-xl p-4 space-y-3"
        >
          <button
            onClick={() => onTimeClick?.(chapter.startTime)}
            className="flex items-start gap-3 w-full text-left group"
          >
            <span className="text-xs font-mono text-primary font-medium mt-0.5">
              {formatTime(chapter.startTime)}
            </span>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {chapter.title}
              </h3>
            </div>
          </button>

          {chapter.bullets.length > 0 && (
            <ul className="space-y-1.5 pl-14">
              {chapter.bullets.map((bullet, i) => (
                <li key={i} className="text-sm text-muted-foreground flex gap-2">
                  <span className="text-primary">•</span>
                  {bullet}
                </li>
              ))}
            </ul>
          )}

          {chapter.keyQuote && (
            <div className="ml-14 flex gap-2 p-3 bg-primary/5 rounded-lg">
              <Quote className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground italic">"{chapter.keyQuote}"</p>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
