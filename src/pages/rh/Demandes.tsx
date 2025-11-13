import { useState } from "react";
import { ClipboardList, Clock, Check, X, AlertCircle, Eye, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";

interface Demande {
  id: string;
  type: string;
  agent: { nom: string; prenoms: string; matricule: string };
  date_demande: string;
  statut: "en_attente" | "en_cours" | "approuvee" | "rejetee";
  priorite: "normale" | "urgente";
  description: string;
}

const mockDemandes: Demande[] = [
  {
    id: "1",
    type: "Congé annuel",
    agent: { nom: "MBONGO", prenoms: "Jean", matricule: "FP-2023-00123" },
    date_demande: "2024-01-15",
    statut: "en_attente",
    priorite: "normale",
    description: "Demande de congé annuel du 20/02/2024 au 10/03/2024 (15 jours)",
  },
  {
    id: "2",
    type: "Mutation",
    agent: { nom: "OBAME", prenoms: "Marie", matricule: "FP-2022-00456" },
    date_demande: "2024-01-14",
    statut: "en_cours",
    priorite: "urgente",
    description: "Demande de mutation vers la Direction des Ressources Humaines",
  },
  {
    id: "3",
    type: "Attestation de travail",
    agent: { nom: "NGUEMA", prenoms: "Paul", matricule: "FP-2021-00789" },
    date_demande: "2024-01-14",
    statut: "approuvee",
    priorite: "normale",
    description: "Demande d'attestation de travail pour démarches bancaires",
  },
  {
    id: "4",
    type: "Avancement",
    agent: { nom: "NZAMBA", prenoms: "Sophie", matricule: "FP-2020-01234" },
    date_demande: "2024-01-13",
    statut: "en_cours",
    priorite: "normale",
    description: "Demande d'avancement d'échelon (5 ans d'ancienneté)",
  },
];

export default function DemandesRH() {
  const [demandes, setDemandes] = useState<Demande[]>(mockDemandes);
  const [selectedDemande, setSelectedDemande] = useState<Demande | null>(null);
  const [filterType, setFilterType] = useState("tous");
  const [decision, setDecision] = useState("");

  const handleApprove = (id: string) => {
    setDemandes(prev =>
      prev.map(d => d.id === id ? { ...d, statut: "approuvee" as const } : d)
    );
    toast.success("Demande approuvée");
    setSelectedDemande(null);
  };

  const handleReject = (id: string) => {
    if (!decision.trim()) {
      toast.error("Veuillez indiquer le motif du rejet");
      return;
    }
    setDemandes(prev =>
      prev.map(d => d.id === id ? { ...d, statut: "rejetee" as const } : d)
    );
    toast.success("Demande rejetée");
    setSelectedDemande(null);
    setDecision("");
  };

  const handleProcess = (id: string) => {
    setDemandes(prev =>
      prev.map(d => d.id === id ? { ...d, statut: "en_cours" as const } : d)
    );
    toast.success("Demande mise en traitement");
  };

  const filteredDemandes = demandes.filter(d =>
    filterType === "tous" || d.type === filterType
  );

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "en_attente": return <Badge variant="secondary">En attente</Badge>;
      case "en_cours": return <Badge variant="outline" className="bg-blue-50">En cours</Badge>;
      case "approuvee": return <Badge variant="default" className="bg-green-500">Approuvée</Badge>;
      case "rejetee": return <Badge variant="destructive">Rejetée</Badge>;
      default: return <Badge>{statut}</Badge>;
    }
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case "en_attente": return <Clock className="w-5 h-5 text-amber-500" />;
      case "en_cours": return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case "approuvee": return <Check className="w-5 h-5 text-green-500" />;
      case "rejetee": return <X className="w-5 h-5 text-destructive" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const countByStatus = (statut: string) =>
    demandes.filter(d => d.statut === statut).length;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="neu-card p-6">
        <div className="flex items-center gap-4">
          <div className="neu-raised w-14 h-14 flex items-center justify-center">
            <ClipboardList className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-1">Gestion des Demandes</h1>
            <p className="text-muted-foreground">
              Traitement des demandes agents
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{demandes.length}</p>
              </div>
              <ClipboardList className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold">{countByStatus("en_attente")}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En cours</p>
                <p className="text-2xl font-bold">{countByStatus("en_cours")}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approuvées</p>
                <p className="text-2xl font-bold">{countByStatus("approuvee")}</p>
              </div>
              <Check className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="neu-card">
        <CardContent className="pt-6">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Type de demande" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tous">Tous les types</SelectItem>
              <SelectItem value="Congé annuel">Congé annuel</SelectItem>
              <SelectItem value="Mutation">Mutation</SelectItem>
              <SelectItem value="Attestation de travail">Attestation</SelectItem>
              <SelectItem value="Avancement">Avancement</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Demandes List */}
      <Tabs defaultValue="toutes" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="toutes">Toutes</TabsTrigger>
          <TabsTrigger value="en_attente">En attente</TabsTrigger>
          <TabsTrigger value="en_cours">En cours</TabsTrigger>
          <TabsTrigger value="approuvee">Approuvées</TabsTrigger>
          <TabsTrigger value="rejetee">Rejetées</TabsTrigger>
        </TabsList>

        {["toutes", "en_attente", "en_cours", "approuvee", "rejetee"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <div className="space-y-4 mt-6">
              {filteredDemandes
                .filter(d => tab === "toutes" || d.statut === tab)
                .map((demande) => (
                  <Card key={demande.id} className="neu-card">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="neu-raised w-12 h-12 flex items-center justify-center flex-shrink-0">
                            {getStatutIcon(demande.statut)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{demande.type}</h3>
                              {getStatutBadge(demande.statut)}
                              {demande.priorite === "urgente" && (
                                <Badge variant="destructive">Urgent</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              Agent: {demande.agent.nom} {demande.agent.prenoms} ({demande.agent.matricule})
                            </p>
                            <p className="text-sm mb-2">{demande.description}</p>
                            <p className="text-xs text-muted-foreground">
                              Demandé le {new Date(demande.date_demande).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedDemande(demande)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Voir
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Détails de la demande</DialogTitle>
                                <DialogDescription>
                                  {demande.type} - {demande.agent.nom} {demande.agent.prenoms}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Description</Label>
                                  <p className="text-sm mt-1">{demande.description}</p>
                                </div>
                                <div>
                                  <Label>Statut actuel</Label>
                                  <div className="mt-2">{getStatutBadge(demande.statut)}</div>
                                </div>
                                {demande.statut === "en_attente" || demande.statut === "en_cours" ? (
                                  <>
                                    <div>
                                      <Label htmlFor="decision">Décision / Commentaire</Label>
                                      <Textarea
                                        id="decision"
                                        placeholder="Indiquez un commentaire ou motif..."
                                        value={decision}
                                        onChange={(e) => setDecision(e.target.value)}
                                        className="mt-2"
                                        rows={4}
                                      />
                                    </div>
                                    <div className="flex gap-3">
                                      {demande.statut === "en_attente" && (
                                        <Button
                                          variant="outline"
                                          onClick={() => handleProcess(demande.id)}
                                          className="flex-1"
                                        >
                                          <AlertCircle className="w-4 h-4 mr-2" />
                                          Mettre en cours
                                        </Button>
                                      )}
                                      <Button
                                        onClick={() => handleApprove(demande.id)}
                                        className="flex-1"
                                      >
                                        <Check className="w-4 h-4 mr-2" />
                                        Approuver
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        onClick={() => handleReject(demande.id)}
                                        className="flex-1"
                                      >
                                        <X className="w-4 h-4 mr-2" />
                                        Rejeter
                                      </Button>
                                    </div>
                                  </>
                                ) : null}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              {filteredDemandes.filter(d => tab === "toutes" || d.statut === tab).length === 0 && (
                <Card className="neu-card">
                  <CardContent className="py-12 text-center">
                    <ClipboardList className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
                    <p className="text-muted-foreground">Aucune demande dans cette catégorie</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

