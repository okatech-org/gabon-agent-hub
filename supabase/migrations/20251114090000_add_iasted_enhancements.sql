-- Ajouter colonnes pour fichiers générés
ALTER TABLE conversation_messages
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS file_type TEXT CHECK (file_type IN ('pdf', 'docx'));

-- Créer bucket storage pour documents générés
INSERT INTO storage.buckets (id, name, public)
VALUES ('iasted-documents', 'iasted-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Politiques d'accès au bucket
CREATE POLICY IF NOT EXISTS "Public read generated documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'iasted-documents');

CREATE POLICY IF NOT EXISTS "Authenticated upload documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'iasted-documents'
  AND auth.role() = 'authenticated'
);

-- Index pour accélérer les requêtes sur les conversations
CREATE INDEX IF NOT EXISTS idx_conversation_session
ON conversation_messages(session_id, created_at DESC);

-- Configuration par défaut VAD
ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS vad_config JSONB DEFAULT '{
  "energyThreshold": 0.015,
  "silenceThreshold": 800,
  "minSpeechDuration": 400,
  "preSpeechPadding": 300,
  "postSpeechPadding": 500
}'::jsonb;


