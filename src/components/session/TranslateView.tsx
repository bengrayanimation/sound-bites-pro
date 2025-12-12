import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, ChevronDown, Download, Share2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TranscriptSegment } from '@/types/recording';
import { downloadTextFile, shareText, downloadHtmlFile, generateTranslatedHtml } from '@/lib/shareUtils';
import { formatTime } from '@/lib/formatters';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface TranslateViewProps {
  transcript?: TranscriptSegment[];
  title?: string;
}

const languages = [
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
];

export function TranslateView({ transcript, title = 'Recording' }: TranslateViewProps) {
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedTranscript, setTranslatedTranscript] = useState<TranscriptSegment[] | null>(null);

  const translateTranscript = async () => {
    if (!transcript || transcript.length === 0) return;
    
    setIsTranslating(true);
    toast.loading(`Translating to ${selectedLanguage.name}...`, { id: 'translate' });
    
    try {
      const { data, error } = await supabase.functions.invoke('translate', {
        body: {
          transcript,
          targetLanguage: selectedLanguage.name,
          title
        }
      });

      if (error) throw error;

      if (data?.translatedTranscript) {
        setTranslatedTranscript(data.translatedTranscript);
        toast.success(`Translated to ${selectedLanguage.name}!`, { id: 'translate' });
      } else {
        throw new Error('No translation returned');
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Translation failed. Please try again.', { id: 'translate' });
    } finally {
      setIsTranslating(false);
    }
  };

  const generateTranslatedText = () => {
    const source = translatedTranscript || transcript;
    if (!source) return '';
    let text = `📋 ${title} - Translation (${selectedLanguage.name})\n\n`;
    source.forEach((seg) => {
      text += `[${formatTime(seg.startTime)}] ${seg.speaker ? `${seg.speaker}: ` : ''}${seg.text}\n`;
    });
    return text;
  };

  const handleDownloadTxt = () => {
    const text = generateTranslatedText();
    downloadTextFile(`${title.replace(/\s+/g, '_')}_${selectedLanguage.code}.txt`, text);
    toast.success(`Translation saved as TXT (${selectedLanguage.name})`);
  };

  const handleDownloadHtml = () => {
    const source = translatedTranscript || transcript;
    if (!source) return;
    const html = generateTranslatedHtml(source, title, selectedLanguage.name);
    downloadHtmlFile(`${title.replace(/\s+/g, '_')}_${selectedLanguage.code}.html`, html);
    toast.success(`Translation saved as HTML (${selectedLanguage.name})`);
  };

  const handleShare = async () => {
    const text = generateTranslatedText();
    const shared = await shareText(`${title} - ${selectedLanguage.name} Translation`, text);
    if (shared) toast.success('Translation shared!');
  };

  if (!transcript || transcript.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Globe className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-foreground mb-2">No transcript to translate</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Translation requires a transcript first
        </p>
      </div>
    );
  }

  const displayTranscript = translatedTranscript || transcript;

  return (
    <div className="space-y-6">
      {/* Language selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Translate to:</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Globe className="w-4 h-4" />
              {selectedLanguage.name}
              <ChevronDown className="w-4 h-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => {
                  setSelectedLanguage(lang);
                  setTranslatedTranscript(null);
                }}
              >
                {lang.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Translation preview */}
      <div className="p-4 bg-muted/50 rounded-xl space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Globe className="w-4 h-4" />
          {translatedTranscript ? `Translated to ${selectedLanguage.name}` : `Preview (${selectedLanguage.name})`}
        </div>
        
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {displayTranscript.slice(0, translatedTranscript ? undefined : 5).map((segment, index) => (
            <motion.div
              key={segment.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="text-sm text-foreground"
            >
              <span className="text-xs text-primary font-mono mr-2">
                {formatTime(segment.startTime)}
              </span>
              {segment.speaker && <span className="font-medium">{segment.speaker}: </span>}
              {segment.text}
            </motion.div>
          ))}
          {!translatedTranscript && transcript.length > 5 && (
            <p className="text-sm text-muted-foreground">
              + {transcript.length - 5} more segments...
            </p>
          )}
        </div>

        {!translatedTranscript && (
          <p className="text-xs text-muted-foreground italic">
            Pro tip: Translation preserves original timestamps for easy reference
          </p>
        )}
      </div>

      <Button 
        className="w-full" 
        onClick={translateTranscript}
        disabled={isTranslating}
      >
        {isTranslating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Translating...
          </>
        ) : (
          <>
            <Globe className="w-4 h-4 mr-2" />
            {translatedTranscript ? 'Translate Again' : 'Translate Full Transcript'}
          </>
        )}
      </Button>

      {/* Download/Share actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={handleShare}>
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Download
              <ChevronDown className="w-4 h-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleDownloadTxt}>
              Download as TXT
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDownloadHtml}>
              Download as HTML
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
