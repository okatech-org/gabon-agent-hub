import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================================================
// DÉFINITION DES OUTILS (Ported from presidence.ga)
// ============================================================================

const IASTED_TOOLS = [
  {
    type: "function",
    function: {
      name: "generate_document",
      description: "Générer PDF officiel. L'IA PEUT créer des fichiers.",
      parameters: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["decret", "nomination", "lettre", "note"] },
          recipient: { type: "string" },
          subject: { type: "string" },
          content_points: { type: "array", items: { type: "string" } }
        },
        required: ["type", "recipient", "subject"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "query_knowledge_base",
      description: "Interroger base spécialisée",
      parameters: {
        type: "object",
        properties: {
          domain: { type: "string", enum: ["diplomatie", "economie", "securite", "juridique", "opinion_publique"] },
          query: { type: "string" }
        },
        required: ["domain", "query"]
      }
    }
  }
];

// Fonction pour filtrer les outils selon le rôle
function getToolsForRole(userRole: string) {
  // Adapter selon les besoins du gabon-agent-hub
  // Pour l'instant, on donne accès aux outils de base à tout le monde
  return IASTED_TOOLS;
}

// Analyse contextuelle avancée
interface ContextAnalysis {
  category: string;
  intent: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  domain: string;
  responseType: 'standard' | 'briefing' | 'analysis' | 'alert' | 'crisis';
  requiresData: boolean;
  command?: string;
  args?: any;
}

function analyzeContext(userText: string, userRole: string): ContextAnalysis {
  const text = userText.toLowerCase().trim();

  // Détection des commandes vocales
  const stopPatterns = ['arrête', 'stop', 'pause', 'arrêter', 'stopper', 'ça suffit'];
  const continuePatterns = ['continue', 'reprends', 'reprendre', 'continuer'];

  if (stopPatterns.some(p => text.includes(p))) {
    return {
      category: 'voice_command',
      intent: 'stop_conversation',
      urgency: 'low',
      domain: 'system',
      responseType: 'standard',
      requiresData: false,
      command: 'stop_listening',
      args: {}
    };
  }

  if (continuePatterns.some(p => text.includes(p))) {
    return {
      category: 'voice_command',
      intent: 'resume_conversation',
      urgency: 'low',
      domain: 'system',
      responseType: 'standard',
      requiresData: false,
      command: 'resume',
      args: {}
    };
  }

  // Détection des briefings
  const briefingPatterns = ['briefing', 'synthèse', 'situation', 'état des lieux', 'point sur'];
  if (briefingPatterns.some(p => text.includes(p))) {
    return {
      category: 'briefing_request',
      intent: 'executive_briefing',
      urgency: 'medium',
      domain: 'general',
      responseType: 'briefing',
      requiresData: true
    };
  }

  // Politesses (small talk)
  const greetingPatterns = ['bonjour', 'salut', 'hello', 'bonsoir'];
  const thanksPatterns = ['merci', 'remercie'];
  if (greetingPatterns.some(p => text.includes(p))) {
    return {
      category: 'small_talk',
      intent: 'social_interaction',
      urgency: 'low',
      domain: 'general',
      responseType: 'standard',
      requiresData: false
    };
  }

  // Par défaut
  return {
    category: 'query',
    intent: 'general_inquiry',
    urgency: 'low',
    domain: 'general',
    responseType: 'standard',
    requiresData: false
  };
}

