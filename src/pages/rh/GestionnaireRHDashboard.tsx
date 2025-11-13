import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileText, TrendingUp, AlertCircle, UserPlus, FileCheck, Briefcase, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  totalAgents: number;
  actesEnAttente: number;
  demandesEnCours: number;
  mutationsRecentes: number;
}

export default function GestionnaireRHDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAgents: 0,
    actesEnAttente: 0,
    demandesEnCours: 0,
    mutationsRecentes: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setIsLoading(true);

      // Charger les statistiques
      const [agentsResult, actesResult, affectationsResult] = await Promise.all([
        supabase.from("agents").select("id", { count: "exact", head: true }),
        supabase.from("actes_administratifs").select("id", { count: "exact", head: true }).eq("statut", "brouillon"),
        supabase.from("affectations").select("id", { count: "exact", head: true }).gte("date_debut", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      setStats({
        totalAgents: agentsResult.count || 0,
        actesEnAttente: actesResult.count || 0,
        demandesEnCours: 0, // À implémenter avec une table demandes
        mutationsRecentes: affectationsResult.count || 0
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: "Agents Enregistrés",
      value: stats.totalAgents,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
      link: "/rh/agents"
    },
    {
      title: "Actes en Attente",
      value: stats.actesEnAttente,
      icon: FileText,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      link: "/rh/actes"
    },
    {
      title: "Demandes en Cours",
      value: stats.demandesEnCours,
      icon: Clock,
      color: "text-info",
      bgColor: "bg-info/10",
      link: "/rh/demandes"
    },
    {
      title: "Mutations (30j)",
      value: stats.mutationsRecentes,
      icon: Briefcase,
      color: "text-success",
      bgColor: "bg-success/10",
      link: "/rh/affectations"
    }
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      {/* En-tête */}
      <div className="neu-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Tableau de Bord - Gestionnaire RH</h1>
            <p className="text-muted-foreground">
              Gestion opérationnelle des dossiers et actes administratifs
            </p>
          </div>
          <div className="neu-raised w-16 h-16 flex items-center justify-center">
            <Users className="w-8 h-8 text-info" />
          </div>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <Link key={card.title} to={card.link}>
              <Card className="neu-card hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </CardTitle>
                  <div className={`neu-raised w-10 h-10 flex items-center justify-center ${card.color}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {isLoading ? "..." : card.value.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Actions rapides */}
      <div className="neu-card p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-secondary" />
          Actions Rapides
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/rh/agents/nouveau">
            <Button className="w-full h-auto py-6 flex flex-col gap-2" variant="outline">
              <UserPlus className="w-6 h-6" />
              <span className="text-sm">Nouvel Agent</span>
            </Button>
          </Link>
          <Link to="/rh/actes/nouveau">
            <Button className="w-full h-auto py-6 flex flex-col gap-2" variant="outline">
              <FileCheck className="w-6 h-6" />
              <span className="text-sm">Générer un Acte</span>
            </Button>
          </Link>
          <Link to="/rh/affectations/nouvelle">
            <Button className="w-full h-auto py-6 flex flex-col gap-2" variant="outline">
              <Briefcase className="w-6 h-6" />
              <span className="text-sm">Nouvelle Affectation</span>
            </Button>
          </Link>
          <Link to="/rh/recherche">
            <Button className="w-full h-auto py-6 flex flex-col gap-2" variant="outline">
              <Users className="w-6 h-6" />
              <span className="text-sm">Rechercher un Agent</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Alertes et notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="neu-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              Tâches Prioritaires
            </CardTitle>
            <CardDescription>Actions nécessitant votre attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.actesEnAttente > 0 && (
                <div className="neu-inset p-3 rounded-lg">
                  <p className="text-sm font-medium">
                    {stats.actesEnAttente} acte(s) en brouillon à finaliser
                  </p>
                  <Link to="/rh/actes?statut=brouillon">
                    <Button variant="link" size="sm" className="p-0 h-auto">
                      Voir les actes →
                    </Button>
                  </Link>
                </div>
              )}
              {stats.totalAgents === 0 && (
                <div className="neu-inset p-3 rounded-lg">
                  <p className="text-sm font-medium">
                    Aucun agent enregistré dans le système
                  </p>
                  <Link to="/rh/agents/nouveau">
                    <Button variant="link" size="sm" className="p-0 h-auto">
                      Ajouter un agent →
                    </Button>
                  </Link>
                </div>
              )}
              {stats.actesEnAttente === 0 && stats.totalAgents > 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucune tâche prioritaire pour le moment
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="neu-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-info" />
              Activité Récente
            </CardTitle>
            <CardDescription>Dernières opérations effectuées</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.mutationsRecentes > 0 ? (
                <div className="neu-inset p-3 rounded-lg">
                  <p className="text-sm font-medium">
                    {stats.mutationsRecentes} mutation(s) effectuée(s) ce mois
                  </p>
                  <Link to="/rh/affectations">
                    <Button variant="link" size="sm" className="p-0 h-auto">
                      Voir l'historique →
                    </Button>
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucune activité récente
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
