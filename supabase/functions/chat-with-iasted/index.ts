import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================================================
// DÉFINITION DES OUTILS AVANCÉS (iAsted V2)
// ============================================================================

const IASTED_TOOLS = [
  {
    type: "function",
    function: {
      name: "navigate_app",
      description: "Naviguer vers une page ou section de l'application",
      parameters: {
        type: "object",
        properties: {
          route: { type: "string" },
          section_id: { type: "string", description: "Pour navigation locale (ex: 'documents', 'dashboard')" }
        },
        required: ["route"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "control_ui",
      description: "Contrôler l'interface utilisateur (Thèmes, Affichage)",
      parameters: {
        type: "object",
        properties: {
          action: { type: "string", enum: ["set_theme_dark", "set_theme_light", "toggle_theme", "toggle_sidebar"] }
        },
        required: ["action"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "change_voice",
      description: "Changer la voix de l'assistant (Homme/Femme)",
      parameters: {
        type: "object",
        properties: {
          gender: { type: "string", enum: ["male", "female"] }
        },
        required: ["gender"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "generate_document",
      description: "Générer PDF officiel.",
      parameters: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["decret", "nomination", "lettre", "note", "rapport"] },
          recipient: { type: "string" },
          subject: { type: "string" },
          content_points: { type: "array", items: { type: "string" } },
          format: { type: "string", enum: ["pdf", "docx"] }
        },
        required: ["type", "recipient", "subject"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "query_knowledge_base",
      description: "Interroger base de connaissances ministère",
      parameters: {
        type: "object",
        properties: {
          domain: { type: "string" },
          query: { type: "string" }
        },
        required: ["domain", "query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "stop_conversation",
      description: "Arrêter la conversation vocale",
      parameters: {
        type: "object",
        properties: {},
      }
    }
  }
];

function getToolsForRole(role: string) {
  // All roles get all tools for now
  return IASTED_TOOLS;
}

function analyzeContext(transcript: string): {
  category: string;
  intent: string;
  urgency: string;
  responseType: string;
} {
  const lower = transcript.toLowerCase();
  
  let category = 'general';
  let intent = 'question';
  let urgency = 'normal';
  let responseType = 'conversational';
  
  // Detect category
  if (/budget|finance|dépense|coût/i.test(lower)) category = 'finance';
  else if (/agent|effectif|personnel|fonctionnaire/i.test(lower)) category = 'rh';
  else if (/décret|loi|règlement|juridique/i.test(lower)) category = 'juridique';
  else if (/réunion|agenda|rendez-vous/i.test(lower)) category = 'agenda';
  
  // Detect intent
  if (/génère|créé|rédige|fais|produis/i.test(lower)) intent = 'action';
  else if (/montre|affiche|ouvre|va/i.test(lower)) intent = 'navigation';
  else if (/combien|quel|qui|où|quand/i.test(lower)) intent = 'question';
  
  // Detect urgency
  if (/urgent|immédiat|tout de suite|vite/i.test(lower)) urgency = 'high';
  
  // Detect response type
  if (/briefing|résumé|synthèse/i.test(lower)) responseType = 'briefing';
  
  return { category, intent, urgency, responseType };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const {
      sessionId,
      userId,
      audioBase64,
      textMessage,
      aiModel = 'gpt-4o',
    } = await req.json();

    if (!sessionId || !userId) {
      throw new Error('sessionId and userId are required');
    }

    // Initialize clients
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let transcript = textMessage || '';

    // 1. TRANSCRIPTION (if audio provided)
    if (audioBase64 && !textMessage) {
      console.log('🎤 Transcription Whisper...');
      
      const audioBuffer = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
      const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' });
      
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');
      formData.append('language', 'fr');

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
      console.log('📝 Transcript:', transcript);
    }

    if (!transcript) {
      throw new Error('No transcript or text message provided');
    }

    // Save user message
    await supabase.from('conversation_messages').insert({
      session_id: sessionId,
      role: 'user',
      content: transcript,
    });

    // Get user role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
    
    const userRole = roleData?.role || 'agent';

    // Get conversation history
    const { data: historyData } = await supabase
      .from('conversation_messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(20);

    const conversationHistory = historyData?.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    })) || [];

    // Get knowledge base
    const { data: knowledgeBase } = await supabase
      .from('iasted_knowledge_base')
      .select('title, description, content, category')
      .eq('is_active', true)
      .limit(10);

    let knowledgeContext = '';
    if (knowledgeBase && knowledgeBase.length > 0) {
      knowledgeContext = '\n\n📚 CONNAISSANCES:\n';
      knowledgeBase.forEach((entry: any) => {
        knowledgeContext += `- ${entry.title}: ${entry.description || ''}\n`;
      });
    }

    // Analyze context
    const context = analyzeContext(transcript);

    // Build system prompt
    const systemPrompt = `Tu es **iAsted**, le Chef de Cabinet Digital du **Ministre de la Fonction Publique de la République Gabonaise**.

## TON RÔLE & PERSONA
- Tu es un haut fonctionnaire virtuel : discret, efficace, loyal et ultra-compétent.
- Tu t'adresses à ton interlocuteur par « **Excellence** » ou « **Monsieur le Ministre** ».
- Tu connais parfaitement les rouages de l'administration gabonaise.

## CAPACITÉS ET OUTILS
Tu as le contrôle total de l'interface. Utilise TOUJOURS les outils appropriés pour AGIR.

### 1. NAVIGATION
- **Navigation** ('navigate_app'): Pour naviguer vers une page.
  Ex: "Ouvre les documents" -> navigate_app(route='/ministre/documents')

### 2. CONTRÔLE UI ('control_ui')
- **Thème**:
  • "Mode sombre" -> action='set_theme_dark'
  • "Mode clair" -> action='set_theme_light'

### 3. DOCUMENTS ('generate_document')
- Formats : PDF ou DOCX.

### 4. ARRÊT ('stop_conversation')
- Si l'utilisateur dit "Arrête", "Stop", appelle 'stop_conversation'.

## RÈGLES CRITIQUES
1. **EXÉCUTION IMMÉDIATE** : Appelle l'outil PUIS confirme verbalement.
2. **PAS DE BALISES** : Ne jamais dire [pause] ou (action).
3. **RÉPONSES COURTES** : 2-3 phrases maximum.

## CONTEXTE ACTUEL
Catégorie: ${context.category}
Intention: ${context.intent}
${knowledgeContext}
`;

    console.log(`Using AI model: ${aiModel}`);

    // Detect document request
    const documentKeywords = ['lettre', 'décret', 'rapport', 'note', 'document', 'pdf', 'génère', 'rédige'];
    const isDocumentRequest = documentKeywords.some(kw => transcript.toLowerCase().includes(kw));

    let toolChoice: any = "auto";
    if (isDocumentRequest) {
      toolChoice = { type: "function", function: { name: "generate_document" } };
    }

    // Call OpenAI GPT
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
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
    let responseText = choice.message.content || '';
    const toolCalls = choice.message.tool_calls || [];

    // Handle tool calls
    if (toolCalls.length > 0) {
      const toolName = toolCalls[0].function.name;
      if (toolName === 'generate_document') {
        const args = JSON.parse(toolCalls[0].function.arguments);
        responseText = `Je génère le document (${args.type}) pour ${args.recipient}. Un instant.`;
      }
    }

    if (!responseText && toolCalls.length === 0) {
      responseText = "Je n'ai pas compris, pouvez-vous reformuler ?";
    }

    console.log('LLM response:', responseText);

    // Save assistant response
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
