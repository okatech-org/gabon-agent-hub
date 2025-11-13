import { Building2, Users, FileText, TrendingUp, Calendar, BookOpen, CheckCircle2, Shield, Database, UserCheck, AlertCircle, LineChart } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import heroImage from "@/assets/hero-fonction-publique.jpg";
import servicePublicImage from "@/assets/service-public.jpg";
import ministereImage from "@/assets/ministere.jpg";
import fonctionnaireImage from "@/assets/fonctionnaire-espace.jpg";
import candidatsImage from "@/assets/candidats-concours.jpg";
import digitalisationImage from "@/assets/digitalisation.jpg";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex justify-center px-2 md:px-4 py-6 md:py-10">
      <div className="w-full max-w-7xl space-y-6 md:space-y-8">
        {/* Top header / navigation */}
        <header className="neu-card px-4 py-4 md:px-6 md:py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="neu-raised flex items-center justify-center w-10 h-10">
              <span className="text-sm font-bold text-primary">GA</span>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">
                ADMIN.GA – Portail de la Fonction Publique
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Plateforme officielle du Ministère de la Fonction Publique de la
                République Gabonaise
              </p>
            </div>
          </div>
          <div className="flex items-center flex-wrap gap-2">
            <ThemeToggle />
            <Link to="/auth/login">
              <button className="neu-button neu-button-admin text-sm">
                Connexion administration
              </button>
            </Link>
            <Link to="/auth/login">
              <button className="neu-button neu-button-citizen text-sm">
                Connexion agent / citoyen
              </button>
            </Link>
          </div>
        </header>

        {/* HERO */}
        <section className="neu-card px-5 py-6 md:px-8 md:py-8 space-y-6">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-3">
              <p className="text-xs md:text-sm uppercase tracking-wide text-muted-foreground">
                Portail digital officiel
              </p>
              <h2 className="text-2xl md:text-3xl font-bold leading-snug">
                ADMIN.GA – La Fonction Publique gabonaise, au service du citoyen
              </h2>
              <p className="text-sm md:text-base text-muted-foreground">
                Digitalisation des démarches, simplification des procédures,
                transparence et modernisation : ADMIN.GA centralise la gestion
                des agents publics et l'accès aux concours de la Fonction
                Publique.
              </p>
              <p className="text-xs md:text-sm italic text-muted-foreground">
                « Servir l'État, c'est servir chaque citoyen. »
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link to="/auth/login">
                  <button className="neu-button neu-button-admin">
                    Je suis fonctionnaire
                  </button>
                </Link>
                <Link to="/auth/login">
                  <button className="neu-button neu-button-citizen">
                    Je suis citoyen / candidat
                  </button>
                </Link>
              </div>
            </div>

            <div className="neu-card-sm overflow-hidden">
              <img 
                src={heroImage} 
                alt="Fonctionnaires gabonais travaillant ensemble"
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
          </div>
          
          {/* Stats rapides */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6">
              <StatCard
                label="Agents recensés"
                value="92 000+"
                subtitle="Fonctionnaires et contractuels"
                icon={<Users className="w-5 h-5" />}
                color="text-secondary"
              />
              <StatCard
                label="Concours ouverts"
                value="3"
                subtitle="Inscriptions en ligne"
                icon={<FileText className="w-5 h-5" />}
                color="text-accent"
              />
              <StatCard
                label="Actes traités"
                value="1 248"
                subtitle="Titularisations, promotions…"
                icon={<TrendingUp className="w-5 h-5" />}
                color="text-primary"
              />
              <StatCard
                label="Services en ligne"
                value="15+"
                subtitle="Démarches dématérialisées"
                icon={<Building2 className="w-5 h-5" />}
                color="text-info"
              />
            </div>
        </section>

        {/* À propos de la Fonction Publique */}
        <section className="neu-card px-5 py-6 md:px-8 md:py-7 space-y-4">
          <div className="grid lg:grid-cols-5 gap-8 items-center">
            <div className="lg:col-span-3 space-y-4">
              <h3 className="text-lg md:text-xl font-semibold">
                Comprendre la Fonction Publique gabonaise
              </h3>
              <p className="text-sm md:text-base text-muted-foreground">
                La Fonction Publique regroupe l'ensemble des femmes et des hommes
                qui travaillent pour l'État et les établissements publics. Chaque
                jour, ils assurent la continuité des services essentiels :
                éducation, santé, sécurité, justice, finances publiques, gestion du
                territoire, et bien plus encore.
              </p>
              <div className="grid gap-4 text-sm md:text-base text-muted-foreground">
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">
                    Un rôle central dans l'État
                  </h4>
                  <p>
                    La Fonction Publique est le bras opérationnel de l'État. Elle
                    met en œuvre les politiques publiques décidées par les
                    autorités, et veille à ce que chaque citoyenne et chaque citoyen
                    bénéficie de services de qualité, partout sur le territoire.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">
                    Nos valeurs de service public
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Neutralité – servir tous les citoyens, sans distinction.</li>
                    <li>
                      Intégrité – agir avec honnêteté, transparence et loyauté.
                    </li>
                    <li>Efficacité – rechercher des solutions rapides et fiables.</li>
                    <li>Proximité – rester à l'écoute des besoins du terrain.</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-2 neu-card-sm overflow-hidden">
              <img 
                src={servicePublicImage} 
                alt="Agents publics gabonais au service des citoyens"
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
          </div>
        </section>

        {/* Ministère de la Fonction Publique */}
        <section className="neu-card px-5 py-6 md:px-8 md:py-7 space-y-4">
          <div className="grid lg:grid-cols-5 gap-8 items-center">
            <div className="lg:col-span-2 neu-card-sm overflow-hidden order-2 lg:order-1">
              <img 
                src={ministereImage} 
                alt="Réunion au Ministère de la Fonction Publique du Gabon"
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>

            <div className="lg:col-span-3 space-y-4 order-1 lg:order-2">
              <h3 className="text-lg md:text-xl font-semibold">
                Le Ministère de la Fonction Publique
              </h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Le Ministère de la Fonction Publique conçoit, met en œuvre et
                suit la politique de l'État en matière de gestion des ressources
                humaines publiques. Il accompagne les ministères et institutions
                dans l'organisation de leurs services et dans la gestion de leurs
                agents.
              </p>
              <div className="grid gap-4 text-sm md:text-base text-muted-foreground">
                <div>
                  <h4 className="font-semibold text-foreground mb-1">
                    Missions principales
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      Gérer la carrière des agents publics : recrutement,
                      titularisation, avancement, mobilité, retraite.
                    </li>
                    <li>
                      Organiser l'administration : structures, postes, effectifs et
                      compétences.
                    </li>
                    <li>
                      Conduire la réforme et la modernisation de la Fonction
                      Publique.
                    </li>
                    <li>
                      Digitaliser l'action publique avec des outils comme ADMIN.GA.
                    </li>
                  </ul>
                </div>
                <div className="neu-inset p-4 md:p-5 text-sm md:text-base rounded-xl">
                  <h4 className="font-semibold text-foreground mb-2">
                    La Fonction Publique au cœur de la Nouvelle République
                  </h4>
                  <p className="text-muted-foreground">
                    Assainissement des fichiers, recensement biométrique des agents,
                    lutte contre les agents fictifs, transparence dans les
                    nominations et les concours : le ministère s'engage pour une
                    administration exemplaire et responsable.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Je suis fonctionnaire / Je suis citoyen */}
        <section className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Fonctionnaire */}
          <div className="neu-card px-5 py-6 md:px-7 md:py-7 space-y-4">
            <div className="neu-card-sm overflow-hidden mb-4">
              <img 
                src={fonctionnaireImage} 
                alt="Fonctionnaire gabonaise accédant à son espace personnel"
                className="w-full h-48 object-cover rounded-2xl"
              />
            </div>
            <h3 className="text-lg md:text-xl font-semibold">
              Je suis fonctionnaire
            </h3>
            <p className="text-sm md:text-base text-muted-foreground">
              ADMIN.GA est votre point d'entrée unique pour suivre votre
              parcours professionnel, accéder à vos documents et dialoguer avec
              l'administration.
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm md:text-base text-muted-foreground">
              <li>
                Consulter votre dossier administratif, vos affectations et votre
                grade.
              </li>
              <li>
                Télécharger vos actes : titularisation, promotions, mutations,
                retraite.
              </li>
              <li>
                Suivre l'avancement de vos démarches en ligne, sans déplacement.
              </li>
              <li>
                Accéder aux textes de référence et guides pratiques sur vos
                droits et obligations.
              </li>
            </ul>
            <button className="neu-button neu-button-admin mt-2">
              Accéder à mon espace fonctionnaire
            </button>
            <p className="text-xs text-muted-foreground">
              Connexion sécurisée avec vos identifiants ou votre matricule
              fonction publique.
            </p>
          </div>

          {/* Citoyen / candidat */}
          <div className="neu-card px-5 py-6 md:px-7 md:py-7 space-y-4">
            <div className="neu-card-sm overflow-hidden mb-4">
              <img 
                src={candidatsImage} 
                alt="Jeunes gabonais consultant les opportunités de concours"
                className="w-full h-48 object-cover rounded-2xl"
              />
            </div>
            <h3 className="text-lg md:text-xl font-semibold">
              Je suis citoyen / candidat aux concours
            </h3>
            <p className="text-sm md:text-base text-muted-foreground">
              Vous souhaitez rejoindre la Fonction Publique ou mieux comprendre
              ses métiers ? ADMIN.GA vous informe et vous guide à chaque étape.
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm md:text-base text-muted-foreground">
              <li>Consulter la liste des concours et avis de recrutement.</li>
              <li>
                Découvrir les métiers de la Fonction Publique et leurs missions.
              </li>
              <li>
                Créer un espace candidat et déposer votre dossier en ligne.
              </li>
              <li>Suivre en temps réel l'avancement de votre candidature.</li>
            </ul>
            <div className="flex flex-wrap gap-3 mt-2">
              <button className="neu-button neu-button-citizen">
                Voir les concours ouverts
              </button>
              <button className="neu-button neu-button-citizen">Créer mon espace candidat</button>
            </div>
            <p className="text-xs text-muted-foreground">
              Transparence, égalité d'accès, sélection par le mérite.
            </p>
          </div>
        </section>

        {/* Modernisation & digitalisation */}
        <section className="neu-card px-5 py-6 md:px-8 md:py-7 space-y-4">
          <div className="grid lg:grid-cols-5 gap-8 items-center">
            <div className="lg:col-span-3 space-y-4">
              <h3 className="text-lg md:text-xl font-semibold">
                Modernisation & Digitalisation de l'administration
              </h3>
              <p className="text-sm md:text-base text-muted-foreground">
                La République Gabonaise a engagé une transformation profonde de son
                administration. Avec ADMIN.GA, la Fonction Publique passe au
                numérique pour mieux servir les agents et les citoyens.
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-sm md:text-base">
                <div className="space-y-3">
                  <div className="flex gap-3 items-start">
                    <div className="neu-raised w-10 h-10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-foreground mb-1">Digitalisation des procédures</h5>
                      <p className="text-muted-foreground text-sm">Moins de papier, moins de déplacements</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="neu-raised w-10 h-10 flex items-center justify-center flex-shrink-0">
                      <Database className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-foreground mb-1">Dématérialisation des archives</h5>
                      <p className="text-muted-foreground text-sm">Dossiers sécurisés et faciles à retrouver</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="neu-raised w-10 h-10 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-foreground mb-1">Identifiant unique</h5>
                      <p className="text-muted-foreground text-sm">Chaque agent public dispose d'un identifiant unique</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-3 items-start">
                    <div className="neu-raised w-10 h-10 flex items-center justify-center flex-shrink-0">
                      <UserCheck className="w-5 h-5 text-info" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-foreground mb-1">Recensement biométrique</h5>
                      <p className="text-muted-foreground text-sm">Fiabilisation complète des effectifs</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="neu-raised w-10 h-10 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-warning" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-foreground mb-1">Lutte contre la fraude</h5>
                      <p className="text-muted-foreground text-sm">Élimination des agents fictifs et optimisation de la masse salariale</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="neu-raised w-10 h-10 flex items-center justify-center flex-shrink-0">
                      <LineChart className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-foreground mb-1">Transparence renforcée</h5>
                      <p className="text-muted-foreground text-sm">Plus de traçabilité et de qualité de service</p>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm md:text-base italic text-muted-foreground mt-4">
                « Une fonction publique plus efficace, plus proche, plus moderne. »
              </p>
            </div>

            <div className="lg:col-span-2 neu-card-sm overflow-hidden">
              <img 
                src={digitalisationImage} 
                alt="Professionnels IT gabonais travaillant sur la digitalisation"
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
          </div>
        </section>

        {/* Actualités & Ressources */}
        <section className="grid lg:grid-cols-2 gap-6 md:gap-8">
          {/* Actualités */}
          <div className="neu-card px-5 py-6 md:px-7 md:py-7 space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="text-lg md:text-xl font-semibold">
                Actualités & Communiqués
              </h3>
            </div>
            <p className="text-sm md:text-base text-muted-foreground">
              Suivez les dernières actualités du Ministère de la Fonction
              Publique, les annonces officielles et les grandes étapes de la
              réforme.
            </p>
            <div className="space-y-3 text-sm text-muted-foreground">
              <NewsItem
                title="Lancement d'ADMIN.GA pour tous les agents publics"
                date="12 novembre 2025"
                description="Le Ministère de la Fonction Publique met en ligne ADMIN.GA, le premier portail digital entièrement dédié à la gestion de la carrière des agents publics et aux candidatures aux concours."
              />
              <NewsItem
                title="Campagne nationale de recensement biométrique"
                date="5 novembre 2025"
                description="Une nouvelle phase de recensement biométrique est ouverte pour les agents publics afin d'actualiser les effectifs et de renforcer la fiabilité des données."
              />
              <NewsItem
                title="Publication du Guide numérique du fonctionnaire"
                date="28 octobre 2025"
                description="Le nouveau Guide du fonctionnaire est disponible en version électronique sur ADMIN.GA."
              />
            </div>
          </div>

          {/* Ressources */}
          <div className="neu-card px-5 py-6 md:px-7 md:py-7 space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-secondary" />
              <h3 className="text-lg md:text-xl font-semibold">
                Ressources & informations utiles
              </h3>
            </div>
            <p className="text-sm md:text-base text-muted-foreground">
              Besoin de précisions ? Retrouvez les principaux textes, guides et
              réponses à vos questions.
            </p>
            <ul className="space-y-2 text-sm md:text-base text-muted-foreground">
              <li>• Statut général de la Fonction Publique</li>
              <li>• Lois et décrets récents sur la Function Publique</li>
              <li>• Guide du fonctionnaire gabonais (PDF)</li>
              <li>• Guide du candidat aux concours</li>
              <li>• FAQ – Compte agent & compte candidat</li>
              <li>• Assistance & support en ligne</li>
            </ul>
            <button className="neu-button mt-2">Accéder à toutes les ressources</button>
          </div>
        </section>

        {/* Footer */}
        <footer className="neu-card px-4 py-4 md:px-6 md:py-5 text-xs md:text-sm flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">
              Portail officiel du Ministère de la Fonction Publique de la
              République Gabonaise
            </p>
            <p>
              © {new Date().getFullYear()} – La Fonction Publique, au service de
              tous.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="#" className="hover:underline hover:text-foreground transition-colors">
              Mentions légales
            </a>
            <a href="#" className="hover:underline hover:text-foreground transition-colors">
              Protection des données
            </a>
            <a href="#" className="hover:underline hover:text-foreground transition-colors">
              Contact & support
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* Sous-composants */

interface StatCardProps {
  label: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ label, value, subtitle, icon, color }: StatCardProps) {
  return (
    <div className="neu-card-sm px-3 py-3 md:px-4 md:py-4 text-xs md:text-sm">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-muted-foreground">{label}</p>
          <p className="text-lg md:text-xl font-bold">{value}</p>
          <p className="text-[0.7rem] md:text-xs text-muted-foreground">
            {subtitle}
          </p>
        </div>
        <div className={`icon-pill ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

interface NewsItemProps {
  title: string;
  date: string;
  description: string;
}

function NewsItem({ title, date, description }: NewsItemProps) {
  return (
    <div className="neu-inset p-3 md:p-4 rounded-xl">
      <p className="text-[0.7rem] md:text-xs uppercase tracking-wide text-muted-foreground mb-1">
        {date}
      </p>
      <h4 className="font-semibold text-foreground mb-1">{title}</h4>
      <p className="text-xs md:text-sm text-muted-foreground">
        {description}
      </p>
      <button className="neu-button mt-2 text-xs px-3 py-2">
        Lire le communiqué
      </button>
    </div>
  );
}
