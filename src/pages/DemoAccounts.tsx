import { Shield, Users, UserCog, Briefcase, GraduationCap, Building2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

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

export default function DemoAccounts() {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-background flex justify-center px-2 md:px-4 py-6 md:py-10">
      <div className="w-full max-w-7xl space-y-6 md:space-y-8">
        {/* Header */}
        <header className="neu-card px-4 py-4 md:px-6 md:py-5">
          <div className="flex items-center gap-4">
            <Link to="/auth/login">
              <button className="neu-raised w-12 h-12 flex items-center justify-center hover:scale-105 transition-transform">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="neu-raised w-12 h-12 flex items-center justify-center">
                <Shield className="h-7 w-7 text-secondary" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">
                  Comptes Démo - Accès Direct
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Découvrez ADMIN.GA avec différents profils d'utilisateurs
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="neu-card px-5 py-6 md:px-8 md:py-8">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold">
              Explorez les Fonctionnalités d'ADMIN.GA
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Chaque compte démo vous permet d'accéder directement au système avec un profil 
              spécifique de la fonction publique gabonaise. Découvrez les interfaces, fonctionnalités 
              et permissions correspondant à chaque rôle.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <div className="flex items-center gap-2">
                <div className="neu-raised w-8 h-8 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                </div>
                <span className="text-sm font-medium">Accès instantané</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="neu-raised w-8 h-8 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                </div>
                <span className="text-sm font-medium">Données fictives</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="neu-raised w-8 h-8 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                </div>
                <span className="text-sm font-medium">Aucune inscription</span>
              </div>
            </div>
          </div>
        </section>

        {/* Demo Accounts Grid */}
        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {demoAccounts.map((account) => {
            const IconComponent = account.icon;
            return (
              <button
                key={account.id}
                onClick={() => handleDemoLogin(account)}
                disabled={isLoading}
                className="neu-card p-6 text-left hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className={`neu-raised w-14 h-14 flex items-center justify-center flex-shrink-0 ${account.color} group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-7 h-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-secondary transition-colors">
                      {account.nom}
                    </h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                      {account.role}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                  {account.description}
                </p>

                <div className="space-y-2.5 mb-5">
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
                    Attributions principales
                  </p>
                  {account.attributs.map((attribut, index) => (
                    <div key={index} className="flex items-start gap-2.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${account.color.replace('text-', 'bg-')} mt-2 flex-shrink-0`} />
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {attribut}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-muted space-y-2">
                  <p className="text-xs text-muted-foreground break-all">
                    <span className="font-semibold text-foreground">Email: </span>
                    {account.email}
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                    <p className="text-sm text-success font-medium">
                      Connexion en un clic
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </section>

        {/* Info Section */}
        <section className="neu-card px-5 py-6 md:px-8 md:py-7">
          <div className="neu-inset p-5 md:p-6 rounded-xl">
            <div className="flex gap-4">
              <div className="neu-raised w-12 h-12 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-info" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Note importante sur les comptes démo
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Ces comptes démo permettent de découvrir les différentes interfaces et fonctionnalités 
                  d'ADMIN.GA selon les profils d'utilisateurs de la fonction publique gabonaise.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-info mt-2 flex-shrink-0" />
                    <span>Les données affichées sont fictives et à but de démonstration uniquement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-info mt-2 flex-shrink-0" />
                    <span>Chaque profil dispose de permissions et d'accès spécifiques</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-info mt-2 flex-shrink-0" />
                    <span>Aucune action réelle n'est effectuée sur les systèmes officiels</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="neu-card px-4 py-4 md:px-6 md:py-5 text-xs md:text-sm flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">
              Portail officiel du Ministère de la Fonction Publique de la République Gabonaise
            </p>
            <p>© 2025 ADMIN.GA - Tous droits réservés</p>
          </div>
          <Link to="/auth/login" className="hover:underline font-medium">
            Retour à la connexion
          </Link>
        </footer>
      </div>
    </div>
  );
}
