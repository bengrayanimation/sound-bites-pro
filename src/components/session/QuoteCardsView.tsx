import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, Share2, Download, ChevronLeft, ChevronRight, DownloadCloud, ImagePlus, X, Pencil, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { QuoteCard } from '@/types/recording';
import { formatTime } from '@/lib/formatters';
import { 
  shareQuoteAsImage, 
  downloadQuoteAsJpg, 
  quoteCardStyles,
  generateQuoteCardImage,
  downloadFile
} from '@/lib/shareUtils';
import { toast } from 'sonner';

interface QuoteCardsViewProps {
  quoteCards?: QuoteCard[];
  title?: string;
  onUpdateQuote?: (index: number, quote: QuoteCard) => void;
}

const styleKeys = Object.keys(quoteCardStyles);

export function QuoteCardsView({ quoteCards, title = 'Recording', onUpdateQuote }: QuoteCardsViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Track individual styles for each quote card
  const [cardStyles, setCardStyles] = useState<Record<string, number>>({});
  // Track individual background images for each quote card
  const [cardBackgrounds, setCardBackgrounds] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuote, setEditedQuote] = useState('');
  const [editedSpeaker, setEditedSpeaker] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getCurrentStyleIndex = (cardId: string) => {
    return cardStyles[cardId] ?? 0;
  };

  const setCurrentStyleIndex = (cardId: string, styleIndex: number) => {
    setCardStyles(prev => ({ ...prev, [cardId]: styleIndex }));
  };

  const getBackgroundImage = (cardId: string) => {
    return cardBackgrounds[cardId] || null;
  };

  const handleShare = async () => {
    if (!quoteCards || quoteCards.length === 0) return;
    const quote = quoteCards[currentIndex];
    const styleKey = styleKeys[getCurrentStyleIndex(quote.id)];
    const bg = getBackgroundImage(quote.id);
    toast.loading('Generating image...');
    const shared = await shareQuoteAsImage(quote, styleKey, title, bg || undefined);
    toast.dismiss();
    if (shared) toast.success('Quote shared!');
  };

  const handleSave = async () => {
    if (!quoteCards || quoteCards.length === 0) return;
    const quote = quoteCards[currentIndex];
    const styleKey = styleKeys[getCurrentStyleIndex(quote.id)];
    const bg = getBackgroundImage(quote.id);
    toast.loading('Generating JPG...');
    await downloadQuoteAsJpg(quote, styleKey, `${title.replace(/\s+/g, '_')}_quote_${currentIndex + 1}.jpg`, bg || undefined);
    toast.dismiss();
    toast.success('Quote card saved as JPG');
  };

  const handleSaveAll = async () => {
    if (!quoteCards || quoteCards.length === 0) return;
    toast.loading('Generating all quote cards...');
    
    for (let i = 0; i < quoteCards.length; i++) {
      const quote = quoteCards[i];
      const styleKey = styleKeys[getCurrentStyleIndex(quote.id)];
      const bg = getBackgroundImage(quote.id);
      const blob = await generateQuoteCardImage(quote, styleKey, bg || undefined);
      downloadFile(`${title.replace(/\s+/g, '_')}_quote_${i + 1}.jpg`, blob);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    toast.dismiss();
    toast.success(`Saved ${quoteCards.length} quote cards as JPGs`);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && quoteCards) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const cardId = quoteCards[currentIndex].id;
        setCardBackgrounds(prev => ({
          ...prev,
          [cardId]: event.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBackgroundImage = () => {
    if (!quoteCards) return;
    const cardId = quoteCards[currentIndex].id;
    setCardBackgrounds(prev => {
      const newBgs = { ...prev };
      delete newBgs[cardId];
      return newBgs;
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startEditing = () => {
    if (!quoteCards || quoteCards.length === 0) return;
    const quote = quoteCards[currentIndex];
    setEditedQuote(quote.quote);
    setEditedSpeaker(quote.speaker);
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (!quoteCards || !onUpdateQuote) return;
    const quote = quoteCards[currentIndex];
    onUpdateQuote(currentIndex, {
      ...quote,
      quote: editedQuote,
      speaker: editedSpeaker,
    });
    setIsEditing(false);
    toast.success('Quote card updated');
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditedQuote('');
    setEditedSpeaker('');
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
  const currentStyleIndex = getCurrentStyleIndex(currentCard.id);
  const currentStyleKey = styleKeys[currentStyleIndex];
  const backgroundImage = getBackgroundImage(currentCard.id);

  const nextCard = () => {
    setCurrentIndex((i) => (i + 1) % quoteCards.length);
    setIsEditing(false);
  };

  const prevCard = () => {
    setCurrentIndex((i) => (i - 1 + quoteCards.length) % quoteCards.length);
    setIsEditing(false);
  };

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
      {/* Style color buttons - individual per card */}
      <div className="flex flex-wrap justify-center gap-2">
        {styleKeys.map((key, i) => (
          <button
            key={key}
            onClick={() => setCurrentStyleIndex(currentCard.id, i)}
            className={`w-8 h-8 rounded-full border-2 transition-all ${
              i === currentStyleIndex ? 'scale-110 ring-2 ring-primary ring-offset-2 ring-offset-background' : 'opacity-60 hover:opacity-100'
            }`}
            style={{ backgroundColor: quoteCardStyles[key].bg, borderColor: quoteCardStyles[key].accentColor }}
            title={quoteCardStyles[key].label}
          />
        ))}
        
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
            key={`${currentCard.id}-${currentStyleKey}-${backgroundImage}-${isEditing}`}
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
            
            <div className="relative z-10 flex justify-between items-start">
              <Quote className={`w-10 h-10 ${getAccentColor()} opacity-60`} />
              {onUpdateQuote && !isEditing && (
                <button
                  onClick={startEditing}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <Pencil className="w-4 h-4 opacity-60" />
                </button>
              )}
            </div>
            
            {isEditing ? (
              <div className="space-y-4 my-6 relative z-10">
                <Textarea
                  value={editedQuote}
                  onChange={(e) => setEditedQuote(e.target.value)}
                  className="bg-white/10 border-white/20 text-inherit resize-none"
                  rows={3}
                  maxLength={120}
                  placeholder="Quote text..."
                />
                <Input
                  value={editedSpeaker}
                  onChange={(e) => setEditedSpeaker(e.target.value)}
                  className="bg-white/10 border-white/20 text-inherit"
                  placeholder="Speaker name..."
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveEdit} className="gap-1">
                    <Check className="w-3 h-3" /> Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelEdit}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-2xl font-semibold leading-relaxed my-6 relative z-10">
                "{currentCard.quote}"
              </p>
            )}
            
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
              onClick={() => { setCurrentIndex(i); setIsEditing(false); }}
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
          Save JPG
        </Button>
      </div>
      
      {quoteCards.length > 1 && (
        <Button variant="secondary" className="w-full" onClick={handleSaveAll}>
          <DownloadCloud className="w-4 h-4 mr-2" />
          Save All ({quoteCards.length} JPGs)
        </Button>
      )}
    </div>
  );
}
