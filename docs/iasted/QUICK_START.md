# 🚀 iAsted v2.0 - Démarrage Rapide (10 minutes)

## ⚡ Installation Express

### Étape 1 : Migration DB (2 min)

```bash
cd /Users/okatech/gabon-agent-hub
supabase db push
```

✅ **Vérification** : Pas d'erreur dans la sortie

---

### Étape 2 : Variables d'Environnement (2 min)

**Supabase Dashboard** : Settings > Edge Functions > Secrets

Ajouter les 3 clés :
```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-proj-...
ELEVENLABS_API_KEY=sk_...
```

✅ **Vérification** : `supabase secrets list`

---

### Étape 3 : Déployer Functions (3 min)

```bash
cd supabase/functions

# Function 1 : Générateur PDF
supabase functions deploy pdf-generator

# Function 2 : IA + TTS
supabase functions deploy chat-with-iasted-advanced
```

✅ **Vérification** : 
```bash
supabase functions list
# Doit afficher: pdf-generator, chat-with-iasted-advanced
```

---

### Étape 4 : Voix iAsted (3 min)

1. Aller sur [ElevenLabs Dashboard](https://elevenlabs.io)
2. Créer une voix nommée **"iasted"** (minuscules obligatoire)
3. Configurer :
   - Style : Professionnel et chaleureux
   - Âge : Adulte (30-40 ans)
   - Accent : Français standard

✅ **Vérification** : 
```bash
curl https://api.elevenlabs.io/v1/voices \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  | grep -i "iasted"
```

---

## 🧪 Tests (5 min)

### Lancer le Frontend

```bash
npm run dev
```

### Test 1 : Accès Interface (30s)

Ouvrir : `http://localhost:5173/ministre/iasted-advanced`

✅ **Résultat attendu** :
- Page affichée sans erreur
- Header "iAsted Optimisé Claude"
- 4 onglets visibles
- Bouton micro central

---

### Test 2 : Chargement Voix (30s)

1. Aller dans l'onglet **Paramètres**
2. Section "Voix iAsted"

✅ **Résultat attendu** :
- Voix "iasted" sélectionnée automatiquement
- Message : "✅ Voix iAsted chargée"

---

### Test 3 : Conversation Vocale (2 min)

1. Onglet **Vocal**
2. Cliquer sur le bouton micro
3. Autoriser le microphone
4. Dire : **"Bonjour iAsted"**
5. Attendre la fin automatique (VAD)

✅ **Résultat attendu** :
- Bouton micro devient bleu (écoute)
- Barre de niveau audio s'anime
- Timer "Fin dans Xs"
- Badge "Réflexion..." apparaît
- Badge "Parle..." apparaît
- Audio joué naturellement
- Message affiché dans conversation

**Si ça marche → Bravo ! 🎉**

---

### Test 4 : Génération Document (2 min)

1. Cliquer à nouveau sur le micro
2. Dire : **"Crée-moi un décret de nomination pour Jean Dupont comme Directeur Général"**
3. Attendre génération

✅ **Résultat attendu** :
- Badge "Réflexion..." pendant ~5s
- Message iAsted : "Excellence, j'ai généré le document..."
- Preview document dans conversation
- Onglet **Documents** affiche compteur (1)
- Boutons "Voir" et "Télécharger" fonctionnent

**Si ça marche → Système complet ! 🚀**

---

## 🐛 Problèmes Courants

### Erreur : "ANTHROPIC_API_KEY not configured"

```bash
# Vérifier
supabase secrets list

# Ajouter
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

# Redéployer
supabase functions deploy chat-with-iasted-advanced
```

---

### Erreur : "Voix iAsted non trouvée"

```bash
# Lister voix ElevenLabs
curl https://api.elevenlabs.io/v1/voices \
  -H "xi-api-key: $ELEVENLABS_API_KEY"

# Si absent : créer voix "iasted" dans dashboard
```

---

### Erreur : "Upload PDF failed (403)"

```sql
-- Vérifier bucket existe
SELECT * FROM storage.buckets WHERE id = 'iasted-documents';

-- Recréer si absent
INSERT INTO storage.buckets (id, name, public)
VALUES ('iasted-documents', 'iasted-documents', true)
ON CONFLICT DO NOTHING;
```

---

### VAD coupe trop tôt

Interface > Paramètres > Détection de Parole

**Augmenter "Durée de silence"** : 800ms → 1200ms

---

## 📊 Logs en Temps Réel

```bash
# Suivre les logs
supabase functions logs chat-with-iasted-advanced --tail

# Filtrer erreurs
supabase functions logs chat-with-iasted-advanced --level error
```

---

## ✅ Checklist Complète

### Installation
- [ ] Migration DB appliquée
- [ ] Variables d'environnement configurées
- [ ] Functions déployées
- [ ] Voix iAsted créée

### Tests
- [ ] Interface accessible
- [ ] Voix chargée
- [ ] Conversation vocale fonctionne
- [ ] VAD détecte fin de parole
- [ ] Génération document OK
- [ ] PDF téléchargeable

### Performance
- [ ] Latence vocale < 8s
- [ ] Audio naturel
- [ ] Pas d'erreurs dans logs
- [ ] UI responsive

---

## 🎓 Formation Utilisateurs (1h)

### Session 1 : Bases (20 min)
- Accès interface
- Conversation simple
- Commandes vocales
- Lecture messages

### Session 2 : Documents (20 min)
- Créer un décret
- Créer une lettre
- Télécharger PDF
- Visualiser historique

### Session 3 : Avancé (20 min)
- Mode continu
- Adaptation réponses ("résume", "explique en détail")
- Paramètres VAD
- Choix modèle IA

---

## 🎯 Prochaines Étapes

1. **J+1** : Monitoring usage
2. **J+7** : Collecter feedback utilisateurs
3. **J+30** : Optimisations basées sur analytics
4. **Q1 2025** : Nouvelles fonctionnalités (multi-langue, etc.)

---

## 📞 Support

**En cas de problème** :
1. Consulter logs : `supabase functions logs chat-with-iasted-advanced --tail`
2. Vérifier [TROUBLESHOOTING.md](./README.md#-dépannage)
3. Contact : iasted-support@fonction-publique.ga

---

## 🎉 Félicitations !

Si tous les tests passent, votre système iAsted v2.0 est **production ready** !

**Temps total installation** : ~10 minutes  
**Temps total tests** : ~5 minutes  
**Status** : ✅ Opérationnel

---

**Date** : 14 Novembre 2025  
**Version** : 2.0  
**Guide** : Quick Start

<div align="center">

**🚀 Bon déploiement avec iAsted !**

</div>

