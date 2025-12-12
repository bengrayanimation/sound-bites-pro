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
    const { highlightReel, title, transcript } = await req.json();
    
    if (!highlightReel) {
      throw new Error('No highlight reel data provided');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`Generating video for highlight reel: ${title}`);

    // Generate visual descriptions for each moment
    const momentsWithVisuals = await Promise.all(
      highlightReel.moments.map(async (moment: any, index: number) => {
        // Get the transcript text for this moment
        const relevantTranscript = transcript?.filter((t: any) => 
          t.startTime >= moment.startTime && t.startTime <= moment.endTime
        ) || [];
        
        const momentText = relevantTranscript.map((t: any) => t.text).join(' ') || moment.caption;

        // Generate a visual description using AI
        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash-lite',
            messages: [
              {
                role: 'system',
                content: 'Generate a brief, cinematic visual description (1-2 sentences) for a video scene based on the context. Focus on mood, colors, and imagery that would complement the audio content.'
              },
              {
                role: 'user',
                content: `Context: "${moment.caption}"\nContent: "${momentText}"\n\nGenerate a visual scene description.`
              }
            ],
          }),
        });

        let visualDescription = `Scene ${index + 1}: ${moment.caption}`;
        
        if (response.ok) {
          const data = await response.json();
          visualDescription = data.choices?.[0]?.message?.content || visualDescription;
        }

        return {
          ...moment,
          visualDescription,
          sceneNumber: index + 1
        };
      })
    );

    // Generate a storyboard/video concept
    const storyboardResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a video storyboard creator. Create a visual storyboard for a highlight reel video.

Output ONLY valid JSON:
{
  "videoStoryboard": {
    "title": "Video title",
    "duration": 60,
    "style": "professional|dynamic|minimal|cinematic",
    "colorPalette": ["#color1", "#color2", "#color3"],
    "scenes": [
      {
        "sceneNumber": 1,
        "startTime": 0,
        "endTime": 15,
        "visualType": "text-overlay|waveform|abstract|gradient",
        "caption": "Caption text",
        "visualDescription": "Description of the visual",
        "transition": "fade|slide|zoom|cut"
      }
    ],
    "soundtrack": {
      "mood": "upbeat|calm|dramatic|inspirational",
      "tempo": "slow|medium|fast"
    }
  }
}`
          },
          {
            role: 'user',
            content: `Create a video storyboard for: "${title}"

Highlight moments:
${momentsWithVisuals.map((m: any) => `Scene ${m.sceneNumber} (${m.startTime}s-${m.endTime}s): ${m.caption}\nVisual: ${m.visualDescription}`).join('\n\n')}`
          }
        ],
      }),
    });

    if (!storyboardResponse.ok) {
      const errorText = await storyboardResponse.text();
      console.error('Storyboard generation error:', storyboardResponse.status, errorText);
      
      // Return a basic video concept
      return new Response(JSON.stringify({
        videoStoryboard: {
          title,
          duration: highlightReel.duration,
          style: 'professional',
          colorPalette: ['#D4A574', '#1a1a2e', '#f4f4f5'],
          scenes: momentsWithVisuals.map((m: any) => ({
            sceneNumber: m.sceneNumber,
            startTime: m.startTime,
            endTime: m.endTime,
            visualType: 'waveform',
            caption: m.caption,
            visualDescription: m.visualDescription,
            transition: 'fade'
          })),
          soundtrack: { mood: 'professional', tempo: 'medium' }
        },
        momentsWithVisuals
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const storyboardData = await storyboardResponse.json();
    const storyboardContent = storyboardData.choices?.[0]?.message?.content || '';
    
    try {
      const jsonMatch = storyboardContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return new Response(JSON.stringify({
          ...parsed,
          momentsWithVisuals
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } catch (parseError) {
      console.error('Error parsing storyboard:', parseError);
    }

    return new Response(JSON.stringify({
      videoStoryboard: {
        title,
        duration: highlightReel.duration,
        style: 'professional',
        scenes: momentsWithVisuals
      },
      momentsWithVisuals
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Video generation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
