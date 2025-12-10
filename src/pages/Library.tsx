import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Mic, Pin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RecordingCard } from '@/components/RecordingCard';
import { useRecordingStore } from '@/stores/recordingStore';
import { groupRecordingsByDate } from '@/lib/formatters';
import { toast } from '@/hooks/use-toast';

export default function Library() {
  const navigate = useNavigate();
  const { recordings, togglePin, deleteRecording } = useRecordingStore();
  const [renameId, setRenameId] = useState<string | null>(null);

  const pinnedRecordings = recordings.filter((r) => r.isPinned);
  const unpinnedRecordings = recordings.filter((r) => !r.isPinned);
  const groupedRecordings = groupRecordingsByDate(unpinnedRecordings);

  const handleDelete = (id: string) => {
    deleteRecording(id);
    toast({
      title: 'Recording deleted',
      description: 'The recording has been removed from your library.',
    });
  };

  const handleShare = (id: string) => {
    toast({
      title: 'Share',
      description: 'Sharing functionality coming soon!',
    });
  };

  const handleRename = (id: string) => {
    toast({
      title: 'Rename',
      description: 'Rename functionality coming soon!',
    });
  };

  if (recordings.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="flex items-center gap-3 p-4 border-b border-border">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold text-foreground">Library</h1>
        </header>

        {/* Empty state */}
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <Mic className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            No recordings yet
          </h2>
          <p className="text-muted-foreground mb-8">
            Start capturing your thoughts and conversations
          </p>
          <Button onClick={() => navigate('/')}>
            <Mic className="w-4 h-4 mr-2" />
            Record now
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 p-4 border-b border-border bg-background/95 backdrop-blur-sm">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold text-foreground">Library</h1>
        <span className="ml-auto text-sm text-muted-foreground">
          {recordings.length} recording{recordings.length !== 1 ? 's' : ''}
        </span>
      </header>

      <main className="p-4 pb-24 space-y-6">
        {/* Pinned section */}
        <AnimatePresence>
          {pinnedRecordings.length > 0 && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Pin className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Pinned
                </span>
              </div>
              <div className="space-y-2">
                {pinnedRecordings.map((recording) => (
                  <RecordingCard
                    key={recording.id}
                    recording={recording}
                    onSelect={() => navigate(`/recording/${recording.id}`)}
                    onPin={() => togglePin(recording.id)}
                    onDelete={() => handleDelete(recording.id)}
                    onRename={() => handleRename(recording.id)}
                    onShare={() => handleShare(recording.id)}
                  />
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Grouped by date */}
        {groupedRecordings.map((group) => (
          <section key={group.label}>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              {group.label}
            </h2>
            <div className="space-y-2">
              {group.items.map((recording) => (
                <RecordingCard
                  key={recording.id}
                  recording={recording}
                  onSelect={() => navigate(`/recording/${recording.id}`)}
                  onPin={() => togglePin(recording.id)}
                  onDelete={() => handleDelete(recording.id)}
                  onRename={() => handleRename(recording.id)}
                  onShare={() => handleShare(recording.id)}
                />
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
