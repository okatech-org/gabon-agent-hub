# 🚀 Guide de Déploiement - Génération de Documents PDF

## 📋 Résumé des Changements

Cette mise à jour ajoute la génération automatique de documents PDF (arrêtés, lettres, rapports, notes) directement dans les conversations avec iAsted, avec affichage de type "artefact" comme Claude.

### ✨ Nouvelles Fonctionnalités

1. **Détection intelligente** des demandes de documents
2. **Génération PDF automatique** via Edge Function
3. **Affichage inline** des documents dans le chat
4. **Actions rapides** : Visualiser et Télécharger
5. **Support multi-types** : Arrêtés, Lettres, Rapports, Notes

## 🔧 Étapes de Déploiement

### 1. Vérifier les Prérequis

```bash
# Vérifier que Supabase CLI est installé
supabase --version

# Vérifier que vous êtes connecté
supabase status
```

### 2. Déployer les Edge Functions

```bash
# Naviguer vers le dossier du projet
cd /Users/okatech/gabon-agent-hub

# Déployer la fonction avancée de chat (avec génération PDF)
supabase functions deploy chat-with-iasted-advanced \
  --project-ref vnsspatmudluflqfcmap \
  --no-verify-jwt=false

# Déployer le générateur PDF
supabase functions deploy pdf-generator \
  --project-ref vnsspatmudluflqfcmap \
  --no-verify-jwt=false
```

### 3. Vérifier les Variables d'Environnement

Assurez-vous que ces secrets sont configurés dans Supabase :

```bash
# Vérifier les secrets (ne pas exécuter, juste vérifier qu'ils existent)
# - ANTHROPIC_API_KEY (pour Claude Sonnet)
# - OPENAI_API_KEY (pour Whisper transcription)
# - ELEVENLABS_API_KEY (pour TTS)
```

Pour vérifier dans le dashboard Supabase :
1. Allez sur https://supabase.com/dashboard/project/vnsspatmudluflqfcmap
2. Cliquez sur "Edge Functions" > "Settings"
3. Vérifiez que les clés API sont présentes

### 4. Tester la Fonction en Local (Optionnel)

```bash
# Démarrer Supabase localement
supabase start

# Servir la fonction localement
supabase functions serve chat-with-iasted-advanced --env-file .env.local
```

### 5. Vérifier le Déploiement

#### Test 1 : Vérifier CORS (dans le navigateur)

1. Ouvrir la console développeur (F12)
2. Aller sur http://localhost:8080 (ou votre URL de dev)
3. Ouvrir l'onglet "Network"
4. Déclencher un appel à iAsted
5. Vérifier que la requête OPTIONS retourne **200 OK**
6. Vérifier que la requête POST retourne **200 OK**

**Attendu dans les headers de réponse :**
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type
Access-Control-Allow-Methods: POST, OPTIONS
```

#### Test 2 : Générer un Document

**Dans l'interface iAsted :**

1. Connectez-vous en tant que Ministre
2. Ouvrez le chat iAsted
3. Tapez : `"Je veux un document pour souhaiter la fête de fin d'années à mes collaborateurs"`
4. Attendez la réponse

**Résultat attendu :**
- ✅ Message : "Excellence, j'ai généré la lettre officielle en format PDF..."
- ✅ Carte de document s'affiche avec icône, nom du fichier
- ✅ Boutons "Voir" et "Télécharger" fonctionnels
- ✅ Le PDF s'ouvre dans un nouvel onglet

#### Test 3 : Vérifier le Storage

```bash
# Dans le dashboard Supabase
# 1. Aller dans Storage > iasted-documents
# 2. Vérifier que le dossier generated/{user_id}/ existe
# 3. Vérifier que le PDF y est présent
```

### 6. Tests de Régression

Assurez-vous que les fonctionnalités existantes marchent toujours :

- [ ] Chat textuel normal fonctionne
- [ ] Chat vocal fonctionne
- [ ] Transcription Whisper fonctionne
- [ ] Synthèse vocale ElevenLabs fonctionne
- [ ] Mode continu fonctionne

## 🐛 Dépannage

### Problème : CORS Error persiste

**Solution :**
```bash
# Redéployer avec force
supabase functions deploy chat-with-iasted-advanced --project-ref vnsspatmudluflqfcmap --force

