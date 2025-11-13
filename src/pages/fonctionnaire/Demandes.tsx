import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ClipboardList, Plus } from "lucide-react";
import { toast } from "@/lib/toast";

type Demande = {
  id: string;
  type: string;
  statut: "en_cours" | "approuvée" | "rejetée";
  detail?: string;
  createdAt: string;
};

const INITIAL: Demande[] = [
  { id: "d1", type: "Congés annuels", statut: "en_cours", createdAt: new Date().toISOString() },
];

export default function Demandes() {
  const [demandes, setDemandes] = useState<Demande[]>(INITIAL);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<string>("");
  const [detail, setDetail] = useState<string>("");

  const submit = () => {
    if (!type) {
      toast.error("Veuillez choisir un type de demande");
      return;
    }
    setDemandes((prev) => [
      { id: crypto.randomUUID(), type, statut: "en_cours", detail, createdAt: new Date().toISOString() },
      ...prev,
    ]);
    setOpen(false);
    setType("");
    setDetail("");
    toast.success("Demande soumise");
  };

  return (
    <div className="w-full p-4 md:p-6">
      <div className="mx-auto w-full max-w-5xl space-y-4">
        <div className="neu-card p-5 md:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="neu-raised w-12 h-12 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Mes Demandes</h1>
              <p className="text-sm text-muted-foreground">
                Soumettre et suivre vos demandes en ligne
              </p>
            </div>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nouvelle demande
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouvelle Demande</DialogTitle>
                <DialogDescription>Renseignez le type et une justification</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Type de demande</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Congés annuels">Congés annuels</SelectItem>
                      <SelectItem value="Permission exceptionnelle">Permission exceptionnelle</SelectItem>
                      <SelectItem value="Mutation">Mutation</SelectItem>
                      <SelectItem value="Mise à jour dossier">Mise à jour dossier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Détails (optionnel)</Label>
                  <Textarea rows={4} value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Justification ou précisions..." />
                </div>
                <div className="flex justify-end">
                  <Button onClick={submit}>Soumettre</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {demandes.map((d) => (
            <Card key={d.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{d.type}</CardTitle>
                    <CardDescription>Soumise le {new Date(d.createdAt).toLocaleDateString("fr-FR")}</CardDescription>
                  </div>
                  <div>
                    {d.statut === "approuvée" && <Badge className="bg-success/10 text-success">Approuvée</Badge>}
                    {d.statut === "rejetée" && <Badge className="bg-destructive text-destructive-foreground">Rejetée</Badge>}
                    {d.statut === "en_cours" && <Badge variant="secondary">En cours</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {d.detail || "Aucun détail fourni."}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}


