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

// Template for new recordings with all AI features
export const createRecordingTemplate = (
  id: string,
  title: string,
  duration: number,
  createdAt: Date,
  isPinned: boolean = false
): Recording => ({
  id,
  title,
  duration,
  createdAt,
  isPinned,
  isTranscribed: true,
  transcript: [
    { id: 't1', text: "Recording started. This is the beginning of your audio.", startTime: 0, endTime: 5, speaker: 'Speaker 1' },
    { id: 't2', text: "The AI will automatically transcribe your audio content.", startTime: 5, endTime: 12, speaker: 'Speaker 1' },
    { id: 't3', text: "All features including chapters, summaries, and quotes will be generated.", startTime: 12, endTime: 20, speaker: 'Speaker 1' },
  ],
  chapters: [
    { 
      id: 'c1', 
      title: 'Introduction', 
      startTime: 0, 
      endTime: Math.floor(duration / 3), 
      bullets: ['Opening remarks', 'Context setting'], 
      keyQuote: "Let's get started." 
    },
    { 
      id: 'c2', 
      title: 'Main Discussion', 
      startTime: Math.floor(duration / 3), 
      endTime: Math.floor(duration * 2 / 3), 
      bullets: ['Key points covered', 'Important details'], 
      keyQuote: "This is the key takeaway." 
    },
    { 
      id: 'c3', 
      title: 'Conclusion', 
      startTime: Math.floor(duration * 2 / 3), 
      endTime: duration, 
      bullets: ['Summary', 'Next steps'], 
      keyQuote: "Wrapping up the discussion." 
    },
  ],
  checkpoints: [
    { id: 'cp1', type: 'task', text: 'Follow up on discussion points', timestamp: Math.floor(duration / 4) },
    { id: 'cp2', type: 'decision', text: 'Key decision made during recording', timestamp: Math.floor(duration / 2) },
    { id: 'cp3', type: 'question', text: 'Question raised for future consideration', timestamp: Math.floor(duration * 3 / 4) },
  ],
  summary: {
    executive: {
      keyPoints: ['Main topic discussed', 'Key insights shared', 'Important conclusions reached'],
      decisions: ['Primary decision made', 'Secondary action agreed'],
      nextSteps: ['Follow up on key points', 'Schedule next discussion', 'Share recording with team'],
    },
    student: {
      chapters: ['Overview of the recording content and key themes'],
      glossary: [
        { term: 'Key Term', definition: 'Important concept discussed in this recording' },
      ],
      quiz: [
        { question: 'What was the main topic?', answer: 'The key discussion points' },
      ],
    },
  },
  quoteCards: [
    { id: 'q1', quote: "This captures the essence of our discussion perfectly.", speaker: 'Speaker 1', timestamp: Math.floor(duration / 4), style: 'minimal' },
    { id: 'q2', quote: "An important insight that emerged from the conversation.", speaker: 'Speaker 1', timestamp: Math.floor(duration / 2), style: 'corporate' },
    { id: 'q3', quote: "The key takeaway everyone should remember.", speaker: 'Speaker 1', timestamp: Math.floor(duration * 3 / 4), style: 'bold' },
  ],
  highlightReel: {
    id: 'hr1',
    duration: 60,
    moments: [
      { startTime: 0, endTime: 15, caption: 'Opening highlights' },
      { startTime: Math.floor(duration / 3), endTime: Math.floor(duration / 3) + 15, caption: 'Key moment' },
      { startTime: Math.floor(duration * 2 / 3), endTime: Math.floor(duration * 2 / 3) + 15, caption: 'Important insight' },
      { startTime: duration - 20, endTime: duration, caption: 'Closing remarks' },
    ],
  },
});

// Two example recordings prepacked with full features
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
      { id: 't4', text: "We could prototype it in two weeks and test with beta users.", startTime: 16, endTime: 22, speaker: 'Engineer' },
      { id: 't5', text: "Perfect. Let's also consider mobile-first design for this feature.", startTime: 22, endTime: 28, speaker: 'Designer' },
    ],
    chapters: [
      { id: 'c1', title: 'Feature Ideation', startTime: 0, endTime: 600, bullets: ['AI summaries', 'Export improvements', 'Mobile redesign'], keyQuote: 'AI-powered features are the future.' },
      { id: 'c2', title: 'Prioritization', startTime: 600, endTime: 1200, bullets: ['Impact scoring', 'Resource allocation'], keyQuote: 'Focus on high-impact, low-effort wins.' },
      { id: 'c3', title: 'Timeline Planning', startTime: 1200, endTime: 1847, bullets: ['Sprint planning', 'Milestone setting'], keyQuote: 'Two-week prototype cycle.' },
    ],
    checkpoints: [
      { id: 'cp1', type: 'decision', text: 'Prioritize AI summaries for Q2', timestamp: 300 },
      { id: 'cp2', type: 'task', text: 'Create design mockups by next week', timestamp: 800 },
      { id: 'cp3', type: 'task', text: 'Engineering spike on AI integration', timestamp: 1100 },
      { id: 'cp4', type: 'question', text: 'Which AI provider to use?', timestamp: 1400 },
    ],
    summary: {
      executive: {
        keyPoints: ['AI summaries top priority', 'Mobile redesign scheduled for Q3', 'Two-week prototype cycle agreed'],
        decisions: ['Focus Q2 on AI features', 'Mobile-first design approach'],
        nextSteps: ['Design mockups due next week', 'Engineering spike on AI integration', 'Beta user recruitment'],
      },
      student: {
        chapters: ['Product brainstorming session for Q2 planning'],
        glossary: [
          { term: 'Roadmap', definition: 'Strategic plan for product development' },
          { term: 'Sprint', definition: 'Time-boxed development cycle, usually 2 weeks' },
        ],
        quiz: [
          { question: 'What is the Q2 priority?', answer: 'AI-powered summaries' },
          { question: 'How long is the prototype cycle?', answer: 'Two weeks' },
        ],
      },
    },
    quoteCards: [
      { id: 'q1', quote: "AI-powered features will set us apart from the competition.", speaker: 'Product Lead', timestamp: 250, style: 'bold' },
      { id: 'q2', quote: "Focus on high-impact, low-effort wins first.", speaker: 'Designer', timestamp: 620, style: 'minimal' },
      { id: 'q3', quote: "Mobile redesign is critical for user retention.", speaker: 'Product Lead', timestamp: 900, style: 'corporate' },
      { id: 'q4', quote: "We could prototype it in two weeks and test with beta users.", speaker: 'Engineer', timestamp: 18, style: 'ocean' },
      { id: 'q5', quote: "Let's make mobile-first our design philosophy.", speaker: 'Designer', timestamp: 1300, style: 'sunset' },
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