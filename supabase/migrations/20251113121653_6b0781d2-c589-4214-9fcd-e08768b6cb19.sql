-- Créer la table des sessions de conversation
CREATE TABLE IF NOT EXISTS public.conversation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{}',
  title TEXT,
  language TEXT DEFAULT 'fr',
  memory_summary TEXT,
  memory_updated_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Créer la table des messages de conversation
CREATE TABLE IF NOT EXISTS public.conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.conversation_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  audio_base64 TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Créer la table des préférences utilisateur
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  voice_id TEXT DEFAULT 'alloy',
  voice_silence_duration INTEGER DEFAULT 900,
  voice_silence_threshold INTEGER DEFAULT 10,
  voice_continuous_mode BOOLEAN DEFAULT false,
  voice_focus_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_conversation_sessions_user_id ON public.conversation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_session_id ON public.conversation_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

-- RLS Policies
ALTER TABLE public.conversation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Policies pour conversation_sessions
DROP POLICY IF EXISTS "Users can view own sessions" ON public.conversation_sessions;
CREATE POLICY "Users can view own sessions"
  ON public.conversation_sessions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own sessions" ON public.conversation_sessions;
CREATE POLICY "Users can create own sessions"
  ON public.conversation_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own sessions" ON public.conversation_sessions;
CREATE POLICY "Users can update own sessions"
  ON public.conversation_sessions FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own sessions" ON public.conversation_sessions;
CREATE POLICY "Users can delete own sessions"
  ON public.conversation_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Policies pour conversation_messages
DROP POLICY IF EXISTS "Users can view messages from own sessions" ON public.conversation_messages;
CREATE POLICY "Users can view messages from own sessions"
  ON public.conversation_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_sessions
      WHERE conversation_sessions.id = conversation_messages.session_id
      AND conversation_sessions.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create messages in own sessions" ON public.conversation_messages;
CREATE POLICY "Users can create messages in own sessions"
  ON public.conversation_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversation_sessions
      WHERE conversation_sessions.id = conversation_messages.session_id
      AND conversation_sessions.user_id = auth.uid()
    )
  );

-- Policies pour user_preferences
DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_preferences;
CREATE POLICY "Users can view own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own preferences" ON public.user_preferences;
CREATE POLICY "Users can create own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;
CREATE POLICY "Users can update own preferences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id);