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

// Rich demo recordings with full AI features
const demoRecordings: Recording[] = [
  {
    id: '1',
    title: 'Team Standup Notes',
    duration: 324,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isPinned: true,
    isTranscribed: true,
    transcript: [
      { id: 't1', text: "Good morning everyone. Let's start with updates from the team.", startTime: 0, endTime: 5, speaker: 'Sarah' },
      { id: 't2', text: "I finished the authentication module yesterday and ran all the unit tests.", startTime: 5, endTime: 12, speaker: 'Mike' },
      { id: 't3', text: "Great work Mike. Any blockers we should know about?", startTime: 12, endTime: 16, speaker: 'Sarah' },
      { id: 't4', text: "Just waiting on the API keys from DevOps, should have them by noon.", startTime: 16, endTime: 22, speaker: 'Mike' },
      { id: 't5', text: "Today I'll be working on the dashboard components and data visualization.", startTime: 22, endTime: 28, speaker: 'Emily' },
      { id: 't6', text: "I've also started documenting the component library for the team.", startTime: 28, endTime: 34, speaker: 'Emily' },
      { id: 't7', text: "Perfect. Let's sync again tomorrow at the same time.", startTime: 34, endTime: 40, speaker: 'Sarah' },
    ],
    chapters: [
      { 
        id: 'c1', 
        title: 'Opening & Introductions', 
        startTime: 0, 
        endTime: 60, 
        bullets: ['Team check-in', 'Agenda overview', 'Sprint progress review'], 
        keyQuote: "Let's make this a productive week." 
      },
      { 
        id: 'c2', 
        title: 'Development Updates', 
        startTime: 60, 
        endTime: 180, 
        bullets: ['Auth module complete', 'Dashboard in progress', 'Documentation started'], 
        keyQuote: "We're on track for the Friday deadline." 
      },
      { 
        id: 'c3', 
        title: 'Blockers & Dependencies', 
        startTime: 180, 
        endTime: 260, 
        bullets: ['API keys pending', 'DevOps coordination needed'], 
        keyQuote: "Should have everything resolved by noon." 
      },
    ],
    checkpoints: [
      { id: 'cp1', type: 'task', text: 'Complete dashboard by Friday', timestamp: 120 },
      { id: 'cp2', type: 'decision', text: 'Use React Query for data fetching', timestamp: 180 },
      { id: 'cp3', type: 'task', text: 'Get API keys from DevOps', timestamp: 200 },
      { id: 'cp4', type: 'question', text: 'What testing framework for E2E?', timestamp: 240 },
    ],
    summary: {
      executive: {
        keyPoints: ['Auth module completed and tested', 'Dashboard components in progress', 'Documentation initiative started'],
        decisions: ['Adopt React Query for state management', 'Friday deadline confirmed'],
        nextSteps: ['Finish dashboard by Friday', 'Get API keys by noon', 'Review PR for auth module'],
      },
      student: {
        chapters: ['Team sync meeting covering sprint progress and development updates'],
        glossary: [
          { term: 'Standup', definition: 'Brief daily team sync meeting to share progress and blockers' },
          { term: 'Sprint', definition: 'A fixed time period for completing a set of work items' },
        ],
        quiz: [
          { question: 'What was completed yesterday?', answer: 'Authentication module' },
          { question: 'What is the Friday deadline for?', answer: 'Dashboard components' },
        ],
      },
    },
    quoteCards: [
      { id: 'q1', quote: "We're ahead of schedule and the team is fully aligned on priorities.", speaker: 'Sarah', timestamp: 200, style: 'minimal' },
      { id: 'q2', quote: "The auth module is rock solid - all 47 unit tests passing.", speaker: 'Mike', timestamp: 85, style: 'corporate' },
      { id: 'q3', quote: "Documentation will save us hours in the long run.", speaker: 'Emily', timestamp: 150, style: 'student' },
    ],
    highlightReel: {
      id: 'hr1',
      duration: 60,
      moments: [
        { startTime: 5, endTime: 12, caption: 'Auth module completed' },
        { startTime: 60, endTime: 75, caption: 'Dashboard progress update' },
        { startTime: 180, endTime: 195, caption: 'Key decision on React Query' },
        { startTime: 280, endTime: 300, caption: 'Next steps aligned' },
      ],
    },
  },
  {
    id: '2',
    title: 'Product Brainstorm',
    duration: 1847,
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000),
    isPinned: true,
    isTranscribed: true,
    transcript: [
      { id: 't1', text: "Let's explore new feature ideas for Q2.", startTime: 0, endTime: 4, speaker: 'Product Lead' },
      { id: 't2', text: "I've been hearing a lot of requests for AI-powered summaries.", startTime: 4, endTime: 10, speaker: 'Designer' },
      { id: 't3', text: "That aligns with our roadmap. What about the implementation timeline?", startTime: 10, endTime: 16, speaker: 'Product Lead' },
    ],
    chapters: [
      { id: 'c1', title: 'Feature Ideation', startTime: 0, endTime: 600, bullets: ['AI summaries', 'Export improvements', 'Mobile redesign'], keyQuote: 'AI-powered features are the future.' },
      { id: 'c2', title: 'Prioritization', startTime: 600, endTime: 1200, bullets: ['Impact scoring', 'Resource allocation'], keyQuote: 'Focus on high-impact, low-effort wins.' },
    ],
    checkpoints: [
      { id: 'cp1', type: 'decision', text: 'Prioritize AI summaries for Q2', timestamp: 300 },
      { id: 'cp2', type: 'task', text: 'Create design mockups by next week', timestamp: 800 },
    ],
    summary: {
      executive: {
        keyPoints: ['AI summaries top priority', 'Mobile redesign scheduled for Q3'],
        decisions: ['Focus Q2 on AI features'],
        nextSteps: ['Design mockups due next week', 'Engineering spike on AI integration'],
      },
      student: {
        chapters: ['Product brainstorming session for Q2 planning'],
        glossary: [{ term: 'Roadmap', definition: 'Strategic plan for product development' }],
        quiz: [{ question: 'What is the Q2 priority?', answer: 'AI-powered summaries' }],
      },
    },
    quoteCards: [
      { id: 'q1', quote: "AI-powered features will set us apart from the competition.", speaker: 'Product Lead', timestamp: 250, style: 'bold' },
      { id: 'q2', quote: "Focus on high-impact, low-effort wins first.", speaker: 'Designer', timestamp: 620, style: 'minimal' },
      { id: 'q3', quote: "Mobile redesign is critical for user retention.", speaker: 'Product Lead', timestamp: 900, style: 'corporate' },
    ],
    highlightReel: {
      id: 'hr2',
      duration: 60,
      moments: [
        { startTime: 0, endTime: 15, caption: 'Feature ideation kickoff' },
        { startTime: 250, endTime: 270, caption: 'AI features discussion' },
        { startTime: 600, endTime: 625, caption: 'Prioritization framework' },
        { startTime: 1100, endTime: 1120, caption: 'Q2 roadmap finalized' },
      ],
    },
  },
  {
    id: '3',
    title: 'Client Call - Acme Corp',
    duration: 2156,
    createdAt: new Date(Date.now() - 50 * 60 * 60 * 1000),
    isPinned: false,
    isTranscribed: true,
    transcript: [
      { id: 't1', text: "Thanks for joining, let's review the contract terms.", startTime: 0, endTime: 5 },
      { id: 't2', text: "We're excited about this partnership.", startTime: 5, endTime: 9 },
    ],
    chapters: [
      { id: 'c1', title: 'Contract Review', startTime: 0, endTime: 900, bullets: ['Terms discussion', 'Pricing agreement'], keyQuote: 'Partnership finalized.' },
    ],
    checkpoints: [
      { id: 'cp1', type: 'decision', text: 'Agreed on 12-month contract', timestamp: 600 },
      { id: 'cp2', type: 'task', text: 'Send final contract by Monday', timestamp: 1800 },
    ],
  },
  {
    id: '4',
    title: 'Interview - Senior Developer',
    duration: 2890,
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
    isPinned: false,
    isTranscribed: true,
    transcript: [
      { id: 't1', text: "Tell me about your experience with React.", startTime: 0, endTime: 4 },
      { id: 't2', text: "I've been working with React for 5 years, starting with class components.", startTime: 4, endTime: 10 },
    ],
  },
  {
    id: '5',
    title: 'Personal Voice Note',
    duration: 87,
    createdAt: new Date(Date.now() - 168 * 60 * 60 * 1000),
    isPinned: false,
    isTranscribed: false,
  },
];

export const useRecordingStore = create<RecordingState>()(
  persist(
    (set, get) => ({
      recordings: demoRecordings,
      freeRecordingsLeft: 999,
      isPro: true, // Unlocked for testing
      
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
