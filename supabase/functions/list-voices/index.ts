import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    
    if (ELEVENLABS_API_KEY) {
      // Récupérer les voix ElevenLabs
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch ElevenLabs voices');
      }

      const data = await response.json();
      
      return new Response(JSON.stringify({
        voices: data.voices,
        provider: 'elevenlabs'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else {
      // Retourner voix OpenAI par défaut
      const openaiVoices = [
        { voice_id: 'alloy', name: 'Alloy', labels: { accent: 'neutral' } },
        { voice_id: 'echo', name: 'Echo', labels: { accent: 'neutral' } },
        { voice_id: 'fable', name: 'Fable', labels: { accent: 'british' } },
        { voice_id: 'onyx', name: 'Onyx', labels: { accent: 'deep' } },
        { voice_id: 'nova', name: 'Nova', labels: { accent: 'warm' } },
        { voice_id: 'shimmer', name: 'Shimmer', labels: { accent: 'soft' } },
      ];

      return new Response(JSON.stringify({
        voices: openaiVoices,
        provider: 'openai'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});