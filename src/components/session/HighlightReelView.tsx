import { useState } from 'react';
import { motion } from 'framer-motion';
import { Film, Play, Share2, Download, Sparkles, Lock, Pause, Clock } from 'lucide-react';
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
  const [isPlaying, setIsPlaying] = useState(false);

  if (!isPro) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-6"
        >
          <Lock className="w-10 h-10 text-primary" />
        </motion.div>
        <h3 className="font-bold text-xl text-foreground mb-2">Pro Feature</h3>
        <p className="text-sm text-muted-foreground max-w-xs mb-6">
          60-second highlight reels are available with a Pro subscription
        </p>
        <Button className="shadow-record">
          Upgrade to Pro
        </Button>
      </div>
    );
  }

  if (!highlightReel) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-6"
        >
          <Film className="w-10 h-10 text-muted-foreground" />
        </motion.div>
        <h3 className="font-bold text-xl text-foreground mb-2">Generate Highlight Reel</h3>
        <p className="text-sm text-muted-foreground max-w-xs mb-6">
          Create a 60-second reel of the most important moments from this recording
        </p>
        <Button className="shadow-record">
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Reel
        </Button>
      </div>
    );
  }

  // Generate waveform for highlight reel
  const waveformBars = Array.from({ length: 40 }, (_, i) => ({
    height: 20 + Math.sin(i * 0.3) * 30 + Math.random() * 30,
  }));

  return (
    <div className="space-y-6">
      {/* Reel preview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-foreground to-foreground/90 rounded-2xl aspect-video flex items-center justify-center overflow-hidden shadow-xl"
      >
        {/* Waveform background */}
        <div className="absolute inset-0 flex items-center justify-center gap-1 px-8">
          {waveformBars.map((bar, i) => (
            <motion.div
              key={i}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: i * 0.02, duration: 0.3 }}
              className="flex-1 bg-background/20 rounded-full"
              style={{ height: `${bar.height}%` }}
            />
          ))}
        </div>

        {/* Play button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsPlaying(!isPlaying)}
          className="relative z-10 w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-record"
        >
          {isPlaying ? (
            <Pause className="w-9 h-9 text-primary-foreground fill-current" />
          ) : (
            <Play className="w-9 h-9 text-primary-foreground fill-current ml-1" />
          )}
        </motion.button>

        {/* Duration badge */}
        <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-2 bg-background/95 rounded-full text-sm font-semibold shadow-lg">
          <Clock className="w-3.5 h-3.5" />
          {formatTime(highlightReel.duration)}
        </div>

        {/* Moments indicator */}
        <div className="absolute top-4 left-4 px-3 py-1.5 bg-primary rounded-full text-xs font-semibold text-primary-foreground">
          {highlightReel.moments.length} key moments
        </div>
      </motion.div>

      {/* Key moments */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Key Moments
        </h3>
        <div className="space-y-2">
          {highlightReel.moments.map((moment, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 p-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Play className="w-3.5 h-3.5 text-primary fill-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{moment.caption}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatTime(moment.startTime)} - {formatTime(moment.endTime)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1">
          <Share2 className="w-4 h-4 mr-2" />
          Share Reel
        </Button>
        <Button variant="outline" className="flex-1">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  );
}
