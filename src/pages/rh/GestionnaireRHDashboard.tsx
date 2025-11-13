import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, FileText, TrendingUp, AlertCircle, UserPlus, FileCheck, 
  Briefcase, Clock, Shield, BarChart3, Award, Target 
} from "lucide-react";

interface DashboardStats {
  totalAgents: number;
  actesEnAttente: number;
  actesValides: number;
  demandesEnCours: number;
  mutationsRecentes: number;
  avancementsEnCours: number;
  tauxOccupationPostes: number;
  agentsActifs: number;
}

export default function GestionnaireRHDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAgents: 0,
    actesEnAttente: 0,
    actesValides: 0,
    demandesEnCours: 0,
    mutationsRecentes: 0,
    avancementsEnCours: 0,
    tauxOccupationPostes: 0,
    agentsActifs: 0
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
      const [
        agentsResult, 
        actesEnAttenteResult, 
        actesValidesResult,
        affectationsResult,
        avancementsResult,
        agentsActifsResult
      ] = await Promise.all([
        supabase.from("agents").select("id", { count: "exact", head: true }),
        supabase.from("actes_administratifs").select("id", { count: "exact", head: true }).eq("statut", "brouillon"),
        supabase.from("actes_administratifs").select("id", { count: "exact", head: true }).eq("statut", "signe"),
        supabase.from("affectations").select("id", { count: "exact", head: true }).gte("date_debut", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from("actes_administratifs").select("id", { count: "exact", head: true }).eq("type_acte", "avancement").eq("statut", "en_attente"),
        supabase.from("agents").select("id", { count: "exact", head: true }).eq("statut", "actif")
      ]);

      setStats({
        totalAgents: agentsResult.count || 0,
        actesEnAttente: actesEnAttenteResult.count || 0,
        actesValides: actesValidesResult.count || 0,
        demandesEnCours: 0, // À implémenter avec une table demandes
        mutationsRecentes: affectationsResult.count || 0,
        avancementsEnCours: avancementsResult.count || 0,
        tauxOccupationPostes: agentsActifsResult.count && agentsResult.count 
          ? Math.round((agentsActifsResult.count / agentsResult.count) * 100)
          : 0,
        agentsActifs: agentsActifsResult.count || 0
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
      title: "Agents Actifs",
      value: stats.agentsActifs,
      subtitle: `sur ${stats.totalAgents} total`,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
      link: "/rh/agents"
    },
    {
      title: "Actes à Valider",
      value: stats.actesEnAttente,
      subtitle: `${stats.actesValides} validés`,
      icon: FileCheck,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      link: "/rh/actes"
    },
    {
      title: "Avancements en Cours",
      value: stats.avancementsEnCours,
      subtitle: "Dossiers à traiter",
      icon: Award,
      color: "text-success",
      bgColor: "bg-success/10",
      link: "/rh/carrieres"
    },
    {
      title: "Taux d'Occupation",
      value: `${stats.tauxOccupationPostes}%`,
      subtitle: "Effectifs",
      icon: Target,
      color: "text-info",
      bgColor: "bg-info/10",
      link: "/rh/effectifs"
    }
  ];

  return (
    <div className="h-full flex flex-col space-y-3">
      {/* En-tête */}
      <div className="neu-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Tableau de Bord - Directeur RH</h1>
            <p className="text-muted-foreground">
              Gestion stratégique des ressources humaines de la fonction publique
            </p>
          </div>
          <div className="neu-raised w-16 h-16 flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
        </div>
      </div>

      {/* Cartes de statistiques - KPIs Stratégiques */}
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
                  {isLoading ? "..." : typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                </div>
                <p className="text-sm font-medium text-foreground">{card.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 4 Attributions Principales du DRH */}
      <div className="neu-card p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Attributions Stratégiques du DRH
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/rh/actes">
            <div className="neu-inset p-4 rounded-lg hover:shadow-neu-button-hover transition-shadow cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="neu-raised w-10 h-10 flex items-center justify-center flex-shrink-0">
                  <FileCheck className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Validation des Actes Administratifs</h3>
                  <p className="text-sm text-muted-foreground">
                    Signature et validation des décisions de carrière et actes administratifs
                  </p>
                  <div className="mt-2 text-sm font-medium text-amber-600">
                    {stats.actesEnAttente} acte(s) en attente de validation →
                  </div>
                </div>
              </div>
            </div>
          </Link>
          
          <Link to="/rh/carrieres">
            <div className="neu-inset p-4 rounded-lg hover:shadow-neu-button-hover transition-shadow cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="neu-raised w-10 h-10 flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Gestion des Carrières et Avancements</h3>
                  <p className="text-sm text-muted-foreground">
                    Pilotage des promotions, avancements et évolutions de carrière
                  </p>
                  <div className="mt-2 text-sm font-medium text-success">
                    {stats.avancementsEnCours} dossier(s) à traiter →
                  </div>
                </div>
              </div>
            </div>
          </Link>
          
          <Link to="/rh/effectifs">
            <div className="neu-inset p-4 rounded-lg hover:shadow-neu-button-hover transition-shadow cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="neu-raised w-10 h-10 flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 text-info" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Pilotage des Effectifs</h3>
                  <p className="text-sm text-muted-foreground">
                    Suivi des effectifs, prévisions et gestion prévisionnelle
                  </p>
                  <div className="mt-2 text-sm font-medium text-info">
                    {stats.agentsActifs} agents actifs / {stats.totalAgents} total →
                  </div>
                </div>
              </div>
            </div>
          </Link>
          
          <Link to="/rh/rapports">
            <div className="neu-inset p-4 rounded-lg hover:shadow-neu-button-hover transition-shadow cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="neu-raised w-10 h-10 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Tableaux de Bord RH</h3>
                  <p className="text-sm text-muted-foreground">
                    Analyses et indicateurs stratégiques RH
                  </p>
                  <div className="mt-2 text-sm font-medium text-primary">
                    Voir les rapports et statistiques →
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
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
