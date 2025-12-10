import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { formatTime } from '@/lib/formatters';

interface AudioPlayerProps {
  duration: number;
  currentTime?: number;
  onSeek?: (time: number) => void;
}

export function AudioPlayer({ duration, currentTime = 0, onSeek }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [position, setPosition] = useState(currentTime);

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const handleSpeedChange = () => {
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIndex]);
  };

  const handleSeek = (value: number[]) => {
    setPosition(value[0]);
    onSeek?.(value[0]);
  };

  const skipBackward = () => {
    setPosition(Math.max(0, position - 15));
  };

  const skipForward = () => {
    setPosition(Math.min(duration, position + 15));
  };

  // Generate waveform bars with varied heights
  const waveformBars = Array.from({ length: 60 }, (_, i) => {
    const seed = Math.sin(i * 0.5) * 0.5 + 0.5;
    return {
      height: 15 + seed * 70,
      played: (i / 60) * duration <= position,
    };
  });

  return (
    <div className="space-y-8">
      {/* Waveform visualization */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative h-28 flex items-center gap-[2px] px-2 bg-muted/30 rounded-2xl overflow-hidden"
      >
        {waveformBars.map((bar, i) => (
          <motion.div
            key={i}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: i * 0.01, duration: 0.3 }}
            className={`flex-1 min-w-[2px] max-w-[4px] rounded-full transition-colors duration-150 ${
              bar.played ? 'bg-primary' : 'bg-muted-foreground/20'
            }`}
            style={{ height: `${bar.height}%` }}
          />
        ))}
        
        {/* Playhead indicator */}
        <motion.div
          className="absolute top-0 bottom-0 w-0.5 bg-primary shadow-lg"
          style={{ left: `${(position / duration) * 100}%` }}
          animate={{ left: `${(position / duration) * 100}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      </motion.div>

      {/* Progress slider */}
      <div className="space-y-2 px-2">
        <Slider
          value={[position]}
          max={duration}
          step={1}
          onValueChange={handleSeek}
          className="cursor-pointer"
        />
        <div className="flex justify-between text-xs text-muted-foreground font-medium">
          <span>{formatTime(position)}</span>
          <span>-{formatTime(duration - position)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={skipBackward}
          className="relative"
        >
          <SkipBack className="w-6 h-6" />
          <span className="absolute -bottom-1 text-[10px] font-semibold text-muted-foreground">15</span>
        </Button>

        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            variant="default"
            size="icon"
            className="w-16 h-16 rounded-full shadow-record"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 fill-current ml-1" />
            )}
          </Button>
        </motion.div>

        <Button
          variant="ghost"
          size="icon"
          onClick={skipForward}
          className="relative"
        >
          <SkipForward className="w-6 h-6" />
          <span className="absolute -bottom-1 text-[10px] font-semibold text-muted-foreground">15</span>
        </Button>
      </div>

      {/* Playback options */}
      <div className="flex items-center justify-center gap-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleSpeedChange}
          className="text-xs font-semibold min-w-[80px]"
        >
          {playbackSpeed}× Speed
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="w-9 h-9"
        >
          <Volume2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
