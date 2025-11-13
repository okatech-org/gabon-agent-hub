-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE app_role AS ENUM ('admin', 'drh_ministre', 'drh_local', 'agent', 'auditeur');
CREATE TYPE type_agent AS ENUM ('fonctionnaire', 'contractuel', 'stagiaire', 'autre');
CREATE TYPE statut_agent AS ENUM ('actif', 'detache', 'conge', 'disponibilite', 'retraite', 'suspendu');
CREATE TYPE statut_poste AS ENUM ('occupe', 'vacant', 'gele');
CREATE TYPE type_evenement AS ENUM ('titularisation', 'avancement', 'promotion', 'detachement', 'mise_a_retraite', 'sanction', 'autre');
CREATE TYPE statut_acte AS ENUM ('brouillon', 'en_validation', 'valide', 'signe', 'archive');
CREATE TYPE statut_candidature AS ENUM ('deposee', 'en_cours', 'acceptee', 'refusee');
CREATE TYPE statut_recensement AS ENUM ('recense', 'non_recense', 'en_litige', 'regularise');

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  prenoms TEXT,
  email TEXT,
  telephone TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = 'admin'
  )
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Only admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.is_admin(auth.uid()));

-- Structures table (hierarchical organization)
CREATE TABLE public.structures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  type_structure TEXT NOT NULL, -- 'etat', 'ministere', 'dg', 'direction', 'service'
  parent_id UUID REFERENCES public.structures(id) ON DELETE SET NULL,
  responsable_id UUID REFERENCES public.profiles(id),
  localisation TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.structures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view structures"
  ON public.structures FOR SELECT
  USING (true);

CREATE POLICY "Admins and DRH can manage structures"
  ON public.structures FOR ALL
  USING (
    public.is_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'drh_ministre') OR 
    public.has_role(auth.uid(), 'drh_local')
  );

-- Postes table (positions/posts)
CREATE TABLE public.postes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  intitule TEXT NOT NULL,
  structure_id UUID REFERENCES public.structures(id) ON DELETE CASCADE NOT NULL,
  grade_minimal TEXT,
  statut statut_poste DEFAULT 'vacant',
  localisation TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.postes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view postes"
  ON public.postes FOR SELECT
  USING (true);

CREATE POLICY "Admins and DRH can manage postes"
  ON public.postes FOR ALL
  USING (
    public.is_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'drh_ministre') OR 
    public.has_role(auth.uid(), 'drh_local')
  );

-- Agents table (main entity)
CREATE TABLE public.agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  matricule TEXT UNIQUE NOT NULL,
  identite_numerique TEXT,
  nom TEXT NOT NULL,
  prenoms TEXT,
  date_naissance DATE,
  lieu_naissance TEXT,
  sexe TEXT,
  email TEXT,
  telephone TEXT,
  type_agent type_agent NOT NULL,
  corps TEXT,
  cadre TEXT,
  categorie TEXT,
  grade TEXT,
  echelon INTEGER,
  statut statut_agent DEFAULT 'actif',
  structure_id UUID REFERENCES public.structures(id),
  poste_id UUID REFERENCES public.postes(id),
  date_prise_fonction DATE,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and DRH can view all agents"
  ON public.agents FOR SELECT
  USING (
    public.is_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'drh_ministre') OR 
    public.has_role(auth.uid(), 'drh_local') OR
    public.has_role(auth.uid(), 'auditeur')
  );

CREATE POLICY "Agents can view own record"
  ON public.agents FOR SELECT
  USING (public.has_role(auth.uid(), 'agent'));

CREATE POLICY "Admins and DRH can manage agents"
  ON public.agents FOR ALL
  USING (
    public.is_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'drh_ministre') OR 
    public.has_role(auth.uid(), 'drh_local')
  );

-- Affectations table (assignment history)
CREATE TABLE public.affectations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  structure_id UUID REFERENCES public.structures(id) NOT NULL,
  poste_id UUID REFERENCES public.postes(id),
  date_debut DATE NOT NULL,
  date_fin DATE,
  motif TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.affectations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and DRH can view affectations"
  ON public.affectations FOR SELECT
  USING (
    public.is_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'drh_ministre') OR 
    public.has_role(auth.uid(), 'drh_local') OR
    public.has_role(auth.uid(), 'auditeur')
  );

CREATE POLICY "Admins and DRH can manage affectations"
  ON public.affectations FOR ALL
  USING (
    public.is_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'drh_ministre') OR 
    public.has_role(auth.uid(), 'drh_local')
  );

-- Evenements carriere table
CREATE TABLE public.evenements_carriere (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  type_evenement type_evenement NOT NULL,
  date_evenement DATE NOT NULL,
  ancien_grade TEXT,
  nouveau_grade TEXT,
  ancien_echelon INTEGER,
  nouveau_echelon INTEGER,
  description TEXT,
  pieces_jointes JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.evenements_carriere ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and DRH can view evenements"
  ON public.evenements_carriere FOR SELECT
  USING (
    public.is_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'drh_ministre') OR 
    public.has_role(auth.uid(), 'drh_local') OR
    public.has_role(auth.uid(), 'auditeur')
  );

