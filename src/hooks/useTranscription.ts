import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TranscriptSegment, Recording } from '@/types/recording';

interface TranscriptionResult {
  transcript: TranscriptSegment[];
  chapters?: any[];
  checkpoints?: any[];
  summary?: any;
  quoteCards?: any[];
  highlightReel?: any;
}

export function useTranscription() {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const transcribe = useCallback(async (
    audioBase64: string,
    duration: number
  ): Promise<TranscriptSegment[] | null> => {
    setIsTranscribing(true);
    setProgress(10);
    setError(null);

    try {
      console.log('Starting transcription...');
      
      const { data, error: fnError } = await supabase.functions.invoke('transcribe', {
        body: { audioBase64, duration }
      });

      if (fnError) {
        console.error('Transcription function error:', fnError);
        throw new Error(fnError.message);
      }

      setProgress(50);

      if (data?.transcript) {
        console.log('Transcription complete:', data.transcript.length, 'segments');
        return data.transcript;
      }

      throw new Error('No transcript returned');
    } catch (err) {
      console.error('Transcription error:', err);
      setError(err instanceof Error ? err.message : 'Transcription failed');
      return null;
    } finally {
      setIsTranscribing(false);
      setProgress(100);
    }
  }, []);

  const generateAIContent = useCallback(async (
    transcript: TranscriptSegment[],
    duration: number,
    title: string
  ): Promise<Partial<Recording> | null> => {
    setIsGeneratingContent(true);
    setProgress(60);
    setError(null);

    try {
      console.log('Generating AI content...');

      const { data, error: fnError } = await supabase.functions.invoke('generate-ai-content', {
        body: { transcript, duration, title, type: 'all' }
      });

      if (fnError) {
        console.error('AI content generation error:', fnError);
        throw new Error(fnError.message);
      }

      setProgress(90);

      if (data) {
        console.log('AI content generated successfully');
        return {
          chapters: data.chapters,
          checkpoints: data.checkpoints,
          summary: data.summary,
          quoteCards: data.quoteCards,
          highlightReel: data.highlightReel,
        };
      }

      throw new Error('No AI content returned');
    } catch (err) {
      console.error('AI content generation error:', err);
      setError(err instanceof Error ? err.message : 'Content generation failed');
      return null;
    } finally {
      setIsGeneratingContent(false);
      setProgress(100);
    }
  }, []);

  const processRecording = useCallback(async (
    audioBase64: string,
    duration: number,
    title: string
  ): Promise<TranscriptionResult | null> => {
    // Step 1: Transcribe
    const transcript = await transcribe(audioBase64, duration);
    
    if (!transcript) {
      return null;
    }

    // Step 2: Generate AI content
    const aiContent = await generateAIContent(transcript, duration, title);
    
    return {
      transcript,
      ...aiContent
    };
  }, [transcribe, generateAIContent]);

  return {
    transcribe,
    generateAIContent,
    processRecording,
    isTranscribing,
    isGeneratingContent,
    isProcessing: isTranscribing || isGeneratingContent,
    progress,
    error,
  };
}
