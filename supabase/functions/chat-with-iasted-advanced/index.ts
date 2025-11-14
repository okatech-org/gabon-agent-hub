import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Anthropic from 'npm:@anthropic-ai/sdk@0.27.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/**
 * Détecte le type de réponse attendu (synthèse, détail, document)
 */
function detectResponseIntent(transcript: string, conversationHistory: any[]): {
  type: 'conversation' | 'document' | 'synthesis' | 'detailed';
  documentType?: 'decree' | 'letter' | 'report' | 'note';
  responseMode?: 'concise' | 'detailed' | 'adaptive';
} {
  const lower = transcript.toLowerCase().trim();
  const fullContext = conversationHistory.map(m => m.content).join(' ') + ' ' + lower;

  // Détection de génération de document
  if (
    /(?:cr[ée]e|g[ée]n[èé]re|[ée]cri[ts]|r[ée]dig|fai[ts]|produi[ts])\s+(?:moi|un|une|le|la)?\s*(?:d[ée]cret|arr[êe]t[ée]|lettre|courrier|note|rapport|r[ée]ponse)/i.test(lower) ||
    /besoin\s+d(?:['']|e)\s*(?:un|une)\s*(?:d[ée]cret|lettre|document)/i.test(lower)
  ) {
    // Identifier le type de document
    let documentType: 'decree' | 'letter' | 'report' | 'note' = 'letter';
    
    if (/d[ée]cret|arr[êe]t[ée]/i.test(lower)) {
      documentType = 'decree';
    } else if (/rapport|synth[èe]se|analyse/i.test(lower)) {
      documentType = 'report';
    } else if (/note\s+de\s+service|note\s+interne/i.test(lower)) {
      documentType = 'note';
    }
    
    return {
      type: 'document',
      documentType,
    };
  }

  // Détection besoin de synthèse
  if (/r[ée]sum|synth[èe]se|en\s+bref|en\s+gros|rapidement|vite|en\s+quelques\s+mots/i.test(lower)) {
    return {
      type: 'synthesis',
      responseMode: 'concise',
    };
  }

  // Détection besoin de détails
  if (/d[ée]tail|pr[ée]cis|expliqu|comment|pourquoi|approfondi|complet|exhaustif/i.test(lower)) {
    return {
      type: 'detailed',
      responseMode: 'detailed',
    };
  }

  // Conversation standard
  return {
    type: 'conversation',
    responseMode: 'adaptive',
  };
}

/**
 * Génère un document PDF via API Claude
 */
