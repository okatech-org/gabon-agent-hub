import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Système de routage d'intentions
function detectIntention(transcript: string): { category: string; command?: string; args?: any } {
  const lower = transcript.toLowerCase().trim();
  
  // Commandes vocales
  if (lower.includes('arrêt') || lower.includes('stop')) {
    return { category: 'voice_command', command: 'stop_listening' };
  }
  if (lower.includes('pause')) {
    return { category: 'voice_command', command: 'pause' };
  }
  if (lower.includes('continue') || lower.includes('reprends')) {
    return { category: 'voice_command', command: 'continue' };
  }
  if (lower.includes('nouvelle question')) {
    return { category: 'voice_command', command: 'new_question' };
  }
  if (lower.includes('résumé') || lower.includes('résume')) {
    return { category: 'ask_resume' };
  }
  
  // Questions standard
  return { category: 'question' };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { sessionId, userId, audioBase64, textMessage, langHint = 'fr', voiceId = 'alloy', generateAudio = true, aiModel = 'gemini' } = await req.json();

    if (!sessionId || !userId) {
      throw new Error('sessionId and userId are required');
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let transcript = textMessage || '';

    // 1. Transcription audio si audio fourni (OpenAI Whisper)
    if (audioBase64 && !textMessage) {
      console.log('Starting transcription...');
      const audioBuffer = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
      const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' });
      
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');
      formData.append('language', langHint);

      const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` },
        body: formData,
      });

      if (!transcriptionResponse.ok) {
        throw new Error(`Transcription failed: ${await transcriptionResponse.text()}`);
      }

      const { text } = await transcriptionResponse.json();
      transcript = text;
      console.log('Transcription:', transcript);
    }

    // Sauvegarder message utilisateur
    await supabase.from('conversation_messages').insert({
      session_id: sessionId,
      role: 'user',
      content: transcript,
      audio_base64: audioBase64
    });

    // 2. Détection d'intention
    const intention = detectIntention(transcript);
    console.log('Intention détectée:', intention);

    // Si commande vocale, retourner immédiatement
    if (intention.category === 'voice_command' || intention.category === 'ask_resume') {
      return new Response(JSON.stringify({
        transcript,
        route: intention,
        responseText: ''
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 3. Récupérer historique de conversation
    const { data: messages } = await supabase
      .from('conversation_messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(20);

    const conversationHistory = messages?.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content
    })) || [];

    // 4. Génération réponse avec sélection du modèle
    const SYSTEM_PROMPT = `Tu es **iAsted**, l'Assistant IA ministériel officiel du **Ministre de la Fonction Publique de la République Gabonaise**.
Tu t'adresses au Ministre par « Excellence ». Sois concis, professionnel et orienté action.`;

    console.log(`Using AI model: ${aiModel}`);
    let responseText = '';

    if (aiModel === 'gpt' || aiModel === 'openai') {
      // OpenAI GPT-5-mini
      const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-5-mini-2025-08-07',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...conversationHistory
          ],
          max_completion_tokens: 500,
        }),
      });

      if (!aiResponse.ok) {
        throw new Error(`OpenAI failed: ${await aiResponse.text()}`);
      }

      const aiData = await aiResponse.json();
      responseText = aiData.choices[0].message.content;
    } else if (aiModel === 'claude') {
      // Claude via Lovable AI
      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...conversationHistory
          ],
          max_tokens: 500,
        }),
      });

      if (!aiResponse.ok) {
        throw new Error(`Lovable AI (Claude) failed: ${await aiResponse.text()}`);
      }

      const aiData = await aiResponse.json();
      responseText = aiData.choices[0].message.content;
    } else {
      // Default: Gemini via Lovable AI
      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...conversationHistory
          ],
          max_tokens: 500,
        }),
      });

      if (!aiResponse.ok) {
        throw new Error(`Lovable AI (Gemini) failed: ${await aiResponse.text()}`);
      }

      const aiData = await aiResponse.json();
      responseText = aiData.choices[0].message.content;
    }

    console.log('LLM response:', responseText);

    // Sauvegarder réponse assistant
    await supabase.from('conversation_messages').insert({
      session_id: sessionId,
      role: 'assistant',
      content: responseText
    });

    // 6. Génération audio TTS
    let audioContent = '';
    
    if (generateAudio && responseText) {
      console.log('Generating TTS...');
      
      if (ELEVENLABS_API_KEY) {
        // ElevenLabs TTS (meilleure qualité)
        const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: 'POST',
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: responseText,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            }
          }),
        });

        if (ttsResponse.ok) {
          const audioBlob = await ttsResponse.arrayBuffer();
          audioContent = btoa(String.fromCharCode(...new Uint8Array(audioBlob)));
        }
      } else if (OPENAI_API_KEY) {
        // Fallback OpenAI TTS
        const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'tts-1',
            input: responseText,
            voice: voiceId,
          }),
        });

        if (ttsResponse.ok) {
          const audioBlob = await ttsResponse.arrayBuffer();
          audioContent = btoa(String.fromCharCode(...new Uint8Array(audioBlob)));
        }
      }
    }

    return new Response(JSON.stringify({
      transcript,
      route: intention,
      responseText,
      audioContent
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});