import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcript, duration, title, type } = await req.json();
    
    if (!transcript || transcript.length === 0) {
      throw new Error('No transcript provided');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const transcriptText = transcript.map((s: any) => 
      `[${formatTime(s.startTime)}] ${s.speaker || 'Speaker'}: ${s.text}`
    ).join('\n');

    console.log(`Generating ${type} content for: ${title}`);

    let systemPrompt = '';
    let userPrompt = '';

    switch (type) {
      case 'all':
        systemPrompt = `You are an expert content analyzer. Analyze the transcript and generate comprehensive AI content.

Output ONLY valid JSON in this exact format:
{
  "chapters": [
    { "id": "c1", "title": "Chapter Title", "startTime": 0, "endTime": 60, "bullets": ["Point 1", "Point 2"], "keyQuote": "Important quote" }
  ],
  "checkpoints": [
    { "id": "cp1", "type": "task|decision|question|definition", "text": "Description", "timestamp": 30 }
  ],
  "summary": {
    "executive": {
      "keyPoints": ["Point 1", "Point 2", "Point 3"],
      "decisions": ["Decision 1", "Decision 2"],
      "nextSteps": ["Step 1", "Step 2", "Step 3"]
    },
    "student": {
      "chapters": ["Overview text"],
      "glossary": [{ "term": "Term", "definition": "Definition" }],
      "quiz": [{ "question": "Question?", "answer": "Answer" }]
    }
  },
  "quoteCards": [
    { "id": "q1", "quote": "Notable quote (max 120 chars)", "speaker": "Speaker Name", "timestamp": 45, "style": "minimal" }
  ],
  "highlightReel": {
    "id": "hr1",
    "duration": 60,
    "moments": [
      { "startTime": 10, "endTime": 25, "caption": "Key moment description" }
    ]
  }
}

Rules:
- Generate 2-4 chapters based on content flow
- Identify 3-5 checkpoints (tasks, decisions, questions, definitions)
- Create executive and student summaries
- Select 3-5 best quotes for quote cards (use styles: minimal, bold, corporate, student, ocean, sunset, forest, lavender)
- Create highlight reel with 3-5 key moments totaling ~60 seconds
- All timestamps must be within the recording duration`;
        userPrompt = `Recording: "${title}"
Duration: ${duration} seconds

Transcript:
${transcriptText}

Generate comprehensive AI content for this recording.`;
        break;

      case 'translate':
        const { targetLanguage } = await req.json();
        systemPrompt = `You are a professional translator. Translate the transcript to ${targetLanguage || 'Spanish'} while preserving speaker labels and meaning.

Output ONLY valid JSON:
{
  "translatedTranscript": [
    { "id": "t1", "text": "Translated text", "startTime": 0, "endTime": 5, "speaker": "Speaker 1" }
  ]
}`;
        userPrompt = `Translate this transcript to ${targetLanguage || 'Spanish'}:\n\n${transcriptText}`;
        break;

      default:
        throw new Error(`Unknown content type: ${type}`);
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Usage limit reached. Please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    console.log('Raw AI response length:', content.length);

    // Parse JSON from response
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return new Response(JSON.stringify(parsed), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
    }

    return new Response(JSON.stringify({ error: 'Failed to parse AI response' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Content generation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
