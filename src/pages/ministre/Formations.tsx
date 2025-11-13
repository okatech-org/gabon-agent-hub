import { useMemo, useState } from "react";
import { GraduationCap, CalendarDays, Clock, Users, Search, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type FormationStatus = "upcoming" | "ongoing" | "completed";

interface Formation {
  id: string;
  title: string;
  description: string;
  status: FormationStatus;
  date: string;
  durationHours: number;
  seats?: number;
  enrolled?: boolean;
  category: string;
}

const INITIAL_FORMATIONS: Formation[] = [
  {
    id: "f1",
    title: "Conduite du changement dans la Fonction Publique",
    description: "Méthodologie, communication et gouvernance du changement.",
    status: "upcoming",
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    durationHours: 3,
    seats: 25,
    enrolled: false,
    category: "Management",
  },
  {
    id: "f2",
    title: "Analyse des données RH avec iAsted",
    description: "Exploiter iAsted pour produire des indicateurs fiables.",
    status: "ongoing",
    date: new Date().toISOString(),
    durationHours: 2,
    seats: 0,
    enrolled: true,
    category: "Numérique",
  },
  {
    id: "f3",
    title: "Cadre réglementaire des affectations",
    description: "Rappels juridiques, procédures et bonnes pratiques.",
    status: "completed",
    date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    durationHours: 2,
    enrolled: true,
    category: "Réglementation",
  },
];

export default function Formations() {
  const [items, setItems] = useState<Formation[]>(INITIAL_FORMATIONS);
  const [tab, setTab] = useState<"catalog" | "my" | "history">("catalog");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category));
    return ["all", ...Array.from(set)];
  }, [items]);

  const filtered = useMemo(() => {
    let base = items;
    if (tab === "my") base = base.filter((i) => i.enrolled);
    if (tab === "history") base = base.filter((i) => i.status === "completed");
    if (category !== "all") base = base.filter((i) => i.category === category);
    if (query.trim()) {
      const q = query.toLowerCase();
      base = base.filter(
        (i) => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
      );
    }
    return base;
  }, [items, tab, query, category]);

  const toggleEnroll = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, enrolled: !i.enrolled } : i))
    );
  };

  return (
    <div className="w-full p-4 md:p-6">
      <div className="mx-auto w-full max-w-6xl space-y-4">
        <div className="neu-card p-5 md:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="neu-raised w-12 h-12 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Formations</h1>
              <p className="text-sm text-muted-foreground">
                Développez les compétences clés au sein du ministère
              </p>
            </div>
          </div>
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
            <TabsList className="neu-inset">
              <TabsTrigger value="catalog">Catalogue</TabsTrigger>
              <TabsTrigger value="my">Mes formations</TabsTrigger>
              <TabsTrigger value="history">Historique</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher une formation..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c === "all" ? "Toutes catégories" : c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={tab} className="w-full">
          <TabsContent value="catalog" className="mt-0">
            <div className="grid gap-4 md:grid-cols-2">
              {filtered.length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center text-muted-foreground">
                    Aucune formation trouvée
                  </CardContent>
                </Card>
              ) : (
                filtered.map((f) => (
                  <Card key={f.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{f.title}</CardTitle>
                        {f.status === "upcoming" && <Badge>À venir</Badge>}
                        {f.status === "ongoing" && <Badge variant="secondary">En cours</Badge>}
                        {f.status === "completed" && (
                          <Badge variant="outline" className="gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Terminé
                          </Badge>
                        )}
                      </div>
                      <CardDescription>{f.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" />
                          {new Date(f.date).toLocaleDateString("fr-FR")}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {f.durationHours}h
                        </div>
                        {typeof f.seats === "number" && (
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {f.seats > 0 ? `${f.seats} places` : "Complet"}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{f.category}</Badge>
                        <Button
                          size="sm"
                          onClick={() => toggleEnroll(f.id)}
                          disabled={f.status === "completed"}
                          variant={f.enrolled ? "outline" : "default"}
                        >
                          {f.enrolled ? "Se désinscrire" : "S'inscrire"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="my">
            <div className="grid gap-4 md:grid-cols-2">
              {filtered.filter((f) => f.enrolled).length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center text-muted-foreground">
                    Vous n'êtes inscrit(e) à aucune formation
                  </CardContent>
                </Card>
              ) : (
                filtered
                  .filter((f) => f.enrolled)
                  .map((f) => (
                    <Card key={f.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{f.title}</CardTitle>
                          {f.status === "ongoing" && <Badge variant="secondary">En cours</Badge>}
                          {f.status === "upcoming" && <Badge>À venir</Badge>}
                        </div>
                        <CardDescription>{f.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" />
                            {new Date(f.date).toLocaleDateString("fr-FR")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {f.durationHours}h
                          </span>
                        </div>
                        <Button size="sm" onClick={() => toggleEnroll(f.id)} variant="outline">
                          Se désinscrire
                        </Button>
                      </CardContent>
                    </Card>
                  ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="grid gap-4 md:grid-cols-2">
              {filtered.filter((f) => f.status === "completed").length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center text-muted-foreground">
                    Aucun historique pour le moment
                  </CardContent>
                </Card>
              ) : (
                filtered
                  .filter((f) => f.status === "completed")
                  .map((f) => (
                    <Card key={f.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{f.title}</CardTitle>
                          <Badge variant="outline" className="gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Terminé
                          </Badge>
                        </div>
                        <CardDescription>{f.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="text-xs text-muted-foreground flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" />
                          {new Date(f.date).toLocaleDateString("fr-FR")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {f.durationHours}h
                        </span>
                      </CardContent>
                    </Card>
                  ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


