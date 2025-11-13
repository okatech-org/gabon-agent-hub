import { supabase } from "@/integrations/supabase/client";

interface DemoAccountData {
  email: string;
  password: string;
  nom: string;
  prenoms: string;
  role: string;
}

const demoAccounts: DemoAccountData[] = [
  {
    email: "ministre.demo@fonctionpublique.ga",
    password: "Demo2024!",
    nom: "Ministre",
    prenoms: "de la Fonction Publique",
    role: "ministre"
  },
  {
    email: "sg.demo@fonctionpublique.ga",
    password: "Demo2024!",
    nom: "Secrétaire Général",
    prenoms: "du Ministère",
    role: "secretaire_general"
  },
  {
    email: "cabinet.demo@fonctionpublique.ga",
    password: "Demo2024!",
    nom: "Directeur",
    prenoms: "de Cabinet",
    role: "directeur_cabinet"
  },
  {
    email: "drh.demo@fonctionpublique.ga",
    password: "Demo2024!",
    nom: "Directeur",
    prenoms: "des Ressources Humaines",
    role: "drh_ministre"
  },
  {
    email: "gestionnaire.demo@fonctionpublique.ga",
    password: "Demo2024!",
    nom: "Gestionnaire",
    prenoms: "RH",
    role: "gestionnaire"
  },
  {
    email: "fonctionnaire.demo@fonctionpublique.ga",
    password: "Demo2024!",
    nom: "Agent",
    prenoms: "Fonctionnaire",
    role: "agent"
  },
  {
    email: "candidat.demo@fonctionpublique.ga",
    password: "Demo2024!",
    nom: "Candidat",
    prenoms: "aux Concours",
    role: "candidat"
  }
];

/**
 * Fonction pour initialiser les comptes démo
 * IMPORTANT: Cette fonction nécessite des privilèges admin pour assigner les rôles
 * Elle doit être exécutée avec un compte admin ou via une edge function
 */
export async function initializeDemoAccounts() {
  console.log("🚀 Début de l'initialisation des comptes démo...");
  
  const results = {
    created: [] as string[],
    existing: [] as string[],
    errors: [] as { email: string; error: string }[]
  };

  for (const account of demoAccounts) {
    try {
      console.log(`\n📝 Création du compte: ${account.email}`);
      
      // Créer le compte utilisateur
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: account.email,
        password: account.password,
        options: {
          data: {
            nom: account.nom,
            prenoms: account.prenoms
          }
        }
      });

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          console.log(`ℹ️  Compte existant: ${account.email}`);
          results.existing.push(account.email);
          
          // Essayer de récupérer l'ID utilisateur pour assigner le rôle
          const { data: userData } = await supabase
            .from("profiles")
            .select("id")
            .eq("email", account.email)
            .single();
          
          if (userData) {
            // Vérifier si le rôle existe déjà
            const { data: existingRole } = await supabase
              .from("user_roles")
              .select("*")
              .eq("user_id", userData.id)
              .eq("role", account.role as any) // Cast temporaire en attendant la régénération des types
              .single();
            
            if (!existingRole) {
              // Assigner le rôle
              const { error: roleError } = await supabase
                .from("user_roles")
                .insert({
                  user_id: userData.id,
                  role: account.role as any // Cast temporaire en attendant la régénération des types
                });
              
              if (roleError) {
                console.error(`❌ Erreur lors de l'assignation du rôle: ${roleError.message}`);
              } else {
                console.log(`✅ Rôle ${account.role} assigné à ${account.email}`);
              }
            } else {
              console.log(`ℹ️  Rôle déjà assigné pour ${account.email}`);
            }
          }
        } else {
          throw signUpError;
        }
        continue;
      }

      if (signUpData.user) {
        console.log(`✅ Compte créé avec succès: ${account.email}`);
        results.created.push(account.email);

        // Assigner le rôle à l'utilisateur
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({
            user_id: signUpData.user.id,
            role: account.role as any // Cast temporaire en attendant la régénération des types
          });

        if (roleError) {
          console.error(`❌ Erreur lors de l'assignation du rôle pour ${account.email}:`, roleError.message);
          results.errors.push({
            email: account.email,
            error: `Erreur d'assignation de rôle: ${roleError.message}`
          });
        } else {
          console.log(`✅ Rôle ${account.role} assigné à ${account.email}`);
        }
      }

    } catch (error: any) {
      console.error(`❌ Erreur pour ${account.email}:`, error.message);
      results.errors.push({
        email: account.email,
        error: error.message
      });
    }
  }

  console.log("\n📊 Résumé de l'initialisation:");
  console.log(`✅ Comptes créés: ${results.created.length}`);
  console.log(`ℹ️  Comptes existants: ${results.existing.length}`);
  console.log(`❌ Erreurs: ${results.errors.length}`);
  
  if (results.errors.length > 0) {
    console.log("\n❌ Détails des erreurs:");
    results.errors.forEach(e => console.log(`  - ${e.email}: ${e.error}`));
  }

  return results;
}

/**
 * Fonction pour supprimer tous les comptes démo
 * ATTENTION: Cette fonction nécessite des privilèges admin
 */
export async function deleteDemoAccounts() {
  console.log("🗑️  Suppression des comptes démo...");
  
  const demoEmails = demoAccounts.map(a => a.email);
  
  // Note: La suppression des utilisateurs dans auth.users doit être faite
  // via l'API admin de Supabase ou via le dashboard
  console.warn("⚠️  La suppression des utilisateurs auth doit être faite via le dashboard Supabase");
  console.log("📧 Emails des comptes démo à supprimer:", demoEmails);
  
  return demoEmails;
}
