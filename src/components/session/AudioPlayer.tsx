import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2, Share2, Download, BookOpen, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { formatTime } from '@/lib/formatters';
import { shareText } from '@/lib/shareUtils';
import { toast } from 'sonner';
import { Chapter } from '@/types/recording';

interface AudioPlayerProps {
  duration: number;
  currentTime?: number;
  onSeek?: (time: number) => void;
  title?: string;
  chapters?: Chapter[];
  audioUrl?: string;
}

export function AudioPlayer({ duration, currentTime = 0, onSeek, title = 'Recording', chapters, audioUrl }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [position, setPosition] = useState(currentTime);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  // Initialize audio element
  useEffect(() => {
    if (audioUrl) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.playbackRate = playbackSpeed;
      
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setPosition(0);
      });

      audioRef.current.addEventListener('loadedmetadata', () => {
        // Audio is ready
      });

      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [audioUrl]);

  // Update position during playback
  useEffect(() => {
    const updatePosition = () => {
      if (audioRef.current && isPlaying) {
        setPosition(audioRef.current.currentTime);
        animationRef.current = requestAnimationFrame(updatePosition);
      }
    };

    if (isPlaying && audioRef.current) {
      animationRef.current = requestAnimationFrame(updatePosition);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  // Update playback speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const handlePlayPause = async () => {
    if (!audioRef.current) {
      toast.error('No audio available');
      return;
    }

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Playback error:', error);
      toast.error('Failed to play audio');
    }
  };

  const handleSpeedChange = () => {
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIndex]);
  };

  const handleSeek = (value: number[]) => {
    const newPosition = value[0];
    setPosition(newPosition);
    if (audioRef.current) {
      audioRef.current.currentTime = newPosition;
    }
    onSeek?.(newPosition);
  };

  const jumpToTime = (time: number) => {
    setPosition(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
    onSeek?.(time);
    toast.success(`Jumped to ${formatTime(time)}`);
  };

  const skipBackward = () => {
    const newPos = Math.max(0, position - 15);
    setPosition(newPos);
    if (audioRef.current) {
      audioRef.current.currentTime = newPos;
    }
    onSeek?.(newPos);
  };

  const skipForward = () => {
    const newPos = Math.min(duration, position + 15);
    setPosition(newPos);
    if (audioRef.current) {
      audioRef.current.currentTime = newPos;
    }
    onSeek?.(newPos);
  };

  const handleShare = async () => {
    const text = `🎙️ ${title}\nDuration: ${formatTime(duration)}`;
    const shared = await shareText(`Audio: ${title}`, text);
    if (shared) toast.success('Audio info shared!');
  };

  const handleSave = () => {
    if (audioUrl) {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = `${title.replace(/\s+/g, '_')}.webm`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Audio saved!');
    } else {
      toast.error('No audio available to save');
    }
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
            onClick={handlePlayPause}
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

      {/* Share/Save Actions */}
      <div className="flex gap-3 pt-4 border-t border-border">
        <Button variant="outline" className="flex-1" onClick={handleShare}>
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
        <Button variant="outline" className="flex-1" onClick={handleSave}>
          <Download className="w-4 h-4 mr-2" />
          Save Audio
        </Button>
      </div>

      {/* Chapters Section */}
      {chapters && chapters.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-border">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Chapters</h3>
          </div>
          
          <div className="space-y-3">
            {chapters.map((chapter, index) => (
              <motion.div
                key={chapter.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card border border-border rounded-xl p-4 space-y-3"
              >
                <button
                  onClick={() => jumpToTime(chapter.startTime)}
                  className="flex items-start gap-3 w-full text-left group"
                >
                  <span className="text-xs font-mono text-primary font-medium mt-0.5 min-w-[48px] bg-primary/10 px-2 py-1 rounded">
                    {formatTime(chapter.startTime)}
                  </span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {chapter.title}
                    </h4>
                  </div>
                </button>

                {chapter.bullets.length > 0 && (
                  <ul className="space-y-1.5 pl-[60px]">
                    {chapter.bullets.map((bullet, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-primary">•</span>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}

                {chapter.keyQuote && (
                  <div className="ml-[60px] flex gap-2 p-3 bg-primary/5 rounded-lg">
                    <Quote className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground italic">"{chapter.keyQuote}"</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
