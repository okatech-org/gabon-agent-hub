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
    const { sessionId, userId, audioBase64, textMessage, langHint = 'fr', voiceId, generateAudio = true, aiModel = 'gemini' } = await req.json();

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
      if (!OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY not configured for transcription');
      }

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

    // Récupérer la base de connaissances personnalisée du Ministre
    const { data: knowledgeBase } = await supabase
      .from('iasted_knowledge_base' as any)
      .select('title, description, content, category, tags')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(20);

    let knowledgeContext = '';
    if (knowledgeBase && knowledgeBase.length > 0) {
      knowledgeContext = '\n\n[CONNAISSANCES PERSONNALISÉES DU MINISTRE]\n\n';
      knowledgeBase.forEach((entry: any) => {
        knowledgeContext += `### ${entry.title} [${entry.category}]\n`;
        if (entry.description) knowledgeContext += `${entry.description}\n`;
        if (entry.content) knowledgeContext += `${entry.content}\n`;
        if (entry.tags && entry.tags.length > 0) {
          knowledgeContext += `Mots-clés: ${entry.tags.join(', ')}\n`;
        }
        knowledgeContext += '\n';
      });
    }

    // 4. Génération réponse avec sélection du modèle
    const SYSTEM_PROMPT = `Tu es **iAsted**, l'Assistant IA ministériel du **Ministre de la Fonction Publique de la République Gabonaise**.

## TON STYLE DE COMMUNICATION

Tu parles de façon **naturelle, fluide et conversationnelle**. Tu es un collègue de confiance du Ministre, pas un robot formel.

- **Réponses courtes et directes** : 2-3 phrases maximum, sauf si détails demandés
- **Ton naturel** : Tu t'adresses au Ministre par « Excellence » mais sans lourdeur
- **Langage vivant** : Tu utilises un français correct avec les accords appropriés
- **Pas de listes** : Tu structures tes idées dans des phrases fluides
- **Réactivité** : Tu vas droit à l'essentiel, comme dans une vraie conversation

## TA CONNAISSANCE

Tu maîtrises la fonction publique gabonaise : statuts, procédures, grades, carrières, actes administratifs, structures. Tu as accès aux données RH, statistiques, et anomalies du système.

## TON RÔLE

Tu aides le Ministre à :
- Analyser rapidement les effectifs
- Préparer des actes administratifs
- Obtenir des statistiques précises
- Simuler l'impact de décisions
- Détecter des anomalies

## PRINCIPES

1. **Rapidité** : Réponds vite, synthétise
2. **Action** : Propose des solutions concrètes
3. **Prudence** : Respecte les règles
4. **Discrétion** : Les données sont confidentielles

${knowledgeContext}`;

    console.log(`Using AI model: ${aiModel}`);
    let responseText = '';

    if (aiModel === 'gpt' || aiModel === 'openai') {
      if (!OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY not configured');
      }

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
          max_completion_tokens: 200,
        }),
      });

      if (!aiResponse.ok) {
        throw new Error(`OpenAI failed: ${await aiResponse.text()}`);
      }

      const aiData = await aiResponse.json();
      responseText = aiData.choices[0].message.content;
    } else if (aiModel === 'claude') {
      if (!LOVABLE_API_KEY) {
        throw new Error('LOVABLE_API_KEY not configured');
      }

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
          max_tokens: 200,
        }),
      });

      if (!aiResponse.ok) {
        throw new Error(`Lovable AI (Claude) failed: ${await aiResponse.text()}`);
      }

      const aiData = await aiResponse.json();
      responseText = aiData.choices[0].message.content;
    } else {
      if (!LOVABLE_API_KEY) {
        throw new Error('LOVABLE_API_KEY not configured');
      }

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
          max_tokens: 200,
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

    // 6. Génération audio TTS (uniquement avec ElevenLabs et voix iAsted)
    let audioContent = '';
    
    if (generateAudio && responseText) {
      console.log('Generating TTS with ElevenLabs...');
      
      if (!ELEVENLABS_API_KEY) {
        throw new Error('ELEVENLABS_API_KEY not configured');
      }

      if (!voiceId) {
        throw new Error('voiceId is required for TTS generation');
      }
      
      try {
        // ElevenLabs TTS avec voix iAsted
        console.log('Using ElevenLabs TTS with voice:', voiceId);
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

        if (!ttsResponse.ok) {
          const errorText = await ttsResponse.text();
          throw new Error(`ElevenLabs TTS failed: ${ttsResponse.status} ${errorText}`);
        }

        const audioBlob = await ttsResponse.arrayBuffer();
        
        // Convert ArrayBuffer to base64 in chunks to avoid stack overflow
        const uint8Array = new Uint8Array(audioBlob);
        const chunkSize = 8192; // Process in 8KB chunks
        let binaryString = '';
        
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
          const chunk = uint8Array.slice(i, Math.min(i + chunkSize, uint8Array.length));
          binaryString += String.fromCharCode(...Array.from(chunk));
        }
        
        audioContent = btoa(binaryString);
        console.log('✅ ElevenLabs TTS generated, audio size:', audioBlob.byteLength);
      } catch (ttsError) {
        console.error('❌ TTS generation error:', ttsError);
        throw ttsError;
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