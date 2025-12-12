import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, Share2, Download, ChevronLeft, ChevronRight, DownloadCloud, ImagePlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuoteCard } from '@/types/recording';
import { formatTime } from '@/lib/formatters';
import { 
  shareQuoteAsImage, 
  downloadQuoteAsImage, 
  quoteCardStyles,
  generateQuoteCardImage,
  downloadFile
} from '@/lib/shareUtils';
import { toast } from 'sonner';

interface QuoteCardsViewProps {
  quoteCards?: QuoteCard[];
  title?: string;
}

const styleKeys = Object.keys(quoteCardStyles);

export function QuoteCardsView({ quoteCards, title = 'Recording' }: QuoteCardsViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentStyleIndex, setCurrentStyleIndex] = useState(0);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleShare = async () => {
    if (!quoteCards || quoteCards.length === 0) return;
    const quote = quoteCards[currentIndex];
    const styleKey = styleKeys[currentStyleIndex];
    toast.loading('Generating image...');
    const shared = await shareQuoteAsImage(quote, styleKey, title, backgroundImage || undefined);
    toast.dismiss();
    if (shared) toast.success('Quote shared!');
  };

  const handleSave = async () => {
    if (!quoteCards || quoteCards.length === 0) return;
    const quote = quoteCards[currentIndex];
    const styleKey = styleKeys[currentStyleIndex];
    toast.loading('Generating image...');
    await downloadQuoteAsImage(quote, styleKey, `${title.replace(/\s+/g, '_')}_quote_${currentIndex + 1}.png`, backgroundImage || undefined);
    toast.dismiss();
    toast.success('Quote card saved as image');
  };

  const handleSaveAll = async () => {
    if (!quoteCards || quoteCards.length === 0) return;
    toast.loading('Generating all quote cards...');
    const styleKey = styleKeys[currentStyleIndex];
    
    for (let i = 0; i < quoteCards.length; i++) {
      const blob = await generateQuoteCardImage(quoteCards[i], styleKey, backgroundImage || undefined);
      downloadFile(`${title.replace(/\s+/g, '_')}_quote_${i + 1}.png`, blob);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    toast.dismiss();
    toast.success(`Saved ${quoteCards.length} quote cards`);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBackgroundImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBackgroundImage = () => {
    setBackgroundImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
  const currentStyleKey = styleKeys[currentStyleIndex];

  const nextCard = () => {
    setCurrentIndex((i) => (i + 1) % quoteCards.length);
  };

  const prevCard = () => {
    setCurrentIndex((i) => (i - 1 + quoteCards.length) % quoteCards.length);
  };

  // Dynamic styles based on current style
  const getCardStyles = () => {
    if (backgroundImage) {
      return 'border-transparent text-white';
    }
    switch (currentStyleKey) {
      case 'minimal':
        return 'bg-card border-border text-foreground';
      case 'bold':
        return 'bg-foreground border-transparent text-background';
      case 'corporate':
        return 'bg-gradient-to-br from-slate-800 to-slate-900 border-transparent text-white';
      case 'student':
        return 'bg-gradient-to-br from-amber-50 to-orange-100 border-primary/20 text-foreground';
      case 'ocean':
        return 'bg-gradient-to-br from-sky-800 to-cyan-900 border-transparent text-white';
      case 'sunset':
        return 'bg-gradient-to-br from-orange-900 to-red-900 border-transparent text-white';
      case 'forest':
        return 'bg-gradient-to-br from-green-900 to-emerald-900 border-transparent text-white';
      case 'lavender':
        return 'bg-gradient-to-br from-purple-900 to-violet-900 border-transparent text-white';
      default:
        return 'bg-card border-border text-foreground';
    }
  };

  const getAccentColor = () => {
    if (backgroundImage) return 'text-white';
    switch (currentStyleKey) {
      case 'minimal':
      case 'student':
        return 'text-primary';
      case 'bold':
        return 'text-primary';
      case 'corporate':
        return 'text-amber-400';
      case 'ocean':
        return 'text-sky-400';
      case 'sunset':
        return 'text-orange-400';
      case 'forest':
        return 'text-green-400';
      case 'lavender':
        return 'text-purple-400';
      default:
        return 'text-primary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Style color buttons */}
      <div className="flex flex-wrap justify-center gap-2">
        {styleKeys.map((key, i) => (
          <button
            key={key}
            onClick={() => setCurrentStyleIndex(i)}
            className={`w-8 h-8 rounded-full border-2 transition-all ${
              i === currentStyleIndex ? 'scale-110 ring-2 ring-primary ring-offset-2 ring-offset-background' : 'opacity-60 hover:opacity-100'
            }`}
            style={{ backgroundColor: quoteCardStyles[key].bg, borderColor: quoteCardStyles[key].accentColor }}
            title={quoteCardStyles[key].label}
          />
        ))}
        
        {/* Add background image button */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className={`w-8 h-8 rounded-full border-2 border-dashed border-muted-foreground/50 flex items-center justify-center transition-all hover:border-primary hover:bg-primary/10 ${
            backgroundImage ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
          }`}
          title="Add background image"
        >
          <ImagePlus className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Background image indicator */}
      {backgroundImage && (
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs text-muted-foreground">Custom background</span>
          <button
            onClick={removeBackgroundImage}
            className="p-1 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Card display */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentCard.id}-${currentStyleKey}-${backgroundImage}`}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`${getCardStyles()} border rounded-2xl p-8 min-h-[280px] flex flex-col justify-between shadow-lg relative overflow-hidden`}
          >
            {/* Background image */}
            {backgroundImage && (
              <>
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${backgroundImage})` }}
                />
                <div className="absolute inset-0 bg-black/50" />
              </>
            )}
            
            <div className="relative z-10">
              <Quote className={`w-10 h-10 ${getAccentColor()} opacity-60`} />
            </div>
            
            <p className="text-2xl font-semibold leading-relaxed my-6 relative z-10">
              "{currentCard.quote}"
            </p>
            
            <div className="flex items-center gap-3 relative z-10">
              <div className={`w-10 h-10 rounded-full ${backgroundImage || currentStyleKey !== 'minimal' && currentStyleKey !== 'student' ? 'bg-white/10' : 'bg-foreground/10'} flex items-center justify-center`}>
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
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={handleShare}>
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
        <Button variant="outline" onClick={handleSave}>
          <Download className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>
      
      {quoteCards.length > 1 && (
        <Button variant="secondary" className="w-full" onClick={handleSaveAll}>
          <DownloadCloud className="w-4 h-4 mr-2" />
          Save All ({quoteCards.length} cards)
        </Button>
      )}
    </div>
  );
}
