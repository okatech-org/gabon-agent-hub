import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DemoAccount {
  email: string;
  password: string;
  nom: string;
  prenoms: string;
  role: string;
}

const demoAccounts: DemoAccount[] = [
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting demo accounts initialization...');

    // Create admin Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const results = [];

    for (const account of demoAccounts) {
      console.log(`Processing account: ${account.email}`);
      
      try {
        // Check if user already exists
        const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
        const userExists = existingUser?.users?.some(u => u.email === account.email);

        if (userExists) {
          console.log(`User ${account.email} already exists, skipping...`);
          results.push({
            email: account.email,
            status: 'skipped',
            message: 'User already exists'
          });
          continue;
        }

        // Create user with admin API
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
          user_metadata: {
            nom: account.nom,
            prenoms: account.prenoms
          }
        });

        if (createError) {
          console.error(`Error creating user ${account.email}:`, createError);
          results.push({
            email: account.email,
            status: 'error',
            message: createError.message
          });
          continue;
        }

        console.log(`User ${account.email} created successfully with ID: ${newUser.user.id}`);

        // The profile should be created automatically by the trigger handle_new_user
        // But we'll verify and create if needed
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .upsert({
            id: newUser.user.id,
            nom: account.nom,
            prenoms: account.prenoms,
            email: account.email
          });

        if (profileError) {
          console.error(`Error creating profile for ${account.email}:`, profileError);
        }

        // Assign role
        const { error: roleError } = await supabaseAdmin
          .from('user_roles')
          .insert({
            user_id: newUser.user.id,
            role: account.role
          });

        if (roleError) {
          console.error(`Error assigning role to ${account.email}:`, roleError);
          results.push({
            email: account.email,
            status: 'partial',
            message: 'User created but role assignment failed',
            userId: newUser.user.id
          });
        } else {
          console.log(`Role ${account.role} assigned to ${account.email}`);
          results.push({
            email: account.email,
            status: 'success',
            message: 'User created and role assigned successfully',
            userId: newUser.user.id
          });
        }

      } catch (error) {
        console.error(`Error processing account ${account.email}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({
          email: account.email,
          status: 'error',
          message: errorMessage
        });
      }
    }

    console.log('Demo accounts initialization completed');

    return new Response(
      JSON.stringify({
        message: 'Demo accounts initialization completed',
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in initialize-demo-accounts function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
