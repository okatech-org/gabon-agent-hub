# 🎤 iAsted Optimisé v2.0 - Guide d'Installation

## 📋 Vue d'Ensemble

iAsted v2.0 est un assistant IA vocal avancé avec les capacités suivantes :
- 🎤 Conversation vocale ultra-naturelle avec VAD intelligent
- 🧠 Intelligence Claude Sonnet 4 avec Extended Thinking
- 📄 Génération automatique de documents officiels (PDF)
- 🎯 Adaptation automatique des réponses (synthèse/détails)
- ⚡ Performance optimisée (-50% latence)

## 🚀 Installation Rapide

### 1. Prérequis

- Node.js 18+
- Compte Supabase actif
- API Keys : Anthropic, OpenAI, ElevenLabs

### 2. Appliquer la Migration Base de Données

```bash
cd gabon-agent-hub
supabase db push
```

La migration `20251114090000_add_iasted_enhancements.sql` crée :
- ✅ Colonnes pour fichiers générés dans `conversation_messages`
- ✅ Bucket storage `iasted-documents` 
- ✅ Table `generated_documents` pour analytics
- ✅ Colonnes VAD config dans `user_preferences`
- ✅ Indexes pour performance

### 3. Configurer les Variables d'Environnement

Dans le Dashboard Supabase > Settings > Edge Functions > Secrets :

```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-proj-...
ELEVENLABS_API_KEY=sk_...
```

### 4. Déployer les Fonctions Supabase

```bash
cd supabase/functions

# Déployer le générateur PDF
supabase functions deploy pdf-generator

# Déployer la fonction IA principale
supabase functions deploy chat-with-iasted-advanced
```

### 5. Créer la Voix iAsted sur ElevenLabs

