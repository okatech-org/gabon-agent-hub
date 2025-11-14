-- Ajouter les champs de configuration VAD avancée à user_preferences
ALTER TABLE public.user_preferences
ADD COLUMN IF NOT EXISTS vad_energy_threshold numeric DEFAULT 0.015,
ADD COLUMN IF NOT EXISTS vad_min_speech_duration integer DEFAULT 400,
ADD COLUMN IF NOT EXISTS vad_pre_speech_padding integer DEFAULT 300,
ADD COLUMN IF NOT EXISTS vad_post_speech_padding integer DEFAULT 500;