import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, Share2, Download, ChevronLeft, ChevronRight, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuoteCard } from '@/types/recording';
import { formatTime } from '@/lib/formatters';
import { shareText, generateQuoteText, downloadTextFile } from '@/lib/shareUtils';
import { toast } from 'sonner';

interface QuoteCardsViewProps {
  quoteCards?: QuoteCard[];
  title?: string;
}

const styleConfig = {
  minimal: {
    bg: 'bg-card',
    border: 'border-border',
    text: 'text-foreground',
    accent: 'text-primary',
    label: 'Minimal',
  },
  bold: {
    bg: 'bg-foreground',
    border: 'border-transparent',
    text: 'text-background',
    accent: 'text-primary',
    label: 'Bold',
  },
  corporate: {
    bg: 'bg-gradient-to-br from-slate-800 to-slate-900',
    border: 'border-transparent',
    text: 'text-white',
    accent: 'text-amber-400',
    label: 'Corporate',
  },
  student: {
    bg: 'bg-gradient-to-br from-amber-50 to-orange-50',
    border: 'border-primary/20',
    text: 'text-foreground',
    accent: 'text-primary',
    label: 'Student',
  },
};

export function QuoteCardsView({ quoteCards, title = 'Recording' }: QuoteCardsViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleShare = async () => {
    if (!quoteCards || quoteCards.length === 0) return;
    const quote = quoteCards[currentIndex];
    const text = generateQuoteText(quote);
    const shared = await shareText(`Quote from ${title}`, text);
    if (shared) toast.success('Quote shared!');
  };

  const handleSave = () => {
    if (!quoteCards || quoteCards.length === 0) return;
    const quote = quoteCards[currentIndex];
    const text = generateQuoteText(quote);
    downloadTextFile(`${title.replace(/\s+/g, '_')}_quote_${currentIndex + 1}.txt`, text);
    toast.success('Quote saved to device');
  };

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
  const style = styleConfig[currentCard.style] || styleConfig.minimal;

  const nextCard = () => {
    setCurrentIndex((i) => (i + 1) % quoteCards.length);
  };

  const prevCard = () => {
    setCurrentIndex((i) => (i - 1 + quoteCards.length) % quoteCards.length);
  };

  return (
    <div className="space-y-6">
      {/* Style indicator */}
      <div className="flex items-center justify-center gap-2">
        <Palette className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">{style.label} Style</span>
      </div>

      {/* Card display */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`${style.bg} ${style.border} border rounded-2xl p-8 min-h-[280px] flex flex-col justify-between shadow-lg`}
          >
            <Quote className={`w-10 h-10 ${style.accent} opacity-60`} />
            
            <p className={`text-2xl font-semibold ${style.text} leading-relaxed my-6`}>
              "{currentCard.quote}"
            </p>
            
            <div className={`flex items-center gap-3 ${style.text}`}>
              <div className="w-10 h-10 rounded-full bg-current/10 flex items-center justify-center">
                <span className="text-sm font-bold">{currentCard.speaker.charAt(0)}</span>
              </div>
              <div>
                <p className="font-medium">{currentCard.speaker}</p>
                <p className="text-sm opacity-60">{formatTime(currentCard.timestamp)}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows */}
        {quoteCards.length > 1 && (
          <>
            <button
              onClick={prevCard}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/90 border border-border flex items-center justify-center hover:bg-muted transition-colors shadow-md"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextCard}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/90 border border-border flex items-center justify-center hover:bg-muted transition-colors shadow-md"
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
              className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                i === currentIndex ? 'bg-primary w-6' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={handleShare}>
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
        <Button variant="outline" className="flex-1" onClick={handleSave}>
          <Download className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>
    </div>
  );
}
