import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, context, action } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Initialiser le client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Récupérer les données contextuelles selon l'action
    let contextData = '';
    
    if (action === 'effectifs') {
      const { data: agents } = await supabase
        .from('agents')
        .select('type_agent, statut, grade, categorie, sexe, structure_id');
      
      const { data: structures } = await supabase
        .from('structures')
        .select('nom, type_structure, localisation');

      contextData = `Données des effectifs:\n- Nombre total d'agents: ${agents?.length || 0}\n`;
      
      if (agents) {
        const parType = agents.reduce((acc: any, a) => {
          acc[a.type_agent] = (acc[a.type_agent] || 0) + 1;
          return acc;
        }, {});
        contextData += `- Répartition par type: ${JSON.stringify(parType)}\n`;
        
        const parGenre = agents.reduce((acc: any, a) => {
          acc[a.sexe] = (acc[a.sexe] || 0) + 1;
          return acc;
        }, {});
        contextData += `- Répartition par genre: ${JSON.stringify(parGenre)}\n`;
      }
      
      if (structures) {
        contextData += `- Nombre de structures: ${structures.length}\n`;
      }
    } else if (action === 'actes') {
      const { data: actes } = await supabase
        .from('actes_administratifs')
        .select('type_acte, statut')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (actes) {
        const parStatut = actes.reduce((acc: any, a) => {
          acc[a.statut] = (acc[a.statut] || 0) + 1;
          return acc;
        }, {});
        contextData += `Actes administratifs:\n- Total récent: ${actes.length}\n- Par statut: ${JSON.stringify(parStatut)}\n`;
      }
    }

    // Préparer le prompt système selon le contexte
    const systemPrompt = `Tu es iAsted, l'assistant IA du Ministre de la Fonction Publique du Gabon.

Tu as accès aux données suivantes:
${contextData}

${context || ''}

Ton rôle est de:
1. Analyser les données et fournir des insights stratégiques
2. Répondre aux questions complexes sur la fonction publique
3. Proposer des recommandations basées sur les données
4. Identifier les risques et opportunités
5. Synthétiser les informations de manière claire et structurée

Format de réponse attendu:
- **Résumé**: synthèse en 2-3 phrases
- **Analyse détaillée**: explications et chiffres clés
- **Recommandations**: 2-3 actions concrètes
- **Points d'attention**: risques ou éléments à surveiller

Sois précis, factuel et orienté action. Cite toujours tes sources de données.`;

    // Appel à l'API Lovable AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Limite de requêtes dépassée. Veuillez réessayer dans quelques instants.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'Crédits IA insuffisants. Veuillez contacter l\'administrateur.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      throw new Error(`Erreur API: ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('iAsted response generated successfully');

    return new Response(JSON.stringify({ 
      response: aiResponse,
      model: 'google/gemini-2.5-flash',
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in iasted-agent:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Erreur interne du serveur' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
