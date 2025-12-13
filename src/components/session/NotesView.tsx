import { useState } from 'react';
import { motion } from 'framer-motion';
import { StickyNote, Share2, Download, Bold, Italic, List, ListOrdered, Heading2, Quote as QuoteIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { shareText, downloadTextFile, downloadFile } from '@/lib/shareUtils';
import { toast } from 'sonner';

interface NotesViewProps {
  notes?: string;
  title?: string;
  onUpdateNotes?: (notes: string) => void;
}

export function NotesView({ notes = '', title = 'Recording', onUpdateNotes }: NotesViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState(notes);

  const handleShare = async () => {
    if (!notes) {
      toast.error('No notes to share');
      return;
    }
    const shared = await shareText(`Notes: ${title}`, notes);
    if (shared) toast.success('Notes shared!');
  };

  const handleSave = () => {
    if (!notes) {
      toast.error('No notes to save');
      return;
    }
    downloadTextFile(`${title.replace(/\s+/g, '_')}_notes.txt`, notes);
    toast.success('Notes saved as TXT');
  };

  const handleSaveHtml = () => {
    if (!notes) {
      toast.error('No notes to save');
      return;
    }
    const htmlContent = generateNotesHtml(notes, title);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    downloadFile(`${title.replace(/\s+/g, '_')}_notes.html`, blob);
    toast.success('Notes saved as HTML');
  };

  const startEditing = () => {
    setEditedNotes(notes || '');
    setIsEditing(true);
  };

  const saveNotes = () => {
    onUpdateNotes?.(editedNotes);
    setIsEditing(false);
    toast.success('Notes saved');
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditedNotes(notes || '');
  };

  if (!notes && !isEditing) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4"
        >
          <StickyNote className="w-8 h-8 text-muted-foreground" />
        </motion.div>
        <h3 className="font-semibold text-foreground mb-2">No notes yet</h3>
        <p className="text-sm text-muted-foreground max-w-xs mb-6">
          Add notes to this recording to capture your thoughts
        </p>
        <Button onClick={startEditing}>
          <StickyNote className="w-4 h-4 mr-2" />
          Add Notes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isEditing ? (
        <>
          <Textarea
            value={editedNotes}
            onChange={(e) => setEditedNotes(e.target.value)}
            placeholder="Write your notes here..."
            className="min-h-[300px] text-sm"
          />
          <div className="flex gap-3">
            <Button onClick={saveNotes} className="flex-1">Save Notes</Button>
            <Button variant="outline" onClick={cancelEdit}>Cancel</Button>
          </div>
        </>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-6 min-h-[200px] whitespace-pre-wrap"
          >
            {notes}
          </motion.div>
          <Button variant="outline" className="w-full" onClick={startEditing}>
            <StickyNote className="w-4 h-4 mr-2" />Edit Notes
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={handleShare}><Share2 className="w-4 h-4 mr-2" />Share</Button>
            <Button variant="outline" onClick={handleSave}><Download className="w-4 h-4 mr-2" />Save TXT</Button>
          </div>
        </>
      )}
    </div>
  );
}

function generateNotesHtml(notes: string, title: string): string {
  return `<!DOCTYPE html><html><head><title>Notes - ${title}</title><style>body{font-family:sans-serif;max-width:800px;margin:40px auto;padding:20px;}</style></head><body><h1>${title}</h1><pre>${notes}</pre></body></html>`;
}
