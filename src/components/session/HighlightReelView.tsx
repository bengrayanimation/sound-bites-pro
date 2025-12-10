import { motion } from 'framer-motion';
import { Film, Play, Share2, Download, Sparkles, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HighlightReel } from '@/types/recording';
import { formatTime } from '@/lib/formatters';
import { useRecordingStore } from '@/stores/recordingStore';

interface HighlightReelViewProps {
  highlightReel?: HighlightReel;
  duration: number;
}

export function HighlightReelView({ highlightReel, duration }: HighlightReelViewProps) {
  const { isPro } = useRecordingStore();

  if (!isPro) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground mb-2">Pro Feature</h3>
        <p className="text-sm text-muted-foreground max-w-xs mb-4">
          60-second highlight reels are available with a Pro subscription
        </p>
        <Button>
          <Sparkles className="w-4 h-4 mr-2" />
          Upgrade to Pro
        </Button>
      </div>
    );
  }

  if (!highlightReel) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Film className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-foreground mb-2">Generate Highlight Reel</h3>
        <p className="text-sm text-muted-foreground max-w-xs mb-6">
          Create a 60-second reel of the most important moments
        </p>
        <Button>
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Reel
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reel preview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-foreground rounded-2xl aspect-video flex items-center justify-center overflow-hidden"
      >
        {/* Placeholder waveform */}
        <div className="absolute inset-0 flex items-center justify-center gap-0.5 opacity-30">
          {Array.from({ length: 60 }).map((_, i) => (
            <div
              key={i}
              className="w-1 bg-background rounded-full"
              style={{ height: `${20 + Math.random() * 60}%` }}
            />
          ))}
        </div>

        {/* Play button */}
        <button className="relative w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-record hover:scale-105 transition-transform">
          <Play className="w-8 h-8 text-primary-foreground fill-current ml-1" />
        </button>

        {/* Duration badge */}
        <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-background/90 rounded-full text-sm font-medium">
          {formatTime(highlightReel.duration)}
        </div>
      </motion.div>

      {/* Key moments */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground text-sm">Key Moments</h3>
        <div className="space-y-2">
          {highlightReel.moments.map((moment, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
            >
              <span className="text-xs font-mono text-primary font-medium">
                {formatTime(moment.startTime)}
              </span>
              <p className="text-sm text-foreground flex-1">{moment.caption}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
        <Button variant="outline" className="flex-1">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  );
}
