import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Recording } from '@/types/recording';

interface RecordingState {
  recordings: Recording[];
  freeRecordingsLeft: number;
  isPro: boolean;
  addRecording: (recording: Recording) => void;
  updateRecording: (id: string, updates: Partial<Recording>) => void;
  deleteRecording: (id: string) => void;
  togglePin: (id: string) => void;
  decrementFreeRecordings: () => boolean;
  upgradeToPro: () => void;
}

// Demo recordings for showcase
const demoRecordings: Recording[] = [
  {
    id: '1',
    title: 'Team Standup Notes',
    duration: 324,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isPinned: true,
    isTranscribed: true,
    transcript: [
      { id: 't1', text: "Good morning everyone. Let's start with updates.", startTime: 0, endTime: 5 },
      { id: 't2', text: "I finished the authentication module yesterday.", startTime: 5, endTime: 10 },
      { id: 't3', text: "Today I'll be working on the dashboard components.", startTime: 10, endTime: 15 },
    ],
    chapters: [
      { id: 'c1', title: 'Opening & Introductions', startTime: 0, endTime: 60, bullets: ['Team check-in', 'Agenda overview'], keyQuote: "Let's make this a productive week." },
      { id: 'c2', title: 'Development Updates', startTime: 60, endTime: 180, bullets: ['Auth module complete', 'Dashboard in progress'], keyQuote: "We're on track for the deadline." },
    ],
    checkpoints: [
      { id: 'cp1', type: 'task', text: 'Complete dashboard by Friday', timestamp: 120 },
      { id: 'cp2', type: 'decision', text: 'Use React Query for data fetching', timestamp: 180 },
    ],
    summary: {
      executive: {
        keyPoints: ['Auth module completed', 'Dashboard components in progress'],
        decisions: ['Adopt React Query for state management'],
        nextSteps: ['Finish dashboard by Friday', 'Review PR for auth module'],
      },
      student: {
        chapters: ['Team sync meeting covering development progress'],
        glossary: [{ term: 'Standup', definition: 'Brief daily team sync meeting' }],
        quiz: [{ question: 'What was completed?', answer: 'Authentication module' }],
      },
    },
    quoteCards: [
      { id: 'q1', quote: "We're ahead of schedule and the team is aligned.", speaker: 'Project Lead', timestamp: 200, style: 'minimal' },
    ],
  },
  {
    id: '2',
    title: 'Product Brainstorm',
    duration: 1847,
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000),
    isPinned: true,
    isTranscribed: true,
  },
  {
    id: '3',
    title: 'Client Call - Acme Corp',
    duration: 2156,
    createdAt: new Date(Date.now() - 50 * 60 * 60 * 1000),
    isPinned: false,
    isTranscribed: true,
  },
];

export const useRecordingStore = create<RecordingState>()(
  persist(
    (set, get) => ({
      recordings: demoRecordings,
      freeRecordingsLeft: 3,
      isPro: false,
      
      addRecording: (recording) => {
        set((state) => ({
          recordings: [recording, ...state.recordings],
        }));
      },
      
      updateRecording: (id, updates) => {
        set((state) => ({
          recordings: state.recordings.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        }));
      },
      
      deleteRecording: (id) => {
        set((state) => ({
          recordings: state.recordings.filter((r) => r.id !== id),
        }));
      },
      
      togglePin: (id) => {
        set((state) => ({
          recordings: state.recordings.map((r) =>
            r.id === id ? { ...r, isPinned: !r.isPinned } : r
          ),
        }));
      },
      
      decrementFreeRecordings: () => {
        const { freeRecordingsLeft, isPro } = get();
        if (isPro) return true;
        if (freeRecordingsLeft <= 0) return false;
        set({ freeRecordingsLeft: freeRecordingsLeft - 1 });
        return true;
      },
      
      upgradeToPro: () => {
        set({ isPro: true });
      },
    }),
    {
      name: 'soundbites-storage',
    }
  )
);
