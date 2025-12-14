import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Film, Play, Share2, Download, Sparkles, Pause, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HighlightReel } from '@/types/recording';
import { formatTime } from '@/lib/formatters';
import { shareText, downloadTextFile } from '@/lib/shareUtils';
import { toast } from 'sonner';

interface HighlightReelViewProps {
  highlightReel?: HighlightReel;
  duration: number;
  title?: string;
  audioUrl?: string;
}

export function HighlightReelView({ highlightReel, duration, title = 'Recording', audioUrl }: HighlightReelViewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMomentIndex, setCurrentMomentIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio for highlight reel playback
  useEffect(() => {
    if (audioUrl && highlightReel) {
      audioRef.current = new Audio(audioUrl);
      
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentMomentIndex(0);
      });

      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      };
    }
  }, [audioUrl, highlightReel]);

  const handlePlayPause = async () => {
    if (!audioRef.current || !highlightReel) {
      toast.error('No audio available');
      return;
    }

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        const startTime = highlightReel.moments[currentMomentIndex]?.startTime || 0;
        audioRef.current.currentTime = startTime;
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Playback error:', error);
      toast.error('Failed to play highlight reel');
    }
  };

  const handleShare = async () => {
    if (!highlightReel) return;
    let text = `🎬 Highlight Reel: ${title}\n\nKey Moments:\n`;
    highlightReel.moments.forEach((m, i) => {
      text += `${i + 1}. ${m.caption} (${formatTime(m.startTime)} - ${formatTime(m.endTime)})\n`;
    });
    const shared = await shareText(`Highlight Reel: ${title}`, text);
    if (shared) toast.success('Highlight reel shared!');
  };

  const handleExport = () => {
    if (!highlightReel) return;
    let text = `Highlight Reel: ${title}\n\nKey Moments:\n`;
    highlightReel.moments.forEach((m, i) => {
      text += `${i + 1}. ${m.caption} (${formatTime(m.startTime)} - ${formatTime(m.endTime)})\n`;
    });
    downloadTextFile(`${title.replace(/\s+/g, '_')}_highlight_reel.txt`, text);
    toast.success('Highlight reel exported');
  };

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
        <h3 className="font-bold text-xl text-foreground mb-2">No Highlight Reel</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Highlight reels are generated automatically after transcription
        </p>
      </div>
    );
  }

  const waveformBars = Array.from({ length: 40 }, (_, i) => ({
    height: 20 + Math.sin(i * 0.3) * 30 + Math.random() * 30,
  }));

  return (
    <div className="space-y-6">
      {/* Audio Reel preview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-foreground to-foreground/90 rounded-2xl aspect-video flex items-center justify-center overflow-hidden shadow-xl"
      >
        <div className="absolute inset-0 flex items-center justify-center gap-1 px-8">
          {waveformBars.map((bar, i) => (
            <motion.div
              key={i}
              initial={{ scaleY: 0 }}
              animate={{ 
                scaleY: isPlaying ? [0.3, 1, 0.5, 0.8, 0.3] : 1 
              }}
              transition={{ 
                delay: isPlaying ? 0 : i * 0.02, 
                duration: isPlaying ? 0.5 : 0.3,
                repeat: isPlaying ? Infinity : 0,
                repeatDelay: Math.random() * 0.2
              }}
              className="flex-1 bg-background/20 rounded-full"
              style={{ height: `${bar.height}%` }}
            />
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePlayPause}
          className="relative z-10 w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-record"
        >
          {isPlaying ? (
            <Pause className="w-9 h-9 text-primary-foreground fill-current" />
          ) : (
            <Play className="w-9 h-9 text-primary-foreground fill-current ml-1" />
          )}
        </motion.button>

        <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-2 bg-background/95 rounded-full text-sm font-semibold shadow-lg">
          <Clock className="w-3.5 h-3.5" />
          {formatTime(highlightReel.duration)}
        </div>

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
              onClick={() => {
                setCurrentMomentIndex(i);
                if (audioRef.current) {
                  audioRef.current.currentTime = moment.startTime;
                }
              }}
              className={`flex items-start gap-3 p-4 bg-card border rounded-xl transition-all cursor-pointer group ${
                i === currentMomentIndex ? 'border-primary' : 'border-border hover:border-primary/30'
              }`}
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
        <Button variant="outline" className="flex-1 gap-2" onClick={handleShare}>
          <Share2 className="w-4 h-4" />
          Share
        </Button>
        <Button variant="outline" className="flex-1 gap-2" onClick={handleExport}>
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>
    </div>
  );
}
