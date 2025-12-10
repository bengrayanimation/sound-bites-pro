export interface Recording {
  id: string;
  title: string;
  duration: number; // in seconds
  createdAt: Date;
  audioUrl?: string;
  isPinned: boolean;
  isTranscribed: boolean;
  transcript?: TranscriptSegment[];
  chapters?: Chapter[];
  checkpoints?: Checkpoint[];
  summary?: Summary;
  quoteCards?: QuoteCard[];
  highlightReel?: HighlightReel;
}

export interface TranscriptSegment {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  speaker?: string;
}

export interface Chapter {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  bullets: string[];
  keyQuote?: string;
}

export interface Checkpoint {
  id: string;
  type: 'decision' | 'task' | 'definition' | 'question';
  text: string;
  timestamp: number;
}

export interface Summary {
  executive: {
    keyPoints: string[];
    decisions: string[];
    nextSteps: string[];
  };
  student: {
    chapters: string[];
    glossary: { term: string; definition: string }[];
    quiz: { question: string; answer: string }[];
  };
}

export interface QuoteCard {
  id: string;
  quote: string;
  speaker: string;
  timestamp: number;
  style: 'minimal' | 'bold' | 'corporate' | 'student';
}

export interface HighlightReel {
  id: string;
  duration: number;
  moments: {
    startTime: number;
    endTime: number;
    caption: string;
  }[];
  audioUrl?: string;
}

export type RecordingGroup = {
  label: string;
  recordings: Recording[];
};
