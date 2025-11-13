-- Correction des warnings de sécurité avec CASCADE

-- Recréer la fonction update_conversation_sessions_updated_at avec search_path
DROP TRIGGER IF EXISTS update_conversation_sessions_updated_at ON conversation_sessions;
DROP FUNCTION IF EXISTS update_conversation_sessions_updated_at();

CREATE OR REPLACE FUNCTION update_conversation_sessions_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_conversation_sessions_updated_at
  BEFORE UPDATE ON conversation_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_sessions_updated_at();

-- Corriger la fonction update_updated_at_column existante avec search_path et CASCADE
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recréer tous les triggers qui utilisent update_updated_at_column
CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_structures_updated_at
  BEFORE UPDATE ON structures
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_postes_updated_at
  BEFORE UPDATE ON postes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_actes_updated_at
  BEFORE UPDATE ON actes_administratifs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_concours_updated_at
  BEFORE UPDATE ON concours
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidatures_updated_at
  BEFORE UPDATE ON candidatures
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campagnes_updated_at
  BEFORE UPDATE ON campagnes_recensement
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_statut_recensement_updated_at
  BEFORE UPDATE ON statut_recensement_agent
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_anomalies_updated_at
  BEFORE UPDATE ON anomalies_recensement
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projets_updated_at
  BEFORE UPDATE ON projets_reforme
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();