-- Créer le bucket storage pour les documents iAsted
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'iasted-documents',
  'iasted-documents',
  false,
  52428800, -- 50MB
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/markdown', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
);

-- RLS policies pour le bucket
CREATE POLICY "Ministre can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'iasted-documents' AND
  (is_admin(auth.uid()) OR has_role(auth.uid(), 'ministre'::app_role))
);

CREATE POLICY "Ministre can view documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'iasted-documents' AND
  (is_admin(auth.uid()) OR has_role(auth.uid(), 'ministre'::app_role))
);

CREATE POLICY "Ministre can update documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'iasted-documents' AND
  (is_admin(auth.uid()) OR has_role(auth.uid(), 'ministre'::app_role))
);

CREATE POLICY "Ministre can delete documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'iasted-documents' AND
  (is_admin(auth.uid()) OR has_role(auth.uid(), 'ministre'::app_role))
);

-- Table pour la base de connaissances iAsted
CREATE TABLE public.iasted_knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  category TEXT NOT NULL,
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour améliorer les performances de recherche
CREATE INDEX idx_iasted_knowledge_category ON public.iasted_knowledge_base(category);
CREATE INDEX idx_iasted_knowledge_tags ON public.iasted_knowledge_base USING GIN(tags);
CREATE INDEX idx_iasted_knowledge_active ON public.iasted_knowledge_base(is_active);

-- RLS policies
ALTER TABLE public.iasted_knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ministre can create knowledge entries"
ON public.iasted_knowledge_base FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  (is_admin(auth.uid()) OR has_role(auth.uid(), 'ministre'::app_role))
);

CREATE POLICY "Ministre can view knowledge entries"
ON public.iasted_knowledge_base FOR SELECT
TO authenticated
USING (
  is_admin(auth.uid()) OR has_role(auth.uid(), 'ministre'::app_role)
);

CREATE POLICY "Ministre can update knowledge entries"
ON public.iasted_knowledge_base FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id AND
  (is_admin(auth.uid()) OR has_role(auth.uid(), 'ministre'::app_role))
);

CREATE POLICY "Ministre can delete knowledge entries"
ON public.iasted_knowledge_base FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id AND
  (is_admin(auth.uid()) OR has_role(auth.uid(), 'ministre'::app_role))
);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_iasted_knowledge_updated_at
BEFORE UPDATE ON public.iasted_knowledge_base
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();