CREATE POLICY "Admins and DRH can manage evenements"
  ON public.evenements_carriere FOR ALL
  USING (
    public.is_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'drh_ministre') OR 
    public.has_role(auth.uid(), 'drh_local')
  );

-- Actes administratifs table
CREATE TABLE public.actes_administratifs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  type_acte TEXT NOT NULL,
  numero_acte TEXT,
  objet TEXT NOT NULL,
  contenu TEXT,
  statut statut_acte DEFAULT 'brouillon',
  date_creation DATE DEFAULT CURRENT_DATE,
  date_signature DATE,
  signataire_id UUID REFERENCES public.profiles(id),
  reference_signature TEXT,
  fichier_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.actes_administratifs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and DRH can view actes"
  ON public.actes_administratifs FOR SELECT
  USING (
    public.is_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'drh_ministre') OR 
    public.has_role(auth.uid(), 'drh_local') OR
    public.has_role(auth.uid(), 'auditeur')
  );

CREATE POLICY "Agents can view own actes"
  ON public.actes_administratifs FOR SELECT
  USING (
    public.has_role(auth.uid(), 'agent') AND
    agent_id IN (SELECT id FROM public.agents WHERE public.has_role(auth.uid(), 'agent'))
  );

CREATE POLICY "Admins and DRH can manage actes"
  ON public.actes_administratifs FOR ALL
  USING (
    public.is_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'drh_ministre') OR 
    public.has_role(auth.uid(), 'drh_local')
  );

-- Concours table
CREATE TABLE public.concours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  intitule TEXT NOT NULL,
  description TEXT,
  type_concours TEXT, -- 'direct', 'professionnel', 'interne'
  date_ouverture DATE,
  date_cloture DATE,
  date_epreuve DATE,
  nombre_postes INTEGER,
  conditions TEXT,
  pieces_requises JSONB,
  statut TEXT DEFAULT 'ouvert', -- 'ouvert', 'clos', 'en_cours', 'termine'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.concours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view open concours"
  ON public.concours FOR SELECT
  USING (true);

CREATE POLICY "Admins and DRH can manage concours"
  ON public.concours FOR ALL
  USING (
    public.is_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'drh_ministre')
  );

-- Offres poste table
CREATE TABLE public.offres_poste (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  concours_id UUID REFERENCES public.concours(id) ON DELETE CASCADE,
  poste_id UUID REFERENCES public.postes(id),
  intitule TEXT NOT NULL,
  description TEXT,
  profil_recherche TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.offres_poste ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view offres"
  ON public.offres_poste FOR SELECT
  USING (true);

CREATE POLICY "Admins and DRH can manage offres"
  ON public.offres_poste FOR ALL
  USING (
    public.is_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'drh_ministre')
  );

-- Candidatures table
CREATE TABLE public.candidatures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  concours_id UUID REFERENCES public.concours(id) ON DELETE CASCADE NOT NULL,
  offre_id UUID REFERENCES public.offres_poste(id),
  user_id UUID REFERENCES auth.users(id),
  nom TEXT NOT NULL,
  prenoms TEXT NOT NULL,
  email TEXT NOT NULL,
  telephone TEXT NOT NULL,
  date_naissance DATE,
  lieu_naissance TEXT,
  diplomes JSONB,
  experience JSONB,
  pieces_jointes JSONB,
  statut statut_candidature DEFAULT 'deposee',
  note_dossier NUMERIC,
  note_epreuve NUMERIC,
  rang INTEGER,
  observations TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.candidatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own candidatures"
  ON public.candidatures FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create candidatures"
  ON public.candidatures FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins and DRH can view all candidatures"
  ON public.candidatures FOR SELECT
  USING (
    public.is_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'drh_ministre')
  );

CREATE POLICY "Admins and DRH can manage candidatures"
  ON public.candidatures FOR ALL
  USING (
    public.is_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'drh_ministre')
  );

-- Campagnes recensement table
CREATE TABLE public.campagnes_recensement (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  intitule TEXT NOT NULL,
  description TEXT,
  date_debut DATE NOT NULL,
  date_fin DATE NOT NULL,
  perimetre TEXT, -- 'national', 'ministeriel', 'provincial'
  ministeres TEXT[],
  provinces TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.campagnes_recensement ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view campagnes"
  ON public.campagnes_recensement FOR SELECT
  USING (
    public.is_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'drh_ministre') OR
    public.has_role(auth.uid(), 'auditeur')
  );

CREATE POLICY "Admins can manage campagnes"
  ON public.campagnes_recensement FOR ALL
  USING (
    public.is_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'drh_ministre')
  );

