import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Building2, Briefcase, AlertCircle, TrendingUp, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalAgents: 0,
    totalStructures: 0,
    postesVacants: 0,
    agentsActifs: 0,
    concursOuverts: 0,
    agentsRecenses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [
          { count: totalAgents },
          { count: totalStructures },
          { count: postesVacants },
          { count: agentsActifs },
          { count: concursOuverts },
          { count: agentsRecenses },
        ] = await Promise.all([
          supabase.from("agents").select("*", { count: "exact", head: true }),
          supabase.from("structures").select("*", { count: "exact", head: true }),
          supabase.from("postes").select("*", { count: "exact", head: true }).eq("statut", "vacant"),
          supabase.from("agents").select("*", { count: "exact", head: true }).eq("statut", "actif"),
          supabase.from("concours").select("*", { count: "exact", head: true }).eq("statut", "ouvert"),
          supabase
            .from("statut_recensement_agent")
            .select("*", { count: "exact", head: true })
            .eq("statut", "recense"),
        ]);

        setStats({
          totalAgents: totalAgents || 0,
          totalStructures: totalStructures || 0,
          postesVacants: postesVacants || 0,
          agentsActifs: agentsActifs || 0,
          concursOuverts: concursOuverts || 0,
          agentsRecenses: agentsRecenses || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Agents Publics",
      value: stats.totalAgents,
      description: `${stats.agentsActifs} actifs`,
      icon: Users,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-50",
    },
    {
      title: "Structures",
      value: stats.totalStructures,
      description: "Ministères, directions, services",
      icon: Building2,
      iconColor: "text-green-500",
      iconBg: "bg-green-50",
    },
    {
      title: "Postes Vacants",
      value: stats.postesVacants,
      description: "À pourvoir",
      icon: Briefcase,
      iconColor: "text-purple-500",
      iconBg: "bg-purple-50",
    },
    {
      title: "Concours Ouverts",
      value: stats.concursOuverts,
      description: "En cours de recrutement",
      icon: TrendingUp,
      iconColor: "text-orange-500",
      iconBg: "bg-orange-50",
    },
    {
      title: "Agents Recensés",
      value: stats.agentsRecenses,
      description: "Données biométriques validées",
      icon: UserCheck,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
    },
    {
      title: "Alertes",
      value: 0,
      description: "Anomalies à traiter",
      icon: AlertCircle,
      iconColor: "text-red-500",
      iconBg: "bg-red-50",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble de la Fonction Publique Gabonaise
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tableau de bord</h1>
        <p className="text-muted-foreground mt-1">Vue d'ensemble de la Fonction Publique Gabonaise</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="transition-all duration-200 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold text-foreground">{stat.value.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </div>
                  <div className={`rounded-full p-3 ${stat.iconBg}`}>
                    <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="transition-all duration-200 hover:shadow-lg">
          <CardHeader>
            <CardTitle>Activités Récentes</CardTitle>
            <CardDescription>Dernières opérations enregistrées</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground text-center py-8">
              Aucune activité récente
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-lg">
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
            <CardDescription>Raccourcis vers les opérations courantes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-muted-foreground text-center py-8">
              Configuration en cours
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
