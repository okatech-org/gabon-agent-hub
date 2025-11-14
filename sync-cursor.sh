#!/bin/bash

# Script de synchronisation Lovable <-> Cursor

PROJECT_REF="vnsspatmudluflqfcmap"

echo "🚀 Synchronisation du projet avec Supabase..."

# 1. Récupérer le schéma de la base de données
echo "📥 Récupération du schéma..."
supabase db pull --project-ref $PROJECT_REF

# 2. Générer les types TypeScript
echo "🔧 Génération des types..."
supabase gen types typescript --project-id $PROJECT_REF > src/integrations/supabase/types.ts

# 3. Déployer les edge functions
echo "☁️ Déploiement des Edge Functions..."
supabase functions deploy --project-ref $PROJECT_REF

echo "✅ Synchronisation terminée !"