# Attendre 1-2 minutes pour la propagation
# Vider le cache du navigateur (Ctrl + Shift + R)
```

### Problème : PDF ne se génère pas

**Diagnostic :**
1. Vérifier les logs Edge Function :
```bash
supabase functions logs chat-with-iasted-advanced --project-ref vnsspatmudluflqfcmap
```

2. Vérifier que le bucket existe :
```sql
-- Dans SQL Editor Supabase
SELECT * FROM storage.buckets WHERE id = 'iasted-documents';
```

3. Vérifier les policies :
```sql
-- Dans SQL Editor Supabase
SELECT * FROM storage.policies WHERE bucket_id = 'iasted-documents';
```

**Solution :**
```bash
# Re-exécuter la migration
supabase db push --db-url "votre-connection-string"
```

### Problème : Document ne s'affiche pas dans le chat

**Vérifier :**
1. Dans la console du navigateur, chercher des erreurs
2. Vérifier que `fileUrl`, `fileName`, `fileType` sont présents dans la réponse
3. Vérifier que le composant `InlineDocumentPreview` est bien importé

**Solution :**
```bash
# Rebuild frontend
npm run build
npm run dev
```

### Problème : "Blob size too large"

**Cause :** Le PDF généré est trop volumineux

**Solution :**
1. Réduire la taille du contenu markdown
2. Optimiser les images (si applicable)
3. Augmenter la limite dans la fonction Edge :
```typescript
// Dans chat-with-iasted-advanced/index.ts
max_tokens: 2000 // Réduire de 4000 à 2000
```

## 📊 Monitoring

### Métriques à Surveiller

1. **Taux de succès de génération** : `generated_documents` table
```sql
SELECT 
  DATE(created_at) as date,
  document_type,
  COUNT(*) as total_generated,
  AVG(generation_time_ms) as avg_time_ms
FROM generated_documents
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at), document_type
ORDER BY date DESC;
```

2. **Performance des Edge Functions** : Dashboard Supabase > Edge Functions > Metrics

3. **Utilisation du Storage** : Dashboard Supabase > Storage > iasted-documents

### Alertes Recommandées

- Taux d'erreur > 5% sur `chat-with-iasted-advanced`
- Temps de réponse moyen > 15 secondes
- Utilisation storage > 80% du quota

## 🔄 Rollback en Cas de Problème

Si vous devez revenir en arrière :

```bash
# 1. Désactiver la nouvelle fonction
# (dans Supabase Dashboard > Edge Functions)

# 2. Utiliser l'ancienne fonction
# Modifier frontend pour pointer vers chat-with-iasted au lieu de chat-with-iasted-advanced

# 3. Optionnel : supprimer la migration
# (dans Supabase Dashboard > Database > Migrations)
```

## ✅ Checklist de Déploiement

### Avant le déploiement
- [ ] Code testé localement
- [ ] Variables d'environnement vérifiées
- [ ] Migration SQL vérifiée
- [ ] Documentation mise à jour

### Pendant le déploiement
- [ ] Edge Functions déployées
- [ ] Migration exécutée
- [ ] Policies storage vérifiées
- [ ] Frontend rebuilt

### Après le déploiement
- [ ] Test génération PDF OK
- [ ] Test affichage document OK
- [ ] Test téléchargement OK
- [ ] Chat normal fonctionne
- [ ] Chat vocal fonctionne
- [ ] Monitoring activé

## 📞 Support

En cas de problème :
1. Vérifier les logs : `supabase functions logs`
2. Consulter la documentation : `/docs/iasted/`
3. Vérifier les issues GitHub du projet

---

**Version :** 2.0  
**Date :** 14 Novembre 2025  
**Auteur :** Équipe iAsted

