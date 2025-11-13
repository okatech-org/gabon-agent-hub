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

    // Use provided voiceId, or fallback to env, or use default Aria voice
    const defaultVoiceId = Deno.env.get('ELEVENLABS_VOICE_ID') || '9BWtsMINqrJLrRacOk9x'; // Aria as ultimate fallback
    const effectiveVoiceId = voiceId || defaultVoiceId;
    
    console.log('Using voice ID:', effectiveVoiceId);

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY not configured');
    }

    // Utiliser uniquement ElevenLabs avec la voix iAsted
    console.log('Using ElevenLabs TTS with voice:', effectiveVoiceId);
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${effectiveVoiceId}`, {
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
    
    // Convert ArrayBuffer to base64 in chunks to avoid stack overflow
    const uint8Array = new Uint8Array(arrayBuffer);
    const chunkSize = 8192; // Process in 8KB chunks
    let binaryString = '';
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, Math.min(i + chunkSize, uint8Array.length));
      binaryString += String.fromCharCode(...Array.from(chunk));
    }
    
    const audioContent = btoa(binaryString);

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
