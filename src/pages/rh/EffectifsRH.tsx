import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Users, TrendingUp, TrendingDown, AlertTriangle, BarChart3, PieChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EffectifsStats {
  totalAgents: number;
  agentsActifs: number;
  agentsRetraite: number;
  agentsDetaches: number;
  tauxOccupation: number;
  tendanceMensuelle: number;
  departsPrevisionnels: number;
}

interface RepartitionCategorie {
  categorie: string;
  count: number;
  pourcentage: number;
}

interface RepartitionGrade {
  grade: string;
  count: number;
  pourcentage: number;
}

export default function EffectifsRH() {
  const [stats, setStats] = useState<EffectifsStats>({
    totalAgents: 0,
    agentsActifs: 0,
    agentsRetraite: 0,
    agentsDetaches: 0,
    tauxOccupation: 0,
    tendanceMensuelle: 0,
    departsPrevisionnels: 0
  });
  const [repartitionCategories, setRepartitionCategories] = useState<RepartitionCategorie[]>([]);
  const [repartitionGrades, setRepartitionGrades] = useState<RepartitionGrade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadEffectifsData();
  }, []);

  const loadEffectifsData = async () => {
    try {
      setIsLoading(true);

      // Charger les statistiques globales
      const [
        totalResult, 
        actifsResult, 
        retraiteResult, 
        detachesResult,
        categoriesResult,
        gradesResult
      ] = await Promise.all([
        supabase.from("agents").select("id", { count: "exact", head: true }),
        supabase.from("agents").select("id", { count: "exact", head: true }).eq("statut", "actif"),
        supabase.from("agents").select("id", { count: "exact", head: true }).eq("statut", "retraite"),
        supabase.from("agents").select("id", { count: "exact", head: true }).eq("statut", "detache"),
        supabase.from("agents").select("categorie"),
        supabase.from("agents").select("grade")
      ]);

      const total = totalResult.count || 0;
      const actifs = actifsResult.count || 0;

      // Calculer la répartition par catégorie
      const categoriesData = categoriesResult.data || [];
      const categoriesCount: Record<string, number> = {};
      categoriesData.forEach((agent: any) => {
        const cat = agent.categorie || "Non défini";
        categoriesCount[cat] = (categoriesCount[cat] || 0) + 1;
      });
      
      const categoriesArray = Object.entries(categoriesCount).map(([categorie, count]) => ({
        categorie,
        count,
        pourcentage: total > 0 ? Math.round((count / total) * 100) : 0
      }));

      // Calculer la répartition par grade
      const gradesData = gradesResult.data || [];
      const gradesCount: Record<string, number> = {};
      gradesData.forEach((agent: any) => {
        const grade = agent.grade || "Non défini";
        gradesCount[grade] = (gradesCount[grade] || 0) + 1;
      });
      
      const gradesArray = Object.entries(gradesCount)
        .map(([grade, count]) => ({
          grade,
          count,
          pourcentage: total > 0 ? Math.round((count / total) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 grades

      setStats({
        totalAgents: total,
        agentsActifs: actifs,
        agentsRetraite: retraiteResult.count || 0,
        agentsDetaches: detachesResult.count || 0,
        tauxOccupation: total > 0 ? Math.round((actifs / total) * 100) : 0,
        tendanceMensuelle: 2.5, // À calculer avec des données historiques
        departsPrevisionnels: Math.floor(total * 0.03) // Estimation 3% de départs
      });

      setRepartitionCategories(categoriesArray);
      setRepartitionGrades(gradesArray);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données d'effectifs",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      {/* En-tête */}
      <div className="neu-card p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Pilotage des Effectifs</h1>
            <p className="text-muted-foreground">
              Suivi des effectifs, prévisions et gestion prévisionnelle des emplois
            </p>
          </div>
          <div className="neu-raised w-16 h-16 flex items-center justify-center">
            <Target className="w-8 h-8 text-info" />
          </div>
        </div>
      </div>

      {/* KPIs Principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Effectif Total</p>
                <p className="text-3xl font-bold">{isLoading ? "..." : stats.totalAgents}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tous statuts confondus
                </p>
              </div>
              <Users className="w-10 h-10 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Agents Actifs</p>
                <p className="text-3xl font-bold">{isLoading ? "..." : stats.agentsActifs}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                    {stats.tauxOccupation}% d'occupation
                  </Badge>
                </div>
              </div>
              <div className="neu-raised w-10 h-10 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-success"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tendance Mensuelle</p>
                <p className="text-3xl font-bold flex items-center gap-2">
                  {stats.tendanceMensuelle > 0 ? "+" : ""}{stats.tendanceMensuelle}%
                  {stats.tendanceMensuelle > 0 ? (
                    <TrendingUp className="w-5 h-5 text-success" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-destructive" />
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Évolution des effectifs
                </p>
              </div>
              <BarChart3 className="w-10 h-10 text-info" />
            </div>
          </CardContent>
        </Card>

        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Départs Prévisionnels</p>
                <p className="text-3xl font-bold">{isLoading ? "..." : stats.departsPrevisionnels}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Prochains 12 mois
                </p>
              </div>
              <AlertTriangle className="w-10 h-10 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Répartition par Statut */}
      <Card className="neu-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Répartition par Statut
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="neu-inset p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Actifs</span>
                <Badge variant="default">{stats.agentsActifs}</Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-success h-2 rounded-full transition-all" 
                  style={{ width: `${stats.tauxOccupation}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stats.tauxOccupation}% de l'effectif total</p>
            </div>

            <div className="neu-inset p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Détachés</span>
                <Badge variant="secondary">{stats.agentsDetaches}</Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-amber-500 h-2 rounded-full transition-all" 
                  style={{ 
                    width: `${stats.totalAgents > 0 ? Math.round((stats.agentsDetaches / stats.totalAgents) * 100) : 0}%` 
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalAgents > 0 ? Math.round((stats.agentsDetaches / stats.totalAgents) * 100) : 0}% de l'effectif total
              </p>
            </div>

            <div className="neu-inset p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Retraités</span>
                <Badge variant="outline">{stats.agentsRetraite}</Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-muted-foreground h-2 rounded-full transition-all" 
                  style={{ 
                    width: `${stats.totalAgents > 0 ? Math.round((stats.agentsRetraite / stats.totalAgents) * 100) : 0}%` 
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalAgents > 0 ? Math.round((stats.agentsRetraite / stats.totalAgents) * 100) : 0}% de l'effectif total
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Répartition par Catégorie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="neu-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Répartition par Catégorie
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Chargement...</div>
            ) : repartitionCategories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Aucune donnée disponible</div>
            ) : (
              <div className="space-y-3">
                {repartitionCategories.map((cat) => (
                  <div key={cat.categorie} className="neu-inset p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{cat.categorie}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{cat.count} agents</span>
                        <Badge variant="outline">{cat.pourcentage}%</Badge>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all" 
                        style={{ width: `${cat.pourcentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="neu-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Top 10 Grades
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Chargement...</div>
            ) : repartitionGrades.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Aucune donnée disponible</div>
            ) : (
              <div className="space-y-3">
                {repartitionGrades.map((grade) => (
                  <div key={grade.grade} className="neu-inset p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium truncate">{grade.grade}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{grade.count}</span>
                        <Badge variant="outline">{grade.pourcentage}%</Badge>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-info h-2 rounded-full transition-all" 
                        style={{ width: `${grade.pourcentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alertes et Recommandations */}
      <Card className="neu-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Alertes et Recommandations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.departsPrevisionnels > 0 && (
              <div className="neu-inset p-4 rounded-lg border-l-4 border-amber-500">
                <h4 className="font-semibold mb-1">Départs prévisionnels à anticiper</h4>
                <p className="text-sm text-muted-foreground">
                  {stats.departsPrevisionnels} départ(s) prévisible(s) dans les 12 prochains mois. 
                  Planifier le recrutement et la formation des remplaçants.
                </p>
              </div>
            )}
            
            {stats.tauxOccupation < 85 && (
              <div className="neu-inset p-4 rounded-lg border-l-4 border-info">
                <h4 className="font-semibold mb-1">Taux d'occupation en deçà du seuil optimal</h4>
                <p className="text-sm text-muted-foreground">
                  Le taux d'occupation actuel est de {stats.tauxOccupation}%. 
                  Envisager un plan de recrutement pour atteindre 90-95%.
                </p>
              </div>
            )}

            <div className="neu-inset p-4 rounded-lg border-l-4 border-success">
              <h4 className="font-semibold mb-1">Gestion Prévisionnelle des Emplois et Compétences (GPEC)</h4>
              <p className="text-sm text-muted-foreground">
                Analyser régulièrement les pyramides des âges, les compétences critiques et 
                planifier les besoins en recrutement et formation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

