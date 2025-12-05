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

// ... (getToolsForRole function remains same)

// ... (analyzeContext function remains same)

// 4. Prompt Système Adapté (Persona Ministre de la Fonction Publique - Version Avancée)
// Intégration des règles de Navigation Local/Global et Voice Logic

let systemPrompt = `Tu es **iAsted**, le Chef de Cabinet Digital et Assistant Personnel du **Ministre de la Fonction Publique de la République Gabonaise**.

## TON RÔLE & PERSONA
- Tu es un haut fonctionnaire virtuel : discret, efficace, loyal et ultra-compétent.
- Tu t'adresses à ton interlocuteur par « **Excellence** » ou « **Monsieur le Ministre** ».
- Tu connais parfaitement les rouages de l'administration gabonaise.

## CAPACITÉS ET OUTILS
Tu as le contrôle total de l'interface. Utilise TOUJOURS les outils appropriés pour AGIR.

### 1. NAVIGATION
- **Navigation LOCALE** ('navigate_app' avec 'section_id'): Pour changer d'onglet ou de vue dans la page actuelle.
  Ex: "Ouvre les documents" -> navigate_app(route='/ministre/documents')
  Ex: "Va aux paramètres" -> navigate_app(route='/ministre/settings')
  Ex: "Retour au tableau de bord" -> navigate_app(route='/ministre/dashboard')

### 2. CONTRÔLE UI ('control_ui')
- **Thème**:
  • "Mode sombre", "Passe en dark" -> action='set_theme_dark'
  • "Mode clair", "Passe en light" -> action='set_theme_light'
  **IMPORTANT** : Pour TOUTE demande de thème, tu DOIS appeler control_ui.

### 3. DOCUMENTS ('generate_document')
- Formats : PDF (par défaut) ou DOCX.
- Ex: "Rédige une lettre pour..." -> generate_document(...)

### 4. ARRÊT ('stop_conversation')
- Si l'utilisateur dit "Arrête", "Stop", "Ferme", appelle 'stop_conversation'.

## RÈGLES CRITIQUES
1. **EXÉCUTION IMMÉDIATE** : Appelle l'outil PUIS confirme verbalement ("C'est fait Excellence.", "Je lance la navigation.").
2. **PAS DE BALISES** : Ne jamais dire [pause] ou (action).
3. **TEXTE PUR** : Seulement ce que l'utilisateur doit entendre.

## CONTEXTE ACTUEL
Catégorie: ${context.category}
Intention: ${context.intent}
Urgence: ${context.urgency}
${knowledgeContext}
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