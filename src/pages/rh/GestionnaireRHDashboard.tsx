import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Users, FileText, TrendingUp, AlertCircle, UserPlus, FileCheck, Briefcase, Clock } from "lucide-react";

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
              <div className="neu-card p-5 hover:shadow-neu-button-hover transition-shadow cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <div className={`neu-raised w-10 h-10 flex items-center justify-center ${card.color}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">
                  {isLoading ? "..." : card.value.toLocaleString()}
                </div>
                <p className="text-sm font-medium text-foreground">{card.title}</p>
              </div>
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
            <button className="neu-button w-full h-auto py-6 flex flex-col gap-2">
              <UserPlus className="w-6 h-6" />
              <span className="text-sm">Nouvel Agent</span>
            </button>
          </Link>
          <Link to="/rh/actes/nouveau">
            <button className="neu-button w-full h-auto py-6 flex flex-col gap-2">
              <FileCheck className="w-6 h-6" />
              <span className="text-sm">Générer un Acte</span>
            </button>
          </Link>
          <Link to="/rh/affectations/nouvelle">
            <button className="neu-button w-full h-auto py-6 flex flex-col gap-2">
              <Briefcase className="w-6 h-6" />
              <span className="text-sm">Nouvelle Affectation</span>
            </button>
          </Link>
          <Link to="/rh/recherche">
            <button className="neu-button w-full h-auto py-6 flex flex-col gap-2">
              <Users className="w-6 h-6" />
              <span className="text-sm">Rechercher un Agent</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Alertes et notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="neu-card p-6">
          <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            Tâches Prioritaires
          </h3>
          <p className="text-sm text-muted-foreground mb-4">Actions nécessitant votre attention</p>
          <div className="space-y-3">
            {stats.actesEnAttente > 0 && (
              <div className="neu-inset p-3 rounded-lg">
                <p className="text-sm font-medium mb-1">
                  {stats.actesEnAttente} acte(s) en brouillon à finaliser
                </p>
                <Link to="/rh/actes?statut=brouillon">
                  <span className="text-xs text-primary hover:underline">
                    Voir les actes →
                  </span>
                </Link>
              </div>
            )}
            {stats.totalAgents === 0 && (
              <div className="neu-inset p-3 rounded-lg">
                <p className="text-sm font-medium mb-1">
                  Aucun agent enregistré dans le système
                </p>
                <Link to="/rh/agents/nouveau">
                  <span className="text-xs text-primary hover:underline">
                    Ajouter un agent →
                  </span>
                </Link>
              </div>
            )}
            {stats.actesEnAttente === 0 && stats.totalAgents > 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucune tâche prioritaire pour le moment
              </p>
            )}
          </div>
        </div>

        <div className="neu-card p-6">
          <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <Clock className="w-5 h-5 text-info" />
            Activité Récente
          </h3>
          <p className="text-sm text-muted-foreground mb-4">Dernières opérations effectuées</p>
          <div className="space-y-3">
            {stats.mutationsRecentes > 0 ? (
              <div className="neu-inset p-3 rounded-lg">
                <p className="text-sm font-medium mb-1">
                  {stats.mutationsRecentes} mutation(s) effectuée(s) ce mois
                </p>
                <Link to="/rh/affectations">
                  <span className="text-xs text-primary hover:underline">
                    Voir l'historique →
                  </span>
                </Link>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucune activité récente
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
