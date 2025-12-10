import { motion } from 'framer-motion';
import { Play, MoreVertical, Pin, Trash2, Share2, Edit3 } from 'lucide-react';
import { Recording } from '@/types/recording';
import { formatDuration } from '@/lib/formatters';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RecordingCardProps {
  recording: Recording;
  onSelect: () => void;
  onPin: () => void;
  onDelete: () => void;
  onRename: () => void;
  onShare: () => void;
}

export function RecordingCard({
  recording,
  onSelect,
  onPin,
  onDelete,
  onRename,
  onShare,
}: RecordingCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-soft transition-all group"
    >
      <button
        onClick={onSelect}
        className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
      >
        <Play className="w-4 h-4 text-primary fill-primary" />
      </button>

      <button onClick={onSelect} className="flex-1 text-left min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate">
            {recording.title}
          </p>
          {recording.isPinned && (
            <Pin className="w-3 h-3 text-primary fill-primary flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {formatDuration(recording.duration)}
        </p>
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-2 rounded-lg hover:bg-muted transition-colors opacity-0 group-hover:opacity-100">
            <MoreVertical className="w-4 h-4 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={onRename}>
            <Edit3 className="w-4 h-4 mr-2" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onPin}>
            <Pin className="w-4 h-4 mr-2" />
            {recording.isPinned ? 'Unpin' : 'Pin'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}
