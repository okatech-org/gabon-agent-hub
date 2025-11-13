import { useMemo, useState } from "react";
import { History as HistoryIcon, FileText, UserCheck, AlertTriangle, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

type ActivityType = "decision" | "document" | "affectation" | "alerte";

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  detail: string;
  at: string;
}

const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: "a1",
    type: "decision",
    title: "Validation d'actes",
    detail: "Vous avez validé 2 actes administratifs.",
    at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: "a2",
    type: "document",
    title: "Mise à jour d'un document",
    detail: "Le rapport trimestriel a été mis à jour par le cabinet.",
    at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "a3",
    type: "affectation",
    title: "Nouvelle affectation",
    detail: "Affectation approuvée pour un agent au Secrétariat Général.",
    at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "a4",
    type: "alerte",
    title: "Alerte d'anomalie",
    detail: "Écarts détectés sur 2 dossiers d'affectation.",
    at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

function typeIcon(t: ActivityType) {
  if (t === "document") return <FileText className="w-4 h-4 text-muted-foreground" />;
  if (t === "affectation") return <UserCheck className="w-4 h-4 text-info" />;
  if (t === "alerte") return <AlertTriangle className="w-4 h-4 text-amber-600" />;
  return <HistoryIcon className="w-4 h-4 text-primary" />;
}

function typeBadge(t: ActivityType) {
  if (t === "document") return <Badge variant="outline">Document</Badge>;
  if (t === "affectation") return <Badge variant="secondary">Affectation</Badge>;
  if (t === "alerte") return <Badge className="bg-amber-600 text-white">Alerte</Badge>;
  return <Badge>Décision</Badge>;
}

export default function Historique() {
  const [items] = useState<Activity[]>(INITIAL_ACTIVITIES);
  const [tab, setTab] = useState<ActivityType | "all">("all");

  const filtered = useMemo(() => {
    if (tab === "all") return items;
    return items.filter((i) => i.type === tab);
  }, [items, tab]);

  return (
    <div className="w-full p-4 md:p-6">
      <div className="mx-auto w-full max-w-6xl space-y-4">
        <div className="neu-card p-5 md:p-6">
          <div className="flex items-center gap-3">
            <div className="neu-raised w-12 h-12 flex items-center justify-center">
              <HistoryIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Historique</h1>
              <p className="text-sm text-muted-foreground">
                Journal des décisions, documents et opérations
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Tabs
                value={tab}
                onValueChange={(v) => setTab(v as any)}
                className="w-full"
              >
                <TabsList>
                  <TabsTrigger value="all">Tout</TabsTrigger>
                  <TabsTrigger value="decision">Décisions</TabsTrigger>
                  <TabsTrigger value="document">Documents</TabsTrigger>
                  <TabsTrigger value="affectation">Affectations</TabsTrigger>
                  <TabsTrigger value="alerte">Alertes</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Activités récentes</CardTitle>
            <CardDescription>Enregistrements des 24 dernières heures et plus</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[65vh] pr-4">
              <div className="relative pl-6">
                <div className="absolute left-2 top-0 bottom-0 w-px bg-border" />
                <div className="space-y-5">
                  {filtered.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12">
                      Aucune activité à afficher
                    </div>
                  ) : (
                    filtered.map((a, idx) => (
                      <div key={a.id} className="relative">
                        <div className="absolute -left-[7px] top-1">
                          <div className="neu-raised w-4 h-4 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          </div>
                        </div>
                        <div className="neu-inset rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-1">
                            {typeIcon(a.type)}
                            <span className="text-sm font-semibold">{a.title}</span>
                            {typeBadge(a.type)}
                          </div>
                          <p className="text-sm text-muted-foreground">{a.detail}</p>
                          <div className="text-xs text-muted-foreground mt-2">
                            {new Date(a.at).toLocaleString("fr-FR")}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


