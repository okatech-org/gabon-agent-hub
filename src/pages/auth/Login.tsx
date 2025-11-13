import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Users, UserCog, Briefcase, GraduationCap, Building2, FileText, X, CheckCircle2 } from "lucide-react";

interface DemoAccount {
  id: string;
  nom: string;
  role: string;
  description: string;
  attributs: string[];
  icon: any;
  email: string;
  color: string;
}

const demoAccounts: DemoAccount[] = [
  {
    id: "admin",
    nom: "Administrateur Système",
    role: "admin",
    description: "Accès complet au système ADMIN.GA avec tous les privilèges d'administration",
    attributs: [
      "Gestion complète des utilisateurs et rôles",
      "Configuration système et paramètres",
      "Accès à tous les modules",
      "Supervision et audit"
    ],
    icon: Shield,
    email: "admin.demo@fonctionpublique.ga",
    color: "text-destructive"
  },
  {
    id: "drh",
    nom: "Directeur des Ressources Humaines",
    role: "drh",
    description: "Gestion stratégique des ressources humaines de la fonction publique",
    attributs: [
      "Validation des actes administratifs",
      "Gestion des carrières et avancements",
      "Pilotage des effectifs",
      "Tableaux de bord RH"
    ],
    icon: UserCog,
    email: "drh.demo@fonctionpublique.ga",
    color: "text-secondary"
  },
  {
    id: "gestionnaire",
    nom: "Gestionnaire RH",
    role: "gestionnaire",
    description: "Gestion opérationnelle des dossiers des agents publics",
    attributs: [
      "Saisie et mise à jour des dossiers",
      "Traitement des demandes agents",
      "Génération des actes",
      "Suivi des mutations et affectations"
    ],
    icon: Briefcase,
    email: "gestionnaire.demo@fonctionpublique.ga",
    color: "text-info"
  },
  {
    id: "directeur",
    nom: "Directeur d'Administration",
    role: "directeur",
    description: "Direction d'une administration ou d'un service ministériel",
    attributs: [
      "Gestion des agents de son service",
      "Validation des congés et permissions",
      "Suivi des effectifs du service",
      "Demandes de recrutement"
    ],
    icon: Building2,
    email: "directeur.demo@fonctionpublique.ga",
    color: "text-accent"
  },
  {
    id: "fonctionnaire",
    nom: "Agent Fonctionnaire",
    role: "fonctionnaire",
    description: "Agent titulaire de la fonction publique gabonaise",
    attributs: [
      "Consultation du dossier personnel",
      "Téléchargement des actes",
      "Demandes en ligne (congés, mutations...)",
      "Suivi de carrière"
    ],
    icon: Users,
    email: "fonctionnaire.demo@fonctionpublique.ga",
    color: "text-primary"
  },
  {
    id: "candidat",
    nom: "Candidat aux Concours",
    role: "candidat",
    description: "Citoyen candidat aux concours de la fonction publique",
    attributs: [
      "Consultation des avis de concours",
      "Dépôt de candidature en ligne",
      "Suivi du statut de candidature",
      "Consultation des résultats"
    ],
    icon: GraduationCap,
    email: "candidat.demo@fonctionpublique.ga",
    color: "text-success"
  }
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
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

  const handleDemoLogin = async (account: DemoAccount) => {
    setIsLoading(true);
    try {
      // Utiliser le même mot de passe pour tous les comptes démo
      await signIn(account.email, "Demo2024!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Demo login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="w-full max-w-md space-y-6 relative z-10">
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

            <button
              type="button"
              onClick={() => setShowDemoAccounts(true)}
              className="neu-button w-full py-3"
              disabled={isLoading}
            >
              <FileText className="w-4 h-4 mr-2 inline" />
              Accès Comptes Démo
            </button>

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

      {/* Modal Comptes Démo */}
      {showDemoAccounts && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-background rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto neu-card animate-in slide-in-from-bottom-4 duration-300">
            <div className="sticky top-0 bg-background p-6 flex items-center justify-between rounded-t-3xl border-b border-muted">
              <div>
                <h3 className="text-2xl font-bold">Comptes Démo - Accès Direct</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Sélectionnez un profil pour accéder directement au système
                </p>
              </div>
              <button
                onClick={() => setShowDemoAccounts(false)}
                className="neu-raised w-10 h-10 flex items-center justify-center hover:scale-105 transition-transform"
                disabled={isLoading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {demoAccounts.map((account) => {
                const IconComponent = account.icon;
                return (
                  <button
                    key={account.id}
                    onClick={() => handleDemoLogin(account)}
                    disabled={isLoading}
                    className="neu-card p-5 text-left hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`neu-raised w-12 h-12 flex items-center justify-center flex-shrink-0 ${account.color} group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-base mb-0.5 group-hover:text-secondary transition-colors">
                          {account.nom}
                        </h4>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                          {account.role}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {account.description}
                    </p>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">
                        Attributions principales :
                      </p>
                      {account.attributs.map((attribut, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${account.color.replace('text-', 'bg-')} mt-1.5 flex-shrink-0`} />
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {attribut}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-3 border-t border-muted">
                      <p className="text-xs text-muted-foreground break-all">
                        <span className="font-semibold text-foreground">Email:</span> {account.email}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <CheckCircle2 className="w-3 h-3 text-success" />
                        <p className="text-xs text-success font-medium">
                          Connexion en un clic
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-6 border-t border-muted rounded-b-3xl bg-muted/20">
              <div className="neu-inset p-5 rounded-xl">
                <div className="flex gap-3">
                  <div className="neu-raised w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-info" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-1">
                      Note importante
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Ces comptes démo permettent de découvrir les différentes interfaces et fonctionnalités 
                      d'ADMIN.GA selon les profils d'utilisateurs. Les données affichées sont fictives et 
                      à but de démonstration uniquement.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
