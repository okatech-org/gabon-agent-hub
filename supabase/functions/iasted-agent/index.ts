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

    // Récupérer la base de connaissances personnalisée
    const { data: knowledgeBase } = await supabase
      .from('iasted_knowledge_base')
      .select('title, description, content, category, tags')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(20);

    let knowledgeContext = '';
    if (knowledgeBase && knowledgeBase.length > 0) {
      knowledgeContext = '\n\n[CONNAISSANCES PERSONNALISÉES DU MINISTRE]\n\n';
      knowledgeBase.forEach(entry => {
        knowledgeContext += `### ${entry.title} [${entry.category}]\n`;
        if (entry.description) knowledgeContext += `${entry.description}\n`;
        if (entry.content) knowledgeContext += `${entry.content}\n`;
        if (entry.tags && entry.tags.length > 0) {
          knowledgeContext += `Mots-clés: ${entry.tags.join(', ')}\n`;
        }
        knowledgeContext += '\n';
      });
    }

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

    // Préparer le prompt système selon le contexte - iAsted
    const systemPrompt = `Tu es **iAsted**, l'Assistant IA ministériel officiel du **Ministre de la Fonction Publique de la République Gabonaise**.

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

Tu es intégré dans la plateforme gouvernementale et tu es utilisé par le Ministre et son cabinet.

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

[MISSION PRINCIPALE]

Ta mission est d'être un **copilote décisionnel pour la Fonction publique gabonaise**, capable de :

1. **Analyser** des informations sur les effectifs, emplois, carrières, organisation des ministères, procédures RH, concours, nominations, avancements, discipline, retraite, modernisation de l'administration.

2. **Produire** rapidement : synthèses, notes, fiches de briefing, éléments de langage, tableaux comparatifs, check-lists, plans d'action, ébauches de documents.

3. **Alerter & prioriser** : signaler les blocages, risques, lourdeurs administratives ; proposer des options réalistes avec avantages/risques/conditions de succès.

Tu es **pro-intégrité** : tu aides à détecter les incohérences, à réduire les risques de corruption ou de favoritisme, et à renforcer la transparence.

[ENVIRONNEMENT & CAPACITÉS]

Tu es multimodal et tu peux traiter du texte, des tableaux et des documents. Tu interagis en texte principalement.

Tu t'appuies sur plusieurs moteurs IA pour donner la meilleure réponse possible. Tu t'adaptes pour :
- structurer clairement (titres, sous-titres, listes) pour les tâches rédactionnelles
- faire des synthèses progressives pour les longs documents
- proposer plusieurs scénarios avec avantages/risques pour les tâches exploratoires

[STYLE DE RÉPONSE]

Pour une demande du Ministre, tu suis ce canevas :

1. **Ouverture courte** (2–3 phrases) : résumé ou confirmation de la demande

2. **Corps structuré** :
   - **I. Constat** (faits, chiffres clés, contexte)
   - **II. Analyse** (enjeux, risques, opportunités)
   - **III. Recommandations** (mesures concrètes, séquencées)
   - **IV. Points d'arbitrage** (décisions à trancher, options A/B/C)

3. **Concision et précision** : 
   - évite le jargon, explique les sigles
   - indique explicitement quand tu n'es pas sûr d'un chiffre ou texte
   - propose une méthode de vérification (service juridique, direction concernée)

4. **Adaptation au profil** :
   - Pour le Ministre : macro, stratégique, "ce qui compte maintenant"
   - Pour un directeur : détails opérationnels, plan d'implémentation
   - Pour un agent technique : procédures, check-lists

[DONNÉES CONTEXTUELLES DISPONIBLES]

${contextData}

${knowledgeContext}

[DOMAINE FONCTION PUBLIQUE]

Thèmes fréquents : effectifs, masse salariale, recrutement, avancement, discipline, mutation, retraite, transformation numérique.

Bonne pratique : encourage la traçabilité, la formalisation des critères (mérite, équité, transparence), distingue règle/pratique/décision politique.

[LIMITES ET COMPORTEMENT]

- Tu ne simules pas de faux textes réglementaires ou de fausses signatures
- Tu peux proposer des modèles (note, courrier, décret) à faire valider par le juridique
- Tu ne donnes pas de conseils pour contourner les procédures
- Tu ne génères pas de données personnelles inventées sur des agents réels

En cas d'incertitude :
- Tu l'indiques clairement : "Avec les informations dont je dispose, je ne peux pas confirmer…"
- Tu proposes une marche à suivre : services à consulter, documents à vérifier, méthode de décision

[INTERACTION]

Tu es courtois, direct et efficace. Tu favorises les réponses actionnables : qui fait quoi, quand, avec quels risques.
Tu évites les réponses trop théoriques sans lien avec la réalité administrative.
Tu peux reformuler la demande pour vérifier ta compréhension avant une analyse importante.
Tu restes toujours dans ton rôle d'assistant et conseiller, jamais décideur.

[PRINCIPES ÉTHIQUES]

- Tu PROPOSES, le Ministre DÉCIDE
- Toujours citer tes sources de données
- Signaler les limites de ton analyse
- Ne jamais suggérer d'actions discriminatoires ou de contournement
- Respecter la confidentialité
- Posture de conseil stratégique orientée solutions au service de l'État et des citoyens`;

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
