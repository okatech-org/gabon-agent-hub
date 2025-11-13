import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, FileText, Download, TrendingUp, Users, Award, 
  Briefcase, Clock, PieChart, Activity, Calendar 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RapportStats {
  totalAgents: number;
  nouvellesRecrutements: number;
  actesGeneres: number;
  avancementsTraites: number;
  mutationsEffectuees: number;
  formationsDispensees: number;
  tauxAbsenteisme: number;
  satisfactionMoyenne: number;
}

interface RapportPeriodique {
  id: string;
  titre: string;
  periode: string;
  type: string;
  date_creation: string;
  statut: string;
}

export default function RapportsRH() {
  const [stats, setStats] = useState<RapportStats>({
    totalAgents: 0,
    nouvellesRecrutements: 0,
    actesGeneres: 0,
    avancementsTraites: 0,
    mutationsEffectuees: 0,
    formationsDispensees: 0,
    tauxAbsenteisme: 0,
    satisfactionMoyenne: 0
  });
  const [rapports, setRapports] = useState<RapportPeriodique[]>([]);
  const [periodeSelectionnee, setPeriodeSelectionnee] = useState("mois");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadRapportsData();
  }, [periodeSelectionnee]);

  const loadRapportsData = async () => {
    try {
      setIsLoading(true);

      // Calculer la date de début selon la période
      const now = new Date();
      let dateDebut = new Date();
      
      switch (periodeSelectionnee) {
        case "semaine":
          dateDebut.setDate(now.getDate() - 7);
          break;
        case "mois":
          dateDebut.setMonth(now.getMonth() - 1);
          break;
        case "trimestre":
          dateDebut.setMonth(now.getMonth() - 3);
          break;
        case "annee":
          dateDebut.setFullYear(now.getFullYear() - 1);
          break;
      }

      // Charger les statistiques
      const [
        agentsResult,
        recrutesResult,
        actesResult,
        avancementsResult,
        affectationsResult
      ] = await Promise.all([
        supabase.from("agents").select("id", { count: "exact", head: true }),
        supabase.from("agents").select("id", { count: "exact", head: true })
          .gte("created_at", dateDebut.toISOString()),
        supabase.from("actes_administratifs").select("id", { count: "exact", head: true })
          .gte("date_creation", dateDebut.toISOString()),
        supabase.from("actes_administratifs").select("id", { count: "exact", head: true })
          .eq("type_acte", "avancement")
          .gte("date_creation", dateDebut.toISOString()),
        supabase.from("affectations").select("id", { count: "exact", head: true })
          .gte("date_debut", dateDebut.toISOString())
      ]);

      setStats({
        totalAgents: agentsResult.count || 0,
        nouvellesRecrutements: recrutesResult.count || 0,
        actesGeneres: actesResult.count || 0,
        avancementsTraites: avancementsResult.count || 0,
        mutationsEffectuees: affectationsResult.count || 0,
        formationsDispensees: Math.floor(Math.random() * 50), // Données simulées
        tauxAbsenteisme: parseFloat((Math.random() * 5).toFixed(1)), // Données simulées
        satisfactionMoyenne: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)) // Données simulées
      });

      // Charger la liste des rapports disponibles (simulé)
      setRapports([
        {
          id: "1",
          titre: "Rapport mensuel des effectifs",
          periode: "Janvier 2025",
          type: "Effectifs",
          date_creation: "2025-01-31",
          statut: "disponible"
        },
        {
          id: "2",
          titre: "Bilan des avancements - T4 2024",
          periode: "Q4 2024",
          type: "Carrières",
          date_creation: "2024-12-31",
          statut: "disponible"
        },
        {
          id: "3",
          titre: "Rapport annuel RH 2024",
          periode: "Année 2024",
          type: "Global",
          date_creation: "2024-12-31",
          statut: "disponible"
        }
      ]);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données des rapports",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const indicateurs = [
    {
      titre: "Effectif Total",
      valeur: stats.totalAgents,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      titre: "Nouveaux Recrutés",
      valeur: stats.nouvellesRecrutements,
      icon: TrendingUp,
      color: "text-success",
      bgColor: "bg-success/10"
    },
    {
      titre: "Actes Générés",
      valeur: stats.actesGeneres,
      icon: FileText,
      color: "text-info",
      bgColor: "bg-info/10"
    },
    {
      titre: "Avancements",
      valeur: stats.avancementsTraites,
      icon: Award,
      color: "text-amber-600",
      bgColor: "bg-amber-100"
    },
    {
      titre: "Mutations",
      valeur: stats.mutationsEffectuees,
      icon: Briefcase,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      titre: "Formations",
      valeur: stats.formationsDispensees,
      icon: Activity,
      color: "text-info",
      bgColor: "bg-info/10"
    }
  ];

  const periodes = [
    { value: "semaine", label: "Cette semaine" },
    { value: "mois", label: "Ce mois" },
    { value: "trimestre", label: "Ce trimestre" },
    { value: "annee", label: "Cette année" }
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      {/* En-tête */}
      <div className="neu-card p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Tableaux de Bord et Rapports RH</h1>
            <p className="text-muted-foreground">
              Analyses et indicateurs stratégiques des ressources humaines
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={periodeSelectionnee} onValueChange={setPeriodeSelectionnee}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periodes.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="neu-raised w-16 h-16 flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Indicateurs Clés */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {indicateurs.map((indicateur) => {
          const IconComponent = indicateur.icon;
          return (
            <Card key={indicateur.titre} className="neu-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{indicateur.titre}</p>
                    <p className="text-3xl font-bold">
                      {isLoading ? "..." : indicateur.valeur.toLocaleString()}
                    </p>
                  </div>
                  <div className={`neu-raised w-12 h-12 flex items-center justify-center ${indicateur.color}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Indicateurs de Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="neu-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Indicateurs de Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="neu-inset p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Taux d'Absentéisme</span>
                  <Badge variant={stats.tauxAbsenteisme < 3 ? "default" : "destructive"}>
                    {stats.tauxAbsenteisme}%
                  </Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      stats.tauxAbsenteisme < 3 ? "bg-success" : "bg-destructive"
                    }`}
                    style={{ width: `${Math.min(stats.tauxAbsenteisme * 10, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Objectif: &lt; 3%
                </p>
              </div>

              <div className="neu-inset p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Satisfaction Moyenne</span>
                  <Badge variant="default">
                    {stats.satisfactionMoyenne}/5
                  </Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-success h-2 rounded-full transition-all"
                    style={{ width: `${(stats.satisfactionMoyenne / 5) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Basé sur les enquêtes internes
                </p>
              </div>

              <div className="neu-inset p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Délai Moyen de Traitement</span>
                  <Badge variant="outline">
                    15 jours
                  </Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-info h-2 rounded-full transition-all"
                    style={{ width: "60%" }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Pour les actes administratifs
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="neu-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Répartition des Activités
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="neu-inset p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Validation d'Actes</span>
                  <span className="text-sm font-semibold">{stats.actesGeneres}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: "45%" }} />
                </div>
              </div>

              <div className="neu-inset p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Gestion des Carrières</span>
                  <span className="text-sm font-semibold">{stats.avancementsTraites}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-success h-2 rounded-full" style={{ width: "30%" }} />
                </div>
              </div>

              <div className="neu-inset p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Mutations</span>
                  <span className="text-sm font-semibold">{stats.mutationsEffectuees}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: "25%" }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rapports Disponibles */}
      <Card className="neu-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Rapports Disponibles
            </CardTitle>
            <Button className="gap-2">
              <Calendar className="w-4 h-4" />
              Générer un rapport
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {rapports.map((rapport) => (
              <div key={rapport.id} className="neu-inset p-4 rounded-lg hover:shadow-neu-button-hover transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="neu-raised w-10 h-10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{rapport.titre}</h4>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {rapport.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{rapport.periode}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          Créé le {new Date(rapport.date_creation).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="w-4 h-4" />
                      Télécharger
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Types de Rapports Disponibles */}
      <Card className="neu-card">
        <CardHeader>
          <CardTitle>Types de Rapports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="neu-inset p-4 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Rapport des Effectifs
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Vue d'ensemble des effectifs par catégorie, grade, et statut
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Générer
              </Button>
            </div>

            <div className="neu-inset p-4 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Bilan des Avancements
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Analyse des promotions et avancements de la période
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Générer
              </Button>
            </div>

            <div className="neu-inset p-4 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Suivi des Actes
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Statistiques sur les actes administratifs générés
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Générer
              </Button>
            </div>

            <div className="neu-inset p-4 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Rapport Annuel RH
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Bilan complet de l'année avec tous les indicateurs
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Générer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

