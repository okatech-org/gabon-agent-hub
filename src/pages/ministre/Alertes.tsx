import { useMemo, useState } from "react";
import { AlertTriangle, BellRing, Activity, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AlertLevel = "low" | "medium" | "high";
type AlertStatus = "open" | "ack" | "resolved";

interface MinisterAlert {
  id: string;
  title: string;
  detail: string;
  level: AlertLevel;
  status: AlertStatus;
  createdAt: string;
}

const INITIAL_ALERTS: MinisterAlert[] = [
  {
    id: "al1",
    title: "Écart d'affectation détecté",
    detail: "Une affectation ne respecte pas la procédure standard.",
    level: "high",
    status: "open",
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: "al2",
    title: "Retard de validation d'actes",
    detail: "Deux actes dépassent le délai de validation recommandé.",
    level: "medium",
    status: "ack",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "al3",
    title: "Volume atypique de demandes",
    detail: "Pic inhabituel de demandes reçu sur 24h.",
    level: "low",
    status: "resolved",
    createdAt: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
  },
];

function levelBadge(level: AlertLevel) {
  if (level === "high") {
    return <Badge className="bg-destructive text-destructive-foreground">Élevée</Badge>;
  }
  if (level === "medium") {
    return <Badge variant="secondary">Moyenne</Badge>;
  }
  return <Badge variant="outline">Faible</Badge>;
}

export default function Alertes() {
  const [alerts, setAlerts] = useState<MinisterAlert[]>(INITIAL_ALERTS);
  const [tab, setTab] = useState<"open" | "ack" | "resolved" | "all">("open");

  const filtered = useMemo(() => {
    if (tab === "all") return alerts;
    return alerts.filter((a) => a.status === tab);
  }, [alerts, tab]);

  const stats = useMemo(() => {
    return {
      total: alerts.length,
      open: alerts.filter((a) => a.status === "open").length,
      ack: alerts.filter((a) => a.status === "ack").length,
      resolved: alerts.filter((a) => a.status === "resolved").length,
      high: alerts.filter((a) => a.level === "high" && a.status !== "resolved").length,
    };
  }, [alerts]);

  const acknowledge = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: "ack" } : a)));
  };

  const resolve = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: "resolved" } : a)));
  };

  return (
    <div className="w-full p-4 md:p-6">
      <div className="mx-auto w-full max-w-6xl space-y-4">
        <div className="neu-card p-5 md:p-6">
          <div className="flex items-center gap-3">
            <div className="neu-raised w-12 h-12 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Alertes</h1>
              <p className="text-sm text-muted-foreground">
                Suivi des anomalies et points d'attention
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Alertes ouvertes
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-3xl font-bold">{stats.open}</div>
              <BellRing className="w-5 h-5 text-primary" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                En cours de traitement
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-3xl font-bold">{stats.ack}</div>
              <Activity className="w-5 h-5 text-info" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Critiques (non résolues)
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-3xl font-bold">{stats.high}</div>
              <ShieldAlert className="w-5 h-5 text-destructive" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Total alertes
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-3xl font-bold">{stats.total}</div>
              <AlertTriangle className="w-5 h-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
              <TabsList>
                <TabsTrigger value="open">Ouvertes</TabsTrigger>
                <TabsTrigger value="ack">En cours</TabsTrigger>
                <TabsTrigger value="resolved">Résolues</TabsTrigger>
                <TabsTrigger value="all">Toutes</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Liste des alertes</CardTitle>
            <CardDescription>Actions possibles: Accuser réception, Résoudre</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                Aucune alerte à afficher
              </div>
            ) : (
              filtered.map((a) => (
                <div
                  key={a.id}
                  className={`flex items-start gap-3 rounded-lg p-3 transition-all ${
                    a.status === "resolved" ? "neu-inset" : "neu-raised"
                  }`}
                >
                  <div className="mt-1">
                    {a.level === "high" && <AlertTriangle className="w-4 h-4 text-destructive" />}
                    {a.level === "medium" && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                    {a.level === "low" && <AlertTriangle className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold">{a.title}</span>
                      {levelBadge(a.level)}
                      {a.status === "resolved" && (
                        <Badge variant="outline" className="gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Résolue
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{a.detail}</p>
                    <div className="text-xs text-muted-foreground mt-2">
                      {new Date(a.createdAt).toLocaleString("fr-FR")}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {a.status === "open" && (
                      <Button size="sm" variant="outline" onClick={() => acknowledge(a.id)}>
                        Accuser réception
                      </Button>
                    )}
                    {a.status !== "resolved" && (
                      <Button size="sm" onClick={() => resolve(a.id)}>
                        Résoudre
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