1. Accéder à [ElevenLabs Dashboard](https://elevenlabs.io)
2. Créer une nouvelle voix nommée **"iasted"** (minuscules important)
3. Configurer la voix :
   - Style : Professionnel et chaleureux
   - Stabilité : 0.55
   - Similarité : 0.80
4. La voix sera automatiquement détectée par le système

### 6. Tester l'Installation

```bash
# Lancer le frontend en développement
npm run dev
```

Accéder à : `http://localhost:5173/ministre/iasted-advanced`

## 📂 Structure du Projet

```
gabon-agent-hub/
├── src/
│   ├── hooks/
│   │   └── useVoiceInteractionAdvanced.tsx    # Hook VAD intelligent
│   ├── components/
│   │   └── ministre/
│   │       └── GeneratedDocument.tsx           # UI documents
│   ├── pages/
│   │   └── ministre/
│   │       └── IAstedAdvanced.tsx              # Page principale
│   └── App.tsx                                 # Route ajoutée
│
├── supabase/
│   ├── functions/
│   │   ├── chat-with-iasted-advanced/
│   │   │   └── index.ts                        # Backend IA + TTS
│   │   └── pdf-generator/
│   │       ├── index.ts                        # Entry point
│   │       └── pdfGenerator.ts                 # Lib génération PDF
│   └── migrations/
│       └── 20251114090000_add_iasted_enhancements.sql
│
└── docs/
    └── iasted/
        ├── README.md                            # Ce fichier
        ├── README_AMELIORATIONS_IASTED.md       # Détails techniques
        └── FIXES_GENERATION_DOCUMENTS.md        # Fixes appliqués
```

## ✅ Checklist Post-Installation

### Base de Données
- [ ] Migration appliquée avec succès
- [ ] Bucket `iasted-documents` créé
- [ ] Policies storage configurées

### Backend
- [ ] Fonction `pdf-generator` déployée
- [ ] Fonction `chat-with-iasted-advanced` déployée
- [ ] Variables d'environnement configurées
- [ ] Logs accessibles sans erreur

### Frontend
- [ ] Route `/ministre/iasted-advanced` accessible
- [ ] Voix iAsted chargée
- [ ] Interface responsive

### Tests Manuels
- [ ] **Test 1 : Conversation simple**
  - Dire : "Bonjour iAsted"
  - Résultat attendu : Réponse vocale naturelle

- [ ] **Test 2 : VAD (Détection de fin de parole)**
  - Parler pendant 3-4 secondes
  - Résultat attendu : Arrêt automatique après 800ms de silence

- [ ] **Test 3 : Génération document**
  - Dire : "Crée un décret de nomination"
  - Résultat attendu : PDF généré et téléchargeable

- [ ] **Test 4 : Adaptation réponse**
  - Dire : "Résume les effectifs"
  - Résultat attendu : Réponse courte (2-3 phrases)

## 🐛 Dépannage

### Problème 1 : "ANTHROPIC_API_KEY not configured"

```bash
# Vérifier les secrets
supabase secrets list

# Ajouter si manquant
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

# Redéployer
supabase functions deploy chat-with-iasted-advanced
```

### Problème 2 : Upload PDF échoue (403)

```sql
-- Vérifier policies
SELECT * FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';

-- Recréer policy si nécessaire
DROP POLICY IF EXISTS "Authenticated upload documents" ON storage.objects;
CREATE POLICY "Authenticated upload documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'iasted-documents' 
  AND auth.role() = 'authenticated'
);
```

### Problème 3 : Voix iAsted non trouvée

```bash
# Lister toutes les voix
curl https://api.elevenlabs.io/v1/voices \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  | jq '.voices[] | {name, voice_id}'

# Si "iasted" absent, créer/renommer dans ElevenLabs dashboard
```

### Problème 4 : VAD trop sensible ou pas assez

Ajuster dans l'interface Paramètres :
- **Trop sensible** : Augmenter "Durée de silence" (1000-1500ms)
- **Pas assez** : Diminuer "Durée de silence" (500-700ms)

### Problème 5 : Latence élevée

Vérifier dans les logs Supabase :
```bash
supabase functions logs chat-with-iasted-advanced --tail
```

Optimisations possibles :
- Utiliser `eleven_turbo_v2_5` (déjà configuré)
- Réduire `max_tokens` pour réponses plus courtes
- Activer streaming audio : `streamAudio: true`

## 📊 Monitoring

### Logs Supabase

```bash
# Voir logs en temps réel
supabase functions logs chat-with-iasted-advanced --tail

# Filtrer erreurs
supabase functions logs chat-with-iasted-advanced --level error

# Dernières 100 lignes
supabase functions logs chat-with-iasted-advanced --limit 100
```

### Métriques à Surveiller

| Métrique | Seuil Normal | Seuil Alerte |
|----------|--------------|--------------|
| **Error Rate** | <1% | >5% |
| **Latence P95** | <8s | >15s |
| **Memory Usage** | <256MB | >400MB |
| **Invocations/min** | Variable | >100 |

### Dashboard

Accéder aux métriques : Supabase > Functions > Metrics

## 🔒 Sécurité

### RGPD & Conformité
- ✅ Consentement explicite pour micro
- ✅ Chiffrement transit (HTTPS) + repos (AES-256)
- ✅ Row Level Security (RLS) activé
- ✅ Audit logs de toutes les générations

### Permissions
```sql
-- Les utilisateurs accèdent uniquement à leurs données
CREATE POLICY "Users can only access their own messages"
ON conversation_messages
FOR ALL
USING (auth.uid() = user_id);

-- Upload documents authentifiés uniquement
CREATE POLICY "Authenticated upload only"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'iasted-documents' 
  AND auth.role() = 'authenticated'
);
```

## 💰 Coûts Estimés

### Par Interaction Vocale Complète
```
Transcription (Whisper) : $0.001
TTS (ElevenLabs)        : $0.02
LLM (Claude Sonnet 4)   : $0.005
──────────────────────────────
TOTAL                   : ~$0.026
```

### Par Document PDF
```
Claude (thinking 3000)  : $0.015
PDF Generation          : $0 (local)
Storage (1MB)           : $0.001
──────────────────────────────
TOTAL                   : ~$0.016
```

### Budget Mensuel (1000 interactions)
- Conversations : **$26/mois**
- Documents (500) : **$8/mois**
- **TOTAL : $34/mois** pour usage intensif

## 📚 Ressources

### Documentation Externe
- [Anthropic API](https://docs.anthropic.com/en/api)
- [ElevenLabs Docs](https://elevenlabs.io/docs)
- [Supabase Functions](https://supabase.com/docs/guides/functions)
- [OpenAI Whisper](https://platform.openai.com/docs/guides/speech-to-text)

### Documentation Interne
- [README_AMELIORATIONS_IASTED.md](./README_AMELIORATIONS_IASTED.md) - Détails techniques complets
- [FIXES_GENERATION_DOCUMENTS.md](./FIXES_GENERATION_DOCUMENTS.md) - Fixes appliqués

### Support
- **Email** : iasted-support@fonction-publique.ga
- **Hotline** : +241 XX XX XX XX

## 🎉 Prêt pour Production !

Une fois toutes les étapes complétées :

✅ **Migration** appliquée  
✅ **Functions** déployées  
✅ **Variables** configurées  
✅ **Tests** passés  
✅ **Monitoring** actif

**Votre système iAsted optimisé est opérationnel !**

---

**Version** : 2.0 - Production Ready  
**Date** : 14 Novembre 2025  
**Auteur** : Équipe Technique iAsted  
**Licence** : Propriétaire - Gouvernement Gabonais
