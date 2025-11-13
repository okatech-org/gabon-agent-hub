-- Ajouter les colonnes manquantes pour les paramètres avancés de iAsted
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS thinking_time TEXT DEFAULT 'auto',
ADD COLUMN IF NOT EXISTS response_mode TEXT DEFAULT 'auto',
ADD COLUMN IF NOT EXISTS ai_model TEXT DEFAULT 'gemini',
ADD COLUMN IF NOT EXISTS formality_level TEXT DEFAULT 'formal',
ADD COLUMN IF NOT EXISTS proactivity TEXT DEFAULT 'medium';

-- Ajouter des contraintes pour valider les valeurs
ALTER TABLE public.user_preferences 
ADD CONSTRAINT thinking_time_check CHECK (thinking_time IN ('auto', 'fast', 'balanced', 'thorough')),
ADD CONSTRAINT response_mode_check CHECK (response_mode IN ('auto', 'concise', 'detailed', 'conversational')),
ADD CONSTRAINT ai_model_check CHECK (ai_model IN ('gemini', 'gpt', 'claude')),
ADD CONSTRAINT formality_level_check CHECK (formality_level IN ('formal', 'balanced', 'casual')),
ADD CONSTRAINT proactivity_check CHECK (proactivity IN ('low', 'medium', 'high'));