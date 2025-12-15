import { motion } from 'framer-motion';

interface TimerProps {
  seconds: number;
}

export function Timer({ seconds }: TimerProps) {
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <span className="text-4xl font-semibold tracking-tight text-foreground tabular-nums">
        {formatTime(seconds)}
      </span>
    </motion.div>
  );
}
