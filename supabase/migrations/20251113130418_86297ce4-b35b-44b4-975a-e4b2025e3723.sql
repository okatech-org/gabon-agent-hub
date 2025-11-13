-- Table pour l'historique des versions de la base de connaissances
CREATE TABLE public.iasted_knowledge_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  knowledge_id UUID NOT NULL REFERENCES public.iasted_knowledge_base(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  category TEXT NOT NULL,
  tags TEXT[],
  change_type TEXT NOT NULL, -- 'created', 'updated', 'restored'
  change_summary TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour améliorer les performances
CREATE INDEX idx_knowledge_versions_knowledge_id ON public.iasted_knowledge_versions(knowledge_id);
CREATE INDEX idx_knowledge_versions_version ON public.iasted_knowledge_versions(knowledge_id, version_number DESC);
CREATE INDEX idx_knowledge_versions_created ON public.iasted_knowledge_versions(created_at DESC);

-- RLS policies pour les versions
ALTER TABLE public.iasted_knowledge_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ministre can view versions"
ON public.iasted_knowledge_versions FOR SELECT
TO authenticated
USING (
  is_admin(auth.uid()) OR has_role(auth.uid(), 'ministre'::app_role)
);

CREATE POLICY "System can create versions"
ON public.iasted_knowledge_versions FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  (is_admin(auth.uid()) OR has_role(auth.uid(), 'ministre'::app_role))
);

-- Ajouter une colonne version_number à la table principale
ALTER TABLE public.iasted_knowledge_base 
ADD COLUMN version_number INTEGER DEFAULT 1 NOT NULL;

-- Fonction pour créer automatiquement une version lors d'une mise à jour
CREATE OR REPLACE FUNCTION public.create_knowledge_version()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Créer une version de l'ancien état avant la mise à jour
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO public.iasted_knowledge_versions (
      knowledge_id,
      version_number,
      title,
      description,
      content,
      file_url,
      file_name,
      file_size,
      category,
      tags,
      change_type,
      user_id,
      created_at
    ) VALUES (
      OLD.id,
      OLD.version_number,
      OLD.title,
      OLD.description,
      OLD.content,
      OLD.file_url,
      OLD.file_name,
      OLD.file_size,
      OLD.category,
      OLD.tags,
      'updated',
      OLD.user_id,
      OLD.updated_at
    );
    
    -- Incrémenter le numéro de version
    NEW.version_number = OLD.version_number + 1;
  END IF;
  
  -- Pour les nouvelles créations, créer la version initiale
  IF TG_OP = 'INSERT' THEN
    -- La version initiale sera créée après l'insertion
    NEW.version_number = 1;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger pour créer automatiquement des versions
CREATE TRIGGER create_knowledge_version_trigger
BEFORE UPDATE ON public.iasted_knowledge_base
FOR EACH ROW
EXECUTE FUNCTION public.create_knowledge_version();

-- Fonction pour créer la version initiale après insertion
CREATE OR REPLACE FUNCTION public.create_initial_knowledge_version()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.iasted_knowledge_versions (
    knowledge_id,
    version_number,
    title,
    description,
    content,
    file_url,
    file_name,
    file_size,
    category,
    tags,
    change_type,
    user_id,
    created_at
  ) VALUES (
    NEW.id,
    1,
    NEW.title,
    NEW.description,
    NEW.content,
    NEW.file_url,
    NEW.file_name,
    NEW.file_size,
    NEW.category,
    NEW.tags,
    'created',
    NEW.user_id,
    NEW.created_at
  );
  
  RETURN NEW;
END;
$$;

-- Trigger pour la version initiale
CREATE TRIGGER create_initial_knowledge_version_trigger
AFTER INSERT ON public.iasted_knowledge_base
FOR EACH ROW
EXECUTE FUNCTION public.create_initial_knowledge_version();