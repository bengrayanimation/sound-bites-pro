import { useState } from 'react';
import { motion } from 'framer-motion';
import { StickyNote, Bold, Italic, List, ListOrdered, Heading2, Quote as QuoteIcon, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface NotesEditorProps {
  notes: string;
  onNotesChange: (notes: string) => void;
  isRecording: boolean;
}

export function NotesEditor({ notes, onNotesChange, isRecording }: NotesEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('recording-notes') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = notes.substring(start, end);
    
    const newText = 
      notes.substring(0, start) + 
      prefix + selectedText + suffix + 
      notes.substring(end);
    
    onNotesChange(newText);
  };

  const insertAtLineStart = (prefix: string) => {
    const textarea = document.getElementById('recording-notes') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lineStart = notes.lastIndexOf('\n', start - 1) + 1;
    
    const newText = 
      notes.substring(0, lineStart) + 
      prefix + 
      notes.substring(lineStart);
    
    onNotesChange(newText);
  };

  if (!isRecording) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`fixed bottom-24 left-4 right-4 z-20 ${isExpanded ? 'top-24' : ''}`}
    >
      <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border bg-muted/50">
          <div className="flex items-center gap-2">
            <StickyNote className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Notes</span>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Recording" />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Formatting toolbar */}
        <div className="flex items-center gap-1 p-2 border-b border-border">
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7"
            onClick={() => insertFormatting('**', '**')}
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7"
            onClick={() => insertFormatting('_', '_')}
            title="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </Button>
          <div className="w-px h-5 bg-border mx-1" />
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7"
            onClick={() => insertAtLineStart('## ')}
            title="Heading"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7"
            onClick={() => insertAtLineStart('• ')}
            title="Bullet list"
          >
            <List className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7"
            onClick={() => insertAtLineStart('1. ')}
            title="Numbered list"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7"
            onClick={() => insertAtLineStart('> ')}
            title="Quote"
          >
            <QuoteIcon className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Editor */}
        <Textarea
          id="recording-notes"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Take notes while recording...

Use formatting:
• **bold** for emphasis
• _italic_ for subtle emphasis
• ## for headings
• > for quotes"
          className={`border-0 rounded-none focus-visible:ring-0 resize-none font-mono text-sm ${
            isExpanded ? 'min-h-[300px]' : 'min-h-[120px] max-h-[120px]'
          }`}
        />
      </div>
    </motion.div>
  );
}
