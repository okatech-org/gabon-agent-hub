import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Users, FileText, Award, TrendingUp, BookOpen, Newspaper, Shield } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <header className="border-b bg-card shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">ADMIN.GA</h1>
              <p className="text-xs text-muted-foreground">Fonction Publique du Gabon</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-4">
            <Link to="/auth/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Connexion
            </Link>
            <Link to="/auth/signup">
              <Button size="sm">Créer un compte</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-background py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              <Shield className="h-4 w-4" />
              Portail Officiel de la Fonction Publique
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
              ADMIN.GA – La Fonction Publique gabonaise, au service du citoyen
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              La plateforme digitale officielle qui simplifie vos démarches administratives. 
              Modernisation, transparence et efficacité au cœur de la transformation de l'administration gabonaise.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Link to="/auth/login?type=agent">
                <Button size="lg" className="min-w-[200px]">
                  <Users className="mr-2 h-5 w-5" />
                  Je suis fonctionnaire
                </Button>
              </Link>
              <Link to="/auth/signup?type=candidat">
                <Button size="lg" variant="outline" className="min-w-[200px]">
                  <Award className="mr-2 h-5 w-5" />
                  Je suis citoyen / candidat
                </Button>
              </Link>
            </div>

            <p className="text-sm text-muted-foreground italic pt-4">
              "Servir l'État, c'est servir chaque citoyen."
            </p>
          </div>
        </div>
      </section>

      {/* À propos de la Fonction Publique */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                À propos de la Fonction Publique
              </h2>
              <p className="text-lg text-muted-foreground">
                Un pilier essentiel de l'État au service de tous les Gabonais
              </p>
            </div>

            <div className="prose prose-lg max-w-none text-foreground/90">
              <p className="text-lg leading-relaxed">
                La <strong>Fonction Publique</strong> représente l'ensemble des agents qui travaillent pour l'État 
                et les collectivités territoriales. Ces femmes et ces hommes assurent quotidiennement le fonctionnement 
                de nos services publics : éducation, santé, sécurité, administration, justice, et bien d'autres domaines essentiels.
              </p>

              <p className="text-lg leading-relaxed">
                <strong>Qui sont les agents publics ?</strong> Ce sont des fonctionnaires titulaires, des contractuels, 
                des agents stagiaires qui ont choisi de mettre leurs compétences au service de l'intérêt général. 
                Ils incarnent les valeurs fondamentales du service public gabonais.
              </p>

              <div className="grid md:grid-cols-2 gap-6 my-8">
                <Card className="border-l-4 border-l-primary shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Nos principes fondamentaux</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <p className="text-sm"><strong>Continuité du service public</strong> – L'État ne s'arrête jamais</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <p className="text-sm"><strong>Égalité d'accès</strong> – Tous les citoyens sont traités équitablement</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <p className="text-sm"><strong>Neutralité</strong> – Impartialité et respect de tous</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <p className="text-sm"><strong>Intégrité</strong> – Probité et lutte contre la corruption</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-secondary shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Notre engagement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">
                      La Fonction Publique s'engage à servir tous les Gabonais avec efficacité, proximité et transparence. 
                      Chaque agent public est un maillon essentiel dans la chaîne de service qui relie l'État au citoyen.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Le Ministère de la Fonction Publique */}
      <section className="py-16 lg:py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Le Ministère de la Fonction Publique
              </h2>
              <p className="text-lg text-muted-foreground">
                Pilote de la transformation de l'administration gabonaise
              </p>
            </div>

            <div className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Notre mission</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground/90">
                    Le Ministère de la Fonction Publique a pour mission de <strong>gérer l'ensemble des ressources humaines 
                    de l'État</strong>. Il organise les corps et les carrières, prépare et met en œuvre les réformes administratives, 
                    et conduit la modernisation et la digitalisation de l'administration.
                  </p>
                  <p className="text-foreground/90">
                    Dans le cadre de la <strong>Nouvelle République</strong>, le Ministère s'est engagé dans une vaste entreprise 
                    d'assainissement et de transparence, avec pour objectifs :
                  </p>
                  <ul className="space-y-3 mt-4">
                    <li className="flex items-start gap-3">
                      <div className="rounded-full bg-primary/10 p-1.5 mt-0.5">
                        <ArrowRight className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <strong className="text-foreground">Recensement biométrique des agents</strong>
                        <p className="text-sm text-muted-foreground">Identifier tous les agents publics avec fiabilité et lutter contre les "agents fictifs"</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="rounded-full bg-primary/10 p-1.5 mt-0.5">
                        <ArrowRight className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <strong className="text-foreground">Assainissement des fichiers de la masse salariale</strong>
                        <p className="text-sm text-muted-foreground">Nettoyer les bases de données pour une gestion rigoureuse et transparente</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="rounded-full bg-primary/10 p-1.5 mt-0.5">
                        <ArrowRight className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <strong className="text-foreground">Modernisation des procédures administratives</strong>
                        <p className="text-sm text-muted-foreground">Simplifier et digitaliser pour un service plus rapide et plus efficace</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="rounded-full bg-primary/10 p-1.5 mt-0.5">
                        <ArrowRight className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <strong className="text-foreground">Amélioration du service rendu au citoyen</strong>
                        <p className="text-sm text-muted-foreground">Placer le citoyen au cœur de l'action publique</p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Je suis fonctionnaire */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  <Users className="h-4 w-4" />
                  Espace Fonctionnaire
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  Votre espace personnel ADMIN.GA
                </h2>
                <p className="text-lg text-muted-foreground">
                  Accédez à tous vos documents administratifs et suivez l'évolution de votre carrière en toute simplicité.
                </p>
                <Link to="/auth/login?type=agent">
                  <Button size="lg">
                    Se connecter
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>

              <div className="space-y-4">
                <Card className="shadow-md hover:shadow-xl transition-all">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-primary/10 p-3">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle>Consulter votre dossier administratif</CardTitle>
                        <CardDescription>
                          Accédez à votre dossier complet : affectations, grades, échelons, historique de carrière
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="shadow-md hover:shadow-xl transition-all">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-secondary/10 p-3">
                        <Award className="h-6 w-6 text-secondary" />
                      </div>
                      <div>
                        <CardTitle>Télécharger vos actes</CardTitle>
                        <CardDescription>
                          Obtenez vos actes administratifs en ligne : titularisation, promotion, retraite, mutations
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="shadow-md hover:shadow-xl transition-all">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-accent/10 p-3">
                        <TrendingUp className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <CardTitle>Suivre vos démarches</CardTitle>
                        <CardDescription>
                          Suivez l'avancement de vos demandes : retraite, régularisation, demande d'acte en temps réel
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="shadow-md hover:shadow-xl transition-all">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-primary/10 p-3">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle>Vos droits et obligations</CardTitle>
                        <CardDescription>
                          Accédez aux informations sur vos droits, devoirs et les règles régissant la fonction publique
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Je suis citoyen / candidat */}
      <section className="py-16 lg:py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 space-y-4">
                <Card className="shadow-md hover:shadow-xl transition-all">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-secondary/10 p-3">
                        <Newspaper className="h-6 w-6 text-secondary" />
                      </div>
                      <div>
                        <CardTitle>Concours et recrutements</CardTitle>
                        <CardDescription>
                          Consultez la liste complète des concours ouverts et les avis de recrutement de la fonction publique
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-accent/10 p-3">
                        <Users className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <CardTitle>Découvrir les métiers publics</CardTitle>
                        <CardDescription>
                          Explorez les différents corps, grades et missions de la fonction publique gabonaise
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-primary/10 p-3">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle>Postuler en ligne</CardTitle>
                        <CardDescription>
                          Créez votre espace candidat, déposez votre dossier et suivez votre candidature en temps réel
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-secondary/10 p-3">
                        <Shield className="h-6 w-6 text-secondary" />
                      </div>
                      <div>
                        <CardTitle>Transparence et égalité</CardTitle>
                        <CardDescription>
                          Tous les citoyens ont un accès égal aux emplois publics selon leurs mérites et compétences
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </div>

              <div className="order-1 lg:order-2 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary rounded-full text-sm font-medium">
                  <Award className="h-4 w-4" />
                  Espace Citoyen / Candidat
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  Rejoignez la Fonction Publique
                </h2>
                <p className="text-lg text-muted-foreground">
                  Découvrez les opportunités de carrière au service de l'État et déposez votre candidature 
                  en toute simplicité et en toute transparence.
                </p>
                <Link to="/auth/signup?type=candidat">
                  <Button size="lg" variant="secondary">
                    Créer mon espace candidat
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modernisation & Digitalisation */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Modernisation & Digitalisation de l'administration
              </h2>
              <p className="text-lg text-muted-foreground">
                Une fonction publique plus efficace, plus proche, plus moderne
              </p>
            </div>

            <div className="prose prose-lg max-w-none text-foreground/90">
              <p className="text-lg leading-relaxed">
                La transformation numérique de l'administration gabonaise n'est pas qu'un projet technique : 
                c'est une <strong>révolution dans la manière de servir les citoyens</strong>. En digitalisant 
                nos procédures et nos archives, nous réduisons les délais, améliorons la traçabilité et 
                renforçons la qualité du service public.
              </p>

              <div className="grid md:grid-cols-3 gap-6 my-8">
                <Card className="text-center">
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">Identifiant unique</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Chaque agent dispose d'un identifiant numérique unique qui centralise toutes ses informations administratives
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-2">
                      <Users className="h-6 w-6 text-secondary" />
                    </div>
                    <CardTitle className="text-lg">Recensement biométrique</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Fiabilisation des effectifs et lutte contre les fraudes grâce à l'identification biométrique
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-2">
                      <TrendingUp className="h-6 w-6 text-accent" />
                    </div>
                    <CardTitle className="text-lg">Traçabilité totale</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Chaque acte, chaque décision est enregistré et consultable, garantissant transparence et auditabilité
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-none">
                <CardHeader>
                  <CardTitle className="text-2xl">L'impact de la digitalisation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/20 p-1 mt-1">
                      <ArrowRight className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <strong className="text-foreground">Moins de lenteurs administratives</strong>
                      <p className="text-sm text-muted-foreground">Les processus digitalisés sont plus rapides et plus fluides</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/20 p-1 mt-1">
                      <ArrowRight className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <strong className="text-foreground">Plus de traçabilité</strong>
                      <p className="text-sm text-muted-foreground">Chaque étape est documentée et consultable à tout moment</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/20 p-1 mt-1">
                      <ArrowRight className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <strong className="text-foreground">Meilleure qualité de service</strong>
                      <p className="text-sm text-muted-foreground">Les citoyens et les agents bénéficient d'un service plus réactif et plus fiable</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <blockquote className="text-xl text-center italic text-primary font-medium py-8 border-l-4 border-primary pl-6 my-8">
                "La modernisation de la fonction publique, c'est la modernisation du quotidien des Gabonaises et des Gabonais."
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* Actualités & Communiqués */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Actualités & Communiqués
              </h2>
              <p className="text-lg text-muted-foreground">
                Restez informés des dernières nouvelles de la Fonction Publique
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="text-xs text-muted-foreground mb-2">12 Novembre 2025</div>
                  <CardTitle className="text-lg">Lancement de la campagne de recensement biométrique 2025</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Le Ministère annonce le démarrage de la nouvelle phase du recensement biométrique. 
                    Tous les agents sont invités à se faire recenser avant le 15 décembre 2025.
                  </p>
                  <Button variant="link" className="p-0 h-auto">
                    Lire la suite <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="text-xs text-muted-foreground mb-2">08 Novembre 2025</div>
                  <CardTitle className="text-lg">Ouverture des concours de recrutement 2025-2026</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Plus de 2 000 postes sont ouverts dans divers corps de la fonction publique. 
                    Les candidatures sont ouvertes jusqu'au 30 novembre 2025 sur ADMIN.GA.
                  </p>
                  <Button variant="link" className="p-0 h-auto">
                    Voir les postes <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="text-xs text-muted-foreground mb-2">05 Novembre 2025</div>
                  <CardTitle className="text-lg">Publication du nouveau statut général de la fonction publique</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Le nouveau statut général modernise le cadre juridique de la fonction publique gabonaise 
                    et renforce les droits des agents.
                  </p>
                  <Button variant="link" className="p-0 h-auto">
                    Consulter le texte <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="text-center pt-6">
              <Button variant="outline" size="lg">
                Voir toutes les actualités
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Ressources & Infos utiles */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Ressources & Informations utiles
              </h2>
              <p className="text-lg text-muted-foreground">
                Guides, textes de loi et réponses à vos questions
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-primary/10 p-3">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Textes de base</CardTitle>
                      <CardDescription className="mt-2">
                        • Statut général de la fonction publique<br />
                        • Loi sur le recensement biométrique<br />
                        • Décrets d'application récents<br />
                        • Code de déontologie des agents publics
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="link" className="p-0 h-auto">
                    Accéder aux textes <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-secondary/10 p-3">
                      <FileText className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <CardTitle>Guides pratiques</CardTitle>
                      <CardDescription className="mt-2">
                        • Guide du fonctionnaire<br />
                        • Guide du candidat aux concours<br />
                        • Comment utiliser ADMIN.GA<br />
                        • Procédures de demande de retraite
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="link" className="p-0 h-auto">
                    Télécharger les guides <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-accent/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Newspaper className="h-5 w-5 text-accent" />
                  Questions fréquentes (FAQ)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-l-2 border-accent/30 pl-4">
                  <h4 className="font-semibold text-foreground mb-1">Comment créer mon compte agent sur ADMIN.GA ?</h4>
                  <p className="text-sm text-muted-foreground">
                    Cliquez sur "Je suis fonctionnaire" puis "Créer un compte". Vous aurez besoin de votre matricule 
                    et de votre numéro de téléphone enregistré dans le système.
                  </p>
                </div>
                <div className="border-l-2 border-accent/30 pl-4">
                  <h4 className="font-semibold text-foreground mb-1">Comment postuler à un concours ?</h4>
                  <p className="text-sm text-muted-foreground">
                    Créez un espace candidat, consultez les concours ouverts, vérifiez les conditions d'éligibilité 
                    et déposez votre dossier en ligne avec les pièces requises.
                  </p>
                </div>
                <div className="border-l-2 border-accent/30 pl-4">
                  <h4 className="font-semibold text-foreground mb-1">Je ne suis pas recensé, que dois-je faire ?</h4>
                  <p className="text-sm text-muted-foreground">
                    Contactez immédiatement votre direction des ressources humaines pour régulariser votre situation. 
                    Le recensement est obligatoire pour tous les agents publics.
                  </p>
                </div>
                <div className="pt-4">
                  <Button variant="outline">
                    Voir toutes les questions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-primary" />
                  <span className="font-bold text-lg">ADMIN.GA</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Portail officiel du Ministère de la Fonction Publique de la République Gabonaise
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Liens utiles</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground transition-colors">Mentions légales</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Protection des données</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Accessibilité</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Plan du site</a></li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Contact</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Ministère de la Fonction Publique</li>
                  <li>Libreville, Gabon</li>
                  <li>Tél: +241 XX XX XX XX</li>
                  <li>Email: contact@fonction-publique.ga</li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t text-center text-sm text-muted-foreground">
              <p>© 2025 République Gabonaise - Ministère de la Fonction Publique. Tous droits réservés.</p>
              <p className="mt-2 text-xs">
                Développé dans le cadre de la Nouvelle République • Pour une administration moderne, transparente et efficace
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
