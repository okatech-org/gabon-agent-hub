import { useState } from "react";
import { Target, TrendingUp, Users, AlertTriangle, BarChart3, Calendar, Building2, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { toast } from "@/lib/toast";

const effectifsParStructure = [
  { structure: "Direction Générale", effectif_actuel: 45, effectif_cible: 50, taux: 90 },
  { structure: "Direction RH", effectif_actuel: 82, effectif_cible: 85, taux: 96 },
  { structure: "Direction Financière", effectif_actuel: 58, effectif_cible: 60, taux: 97 },
  { structure: "Services Techniques", effectif_actuel: 120, effectif_cible: 150, taux: 80 },
  { structure: "Services Administratifs", effectif_actuel: 95, effectif_cible: 100, taux: 95 },
];

const evolutionEffectifs = [
  { mois: "Jan", reel: 385, previsionnel: 390, cible: 395 },
  { mois: "Fév", reel: 390, previsionnel: 395, cible: 400 },
  { mois: "Mar", reel: 392, previsionnel: 400, cible: 405 },
  { mois: "Avr", reel: 395, previsionnel: 405, cible: 410 },
  { mois: "Mai", reel: 400, previsionnel: 410, cible: 415 },
  { mois: "Juin", reel: 400, previsionnel: 415, cible: 420 },
];

const mouvementsPrevisionnels = [
  { mois: "Jan", entrees: 8, sorties: 3, mutation_interne: 5 },
  { mois: "Fév", entrees: 10, sorties: 5, mutation_interne: 7 },
  { mois: "Mar", entrees: 5, sorties: 3, mutation_interne: 4 },
  { mois: "Avr", entrees: 12, sorties: 7, mutation_interne: 6 },
  { mois: "Mai", entrees: 8, sorties: 3, mutation_interne: 5 },
  { mois: "Juin", entrees: 6, sorties: 6, mutation_interne: 8 },
];

export default function EffectifsRH() {
  const [periode, setPeriode] = useState("6mois");
  const [viewType, setViewType] = useState("structure");

  const handleExport = () => {
    toast.success("Export du rapport de pilotage en cours...");
  };

  const chartConfig = {
    effectifs: {
      label: "Effectifs",
    },
  };

  const effectifTotal = effectifsParStructure.reduce((sum, s) => sum + s.effectif_actuel, 0);
  const effectifCibleTotal = effectifsParStructure.reduce((sum, s) => sum + s.effectif_cible, 0);
  const tauxCouverture = Math.round((effectifTotal / effectifCibleTotal) * 100);
  const ecartEffectif = effectifCibleTotal - effectifTotal;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="neu-card p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="neu-raised w-14 h-14 flex items-center justify-center">
              <Target className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">Pilotage des Effectifs</h1>
              <p className="text-muted-foreground">
                Suivi et planification des ressources humaines
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={periode} onValueChange={setPeriode}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3mois">3 mois</SelectItem>
                <SelectItem value="6mois">6 mois</SelectItem>
                <SelectItem value="1an">1 an</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Effectif Actuel</p>
                <p className="text-2xl font-bold">{effectifTotal}</p>
                <p className="text-xs text-muted-foreground mt-1">agents</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Effectif Cible</p>
                <p className="text-2xl font-bold">{effectifCibleTotal}</p>
                <p className="text-xs text-muted-foreground mt-1">agents</p>
              </div>
              <Target className="w-8 h-8 text-secondary" />
            </div>
          </CardContent>
        </Card>
        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taux de Couverture</p>
                <p className="text-2xl font-bold">{tauxCouverture}%</p>
                <Progress value={tauxCouverture} className="mt-2" />
              </div>
              <TrendingUp className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Écart</p>
                <p className="text-2xl font-bold">{ecartEffectif}</p>
                <p className="text-xs text-amber-500 mt-1">postes à pourvoir</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="repartition" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="repartition">Répartition</TabsTrigger>
          <TabsTrigger value="evolution">Évolution</TabsTrigger>
          <TabsTrigger value="previsions">Prévisions</TabsTrigger>
          <TabsTrigger value="alertes">Alertes</TabsTrigger>
        </TabsList>

        <TabsContent value="repartition" className="mt-6 space-y-6">
          <Card className="neu-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Effectifs par Structure</CardTitle>
                  <CardDescription>Comparaison effectif actuel vs cible</CardDescription>
                </div>
                <Select value={viewType} onValueChange={setViewType}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="structure">Par Structure</SelectItem>
                    <SelectItem value="categorie">Par Catégorie</SelectItem>
                    <SelectItem value="grade">Par Grade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={effectifsParStructure}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="structure" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="effectif_actuel" fill="hsl(var(--primary))" name="Effectif actuel" />
                    <Bar dataKey="effectif_cible" fill="hsl(var(--secondary))" name="Effectif cible" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4">
            {effectifsParStructure.map((item, index) => (
              <Card key={index} className="neu-card">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="neu-raised w-10 h-10 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{item.structure}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.effectif_actuel} / {item.effectif_cible} agents
                        </p>
                      </div>
                    </div>
                    <Badge variant={item.taux >= 95 ? "default" : item.taux >= 85 ? "secondary" : "destructive"}>
                      {item.taux}%
                    </Badge>
                  </div>
                  <Progress value={item.taux} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>Écart: {item.effectif_cible - item.effectif_actuel} postes</span>
                    <span>{item.taux}% de couverture</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="evolution" className="mt-6">
          <Card className="neu-card">
            <CardHeader>
              <CardTitle>Évolution des Effectifs</CardTitle>
              <CardDescription>Suivi réel vs prévisionnel vs cible</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={evolutionEffectifs}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mois" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="reel" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name="Effectif réel"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="previsionnel" 
                      stroke="hsl(var(--secondary))" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Prévisionnel"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cible" 
                      stroke="hsl(var(--success))" 
                      strokeWidth={2}
                      strokeDasharray="3 3"
                      name="Cible"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="previsions" className="mt-6">
          <Card className="neu-card">
            <CardHeader>
              <CardTitle>Mouvements Prévisionnels</CardTitle>
              <CardDescription>Entrées, sorties et mutations internes</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mouvementsPrevisionnels}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mois" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="entrees" fill="#22c55e" name="Entrées" />
                    <Bar dataKey="sorties" fill="#ef4444" name="Sorties" />
                    <Bar dataKey="mutation_interne" fill="#3b82f6" name="Mutations internes" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card className="neu-card">
              <CardHeader>
                <CardTitle className="text-lg">Recrutements Planifiés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { poste: "Attaché d'Administration", nb: 5, date: "T2 2024" },
                    { poste: "Secrétaire", nb: 3, date: "T2 2024" },
                    { poste: "Technicien", nb: 8, date: "T3 2024" },
                  ].map((item, index) => (
                    <div key={index} className="neu-inset p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{item.poste}</span>
                        <Badge>{item.nb}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="neu-card">
              <CardHeader>
                <CardTitle className="text-lg">Départs Prévisibles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { motif: "Retraite", nb: 6, date: "T2 2024" },
                    { motif: "Démission", nb: 2, date: "T2 2024" },
                    { motif: "Fin de contrat", nb: 4, date: "T3 2024" },
                  ].map((item, index) => (
                    <div key={index} className="neu-inset p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{item.motif}</span>
                        <Badge variant="destructive">{item.nb}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="neu-card">
              <CardHeader>
                <CardTitle className="text-lg">Mobilité Interne</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { type: "Mutations demandées", nb: 12, statut: "En cours" },
                    { type: "Affectations programmées", nb: 8, statut: "Validées" },
                    { type: "Détachements", nb: 3, statut: "En attente" },
                  ].map((item, index) => (
                    <div key={index} className="neu-inset p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{item.type}</span>
                        <Badge variant="outline">{item.nb}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.statut}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alertes" className="mt-6">
          <div className="space-y-4">
            {[
              {
                type: "warning",
                titre: "Sous-effectif critique",
                message: "Services Techniques : 20 postes vacants (taux de couverture 80%)",
                structure: "Services Techniques",
              },
              {
                type: "info",
                titre: "Départs en retraite prochains",
                message: "6 agents partent à la retraite au T2 2024. Planifier les remplacements.",
                structure: "Multiple",
              },
              {
                type: "warning",
                titre: "Mobilité interne élevée",
                message: "12 demandes de mutation en attente. Impact sur la répartition des effectifs.",
                structure: "Direction RH",
              },
              {
                type: "success",
                titre: "Objectif atteint",
                message: "Direction Financière : taux de couverture 97% (objectif: 95%)",
                structure: "Direction Financière",
              },
            ].map((alerte, index) => (
              <Card key={index} className="neu-card">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className={`neu-raised w-10 h-10 flex items-center justify-center flex-shrink-0 ${
                      alerte.type === "warning" ? "text-amber-500" : 
                      alerte.type === "success" ? "text-success" : 
                      "text-info"
                    }`}>
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{alerte.titre}</h4>
                        <Badge variant="outline">{alerte.structure}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{alerte.message}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Traiter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
