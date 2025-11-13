import { useState } from "react";
import { BarChart3, Download, FileText, TrendingUp, Users, PieChart, Calendar, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, Line, LineChart, Pie, PieChart as RePieChart, Cell, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts";
import { toast } from "@/lib/toast";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const agentsByTypeData = [
  { name: "Fonctionnaires", value: 450, color: "#0088FE" },
  { name: "Contractuels", value: 230, color: "#00C49F" },
  { name: "Stagiaires", value: 85, color: "#FFBB28" },
  { name: "Temporaires", value: 35, color: "#FF8042" },
];

const agentsByGradeData = [
  { grade: "A", count: 280 },
  { grade: "B", count: 320 },
  { grade: "C", count: 150 },
  { grade: "D", count: 50 },
];

const evolutionEffectifsData = [
  { mois: "Janv", effectif: 720 },
  { mois: "Févr", effectif: 735 },
  { mois: "Mars", effectif: 750 },
  { mois: "Avr", effectif: 762 },
  { mois: "Mai", effectif: 775 },
  { mois: "Juin", effectif: 790 },
  { mois: "Juil", effectif: 800 },
];

const actesParMoisData = [
  { mois: "Janv", nominations: 12, mutations: 8, promotions: 15, conges: 45 },
  { mois: "Févr", nominations: 15, mutations: 6, promotions: 12, conges: 38 },
  { mois: "Mars", nominations: 10, mutations: 10, promotions: 18, conges: 52 },
  { mois: "Avr", nominations: 18, mutations: 7, promotions: 14, conges: 48 },
  { mois: "Mai", nominations: 14, mutations: 9, promotions: 16, conges: 55 },
  { mois: "Juin", nominations: 20, mutations: 11, promotions: 20, conges: 60 },
];

export default function RapportsRH() {
  const [periode, setPeriode] = useState("6mois");
  const [exportFormat, setExportFormat] = useState("pdf");

  const handleExport = (type: string) => {
    toast.success(`Export ${type} en format ${exportFormat.toUpperCase()} en cours...`);
  };

  const chartConfig = {
    agents: {
      label: "Agents",
    },
    effectif: {
      label: "Effectif",
    },
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="neu-card p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="neu-raised w-14 h-14 flex items-center justify-center">
              <BarChart3 className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">Rapports & Statistiques</h1>
              <p className="text-muted-foreground">
                Analyses et indicateurs RH
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Agents</p>
                <p className="text-2xl font-bold">800</p>
                <p className="text-xs text-success mt-1">+2.5% ce mois</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Actes générés</p>
                <p className="text-2xl font-bold">143</p>
                <p className="text-xs text-info mt-1">Ce mois</p>
              </div>
              <FileText className="w-8 h-8 text-secondary" />
            </div>
          </CardContent>
        </Card>
        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taux de présence</p>
                <p className="text-2xl font-bold">96.2%</p>
                <p className="text-xs text-success mt-1">+1.1% vs mois dernier</p>
              </div>
              <TrendingUp className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Demandes traitées</p>
                <p className="text-2xl font-bold">87</p>
                <p className="text-xs text-muted-foreground mt-1">Sur 92 demandes</p>
              </div>
              <div className="w-3 h-3 rounded-full bg-info"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card className="neu-card">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <Select value={periode} onValueChange={setPeriode}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1mois">1 mois</SelectItem>
                <SelectItem value="3mois">3 mois</SelectItem>
                <SelectItem value="6mois">6 mois</SelectItem>
                <SelectItem value="1an">1 an</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <Tabs defaultValue="effectifs" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="effectifs">Effectifs</TabsTrigger>
          <TabsTrigger value="repartition">Répartition</TabsTrigger>
          <TabsTrigger value="actes">Actes</TabsTrigger>
          <TabsTrigger value="rapports">Rapports</TabsTrigger>
        </TabsList>

        <TabsContent value="effectifs" className="space-y-6">
          <Card className="neu-card">
            <CardHeader>
              <CardTitle>Évolution des Effectifs</CardTitle>
              <CardDescription>Nombre d'agents sur les 7 derniers mois</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={evolutionEffectifsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mois" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="effectif" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="neu-card">
              <CardHeader>
                <CardTitle>Agents par Grade</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={agentsByGradeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="grade" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="neu-card">
              <CardHeader>
                <CardTitle>Répartition par Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {agentsByTypeData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold">{item.value}</span>
                        <Badge variant="outline">
                          {((item.value / 800) * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="repartition" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="neu-card">
              <CardHeader>
                <CardTitle>Répartition Hommes/Femmes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-blue-500" />
                      <span className="text-sm font-medium">Hommes</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold">480</span>
                      <Badge variant="outline">60%</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-pink-500" />
                      <span className="text-sm font-medium">Femmes</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold">320</span>
                      <Badge variant="outline">40%</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="neu-card">
              <CardHeader>
                <CardTitle>Répartition par Âge</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { range: "20-30 ans", count: 145, color: "bg-green-500" },
                    { range: "31-40 ans", count: 280, color: "bg-blue-500" },
                    { range: "41-50 ans", count: 245, color: "bg-amber-500" },
                    { range: "51-60 ans", count: 130, color: "bg-red-500" },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${item.color}`} />
                        <span className="text-sm font-medium">{item.range}</span>
                      </div>
                      <span className="text-sm font-bold">{item.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="actes" className="space-y-6">
          <Card className="neu-card">
            <CardHeader>
              <CardTitle>Actes Administratifs par Mois</CardTitle>
              <CardDescription>Distribution des différents types d'actes</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={actesParMoisData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mois" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="nominations" fill="#0088FE" name="Nominations" />
                    <Bar dataKey="mutations" fill="#00C49F" name="Mutations" />
                    <Bar dataKey="promotions" fill="#FFBB28" name="Promotions" />
                    <Bar dataKey="conges" fill="#FF8042" name="Congés" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rapports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { titre: "Rapport Mensuel RH", periode: "Janvier 2024", type: "Mensuel" },
              { titre: "Statistiques Trimestrielles", periode: "Q4 2023", type: "Trimestriel" },
              { titre: "Bilan Annuel", periode: "2023", type: "Annuel" },
              { titre: "Analyse des Effectifs", periode: "Décembre 2023", type: "Ponctuel" },
            ].map((rapport, index) => (
              <Card key={index} className="neu-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{rapport.titre}</CardTitle>
                      <CardDescription>{rapport.periode}</CardDescription>
                    </div>
                    <Badge>{rapport.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleExport(rapport.titre)}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Voir
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleExport(rapport.titre)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Télécharger
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

