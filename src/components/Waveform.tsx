import { motion } from 'framer-motion';

interface WaveformProps {
  isAnimating?: boolean;
  barCount?: number;
  className?: string;
}

export function Waveform({ isAnimating = false, barCount = 8, className = '' }: WaveformProps) {
  return (
    <div className={`flex items-center justify-center gap-1 h-12 ${className}`}>
      {Array.from({ length: barCount }).map((_, i) => (
        <motion.div
          key={i}
          className="wave-bar w-1 bg-primary rounded-full"
          style={{
            height: isAnimating ? undefined : '8px',
            animationPlayState: isAnimating ? 'running' : 'paused',
          }}
          animate={isAnimating ? {
            height: ['8px', '32px', '8px'],
          } : { height: '8px' }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
