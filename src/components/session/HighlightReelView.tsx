import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Play, Share2, Download, Sparkles, Pause, Clock, Video, Music, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HighlightReel, TranscriptSegment } from '@/types/recording';
import { formatTime } from '@/lib/formatters';
import { shareText, downloadTextFile } from '@/lib/shareUtils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface VideoScene {
  sceneNumber: number;
  startTime: number;
  endTime: number;
  visualType: string;
  caption: string;
  visualDescription: string;
  transition: string;
}

interface VideoStoryboard {
  title: string;
  duration: number;
  style: string;
  colorPalette: string[];
  scenes: VideoScene[];
  soundtrack?: {
    mood: string;
    tempo: string;
  };
}

interface HighlightReelViewProps {
  highlightReel?: HighlightReel;
  duration: number;
  title?: string;
  transcript?: TranscriptSegment[];
}

export function HighlightReelView({ highlightReel, duration, title = 'Recording', transcript }: HighlightReelViewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'audio' | 'video'>('audio');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoStoryboard, setVideoStoryboard] = useState<VideoStoryboard | null>(null);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);

  const handleShare = async () => {
    if (!highlightReel) return;
    let text = `🎬 Highlight Reel: ${title}\n\nKey Moments:\n`;
    highlightReel.moments.forEach((m, i) => {
      text += `${i + 1}. ${m.caption} (${formatTime(m.startTime)} - ${formatTime(m.endTime)})\n`;
    });
    const shared = await shareText(`Highlight Reel: ${title}`, text);
    if (shared) toast.success('Highlight reel shared!');
  };

  const handleExport = () => {
    if (!highlightReel) return;
    let text = `Highlight Reel: ${title}\n\nKey Moments:\n`;
    highlightReel.moments.forEach((m, i) => {
      text += `${i + 1}. ${m.caption} (${formatTime(m.startTime)} - ${formatTime(m.endTime)})\n`;
    });
    
    if (videoStoryboard) {
      text += `\n\n--- Video Storyboard ---\n`;
      text += `Style: ${videoStoryboard.style}\n`;
      text += `Colors: ${videoStoryboard.colorPalette.join(', ')}\n\n`;
      videoStoryboard.scenes.forEach((scene) => {
        text += `Scene ${scene.sceneNumber}: ${scene.caption}\n`;
        text += `  Visual: ${scene.visualDescription}\n`;
        text += `  Transition: ${scene.transition}\n\n`;
      });
    }
    
    downloadTextFile(`${title.replace(/\s+/g, '_')}_highlight_reel.txt`, text);
    toast.success('Highlight reel exported');
  };

  const generateVideoVersion = async () => {
    if (!highlightReel) return;
    
    setIsGeneratingVideo(true);
    toast.loading('Generating AI video storyboard...', { id: 'video-gen' });
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-highlight-video', {
        body: {
          highlightReel,
          title,
          transcript
        }
      });

      if (error) throw error;

      if (data?.videoStoryboard) {
        setVideoStoryboard(data.videoStoryboard);
        setActiveTab('video');
        toast.success('Video storyboard generated!', { id: 'video-gen' });
      } else {
        throw new Error('No video data returned');
      }
    } catch (error) {
      console.error('Video generation error:', error);
      toast.error('Failed to generate video. Please try again.', { id: 'video-gen' });
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  if (!highlightReel) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-6"
        >
          <Film className="w-10 h-10 text-muted-foreground" />
        </motion.div>
        <h3 className="font-bold text-xl text-foreground mb-2">Generate Highlight Reel</h3>
        <p className="text-sm text-muted-foreground max-w-xs mb-6">
          Create a 60-second reel of the most important moments from this recording
        </p>
        <Button className="shadow-record">
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Reel
        </Button>
      </div>
    );
  }

  const waveformBars = Array.from({ length: 40 }, (_, i) => ({
    height: 20 + Math.sin(i * 0.3) * 30 + Math.random() * 30,
  }));

  return (
    <div className="space-y-6">
      {/* Toggle between audio and video */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'audio' | 'video')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="audio" className="gap-2">
            <Music className="w-4 h-4" />
            Audio Reel
          </TabsTrigger>
          <TabsTrigger value="video" className="gap-2" disabled={!videoStoryboard && !isGeneratingVideo}>
            <Video className="w-4 h-4" />
            Video Reel
          </TabsTrigger>
        </TabsList>

        <TabsContent value="audio" className="space-y-6 mt-6">
          {/* Audio Reel preview */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-gradient-to-br from-foreground to-foreground/90 rounded-2xl aspect-video flex items-center justify-center overflow-hidden shadow-xl"
          >
            <div className="absolute inset-0 flex items-center justify-center gap-1 px-8">
              {waveformBars.map((bar, i) => (
                <motion.div
                  key={i}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: i * 0.02, duration: 0.3 }}
                  className="flex-1 bg-background/20 rounded-full"
                  style={{ height: `${bar.height}%` }}
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsPlaying(!isPlaying)}
              className="relative z-10 w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-record"
            >
              {isPlaying ? (
                <Pause className="w-9 h-9 text-primary-foreground fill-current" />
              ) : (
                <Play className="w-9 h-9 text-primary-foreground fill-current ml-1" />
              )}
            </motion.button>

            <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-2 bg-background/95 rounded-full text-sm font-semibold shadow-lg">
              <Clock className="w-3.5 h-3.5" />
              {formatTime(highlightReel.duration)}
            </div>

            <div className="absolute top-4 left-4 px-3 py-1.5 bg-primary rounded-full text-xs font-semibold text-primary-foreground">
              {highlightReel.moments.length} key moments
            </div>
          </motion.div>

          {/* Key moments */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Key Moments
            </h3>
            <div className="space-y-2">
              {highlightReel.moments.map((moment, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 p-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Play className="w-3.5 h-3.5 text-primary fill-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{moment.caption}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatTime(moment.startTime)} - {formatTime(moment.endTime)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="video" className="space-y-6 mt-6">
          {videoStoryboard ? (
            <>
              {/* Video Storyboard preview */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-2xl aspect-video overflow-hidden shadow-xl"
                style={{
                  background: `linear-gradient(135deg, ${videoStoryboard.colorPalette[0] || '#1a1a2e'}, ${videoStoryboard.colorPalette[1] || '#D4A574'})`
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentSceneIndex}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.1 }}
                      className="text-center p-8"
                    >
                      <p className="text-white/60 text-sm mb-2">
                        Scene {videoStoryboard.scenes[currentSceneIndex]?.sceneNumber || 1}
                      </p>
                      <p className="text-white text-xl font-semibold mb-4">
                        {videoStoryboard.scenes[currentSceneIndex]?.caption || 'Loading...'}
                      </p>
                      <p className="text-white/80 text-sm max-w-md mx-auto">
                        {videoStoryboard.scenes[currentSceneIndex]?.visualDescription || ''}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2">
                  {videoStoryboard.scenes.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSceneIndex(i)}
                      className={`flex-1 h-1.5 rounded-full transition-all ${
                        i === currentSceneIndex ? 'bg-white' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>

                <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/20 rounded-full text-xs font-semibold text-white backdrop-blur-sm">
                  {videoStoryboard.style}
                </div>
              </motion.div>

              {/* Video scenes list */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Video className="w-4 h-4 text-primary" />
                  Video Scenes
                </h3>
                <div className="space-y-2">
                  {videoStoryboard.scenes.map((scene, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setCurrentSceneIndex(i)}
                      className={`flex items-start gap-3 p-4 bg-card border rounded-xl transition-all cursor-pointer ${
                        i === currentSceneIndex ? 'border-primary' : 'border-border hover:border-primary/30'
                      }`}
                    >
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{
                          background: `linear-gradient(135deg, ${videoStoryboard.colorPalette[i % videoStoryboard.colorPalette.length] || '#D4A574'}, ${videoStoryboard.colorPalette[(i + 1) % videoStoryboard.colorPalette.length] || '#1a1a2e'})`
                        }}
                      >
                        {scene.sceneNumber}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{scene.caption}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {scene.visualDescription}
                        </p>
                        <p className="text-xs text-primary mt-1">
                          Transition: {scene.transition}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-4">
                Generate an AI video version of your highlight reel
              </p>
              <Button onClick={generateVideoVersion} disabled={isGeneratingVideo}>
                {isGeneratingVideo ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4 mr-2" />
                    Generate Video
                  </>
                )}
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Generate video button (shown in audio tab) */}
      {activeTab === 'audio' && !videoStoryboard && (
        <Button 
          variant="secondary" 
          className="w-full" 
          onClick={generateVideoVersion}
          disabled={isGeneratingVideo}
        >
          {isGeneratingVideo ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Video...
            </>
          ) : (
            <>
              <Video className="w-4 h-4 mr-2" />
              Generate AI Video Version
            </>
          )}
        </Button>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={handleShare}>
          <Share2 className="w-4 h-4 mr-2" />
          Share Reel
        </Button>
        <Button variant="outline" className="flex-1" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  );
}
