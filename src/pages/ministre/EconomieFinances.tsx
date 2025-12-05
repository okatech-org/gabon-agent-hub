import { useMemo, useState } from "react";
import { DollarSign, TrendingUp, TrendingDown, PieChart, BarChart2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Area,
  AreaChart,
  BarChart,
  Bar,
} from "recharts";

type Period = "6m" | "12m";

const MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];

function buildData(period: Period) {
  const len = period === "6m" ? 6 : 12;
  const nowMonth = new Date().getMonth();
  const data = [];
  for (let i = len - 1; i >= 0; i--) {
    const m = (nowMonth - i + 12) % 12;
    const recettes = 80 + Math.round(Math.random() * 40); // en milliards
    const depenses = 70 + Math.round(Math.random() * 45);
    const execution = Math.max(0, Math.min(100, Math.round((depenses / 120) * 100)));
    data.push({
      mois: MONTHS[m],
      recettes,
      depenses,
      execution,
    });
  }
  return data;
}

export default function EconomieFinances() {
  const [period, setPeriod] = useState<Period>("12m");
  const data = useMemo(() => buildData(period), [period]);

  const kpis = useMemo(() => {
    const totalRecettes = data.reduce((s, d) => s + d.recettes, 0);
    const totalDepenses = data.reduce((s, d) => s + d.depenses, 0);
    const tauxExecution = Math.round((totalDepenses / Math.max(totalRecettes, 1)) * 100);
    const budgetVote = 1200; // milliards (exemple)
    const budgetConsomme = Math.round((budgetVote * tauxExecution) / 100);
    return { totalRecettes, totalDepenses, tauxExecution, budgetVote, budgetConsomme };
  }, [data]);

  return (
    <div className="w-full p-4 md:p-6">
      <div className="mx-auto w-full max-w-7xl space-y-4">
        <div className="neu-card p-5 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="neu-raised w-12 h-12 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Économie & Finances</h1>
                <p className="text-sm text-muted-foreground">
                  Indicateurs budgétaires consolidés (données simulées)
                </p>
              </div>
            </div>
            <div>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as Period)}
                className="h-10 rounded-md border bg-background px-3 text-sm"
              >
                <option value="6m">6 derniers mois</option>
                <option value="12m">12 derniers mois</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-primary/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Budget voté (an.)</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-3xl font-bold">{kpis.budgetVote.toLocaleString()} Md</div>
              <div className="p-2 rounded-full bg-primary/10">
                <PieChart className="w-5 h-5 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-secondary/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Budget consommé (est.)</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-3xl font-bold">{kpis.budgetConsomme.toLocaleString()} Md</div>
              <div className="p-2 rounded-full bg-secondary/10">
                <BarChart2 className="w-5 h-5 text-secondary" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Taux d'exécution</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{kpis.tauxExecution}%</div>
              <div className="p-2 rounded-full bg-green-500/10">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-orange-500/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Solde (recettes - dépenses)</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                {(kpis.totalRecettes - kpis.totalDepenses).toLocaleString()} Md
              </div>
              <div className="p-2 rounded-full bg-orange-500/10">
                <TrendingDown className="w-5 h-5 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="neu-inset">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="depenses">Dépenses</TabsTrigger>
            <TabsTrigger value="recettes">Recettes</TabsTrigger>
            <TabsTrigger value="analyses">Analyses</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Recettes vs Dépenses (mensuel)</CardTitle>
                <CardDescription>Comparaison des flux mensuels</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  className="h-64"
                  config={{
                    recettes: { label: "Recettes", color: "hsl(var(--primary))" },
                    depenses: { label: "Dépenses", color: "hsl(var(--secondary))" },
                  }}
                >
                  <BarChart data={data}>
                    <defs>
                      <linearGradient id="fillRecettes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="fillDepenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="mois" axisLine={false} tickLine={false} tickMargin={10} />
                    <YAxis axisLine={false} tickLine={false} tickMargin={10} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="recettes" fill="url(#fillRecettes)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="depenses" fill="url(#fillDepenses)" radius={[4, 4, 0, 0]} />
                    <ChartLegend content={<ChartLegendContent />} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Taux d'exécution</CardTitle>
                <CardDescription>Évolution mensuelle</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  className="h-64"
                  config={{
                    execution: { label: "Exécution (%)", color: "hsl(var(--info))" },
                  }}
                >
                  <LineChart data={data}>
                    <defs>
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="mois" axisLine={false} tickLine={false} tickMargin={10} />
                    <YAxis axisLine={false} tickLine={false} tickMargin={10} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="execution" stroke="url(#lineGradient)" strokeWidth={3} dot={{ r: 4, fill: "#3b82f6" }} activeDot={{ r: 6 }} />
                    <ChartLegend content={<ChartLegendContent />} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="depenses" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Dépenses par mois</CardTitle>
                <CardDescription>Montants en milliards</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  className="h-72"
                  config={{ depenses: { label: "Dépenses", color: "hsl(var(--secondary))" } }}
                >
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorDepenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="mois" axisLine={false} tickLine={false} tickMargin={10} />
                    <YAxis axisLine={false} tickLine={false} tickMargin={10} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="depenses"
                      stroke="hsl(var(--secondary))"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorDepenses)"
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recettes" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Recettes par mois</CardTitle>
                <CardDescription>Montants en milliards</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  className="h-72"
                  config={{ recettes: { label: "Recettes", color: "hsl(var(--primary))" } }}
                >
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorRecettes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="mois" axisLine={false} tickLine={false} tickMargin={10} />
                    <YAxis axisLine={false} tickLine={false} tickMargin={10} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="recettes"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRecettes)"
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analyses" className="mt-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Synthèse</CardTitle>
                  <CardDescription>Points d’attention</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>• Exécution budgétaire stable sur la période sélectionnée.</p>
                  <p>• Recettes légèrement supérieures aux dépenses en moyenne.</p>
                  <p>• Surveiller les pics de dépenses en fin de trimestre.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Recommandations</CardTitle>
                  <CardDescription>Optimisations possibles</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>• Planifier des engagements lissés pour réduire les pics.</p>
                  <p>• Renforcer le suivi des recettes non-fiscales.</p>
                  <p>• Mettre en place des alertes sur dépassements par chapitre.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


