import { motion } from 'framer-motion';
import { Flag, CheckSquare, HelpCircle, BookMarked, Lightbulb } from 'lucide-react';
import { Checkpoint } from '@/types/recording';
import { formatTime } from '@/lib/formatters';

interface CheckpointsViewProps {
  checkpoints?: Checkpoint[];
  onTimeClick?: (time: number) => void;
}

const typeConfig = {
  decision: { icon: CheckSquare, label: 'Decision', color: 'text-green-600' },
  task: { icon: Flag, label: 'Task', color: 'text-blue-600' },
  definition: { icon: BookMarked, label: 'Definition', color: 'text-purple-600' },
  question: { icon: HelpCircle, label: 'Question', color: 'text-orange-500' },
};

export function CheckpointsView({ checkpoints, onTimeClick }: CheckpointsViewProps) {
  if (!checkpoints || checkpoints.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Lightbulb className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-foreground mb-2">No checkpoints yet</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          AI will identify key decisions, tasks, and questions
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {checkpoints.map((checkpoint, index) => {
        const config = typeConfig[checkpoint.type];
        const Icon = config.icon;

        return (
          <motion.button
            key={checkpoint.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            onClick={() => onTimeClick?.(checkpoint.timestamp)}
            className="w-full flex items-start gap-3 p-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-all text-left group"
          >
            <div className={`mt-0.5 ${config.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-semibold uppercase ${config.color}`}>
                  {config.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatTime(checkpoint.timestamp)}
                </span>
              </div>
              <p className="text-sm text-foreground group-hover:text-primary transition-colors">
                {checkpoint.text}
              </p>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