-- Statut recensement agent table
CREATE TABLE public.statut_recensement_agent (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campagne_id UUID REFERENCES public.campagnes_recensement(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  statut statut_recensement NOT NULL,
  date_recensement DATE,
  reference_biometrique TEXT,
  observations TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(campagne_id, agent_id)
);

ALTER TABLE public.statut_recensement_agent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view statut recensement"
  ON public.statut_recensement_agent FOR SELECT
  USING (
    public.is_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'drh_ministre') OR
    public.has_role(auth.uid(), 'auditeur')
  );

CREATE POLICY "Admins can manage statut recensement"
  ON public.statut_recensement_agent FOR ALL
  USING (
    public.is_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'drh_ministre')
  );

-- Anomalies recensement table
CREATE TABLE public.anomalies_recensement (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campagne_id UUID REFERENCES public.campagnes_recensement(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  matricule TEXT,
  type_anomalie TEXT NOT NULL, -- 'non_recense_paye', 'fictif', 'doublon', 'autre'
  description TEXT,
  date_detection DATE DEFAULT CURRENT_DATE,
  est_regularise BOOLEAN DEFAULT false,
  date_regularisation DATE,
  action_prise TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.anomalies_recensement ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view anomalies"
  ON public.anomalies_recensement FOR SELECT
  USING (
    public.is_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'drh_ministre') OR
    public.has_role(auth.uid(), 'auditeur')
  );

CREATE POLICY "Admins can manage anomalies"
  ON public.anomalies_recensement FOR ALL
  USING (
    public.is_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'drh_ministre')
  );

-- Projets reforme table
CREATE TABLE public.projets_reforme (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  intitule TEXT NOT NULL,
  description TEXT,
  objectifs TEXT,
  pilote_id UUID REFERENCES public.profiles(id),
  date_debut DATE,
  date_fin_prevue DATE,
  date_fin_reelle DATE,
  statut TEXT DEFAULT 'en_cours', -- 'planifie', 'en_cours', 'termine', 'suspendu'
  budget NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.projets_reforme ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and DRH can view projets"
  ON public.projets_reforme FOR SELECT
  USING (
    public.is_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'drh_ministre')
  );

CREATE POLICY "Admins can manage projets"
  ON public.projets_reforme FOR ALL
  USING (public.is_admin(auth.uid()));

-- Indicateurs reforme table
CREATE TABLE public.indicateurs_reforme (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  projet_id UUID REFERENCES public.projets_reforme(id) ON DELETE CASCADE NOT NULL,
  nom_indicateur TEXT NOT NULL,
  valeur_cible NUMERIC,
  valeur_reelle NUMERIC,
  unite TEXT,
  date_mesure DATE,
  observations TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.indicateurs_reforme ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and DRH can view indicateurs"
  ON public.indicateurs_reforme FOR SELECT
  USING (
    public.is_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'drh_ministre')
  );

CREATE POLICY "Admins can manage indicateurs"
  ON public.indicateurs_reforme FOR ALL
  USING (public.is_admin(auth.uid()));

-- Journal audit table
CREATE TABLE public.journal_audit (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.journal_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins and auditeurs can view audit"
  ON public.journal_audit FOR SELECT
  USING (
    public.is_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'auditeur')
  );

-- Create indexes for performance
CREATE INDEX idx_agents_matricule ON public.agents(matricule);
CREATE INDEX idx_agents_structure ON public.agents(structure_id);
CREATE INDEX idx_agents_statut ON public.agents(statut);
CREATE INDEX idx_affectations_agent ON public.affectations(agent_id);
CREATE INDEX idx_evenements_agent ON public.evenements_carriere(agent_id);
CREATE INDEX idx_actes_agent ON public.actes_administratifs(agent_id);
CREATE INDEX idx_candidatures_concours ON public.candidatures(concours_id);
CREATE INDEX idx_candidatures_user ON public.candidatures(user_id);
CREATE INDEX idx_recensement_agent ON public.statut_recensement_agent(agent_id);
CREATE INDEX idx_recensement_campagne ON public.statut_recensement_agent(campagne_id);

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_structures_updated_at BEFORE UPDATE ON public.structures
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_postes_updated_at BEFORE UPDATE ON public.postes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON public.agents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_actes_updated_at BEFORE UPDATE ON public.actes_administratifs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_concours_updated_at BEFORE UPDATE ON public.concours
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_candidatures_updated_at BEFORE UPDATE ON public.candidatures
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campagnes_updated_at BEFORE UPDATE ON public.campagnes_recensement
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_statut_recensement_updated_at BEFORE UPDATE ON public.statut_recensement_agent
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_anomalies_updated_at BEFORE UPDATE ON public.anomalies_recensement
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projets_updated_at BEFORE UPDATE ON public.projets_reforme
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nom, prenoms, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nom', ''),
    COALESCE(NEW.raw_user_meta_data->>'prenoms', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();