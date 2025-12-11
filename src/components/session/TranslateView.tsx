import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, ChevronDown, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TranscriptSegment } from '@/types/recording';
import { downloadTextFile, shareText } from '@/lib/shareUtils';
import { formatTime } from '@/lib/formatters';
import { toast } from 'sonner';

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
  const [isTranslated, setIsTranslated] = useState(false);

  const generateTranslatedText = () => {
    if (!transcript) return '';
    let text = `📋 ${title} - Translation (${selectedLanguage.name})\n\n`;
    text += `Note: This is a demo translation preview.\n\n`;
    transcript.forEach((seg) => {
      text += `[${formatTime(seg.startTime)}] ${seg.speaker ? `${seg.speaker}: ` : ''}${seg.text}\n`;
    });
    return text;
  };

  const handleDownload = () => {
    const text = generateTranslatedText();
    downloadTextFile(`${title.replace(/\s+/g, '_')}_${selectedLanguage.code}.txt`, text);
    toast.success(`Translation saved (${selectedLanguage.name})`);
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
                  setIsTranslated(false);
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
          Translation to {selectedLanguage.name}
        </div>
        
        <div className="space-y-3">
          {transcript.slice(0, 5).map((segment, index) => (
            <motion.div
              key={segment.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="text-sm text-foreground"
            >
              <span className="text-xs text-primary font-mono mr-2">
                {Math.floor(segment.startTime / 60)}:{(segment.startTime % 60).toString().padStart(2, '0')}
              </span>
              {segment.speaker && <span className="font-medium">{segment.speaker}: </span>}
              {segment.text}
            </motion.div>
          ))}
          {transcript.length > 5 && (
            <p className="text-sm text-muted-foreground">
              + {transcript.length - 5} more segments...
            </p>
          )}
        </div>

        <p className="text-xs text-muted-foreground italic">
          Pro tip: Translation preserves original timestamps for easy reference
        </p>
      </div>

      <Button className="w-full" onClick={() => setIsTranslated(true)}>
        <Globe className="w-4 h-4 mr-2" />
        Translate Full Transcript
      </Button>

      {/* Download/Share actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={handleShare}>
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
        <Button variant="outline" onClick={handleDownload}>
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>
    </div>
  );
}