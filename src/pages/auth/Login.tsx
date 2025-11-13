import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, FileText, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signIn(email, password);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Bouton retour et thème */}
        <div className="flex justify-between items-center">
          <Link to="/">
            <button className="neu-raised w-12 h-12 flex items-center justify-center hover:scale-105 transition-transform">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <ThemeToggle />
        </div>

        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="neu-raised w-20 h-20 flex items-center justify-center">
              <Shield className="h-12 w-12 text-secondary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold">ADMIN.GA</h1>
          <p className="text-muted-foreground">
            Portail de la Fonction Publique Gabonaise
          </p>
        </div>

        <div className="neu-card px-6 py-8">
          <div className="space-y-2 mb-6">
            <h2 className="text-2xl font-semibold">Connexion</h2>
            <p className="text-sm text-muted-foreground">
              Connectez-vous à votre compte pour accéder au système
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre.email@fonctionpublique.ga"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="neu-inset border-0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="neu-inset border-0"
              />
            </div>

            <button 
              type="submit" 
              className="neu-button neu-button-admin w-full py-3"
              disabled={isLoading}
            >
              {isLoading ? "Connexion en cours..." : "Se connecter"}
            </button>

            <Link to="/demo-accounts" className="block">
              <button
                type="button"
                className="neu-button w-full py-3"
                disabled={isLoading}
              >
                <FileText className="w-4 h-4 mr-2 inline" />
                Accès Comptes Démo
              </button>
            </Link>

            <div className="text-center text-sm pt-2">
              <span className="text-muted-foreground">Pas encore de compte? </span>
              <Link to="/auth/signup" className="text-secondary hover:underline font-medium">
                S'inscrire
              </Link>
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          République Gabonaise - Ministère de la Fonction Publique
          <br />
          © 2025 ADMIN.GA - Tous droits réservés
        </p>
      </div>
    </div>
  );
}
