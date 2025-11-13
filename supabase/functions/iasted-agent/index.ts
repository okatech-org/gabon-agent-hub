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
    
    if (action === 'effectifs' || action === 'simulation') {
      const { data: agents } = await supabase
        .from('agents')
        .select('type_agent, statut, grade, categorie, sexe, structure_id, date_naissance, echelon');
      
      const { data: structures } = await supabase
        .from('structures')
        .select('nom, type_structure, localisation');

      contextData = `Données des effectifs:\n- Nombre total d'agents: ${agents?.length || 0}\n`;
      
      if (agents) {
        // Répartition par type
        const parType = agents.reduce((acc: any, a) => {
          acc[a.type_agent] = (acc[a.type_agent] || 0) + 1;
          return acc;
        }, {});
        contextData += `- Répartition par type: ${JSON.stringify(parType)}\n`;
        
        // Répartition par genre
        const parGenre = agents.reduce((acc: any, a) => {
          acc[a.sexe] = (acc[a.sexe] || 0) + 1;
          return acc;
        }, {});
        contextData += `- Répartition par genre: ${JSON.stringify(parGenre)}\n`;

        // Répartition par catégorie
        const parCategorie = agents.reduce((acc: any, a) => {
          if (a.categorie) acc[a.categorie] = (acc[a.categorie] || 0) + 1;
          return acc;
        }, {});
        contextData += `- Répartition par catégorie: ${JSON.stringify(parCategorie)}\n`;

        // Analyse des âges pour départs à la retraite
        const today = new Date();
        const agentsProchesRetraite = agents.filter(a => {
          if (!a.date_naissance) return false;
          const age = today.getFullYear() - new Date(a.date_naissance).getFullYear();
          return age >= 55 && age < 60; // Proche de la retraite (60 ans)
        });
        contextData += `- Agents proches de la retraite (55-60 ans): ${agentsProchesRetraite.length}\n`;
      }
      
      if (structures) {
        contextData += `- Nombre de structures: ${structures.length}\n`;
        const parType = structures.reduce((acc: any, s) => {
          acc[s.type_structure] = (acc[s.type_structure] || 0) + 1;
          return acc;
        }, {});
        contextData += `- Structures par type: ${JSON.stringify(parType)}\n`;
      }
    } else if (action === 'actes' || action === 'redaction' || action === 'documents') {
      const { data: actes } = await supabase
        .from('actes_administratifs')
        .select('type_acte, statut, date_creation')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (actes) {
        const parStatut = actes.reduce((acc: any, a) => {
          acc[a.statut] = (acc[a.statut] || 0) + 1;
          return acc;
        }, {});
        contextData += `Actes administratifs:\n- Total récent: ${actes.length}\n- Par statut: ${JSON.stringify(parStatut)}\n`;
        
        const parType = actes.reduce((acc: any, a) => {
          acc[a.type_acte] = (acc[a.type_acte] || 0) + 1;
          return acc;
        }, {});
        contextData += `- Par type: ${JSON.stringify(parType)}\n`;

        // Actes en attente
        const enAttente = actes.filter(a => a.statut === 'brouillon' || a.statut === 'en_validation');
        contextData += `- En attente de validation: ${enAttente.length}\n`;
      }

      if (action === 'documents') {
        contextData += `\nTypes de documents ministériels disponibles:
- Arrêté Ministériel
- Circulaire
- Instruction
- Note de Service
- Décision
- Rapport
- Communiqué
- Réponse Ministérielle
- Projet de Loi
- Projet d'Ordonnance
- Projet de Décret\n`;
      }
    } else if (action === 'economie') {
      const { data: agents } = await supabase
        .from('agents')
        .select('type_agent, categorie, grade, echelon');
      
      if (agents) {
        contextData = `Données économiques et budgétaires:\n- Nombre total d'agents: ${agents.length}\n`;
        const parCategorie = agents.reduce((acc: any, a) => {
          if (a.categorie) acc[a.categorie] = (acc[a.categorie] || 0) + 1;
          return acc;
        }, {});
        contextData += `- Répartition par catégorie: ${JSON.stringify(parCategorie)}\n`;
        contextData += `\nNote: Analyse de masse salariale nécessite les grilles indiciaires et les salaires de base par grade/échelon.\n`;
      }
    } else if (action === 'formations') {
      const { data: agents } = await supabase
        .from('agents')
        .select('grade, categorie, type_agent');
      
      if (agents) {
        contextData = `Données sur le personnel (pour besoins en formation):\n- Agents total: ${agents.length}\n`;
        const parGrade = agents.reduce((acc: any, a) => {
          if (a.grade) acc[a.grade] = (acc[a.grade] || 0) + 1;
          return acc;
        }, {});
        contextData += `- Répartition par grade: ${JSON.stringify(parGrade)}\n`;
        contextData += `\nNote: Les données de formations continues ne sont pas encore centralisées dans le système.\n`;
      }
    } else if (action === 'historique') {
      const { data: actes } = await supabase
        .from('actes_administratifs')
        .select('type_acte, date_creation, objet, statut')
        .gte('date_creation', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
        .order('date_creation', { ascending: false })
        .limit(50);
      
      if (actes) {
        contextData = `Historique des 12 derniers mois:\n- Actes créés: ${actes.length}\n`;
        const parType = actes.reduce((acc: any, a) => {
          acc[a.type_acte] = (acc[a.type_acte] || 0) + 1;
          return acc;
        }, {});
        contextData += `- Par type: ${JSON.stringify(parType)}\n`;
      }
    } else if (action === 'alertes' || action === 'notifications') {
      const { data: anomalies } = await supabase
        .from('anomalies_recensement')
        .select('type_anomalie, est_regularise')
        .order('created_at', { ascending: false })
        .limit(100);
      
      const { data: actes } = await supabase
        .from('actes_administratifs')
        .select('statut')
        .eq('statut', 'en_validation');
      
      contextData = `Alertes et notifications:\n`;
      
      if (anomalies) {
        const nonRegularisees = anomalies.filter(a => !a.est_regularise);
        contextData += `- Anomalies non régularisées: ${nonRegularisees.length}\n`;
        const parType = anomalies.reduce((acc: any, a) => {
          acc[a.type_anomalie] = (acc[a.type_anomalie] || 0) + 1;
          return acc;
        }, {});
        contextData += `- Types d'anomalies: ${JSON.stringify(parType)}\n`;
      }
      
      if (actes) {
        contextData += `- Actes en attente de validation: ${actes.length}\n`;
      }
    } else if (action === 'reglementations') {
      contextData = `Réglementations de la fonction publique gabonaise:
- Loi portant Statut général de la Fonction publique
- Décrets d'application du statut
- Arrêtés ministériels en vigueur
- Circulaires d'orientation

Note: La base documentaire juridique complète n'est pas encore intégrée au système. Se référer aux textes officiels publiés au Journal Officiel.\n`;
    }

    // Préparer le prompt système selon le contexte
    const systemPrompt = `Tu es iAsted, l'assistant IA du Ministre de la Fonction Publique du Gabon.

CONTEXTE ET RÔLE:
Tu as accès aux données suivantes:
${contextData}

${context || ''}

CAPACITÉS ET RESPONSABILITÉS:
1. **Analyse stratégique**: Fournir des insights sur les effectifs, tendances, risques et opportunités
2. **Économie & Finances**: Analyser la masse salariale, impacts budgétaires, optimisations
3. **Actions ministérielles**: Générer documents officiels, suivre réglementations, gérer notifications
4. **Formations**: Identifier besoins en formation continue et plans de développement
5. **Historique & traçabilité**: Retracer les décisions et leurs impacts
6. **Alertes & monitoring**: Détecter anomalies et situations nécessitant action urgente
7. **Simulations**: Modéliser les impacts de réformes, gel de recrutements, départs à la retraite
8. **Rédaction institutionnelle**: Produire notes, rapports, décrets avec ton formel et données chiffrées

INSTRUCTIONS SPÉCIFIQUES SELON LE TYPE DE DEMANDE:

Pour **Économie & Finances**:
- Analyser la masse salariale globale et par catégorie
- Évaluer l'impact budgétaire des décisions RH
- Proposer des optimisations (gel recrutements, redéploiements)
- Comparer avec les budgets alloués
- Identifier les postes de coûts principaux

Pour **Documents ministériels**:
- Présenter les types de documents disponibles avec leurs usages
- Expliquer les circuits de validation selon le type
- Proposer des templates et structures adaptées
- Guider sur le ton et formalisme requis pour chaque type

Pour **Réglementations**:
- Référencer les textes juridiques pertinents
- Expliquer l'application des statuts et décrets
- Identifier les réformes réglementaires en cours
- Signaler les incompatibilités ou vides juridiques

Pour **Formations**:
- Identifier les besoins en formation par grade/corps
- Proposer des plans de formation ciblés
- Évaluer les impacts sur la performance des services
- Recommander des parcours professionnalisant

Pour **Historique**:
- Retracer les décisions sur 12 mois
- Analyser les tendances et évolutions
- Identifier les patterns de décisions
- Mesurer les impacts à moyen terme

Pour **Alertes & Notifications**:
- Lister les alertes critiques par ordre de priorité
- Quantifier les risques (financiers, légaux, opérationnels)
- Proposer des actions correctives immédiates
- Définir des échéances d'intervention

Pour les **analyses d'effectifs**:
- Présenter les chiffres clés (total, répartitions)
- Identifier les déséquilibres (genre, catégories, provinces)
- Signaler les risques (départs massifs, sous-effectifs)
- Proposer des actions correctrices

Pour les **simulations**:
- Modéliser l'impact sur 3-5 ans
- Quantifier les effets (effectifs, budgets, services)
- Évaluer les risques sur la continuité de service
- Proposer 2-3 scénarios alternatifs avec avantages/inconvénients

Pour la **rédaction de documents**:
- Utiliser un ton institutionnel formel
- Structurer: Introduction, Analyse, Recommandations, Conclusion
- Intégrer les données chiffrées avec sources
- Proposer des formulations diplomatiques

Pour les **validations d'actes**:
- Résumer l'objet et les impacts
- Évaluer la conformité réglementaire
- Identifier les risques juridiques ou budgétaires
- Recommander: Valider / Réviser / Refuser avec justification

FORMAT DE RÉPONSE STRUCTURÉ:
📊 **Résumé exécutif** (2-3 phrases)

📈 **Analyse détaillée**
- Point 1 avec chiffres
- Point 2 avec tendances
- Point 3 avec comparaisons

💡 **Recommandations**
1. Action prioritaire (justification)
2. Action secondaire (justification)
3. Action de suivi (justification)

⚠️ **Points d'attention**
- Risque identifié 1
- Risque identifié 2

📚 **Sources**: [lister les tables/données utilisées]

PRINCIPES ÉTHIQUES:
- Tu PROPOSES, le Ministre DÉCIDE
- Toujours citer tes sources de données
- Signaler les limites de ton analyse
- Ne jamais suggérer d'actions discriminatoires
- Respecter la confidentialité des données personnelles
- Adopter une posture de conseil stratégique orientée solutions`;

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
        max_tokens: 3000,
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
