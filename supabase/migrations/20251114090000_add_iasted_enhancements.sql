-- ============================================================
-- Migration iAsted Optimisé v2.0
-- Date: 2025-11-14
-- Description: Ajout des fonctionnalités avancées pour iAsted
-- ============================================================

-- 1. Ajouter colonnes pour documents générés dans conversation_messages
ALTER TABLE conversation_messages 
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS file_name TEXT,
ADD COLUMN IF NOT EXISTS file_type TEXT CHECK (file_type IN ('pdf', 'docx')),
ADD COLUMN IF NOT EXISTS document_type TEXT CHECK (document_type IN ('decree', 'letter', 'report', 'note'));

-- 2. Créer le bucket storage pour les documents générés
INSERT INTO storage.buckets (id, name, public)
VALUES ('iasted-documents', 'iasted-documents', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Policies pour le bucket iasted-documents

-- Policy pour lecture publique des documents
CREATE POLICY IF NOT EXISTS "Public read generated documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'iasted-documents');

-- Policy pour upload par utilisateurs authentifiés
CREATE POLICY IF NOT EXISTS "Authenticated upload documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'iasted-documents' 
  AND auth.role() = 'authenticated'
);

-- Policy pour suppression par propriétaire
CREATE POLICY IF NOT EXISTS "Users delete own documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'iasted-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. Index pour performance sur conversation_messages
CREATE INDEX IF NOT EXISTS idx_conversation_session_date 
ON conversation_messages(session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversation_user_date
ON conversation_messages(user_id, created_at DESC) 
WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_conversation_files
ON conversation_messages(session_id, file_url)
WHERE file_url IS NOT NULL;

-- 5. Ajouter colonnes VAD config dans user_preferences
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS vad_config JSONB DEFAULT '{
  "energyThreshold": 0.015,
  "silenceThreshold": 800,
  "minSpeechDuration": 400,
  "preSpeechPadding": 300,
  "postSpeechPadding": 500
}'::jsonb;

-- 6. Ajouter colonnes modèle IA et mode de réponse dans user_preferences
ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS ai_model TEXT DEFAULT 'claude' CHECK (ai_model IN ('claude', 'gpt', 'gemini')),
ADD COLUMN IF NOT EXISTS response_mode TEXT DEFAULT 'adaptive' CHECK (response_mode IN ('adaptive', 'concise', 'detailed', 'conversational')),
ADD COLUMN IF NOT EXISTS thinking_time TEXT DEFAULT 'balanced' CHECK (thinking_time IN ('auto', 'fast', 'balanced', 'thorough')),
ADD COLUMN IF NOT EXISTS formality_level TEXT DEFAULT 'formal' CHECK (formality_level IN ('formal', 'balanced', 'casual')),
ADD COLUMN IF NOT EXISTS proactivity TEXT DEFAULT 'medium' CHECK (proactivity IN ('low', 'medium', 'high'));

-- 7. Créer table pour tracker les documents générés (analytics)
CREATE TABLE IF NOT EXISTS generated_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('decree', 'letter', 'report', 'note')),
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'docx')),
  title TEXT,
  content_preview TEXT,
  generation_time_ms INTEGER,
  ai_model_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour la table generated_documents
CREATE INDEX IF NOT EXISTS idx_generated_docs_user 
ON generated_documents(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_generated_docs_session
ON generated_documents(session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_generated_docs_type
ON generated_documents(document_type, created_at DESC);

-- 8. RLS Policies pour generated_documents
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents"
ON generated_documents FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
ON generated_documents FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
ON generated_documents FOR DELETE
USING (auth.uid() = user_id);

-- 9. Créer une vue pour les statistiques de documents
CREATE OR REPLACE VIEW document_stats AS
SELECT 
  user_id,
  document_type,
  COUNT(*) as total_generated,
  AVG(generation_time_ms) as avg_generation_time_ms,
  MAX(created_at) as last_generated_at
FROM generated_documents
GROUP BY user_id, document_type;

-- 10. Fonction pour nettoyer les anciens documents (optionnel)
CREATE OR REPLACE FUNCTION cleanup_old_documents(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Supprimer les enregistrements de la table
  WITH deleted AS (
    DELETE FROM generated_documents
    WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL
    RETURNING file_url
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Commentaires pour documentation
COMMENT ON COLUMN conversation_messages.file_url IS 'URL publique du document généré (Supabase Storage)';
COMMENT ON COLUMN conversation_messages.file_name IS 'Nom du fichier généré';
COMMENT ON COLUMN conversation_messages.file_type IS 'Type de fichier: pdf ou docx';
COMMENT ON COLUMN conversation_messages.document_type IS 'Type de document officiel: decree, letter, report, note';
COMMENT ON COLUMN user_preferences.vad_config IS 'Configuration Voice Activity Detection pour détection intelligente de fin de parole';
COMMENT ON COLUMN user_preferences.ai_model IS 'Modèle IA utilisé: claude (recommandé), gpt, ou gemini';
COMMENT ON COLUMN user_preferences.response_mode IS 'Mode de réponse: adaptive, concise, detailed, conversational';
COMMENT ON TABLE generated_documents IS 'Tracking et analytics des documents générés par iAsted';

-- ============================================================
-- Fin de la migration
-- ============================================================
