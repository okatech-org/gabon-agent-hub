import { createContext, useContext, useEffect, useState, useRef } from "react";
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

// Constantes pour le rafraîchissement du token
const TOKEN_REFRESH_INTERVAL = 50 * 60 * 1000; // Rafraîchir toutes les 50 minutes (token expire à 60 min)
const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // Buffer de 5 minutes avant expiration

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fonction pour rafraîchir le token
  const refreshSession = async () => {
    try {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Erreur lors de la récupération de la session:", error);
        return;
      }

      if (!currentSession) {
        console.log("Aucune session active, pas de rafraîchissement nécessaire");
        return;
      }

      // Vérifier si le token est proche de l'expiration
      const expiresAt = currentSession.expires_at;
      if (expiresAt) {
        const expiryTime = expiresAt * 1000; // Convertir en millisecondes
        const now = Date.now();
        const timeUntilExpiry = expiryTime - now;

        // Si le token expire dans moins de TOKEN_EXPIRY_BUFFER, le rafraîchir
        if (timeUntilExpiry < TOKEN_EXPIRY_BUFFER) {
          console.log("Token proche de l'expiration, rafraîchissement...");
          const { data, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError) {
            console.error("Erreur lors du rafraîchissement du token:", refreshError);
            toast.error("Session expirée. Veuillez vous reconnecter.");
            await signOut();
            return;
          }

          if (data.session) {
            console.log("Token rafraîchi avec succès");
            setSession(data.session);
            setUser(data.session.user);
          }
        } else {
          console.log(`Token valide encore pour ${Math.round(timeUntilExpiry / 60000)} minutes`);
        }
      }
    } catch (error) {
      console.error("Erreur lors du rafraîchissement de la session:", error);
    }
  };

  // Configurer le rafraîchissement automatique
  useEffect(() => {
    if (session) {
      // Rafraîchir immédiatement si nécessaire
      refreshSession();

      // Configurer le timer de rafraîchissement périodique
      refreshTimerRef.current = setInterval(() => {
        refreshSession();
      }, TOKEN_REFRESH_INTERVAL);

      return () => {
        if (refreshTimerRef.current) {
          clearInterval(refreshTimerRef.current);
        }
      };
    }
  }, [session]);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Rediriger en fonction du rôle
          setTimeout(() => {
            checkUserRoleAndRedirect(session.user.id);
          }, 0);
        }

        if (event === 'TOKEN_REFRESHED') {
          console.log("Token rafraîchi automatiquement par Supabase");
        }

        if (event === 'SIGNED_OUT') {
          // Nettoyer le timer lors de la déconnexion
          if (refreshTimerRef.current) {
            clearInterval(refreshTimerRef.current);
          }
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
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
          case "drh":
          case "drh_ministre":
          case "gestionnaire":
            navigate("/rh/dashboard");
            break;
          case "fonctionnaire":
          case "agent":
            navigate("/fonctionnaire/dashboard");
            break;
          case "secretaire_general":
          case "directeur_cabinet":
          case "drh_local":
            navigate("/dashboard");
            break;
          case "candidat":
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
      if (error) throw error;
      
      navigate('/auth/login');
      toast.success("Déconnexion réussie");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la déconnexion");
      throw error;
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
