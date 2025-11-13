-- Mettre à jour l'enum app_role pour inclure tous les nouveaux rôles nécessaires
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'ministre') THEN
    ALTER TYPE app_role ADD VALUE 'ministre';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'secretaire_general') THEN
    ALTER TYPE app_role ADD VALUE 'secretaire_general';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'directeur_cabinet') THEN
    ALTER TYPE app_role ADD VALUE 'directeur_cabinet';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'gestionnaire') THEN
    ALTER TYPE app_role ADD VALUE 'gestionnaire';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'candidat') THEN
    ALTER TYPE app_role ADD VALUE 'candidat';
  END IF;
END $$;