import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, Share2, Download, ChevronLeft, ChevronRight, Sparkles, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuoteCard } from '@/types/recording';
import { formatTime } from '@/lib/formatters';
import { useRecordingStore } from '@/stores/recordingStore';

interface QuoteCardsViewProps {
  quoteCards?: QuoteCard[];
}

const styleConfig = {
  minimal: {
    bg: 'bg-card',
    border: 'border-border',
    text: 'text-foreground',
    accent: 'text-primary',
  },
  bold: {
    bg: 'bg-foreground',
    border: 'border-transparent',
    text: 'text-background',
    accent: 'text-primary',
  },
  corporate: {
    bg: 'bg-gradient-to-br from-slate-800 to-slate-900',
    border: 'border-transparent',
    text: 'text-white',
    accent: 'text-primary',
  },
  student: {
    bg: 'bg-gradient-to-br from-amber-50 to-orange-50',
    border: 'border-primary/20',
    text: 'text-foreground',
    accent: 'text-primary',
  },
};

export function QuoteCardsView({ quoteCards }: QuoteCardsViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { isPro } = useRecordingStore();

  if (!isPro) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground mb-2">Pro Feature</h3>
        <p className="text-sm text-muted-foreground max-w-xs mb-4">
          Stylised quote cards are available with a Pro subscription
        </p>
        <Button>
          <Sparkles className="w-4 h-4 mr-2" />
          Upgrade to Pro
        </Button>
      </div>
    );
  }

  if (!quoteCards || quoteCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Quote className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-foreground mb-2">No quote cards yet</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          AI will generate stylised quote cards from your best moments
        </p>
      </div>
    );
  }

  const currentCard = quoteCards[currentIndex];
  const style = styleConfig[currentCard.style];

  const nextCard = () => {
    setCurrentIndex((i) => (i + 1) % quoteCards.length);
  };

  const prevCard = () => {
    setCurrentIndex((i) => (i - 1 + quoteCards.length) % quoteCards.length);
  };

  return (
    <div className="space-y-6">
      {/* Card display */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`${style.bg} ${style.border} border rounded-2xl p-8 min-h-[240px] flex flex-col justify-center`}
          >
            <Quote className={`w-8 h-8 ${style.accent} mb-4`} />
            <p className={`text-xl font-medium ${style.text} mb-4 leading-relaxed`}>
              "{currentCard.quote}"
            </p>
            <div className={`flex items-center gap-2 ${style.text} opacity-70`}>
              <span className="text-sm font-medium">{currentCard.speaker}</span>
              <span className="text-sm">•</span>
              <span className="text-sm">{formatTime(currentCard.timestamp)}</span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows */}
        {quoteCards.length > 1 && (
          <>
            <button
              onClick={prevCard}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/90 border border-border flex items-center justify-center hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextCard}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/90 border border-border flex items-center justify-center hover:bg-muted transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Pagination dots */}
      {quoteCards.length > 1 && (
        <div className="flex justify-center gap-2">
          {quoteCards.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentIndex ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      )}

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