// Génération de salutations contextuelles
function getContextualGreeting(userRole: string): string {
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';

  const greetings = {
    default: {
      morning: "Bonjour Excellence. iAsted à votre service. Comment puis-je vous aider ?",
      afternoon: "Bon après-midi Excellence. Je suis à votre écoute.",
      evening: "Bonsoir Excellence. iAsted est prêt à vous assister."
    }
  };

  const roleGreetings = greetings.default;
  return roleGreetings[timeOfDay as keyof typeof roleGreetings];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { sessionId, userId, audioBase64, textMessage, langHint = 'fr', voiceId, generateAudio = true, aiModel = 'gpt', userRole = 'default' } = await req.json();

    if (!sessionId || !userId) {
      throw new Error('sessionId and userId are required');
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let transcript = textMessage || '';
    let sttLatency = 0;

    // 1. Transcription audio si audio fourni (OpenAI Whisper)
    if (audioBase64 && !textMessage) {
      if (!OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY not configured for transcription');
      }

      console.log('Starting transcription...');
      const startTime = Date.now();
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
      sttLatency = Date.now() - startTime;
      console.log('Transcription:', transcript);
    }

    // Sauvegarder message utilisateur
    // Note: On sauvegarde après pour éviter de bloquer si STT échoue, mais avant l'analyse pour avoir le contexte.
    // Cependant, pour optimiser, on peut le faire en parallèle.
    await supabase.from('conversation_messages').insert({
      session_id: sessionId,
      role: 'user',
      content: transcript,
      audio_base64: audioBase64
    });

    // 2. Analyse Contextuelle (Brain)
    const context = analyzeContext(transcript, userRole);
    console.log('Context:', context);

    // Gestion immédiate des commandes vocales
    if (context.category === 'voice_command') {
      return new Response(JSON.stringify({
        transcript,
        route: context,
        responseText: ''
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Gestion immédiate des salutations
    if (context.category === 'small_talk') {
      const greeting = getContextualGreeting(userRole);

      // Sauvegarder la réponse
      await supabase.from('conversation_messages').insert({
        session_id: sessionId,
        role: 'assistant',
        content: greeting
      });

      return new Response(JSON.stringify({
        transcript,
        route: context,
        responseText: greeting
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

    // Récupérer la base de connaissances personnalisée du Ministre (gardé de l'implémentation précédente)
    // C'est un plus par rapport à presidence.ga qui semblait ne pas l'avoir dans le fichier lu.
    const { data: knowledgeBase } = await supabase
      .from('iasted_knowledge_base' as any)
      .select('title, description, content, category, tags')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(5);

    let knowledgeContext = '';
    if (knowledgeBase && knowledgeBase.length > 0) {
      knowledgeContext = '\n\n[CONNAISSANCES PERSONNALISÉES DU MINISTRE]\n\n';
      knowledgeBase.forEach((entry: any) => {
        knowledgeContext += `### ${entry.title} [${entry.category}]\n`;
        if (entry.description) knowledgeContext += `${entry.description}\n`;
        knowledgeContext += '\n';
      });
    }

    // 4. Prompt Système Adapté (Porté de presidence.ga)
    let systemPrompt = `Tu es **iAsted**, l'Assistant IA ministériel du **Ministre de la Fonction Publique de la République Gabonaise**.

## TON STYLE DE COMMUNICATION
Tu parles de façon **naturelle, fluide et conversationnelle**. Tu es un collègue de confiance du Ministre.
- **Réponses courtes et directes** : 2-3 phrases maximum, sauf si détails demandés (Mode Briefing).
- **Ton naturel** : Tu t'adresses au Ministre par « Excellence » avec respect mais sans lourdeur.
- **Proactivité** : Tu proposes des solutions concrètes.

## CONTEXTE ACTUEL
Catégorie: ${context.category}
Intention: ${context.intent}
Urgence: ${context.urgency}
${knowledgeContext}

## INSTRUCTIONS SPÉCIFIQUES
Si l'utilisateur demande un document (lettre, décret, note), utilise l'outil 'generate_document'.
Si l'utilisateur demande une information spécifique, utilise tes connaissances ou interroge la base.
`;

    if (context.responseType === 'briefing') {
      systemPrompt += "\n\n[MODE BRIEFING: Synthèse structurée requise. Sois précis et factuel.]";
    }

    console.log(`Using AI model: ${aiModel}`);
    let responseText = '';

    // Détection de demande de document pour outil (simplifié)
    const documentKeywords = ['lettre', 'décret', 'rapport', 'note', 'circulaire', 'nomination', 'document', 'pdf', 'génère', 'rédige'];
    const isDocumentRequest = documentKeywords.some(kw => transcript.toLowerCase().includes(kw));

    let toolChoice: any = "auto";
    if (isDocumentRequest) {
      toolChoice = { type: "function", function: { name: "generate_document" } };
    }

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    // Appel OpenAI GPT
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Utilisation de GPT-4o pour la performance/qualité
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory
        ],
        tools: getToolsForRole(userRole),
        tool_choice: toolChoice,
        max_completion_tokens: context.responseType === 'briefing' ? 800 : 300,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`OpenAI failed: ${await aiResponse.text()}`);
    }

    const aiData = await aiResponse.json();
    const choice = aiData.choices[0];
    responseText = choice.message.content || '';
    const toolCalls = choice.message.tool_calls || [];

    // Si tool calls, on devrait théoriquement les exécuter ou les renvoyer au client.
    // Pour l'instant, on renvoie une réponse qui inclut ces infos si nécessaire.
    // Mais le code précédent s'attendait à responseText.

    // Si tool call, on peut générer une réponse textuelle expliquant l'action
    if (toolCalls.length > 0) {
      const toolName = toolCalls[0].function.name;
      if (toolName === 'generate_document') {
        const args = JSON.parse(toolCalls[0].function.arguments);
        responseText = `Je génère le document (${args.type}) pour ${args.recipient}. Un instant s'il vous plaît.`;
        // Ici on pourrait déclencher la génération réelle ou laisser le client le faire.
        // Pour simplifier, on informe juste.
      }
    }

    if (!responseText && toolCalls.length === 0) {
      responseText = "Je n'ai pas compris, pouvez-vous reformuler ?";
    }

    console.log('LLM response:', responseText);

    // Sauvegarder réponse assistant
    await supabase.from('conversation_messages').insert({
      session_id: sessionId,
      role: 'assistant',
      content: responseText
    });

    return new Response(JSON.stringify({
      transcript,
      route: context,
      responseText,
      tool_calls: toolCalls,
      // audioContent removed (Browser TTS)
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