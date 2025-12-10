import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TranscriptSegment } from '@/types/recording';

interface TranslateViewProps {
  transcript?: TranscriptSegment[];
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

export function TranslateView({ transcript }: TranslateViewProps) {
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [isTranslating, setIsTranslating] = useState(false);

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
                onClick={() => setSelectedLanguage(lang)}
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
          {transcript.slice(0, 3).map((segment, index) => (
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
              {segment.text}
            </motion.div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground italic">
          Pro tip: Translation preserves original timestamps for easy reference
        </p>
      </div>

      <Button className="w-full" onClick={() => setIsTranslating(true)}>
        <Globe className="w-4 h-4 mr-2" />
        Translate Full Transcript
      </Button>
    </div>
  );
}
