# 🎯 Configuration Cursor pour le Projet

## 📋 Prérequis

```bash
# Installer Supabase CLI
npm install -g supabase

# Se connecter à Supabase
supabase login
```

## 🔑 Credentials du Projet

- **Project ID**: `vnsspatmudluflqfcmap`
- **URL**: `https://vnsspatmudluflqfcmap.supabase.co`
- **Anon Key**: Disponible dans `.env` (ne pas partager)

## 🛠️ Commandes Essentielles

### Edge Functions

```bash
# Déployer une fonction
supabase functions deploy nom-fonction --project-ref vnsspatmudluflqfcmap

# Déployer toutes les fonctions
supabase functions deploy --project-ref vnsspatmudluflqfcmap

# Voir les logs d'une fonction
supabase functions logs nom-fonction --project-ref vnsspatmudluflqfcmap
```

### Base de Données

```bash
# Créer une migration
supabase migration new nom_migration --project-ref vnsspatmudluflqfcmap

# Appliquer les migrations
supabase db push --project-ref vnsspatmudluflqfcmap

# Récupérer le schéma
supabase db pull --project-ref vnsspatmudluflqfcmap

# Générer les types TypeScript
supabase gen types typescript --project-id vnsspatmudluflqfcmap > src/integrations/supabase/types.ts

# Réinitialiser la DB locale (ATTENTION : supprime les données)
supabase db reset --project-ref vnsspatmudluflqfcmap
```

### Secrets (Variables d'environnement)

```bash
# Lister les secrets
supabase secrets list --project-ref vnsspatmudluflqfcmap

# Ajouter un secret
supabase secrets set NOM_SECRET=valeur --project-ref vnsspatmudluflqfcmap

# Supprimer un secret
supabase secrets unset NOM_SECRET --project-ref vnsspatmudluflqfcmap
```

## 🔄 Workflow de Développement

### 1. Modifications de la Base de Données

```bash
# Créer une migration
supabase migration new add_user_preferences --project-ref vnsspatmudluflqfcmap

# Éditer le fichier dans supabase/migrations/
# Ajouter votre SQL

# Appliquer la migration
supabase db push --project-ref vnsspatmudluflqfcmap

# Régénérer les types
supabase gen types typescript --project-id vnsspatmudluflqfcmap > src/integrations/supabase/types.ts
```

### 2. Modifications des Edge Functions

```bash
# Éditer le fichier dans supabase/functions/nom-fonction/index.ts

# Déployer
supabase functions deploy nom-fonction --project-ref vnsspatmudluflqfcmap

# Vérifier les logs
supabase functions logs nom-fonction --project-ref vnsspatmudluflqfcmap
```

### 3. Tester Localement (Optionnel)

```bash
# Démarrer Supabase localement
supabase start

# Tester les fonctions localement
supabase functions serve nom-fonction

# Arrêter
supabase stop
```

## 📦 Structure du Projet

```
├── supabase/
│   ├── config.toml              # Configuration Supabase
│   ├── migrations/              # Migrations SQL
│   └── functions/               # Edge Functions
│       ├── chat-with-iasted/
│       ├── chat-with-iasted-advanced/
│       ├── pdf-generator/
│       └── ...
├── src/
│   ├── integrations/supabase/
│   │   ├── client.ts           # Client Supabase (auto-généré)
│   │   └── types.ts            # Types TypeScript (auto-généré)
│   └── ...
└── .env                         # Variables d'environnement
```

## 🚨 Points d'Attention

1. **Ne JAMAIS éditer** `src/integrations/supabase/client.ts` et `types.ts` manuellement
2. **Toujours régénérer** les types après une migration
3. **Tester les edge functions** avec les logs avant de les déployer en prod
4. **Vérifier CORS** dans les edge functions pour les appels depuis le frontend

## 🔗 Liens Utiles

- [Documentation Supabase CLI](https://supabase.com/docs/reference/cli)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Database Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)

## 💡 Tips

### Déboguer une Edge Function

```bash
# Voir les logs en temps réel
supabase functions logs chat-with-iasted-advanced --project-ref vnsspatmudluflqfcmap --tail

# Invoquer une fonction directement
supabase functions invoke chat-with-iasted --project-ref vnsspatmudluflqfcmap \
  --data '{"sessionId":"test","userId":"test","textMessage":"Bonjour"}'
```

### Backup de la Base de Données

```bash
# Exporter le schéma et les données
supabase db dump --project-ref vnsspatmudluflqfcmap -f backup.sql
```

### Résoudre les Problèmes de CORS

```typescript
// Dans vos edge functions, toujours inclure:
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Gérer les requêtes OPTIONS
if (req.method === 'OPTIONS') {
  return new Response('ok', { headers: corsHeaders });
}
```
