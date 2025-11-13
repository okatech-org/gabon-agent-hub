import { useMemo, useState } from "react";
import { Bell, CheckCircle2, AlertTriangle, Info, Filter, Search, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

type NotificationLevel = "info" | "warning" | "critical";
type NotificationStatus = "unread" | "read";

interface MinisterNotification {
  id: string;
  title: string;
  description: string;
  level: NotificationLevel;
  status: NotificationStatus;
  createdAt: string;
}

const INITIAL_NOTIFICATIONS: MinisterNotification[] = [
  {
    id: "1",
    title: "Actes administratifs en attente",
    description: "3 actes requièrent votre validation dans les 48h.",
    level: "warning",
    status: "unread",
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    title: "Rapport mensuel disponible",
    description: "Le rapport de performance des structures est prêt à être consulté.",
    level: "info",
    status: "read",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    title: "Anomalies détectées",
    description: "Des écarts ont été détectés dans les affectations récentes.",
    level: "critical",
    status: "unread",
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  },
];

function levelBadge(level: NotificationLevel) {
  if (level === "critical") {
    return <Badge className="bg-destructive text-destructive-foreground">Critique</Badge>;
  }
  if (level === "warning") {
    return <Badge variant="secondary">Alerte</Badge>;
  }
  return <Badge variant="outline">Info</Badge>;
}

function levelIcon(level: NotificationLevel) {
  if (level === "critical") return <AlertTriangle className="w-4 h-4 text-destructive" />;
  if (level === "warning") return <AlertTriangle className="w-4 h-4 text-amber-600" />;
  return <Info className="w-4 h-4 text-muted-foreground" />;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<MinisterNotification[]>(INITIAL_NOTIFICATIONS);
  const [tab, setTab] = useState<"all" | "unread" | "priority">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const byTab = notifications.filter((n) => {
      if (tab === "all") return true;
      if (tab === "unread") return n.status === "unread";
      return n.level !== "info"; // priority = warning + critical
    });
    if (!query.trim()) return byTab;
    const q = query.toLowerCase();
    return byTab.filter(
      (n) => n.title.toLowerCase().includes(q) || n.description.toLowerCase().includes(q)
    );
  }, [notifications, tab, query]);

  const unreadCount = notifications.filter((n) => n.status === "unread").length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, status: "read" })));
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: n.status === "read" ? "unread" : "read" } : n))
    );
  };

  return (
    <div className="w-full p-4 md:p-6">
      <div className="mx-auto w-full max-w-6xl space-y-4">
        <div className="neu-card p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="neu-raised w-12 h-12 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Notifications</h1>
                <p className="text-sm text-muted-foreground">
                  {unreadCount} non lue(s) • {notifications.length} au total
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={markAllAsRead} className="gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Tout marquer comme lu
              </Button>
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher une notification..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
                  <TabsList>
                    <TabsTrigger value="all">Toutes</TabsTrigger>
                    <TabsTrigger value="unread">Non lues</TabsTrigger>
                    <TabsTrigger value="priority">Prioritaires</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Liste des notifications</CardTitle>
            <CardDescription>Dernières activités et messages système</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-3">
                {filtered.length === 0 ? (
                  <div className="text-center text-muted-foreground py-12">
                    Aucune notification à afficher
                  </div>
                ) : (
                  filtered.map((n) => (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 rounded-lg p-3 transition-all ${
                        n.status === "unread" ? "neu-raised" : "neu-inset"
                      }`}
                    >
                      <div className="mt-1">{levelIcon(n.level)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold">{n.title}</span>
                          {levelBadge(n.level)}
                          {n.status === "unread" && (
                            <Badge variant="secondary">Nouveau</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{n.description}</p>
                        <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(n.createdAt).toLocaleString("fr-FR")}
                        </div>
                      </div>
                      <div>
                        <Button size="sm" variant="outline" onClick={() => toggleRead(n.id)}>
                          {n.status === "read" ? "Marquer non lu" : "Marquer lu"}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


