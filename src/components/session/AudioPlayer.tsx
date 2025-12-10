import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
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

  // Generate waveform bars
  const waveformBars = Array.from({ length: 50 }, (_, i) => ({
    height: 20 + Math.random() * 60,
    played: (i / 50) * duration <= position,
  }));

  return (
    <div className="space-y-6">
      {/* Waveform visualization */}
      <div className="relative h-24 flex items-center gap-0.5 px-4 bg-muted/50 rounded-xl overflow-hidden">
        {waveformBars.map((bar, i) => (
          <motion.div
            key={i}
            className={`w-1 rounded-full transition-colors ${
              bar.played ? 'bg-primary' : 'bg-muted-foreground/30'
            }`}
            style={{ height: `${bar.height}%` }}
          />
        ))}
      </div>

      {/* Progress slider */}
      <div className="space-y-2">
        <Slider
          value={[position]}
          max={duration}
          step={1}
          onValueChange={handleSeek}
          className="cursor-pointer"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatTime(position)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setPosition(Math.max(0, position - 15))}
        >
          <SkipBack className="w-5 h-5" />
        </Button>

        <Button
          variant="default"
          size="icon"
          className="w-14 h-14 rounded-full"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current ml-0.5" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setPosition(Math.min(duration, position + 15))}
        >
          <SkipForward className="w-5 h-5" />
        </Button>
      </div>

      {/* Playback speed */}
      <div className="flex justify-center">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleSpeedChange}
          className="text-xs font-semibold"
        >
          {playbackSpeed}x Speed
        </Button>
      </div>
    </div>
  );
}