async function generateDocument(
  documentType: string,
  userRequest: string,
  context: string,
  anthropicClient: Anthropic
): Promise<{ content: string; markdown: string }> {
  
  const documentPrompts = {
    decree: `Tu es un rédacteur juridique expert en droit administratif gabonais. Génère un arrêté ministériel complet et conforme selon cette demande:

${userRequest}

CONTEXTE MINISTÉRIEL:
${context}

STRUCTURE OBLIGATOIRE D'UN ARRÊTÉ MINISTÉRIEL:

RÉPUBLIQUE GABONAISE
Unité – Travail – Justice
_______________

MINISTÈRE DE LA FONCTION PUBLIQUE
_______________

ARRÊTÉ N° _____ /MFPTPRE du [DATE]

[OBJET DE L'ARRÊTÉ EN MAJUSCULES]

LE MINISTRE DE LA FONCTION PUBLIQUE, DE LA TRANSFORMATION PUBLIQUE ET DE LA RÉFORME DE L'ÉTAT,

VU [Liste des textes juridiques de référence];
VU [Autres textes applicables];

CONSIDÉRANT [Exposé des motifs];

SUR PROPOSITION [Si applicable];

ARRÊTE:

Article 1er: [Disposition principale]
Article 2: [Dispositions complémentaires]
Article 3: [Entrée en vigueur]
Article 4: [Notification et publication]

Fait à Libreville, le [DATE]

Le Ministre
[SIGNATURE]
[NOM ET TITRE]

Pour Ampliation:
- Président de la République
- Premier Ministre
- Contrôle d'État
- Archives Nationales
- Intéressé(e)

IMPORTANT:
- Utilise la numérotation réelle des articles
- Respecte la hiérarchie des normes
- Inclus les visas juridiques pertinents
- Date conforme au format français
- Formulation administrative stricte`,

    letter: `Tu es le secrétaire particulier du Ministre de la Fonction Publique. Rédige une lettre officielle selon cette demande:

${userRequest}

CONTEXTE:
${context}

FORMAT D'UNE LETTRE MINISTÉRIELLE:

RÉPUBLIQUE GABONAISE
Unité – Travail – Justice

MINISTÈRE DE LA FONCTION PUBLIQUE,
DE LA TRANSFORMATION PUBLIQUE 
ET DE LA RÉFORME DE L'ÉTAT
_______________

Le Ministre

Libreville, le [DATE]

N° _____ /MFPTPRE

Monsieur/Madame [DESTINATAIRE]
[FONCTION]
[ADRESSE]

Objet: [Objet précis de la lettre]

Monsieur/Madame [CIVILITÉ],

[Corps de la lettre en 3-4 paragraphes:
- Introduction contextuelle
- Développement avec arguments
- Conclusion et demande d'action si nécessaire]

Veuillez agréer, Monsieur/Madame [CIVILITÉ], l'expression de ma considération distinguée.

Le Ministre

[SIGNATURE]
[NOM DU MINISTRE]

PJ: [Liste des pièces jointes si applicable]
Copie pour information: [Liste]`,

    report: `Tu es analyste politique senior au cabinet du Ministre. Produis un rapport analytique selon cette demande:

${userRequest}

DONNÉES DISPONIBLES:
${context}

STRUCTURE D'UN RAPPORT MINISTÉRIEL:

# RAPPORT [TITRE EN MAJUSCULES]

**À l'attention de:** Excellence Monsieur le Ministre de la Fonction Publique  
**Objet:** [Objet du rapport]  
**Date:** [Date]  
**Référence:** [Numéro de référence]

---

## I. CONTEXTE ET ENJEUX

[Exposé de la situation, contexte politique/administratif, enjeux stratégiques]

## II. CONSTATS ET ANALYSE

### A. Situation actuelle
[Données chiffrées, faits établis, tendances observées]

### B. Forces et faiblesses
[Analyse SWOT succincte]

### C. Risques identifiés
[Risques politiques, juridiques, opérationnels]

## III. RECOMMANDATIONS

### A. Mesures à court terme (0-3 mois)
1. [Action prioritaire 1]
2. [Action prioritaire 2]

### B. Mesures à moyen terme (3-12 mois)
1. [Action stratégique 1]
2. [Action stratégique 2]

### C. Ressources nécessaires
- Budgétaires: [Estimation]
- Humaines: [Effectifs]
- Délais: [Timeline]

## IV. POINTS D'ARBITRAGE MINISTÉRIEL

[Questions nécessitant décision du Ministre avec options A/B/C]

## V. CONCLUSION

[Synthèse des recommandations principales]

---

**Rédacteur:** [Nom et fonction]  
**Visa Direction:** [Si applicable]  
**Niveau de confidentialité:** [Public/Restreint/Confidentiel]`,

    note: `Tu es directeur de cabinet. Rédige une note de service selon cette demande:

${userRequest}

CONTEXTE:
${context}

FORMAT NOTE DE SERVICE:

RÉPUBLIQUE GABONAISE
Unité – Travail – Justice

MINISTÈRE DE LA FONCTION PUBLIQUE
_______________

NOTE DE SERVICE N° _____ /MFPTPRE

Libreville, le [DATE]

De: Le Ministre de la Fonction Publique
À: [Destinataires]

Objet: [Objet précis]

[Corps de la note en paragraphes courts et directs]

Les dispositions de la présente note entrent en vigueur à compter de sa signature.

Le Ministre

[SIGNATURE]
[NOM]

Diffusion:
- [Liste des services concernés]`
  };

  const prompt = documentPrompts[documentType as keyof typeof documentPrompts] || documentPrompts.letter;

  // Appel à Claude pour génération de document
  const response = await anthropicClient.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: prompt,
    }],
  });

  // Extraire le contenu (sans les blocs thinking)
  const textBlocks = response.content.filter(block => block.type === 'text');
  const documentContent = textBlocks.map(block => block.text).join('\n\n');

  return {
    content: documentContent,
    markdown: documentContent,
  };
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
      voiceId,
      aiModel = 'claude',
      generateAudio = true,
      streamAudio = false,
      responseType = 'adaptive',
    } = await req.json();

    if (!sessionId || !userId) {
      throw new Error('sessionId and userId are required');
    }

    // Initialiser les clients
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!;
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY')!;
    const ANTHROPIC_API_KEY = Deno.env.get('CLAUDE_API_KEY')!;
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!ANTHROPIC_API_KEY) {
      throw new Error('CLAUDE_API_KEY not configured');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

    let transcript = textMessage || '';
    const startTime = Date.now();

    // 1. TRANSCRIPTION (si audio fourni)
    if (audioBase64 && !textMessage) {
      console.log('🎤 Transcription Whisper...');
      
      const audioBuffer = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
      const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' });
      
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');
      formData.append('language', 'fr');
      formData.append('prompt', 'Excellence, Ministre, Fonction Publique, Gabon, arrêté, décret');

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

    // Sauvegarder message utilisateur
    await supabase.from('conversation_messages').insert({
      session_id: sessionId,
      user_id: userId,
      role: 'user',
      content: transcript,
      audio_base64: audioBase64
    });

    // 2. RÉCUPÉRER HISTORIQUE
    const { data: historyData } = await supabase
      .from('conversation_messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(30);

    const conversationHistory = historyData?.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content
    })) || [];

    // 3. RÉCUPÉRER BASE DE CONNAISSANCES
    const { data: knowledgeBase } = await supabase
      .from('iasted_knowledge_base')
      .select('title, description, content, category, tags')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(15);

    let knowledgeContext = '';
    if (knowledgeBase && knowledgeBase.length > 0) {
      knowledgeContext = '\n\n📚 CONNAISSANCES PERSONNALISÉES:\n\n';
      knowledgeBase.forEach((entry: any) => {
        knowledgeContext += `## ${entry.title} [${entry.category}]\n`;
        if (entry.description) knowledgeContext += `${entry.description}\n`;
        if (entry.content) knowledgeContext += `${entry.content}\n`;
        knowledgeContext += '\n';
      });
    }

    // 4. DÉTECTER TYPE DE RÉPONSE
    const intent = detectResponseIntent(transcript, conversationHistory);
    console.log('🎯 Intent détecté:', intent);

    let responseText = '';
    let fileUrl = '';
    let fileName = '';
    let fileType: 'pdf' | 'docx' | undefined;
    let documentType: string | undefined;

    // 5. GÉNÉRATION SELON INTENT
    if (intent.type === 'document') {
      // GÉNÉRATION DE DOCUMENT
      console.log(`📄 Génération document type: ${intent.documentType}`);

      const documentData = await generateDocument(
        intent.documentType!,
        transcript,
        knowledgeContext,
        anthropic
      );

      // Appel au générateur PDF via Supabase Function
      const { data: pdfData, error: pdfError } = await supabase.functions.invoke('pdf-generator', {
        body: {
          markdown: documentData.markdown,
          metadata: {
            title: intent.documentType!,
            type: intent.documentType!,
            author: 'Ministère de la Fonction Publique',
            date: new Date().toLocaleDateString('fr-FR'),
          }
        }
      });

      if (pdfError) {
        console.error('PDF generation error:', pdfError);
        // Fallback: générer un fichier texte
        const textBlob = new TextEncoder().encode(documentData.markdown);
        fileName = `${intent.documentType}_${Date.now()}.txt`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('iasted-documents')
          .upload(`generated/${userId}/${fileName}`, textBlob, {
            contentType: 'text/plain',
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('iasted-documents')
          .getPublicUrl(`generated/${userId}/${fileName}`);

        fileUrl = publicUrlData.publicUrl;
        fileType = 'pdf'; // On garde pdf comme type même si c'est du texte
      } else {
        // Upload du PDF généré
        fileName = `${intent.documentType}_${Date.now()}.pdf`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('iasted-documents')
          .upload(`generated/${userId}/${fileName}`, pdfData, {
            contentType: 'application/pdf',
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('iasted-documents')
          .getPublicUrl(`generated/${userId}/${fileName}`);

        fileUrl = publicUrlData.publicUrl;
        fileType = 'pdf';
      }

      documentType = intent.documentType;
      responseText = `Excellence, j'ai généré le document demandé. Vous pouvez le consulter et le télécharger.`;

      // Enregistrer dans la table generated_documents
      await supabase.from('generated_documents').insert({
        user_id: userId,
        session_id: sessionId,
        document_type: intent.documentType,
        file_url: fileUrl,
        file_name: fileName,
        file_type: 'pdf',
        title: intent.documentType,
        content_preview: documentData.content.substring(0, 500),
        generation_time_ms: Date.now() - startTime,
        ai_model_used: aiModel,
      });

    } else {
      // CONVERSATION STANDARD avec Claude
      console.log('💬 Conversation standard avec Claude...');

      const systemPrompt = `Tu es **iAsted**, l'Assistant IA vocal du Ministre de la Fonction Publique gabonaise.

🎯 PERSONNALITÉ & TON:
- Tu parles comme un proche collaborateur du Ministre
- Ton naturel, fluide, chaleureux mais professionnel
- Tu tutoies pas, tu utilises "Excellence" avec respect mais sans lourdeur
- Tu t'adaptes au rythme de la conversation

🧠 MODE DE RÉPONSE (IMPORTANT):
${intent.responseMode === 'concise' ? `
→ MODE SYNTHÈSE ACTIVÉ
- Réponses ultra-courtes (2-3 phrases max)
- Va droit à l'essentiel
- Chiffres clés uniquement
- Pas de détails techniques
` : intent.responseMode === 'detailed' ? `
→ MODE DÉTAILLÉ ACTIVÉ
- Explications complètes et pédagogiques
- Contexte et nuances
- Exemples concrets
- Chiffres et sources
` : `
→ MODE ADAPTATIF
- Équilibre entre clarté et précision
- 3-5 phrases selon le sujet
- Détails si nécessaire pour la compréhension
`}

📚 CONNAISSANCES:
${knowledgeContext}

💡 CAPACITÉS:
- Analyser effectifs et statistiques RH
- Rédiger actes administratifs
- Simuler impacts de décisions
- Détecter anomalies
- Créer documents officiels (décrets, lettres, rapports)

🎤 STYLE VOCAL:
- Phrases courtes et rythmées
- Pas de jargon inutile
- Transition fluide entre idées
- Pauses naturelles

🔑 PRINCIPE: Tu PROPOSES, le Ministre DÉCIDE. Toujours citer tes sources.`;

      // Appel Claude  
      const validMessages = conversationHistory
        .slice(-10)
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

      const claudeResponse = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: intent.responseMode === 'concise' ? 300 : intent.responseMode === 'detailed' ? 2000 : 800,
        messages: [
          { role: 'user', content: systemPrompt },
          ...validMessages,
          { role: 'user', content: transcript }
        ],
      });

      // Extraire texte (sans thinking)
      const textBlocks = claudeResponse.content.filter(block => block.type === 'text');
      responseText = textBlocks.map(block => block.text).join('\n\n');
      
      console.log('✅ Réponse Claude générée');
    }

    // Sauvegarder réponse assistant
    await supabase.from('conversation_messages').insert({
      session_id: sessionId,
      user_id: userId,
      role: 'assistant',
      content: responseText,
      file_url: fileUrl || null,
      file_name: fileName || null,
      file_type: fileType || null,
      document_type: documentType || null,
    });

    // 6. GÉNÉRATION AUDIO (TTS ElevenLabs)
    let audioContent = '';
    
    if (generateAudio && responseText && !fileUrl) {
      console.log('🔊 Génération TTS ElevenLabs...');
      
      const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: responseText,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.55,
            similarity_boost: 0.80,
            style: 0.30,
            use_speaker_boost: true,
          },
          optimize_streaming_latency: streamAudio ? 3 : 0,
        }),
      });

      if (!ttsResponse.ok) {
        const errorText = await ttsResponse.text();
        console.error('ElevenLabs TTS error:', errorText);
      } else {
        const audioBlob = await ttsResponse.arrayBuffer();
        const uint8Array = new Uint8Array(audioBlob);
        
        // Conversion base64 par chunks
        const chunkSize = 8192;
        let binaryString = '';
        
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
          const chunk = uint8Array.slice(i, Math.min(i + chunkSize, uint8Array.length));
          binaryString += String.fromCharCode(...Array.from(chunk));
        }
        
        audioContent = btoa(binaryString);
        console.log(`✅ Audio généré: ${(audioBlob.byteLength / 1024).toFixed(2)} KB`);
      }
    }

    // 7. RÉPONSE FINALE
    return new Response(JSON.stringify({
      transcript,
      responseText,
      audioContent,
      fileUrl: fileUrl || undefined,
      fileName: fileName || undefined,
      fileType: fileType || undefined,
      documentType: documentType || undefined,
      intent: intent.type,
      processingTime: Date.now() - startTime,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
