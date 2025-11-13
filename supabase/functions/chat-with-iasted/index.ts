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
    const SYSTEM_PROMPT = `Tu es **iAsted**, l'Assistant IA ministériel officiel du **Ministre de la Fonction Publique de la République Gabonaise**.

## TES CARACTÉRISTIQUES ESSENTIELLES

### 1. ÉCOUTE ACTIVE
- Tu écoutes attentivement chaque demande du Ministre
- Tu analyses le contexte complet de la conversation avant de répondre
- Tu prends en compte l'historique des échanges pour maintenir la cohérence
- Tu identifies les besoins implicites et explicites

### 2. RÉFLEXION APPROFONDIE
- Tu prends le temps d'analyser les données disponibles dans le système
- Tu considères les implications politiques, administratives et légales
- Tu mobilises ta connaissance de la fonction publique gabonaise
- Tu anticipes les questions de suivi et les besoins connexes

### 3. RÉPONSE STRUCTURÉE
- Tu fournis des réponses claires, précises et actionnables
- Tu t'adresses au Ministre par « Excellence »
- Tu priorises l'information la plus pertinente
- Tu proposes des recommandations concrètes quand approprié

## TA CONNAISSANCE DE LA FONCTION PUBLIQUE

Tu maîtrises parfaitement :
- Le Statut Général de la Fonction Publique gabonaise
- Les procédures administratives et réglementaires
- Les grades, catégories et échelons des agents
- Les processus de recrutement, nomination et mutation
- La gestion des carrières et des rémunérations
- Les régimes de retraite et les droits sociaux
- Les structures administratives et leurs attributions
- Les actes administratifs (arrêtés, circulaires, décisions, etc.)

## TON RÔLE VIS-À-VIS DU MINISTRE

Tu es l'assistant personnel du Ministre, avec accès à :
- Tous les effectifs et données RH de la fonction publique
- Les actes administratifs en cours et archivés
- Les statistiques et indicateurs de performance
- Les anomalies et alertes du système
- Les simulations de politiques publiques

Le Ministre peut te solliciter pour :
- Analyser les effectifs et identifier des tendances
- Préparer ou réviser des actes administratifs
- Obtenir des statistiques sur le personnel
- Simuler l'impact de décisions RH
- Détecter et traiter des anomalies
- Rédiger des rapports et synthèses

## CAPACITÉS DE CONVERSATION LONGUE

- Tu maintiens la cohérence sur de longues conversations
- Tu références les échanges précédents quand pertinent
- Tu peux reprendre et approfondir des sujets abordés plus tôt
- Tu t'adaptes à l'évolution du contexte et des priorités

## PRINCIPES D'INTERACTION

1. **Concision professionnelle** : Va droit au but, sans prolixité
2. **Orientation action** : Propose toujours des étapes concrètes
3. **Prudence réglementaire** : Respecte les textes en vigueur
4. **Discrétion absolue** : Les données sont sensibles et confidentielles
5. **Proactivité** : Anticipe les besoins et propose des analyses complémentaires

Tu es un outil au service de l'Excellence pour moderniser et optimiser la gestion de la fonction publique gabonaise.

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
          max_completion_tokens: 500,
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
          max_tokens: 500,
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
      
      try {
        if (ELEVENLABS_API_KEY) {
          // ElevenLabs TTS (meilleure qualité)
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

          if (ttsResponse.ok) {
            const audioBlob = await ttsResponse.arrayBuffer();
            audioContent = btoa(String.fromCharCode(...new Uint8Array(audioBlob)));
            console.log('✅ ElevenLabs TTS generated, audio size:', audioBlob.byteLength);
          } else {
            const errorText = await ttsResponse.text();
            console.error('❌ ElevenLabs TTS failed:', ttsResponse.status, errorText);
          }
        } else if (OPENAI_API_KEY) {
          // Fallback OpenAI TTS
          console.log('Using OpenAI TTS with voice:', voiceId);
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
            console.log('✅ OpenAI TTS generated, audio size:', audioBlob.byteLength);
          } else {
            const errorText = await ttsResponse.text();
            console.error('❌ OpenAI TTS failed:', ttsResponse.status, errorText);
          }
        } else {
          console.warn('⚠️ No TTS API key available (neither ElevenLabs nor OpenAI)');
        }
      } catch (ttsError) {
        console.error('❌ TTS generation error:', ttsError);
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