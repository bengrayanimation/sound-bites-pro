import { motion } from 'framer-motion';
import { X, Sparkles, Mic, FileText, Wand2, Quote, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaywallProps {
  onClose: () => void;
  onUpgrade: () => void;
}

const features = [
  { icon: Mic, text: 'Unlimited recordings' },
  { icon: FileText, text: 'Full AI transcriptions' },
  { icon: Wand2, text: 'Smart chapters & summaries' },
  { icon: Quote, text: 'Stylised quote cards' },
  { icon: Film, text: '60-second highlight reels' },
];

export function Paywall({ onClose, onUpgrade }: PaywallProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="w-full max-w-sm bg-card rounded-2xl border border-border shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="relative p-6 pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mb-4 shadow-record">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-2">
            Unlock SoundBites Pro
          </h2>
          <p className="text-muted-foreground text-sm">
            Get unlimited recordings and AI-powered insights
          </p>
        </div>

        {/* Features */}
        <div className="px-6 pb-4">
          <div className="space-y-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {feature.text}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="p-6 bg-muted/50">
          <Button
            onClick={onUpgrade}
            className="w-full h-14 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-record"
          >
            Upgrade Now — £4.99/month
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-3">
            Cancel anytime. No commitment.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
