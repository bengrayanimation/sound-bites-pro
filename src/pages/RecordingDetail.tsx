import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Pin, Share2, MoreVertical, Trash2, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
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

  const tabs = [
    { value: 'audio', label: 'Audio' },
    { value: 'transcript', label: 'Transcript' },
    { value: 'chapters', label: 'Chapters' },
    { value: 'checkpoints', label: 'Checkpoints' },
    { value: 'summary', label: 'Summary' },
    { value: 'translate', label: 'Translate' },
    { value: 'quotes', label: 'Quotes' },
    { value: 'highlights', label: 'Highlights' },
  ];

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
          {/* Scrollable tab list */}
          <ScrollArea className="w-full whitespace-nowrap mb-6">
            <TabsList className="inline-flex w-max gap-1 bg-transparent p-0 h-auto">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2 text-sm font-medium transition-all"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <ScrollBar orientation="horizontal" className="invisible" />
          </ScrollArea>

          <TabsContent value="audio" className="mt-0 animate-fade-in">
            <AudioPlayer duration={recording.duration} />
          </TabsContent>

          <TabsContent value="transcript" className="mt-0 animate-fade-in">
            <TranscriptView transcript={recording.transcript} />
          </TabsContent>

          <TabsContent value="chapters" className="mt-0 animate-fade-in">
            <ChaptersView chapters={recording.chapters} />
          </TabsContent>

          <TabsContent value="checkpoints" className="mt-0 animate-fade-in">
            <CheckpointsView checkpoints={recording.checkpoints} />
          </TabsContent>

          <TabsContent value="summary" className="mt-0 animate-fade-in">
            <SummaryView summary={recording.summary} />
          </TabsContent>

          <TabsContent value="translate" className="mt-0 animate-fade-in">
            <TranslateView transcript={recording.transcript} />
          </TabsContent>

          <TabsContent value="quotes" className="mt-0 animate-fade-in">
            <QuoteCardsView quoteCards={recording.quoteCards} />
          </TabsContent>

          <TabsContent value="highlights" className="mt-0 animate-fade-in">
            <HighlightReelView highlightReel={recording.highlightReel} duration={recording.duration} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
