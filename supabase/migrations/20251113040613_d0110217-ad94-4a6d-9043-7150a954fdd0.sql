-- Mettre à jour l'enum app_role pour inclure tous les nouveaux rôles
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'ministre';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'secretaire_general';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'directeur_cabinet';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'gestionnaire';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'candidat';