import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Clock } from "lucide-react";

type Acte = {
  id: string;
  type: string;
  date: string;
  statut: "signé" | "en_cours";
  url?: string;
};

const SAMPLE: Acte[] = [
  { id: "a1", type: "Nomination", date: new Date().toISOString(), statut: "signé", url: "#" },
  { id: "a2", type: "Mise en congé", date: new Date(Date.now() - 86400000 * 30).toISOString(), statut: "signé", url: "#" },
  { id: "a3", type: "Affectation", date: new Date(Date.now() - 86400000 * 60).toISOString(), statut: "en_cours" },
];

export default function Actes() {
  const [actes] = useState<Acte[]>(SAMPLE);

  return (
    <div className="w-full p-4 md:p-6">
      <div className="mx-auto w-full max-w-5xl space-y-4">
        <div className="neu-card p-5 md:p-6">
          <div className="flex items-center gap-3">
            <div className="neu-raised w-12 h-12 flex items-center justify-center">
              <FileText className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Mes Actes</h1>
              <p className="text-sm text-muted-foreground">
                Téléchargement de vos actes administratifs
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {actes.map((a) => (
            <Card key={a.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{a.type}</CardTitle>
                    <CardDescription>
                      Émis le {new Date(a.date).toLocaleDateString("fr-FR")}
                    </CardDescription>
                  </div>
                  <div>
                    {a.statut === "signé" ? (
                      <Badge>Signé</Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <Clock className="w-3 h-3" />
                        En cours
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {a.statut === "signé"
                    ? "Disponible au téléchargement"
                    : "En cours de finalisation"}
                </div>
                {a.url && (
                  <Button variant="outline" size="sm" onClick={() => window.open(a.url!, "_blank")}>
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}


