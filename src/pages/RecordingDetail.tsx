import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Pin, Share2, MoreVertical, Trash2, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AudioPlayer } from '@/components/session/AudioPlayer';
import { TranscriptView } from '@/components/session/TranscriptView';
import { ChaptersView } from '@/components/session/ChaptersView';
import { CheckpointsView } from '@/components/session/CheckpointsView';
import { SummaryView } from '@/components/session/SummaryView';
import { TranslateView } from '@/components/session/TranslateView';
import { QuoteCardsView } from '@/components/session/QuoteCardsView';
import { HighlightReelView } from '@/components/session/HighlightReelView';
import { useRecordingStore } from '@/stores/recordingStore';
import { formatDuration } from '@/lib/formatters';
import { toast } from '@/hooks/use-toast';

export default function RecordingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { recordings, togglePin, deleteRecording } = useRecordingStore();

  const recording = recordings.find((r) => r.id === id);

  if (!recording) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Recording not found</h2>
          <Button onClick={() => navigate('/library')}>Go to Library</Button>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    deleteRecording(recording.id);
    toast({
      title: 'Recording deleted',
      description: 'The recording has been removed.',
    });
    navigate('/library');
  };

  const handleShare = () => {
    toast({
      title: 'Share',
      description: 'Sharing functionality coming soon!',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => togglePin(recording.id)}
            >
              <Pin
                className={`w-5 h-5 ${recording.isPinned ? 'fill-primary text-primary' : ''}`}
              />
            </Button>
            
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Share2 className="w-5 h-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Recording info */}
        <div className="px-4 pb-4">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl font-bold text-foreground mb-1"
          >
            {recording.title}
          </motion.h1>
          <p className="text-sm text-muted-foreground">
            {formatDuration(recording.duration)} • {recording.createdAt.toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="p-4 pb-24">
        <Tabs defaultValue="audio" className="w-full">
          <TabsList className="w-full overflow-x-auto flex justify-start gap-1 mb-6 bg-transparent p-0 h-auto">
            <TabsTrigger value="audio" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2 text-sm">
              Audio
            </TabsTrigger>
            <TabsTrigger value="transcript" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2 text-sm">
              Transcript
            </TabsTrigger>
            <TabsTrigger value="chapters" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2 text-sm">
              Chapters
            </TabsTrigger>
            <TabsTrigger value="checkpoints" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2 text-sm">
              Checkpoints
            </TabsTrigger>
            <TabsTrigger value="summary" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2 text-sm">
              Summary
            </TabsTrigger>
            <TabsTrigger value="translate" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2 text-sm">
              Translate
            </TabsTrigger>
            <TabsTrigger value="quotes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2 text-sm">
              Quotes
            </TabsTrigger>
            <TabsTrigger value="highlights" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2 text-sm">
              Highlights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="audio">
            <AudioPlayer duration={recording.duration} />
          </TabsContent>

          <TabsContent value="transcript">
            <TranscriptView transcript={recording.transcript} />
          </TabsContent>

          <TabsContent value="chapters">
            <ChaptersView chapters={recording.chapters} />
          </TabsContent>

          <TabsContent value="checkpoints">
            <CheckpointsView checkpoints={recording.checkpoints} />
          </TabsContent>

          <TabsContent value="summary">
            <SummaryView summary={recording.summary} />
          </TabsContent>

          <TabsContent value="translate">
            <TranslateView transcript={recording.transcript} />
          </TabsContent>

          <TabsContent value="quotes">
            <QuoteCardsView quoteCards={recording.quoteCards} />
          </TabsContent>

          <TabsContent value="highlights">
            <HighlightReelView highlightReel={recording.highlightReel} duration={recording.duration} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
