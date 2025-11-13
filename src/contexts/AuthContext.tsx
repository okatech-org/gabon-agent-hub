import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, nom: string, prenoms: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Rediriger en fonction du rôle
          setTimeout(() => {
            checkUserRoleAndRedirect(session.user.id);
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkUserRoleAndRedirect = async (userId: string) => {
    try {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (roles && roles.length > 0) {
        const userRole = roles[0].role;
        
        // Redirection selon le rôle
        switch (userRole) {
          case "ministre":
            navigate("/ministre/dashboard");
            break;
          case "gestionnaire":
            navigate("/rh/dashboard");
            break;
          case "agent":
            navigate("/fonctionnaire/dashboard");
            break;
          case "secretaire_general":
          case "directeur_cabinet":
          case "drh_ministre":
          case "drh_local":
          case "candidat":
          case "auditeur":
          case "admin":
            navigate("/dashboard");
            break;
          default:
            navigate("/dashboard");
        }
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Erreur lors de la vérification du rôle:", error);
      navigate("/dashboard");
    }
  };

  const signUp = async (email: string, password: string, nom: string, prenoms: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nom,
            prenoms,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;
      
      toast.success("Compte créé avec succès! Vous pouvez maintenant vous connecter.");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la création du compte");
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast.success("Connexion réussie!");
    } catch (error: any) {
      toast.error(error.message || "Erreur de connexion");
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      // Si la session n'existe plus, on considère que c'est ok
      if (error && error.message !== "Session from session_id claim in JWT does not exist") {
        throw error;
      }
    } catch (error: any) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      // Toujours nettoyer l'état local et rediriger
      setUser(null);
      setSession(null);
      navigate('/auth/login');
      toast.success("Déconnexion réussie");
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
