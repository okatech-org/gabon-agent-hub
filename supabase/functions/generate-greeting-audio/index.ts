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
    const { text, voiceId } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || Deno.env.get('API_GP');

    let audioContent: string;

    // Essayer ElevenLabs d'abord si la clé est disponible
    if (ELEVENLABS_API_KEY && voiceId) {
      console.log('Using ElevenLabs TTS');
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`ElevenLabs TTS error: ${error}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      audioContent = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    } else if (OPENAI_API_KEY) {
      // Fallback sur OpenAI TTS
      console.log('Using OpenAI TTS');
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text,
          voice: voiceId || 'alloy',
          response_format: 'mp3',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to generate speech');
      }

      const arrayBuffer = await response.arrayBuffer();
      audioContent = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    } else {
      throw new Error('No TTS API key configured');
    }

    return new Response(
      JSON.stringify({ audioContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating audio:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
