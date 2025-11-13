-- Tables pour iAsted vocal avancé

-- Table des sessions de conversation
CREATE TABLE IF NOT EXISTS conversation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT,
  language TEXT DEFAULT 'fr',
  settings JSONB,
  memory_summary TEXT,
  memory_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ
);

-- Table des messages de conversation
CREATE TABLE IF NOT EXISTS conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES conversation_sessions ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'router', 'tool')),
  content TEXT NOT NULL,
  audio_base64 TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table des événements analytics vocaux
CREATE TABLE IF NOT EXISTS analytics_voice_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  session_id UUID REFERENCES conversation_sessions ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ajouter colonnes vocales à user_preferences (si la table existe)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_preferences') THEN
    ALTER TABLE user_preferences 
      ADD COLUMN IF NOT EXISTS voice_id TEXT DEFAULT 'alloy',
      ADD COLUMN IF NOT EXISTS voice_silence_duration INTEGER DEFAULT 900,
      ADD COLUMN IF NOT EXISTS voice_silence_threshold INTEGER DEFAULT 10,
      ADD COLUMN IF NOT EXISTS voice_continuous_mode BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS voice_focus_mode BOOLEAN DEFAULT false;
  ELSE
    CREATE TABLE user_preferences (
      user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
      voice_id TEXT DEFAULT 'alloy',
      voice_silence_duration INTEGER DEFAULT 900,
      voice_silence_threshold INTEGER DEFAULT 10,
      voice_continuous_mode BOOLEAN DEFAULT false,
      voice_focus_mode BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  END IF;
END $$;

-- Enable RLS
ALTER TABLE conversation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_voice_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies pour conversation_sessions
CREATE POLICY "Users can view own sessions"
  ON conversation_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions"
  ON conversation_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON conversation_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON conversation_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies pour conversation_messages
CREATE POLICY "Users can view messages from own sessions"
  ON conversation_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM conversation_sessions 
    WHERE id = session_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create messages in own sessions"
  ON conversation_messages FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM conversation_sessions 
    WHERE id = session_id AND user_id = auth.uid()
  ));

-- RLS Policies pour analytics_voice_events
CREATE POLICY "Users can view own analytics"
  ON analytics_voice_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own analytics"
  ON analytics_voice_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies pour user_preferences
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_conversation_messages_session ON conversation_messages(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_conversation_sessions_user ON conversation_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_voice_events_user ON analytics_voice_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_voice_events_session ON analytics_voice_events(session_id, created_at);

-- Trigger pour updated_at sur conversation_sessions
CREATE OR REPLACE FUNCTION update_conversation_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_sessions_updated_at
  BEFORE UPDATE ON conversation_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_sessions_updated_at();