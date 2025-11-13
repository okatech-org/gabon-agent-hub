import { useState } from "react";
import { Award, TrendingUp, Users, FileText, Search, Filter, Plus, Eye, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/lib/toast";

interface Agent {
  id: string;
    matricule: string;
    nom: string;
    prenoms: string;
    grade: string;
  echelon: string;
    categorie: string;
  anciennete_grade: number;
  anciennete_echelon: number;
  date_dernier_avancement: string;
  eligible_avancement: boolean;
  eligible_promotion: boolean;
}

const mockAgents: Agent[] = [
  {
    id: "1",
    matricule: "FP-2018-00123",
    nom: "MBONGO",
    prenoms: "Jean-Claude",
    grade: "Attaché Principal",
    echelon: "3",
    categorie: "A",
    anciennete_grade: 6,
    anciennete_echelon: 3,
    date_dernier_avancement: "2021-01-15",
    eligible_avancement: true,
    eligible_promotion: false,
  },
  {
    id: "2",
    matricule: "FP-2016-00456",
    nom: "OBAME",
    prenoms: "Marie-Louise",
    grade: "Secrétaire d'Administration Principal",
    echelon: "5",
    categorie: "B",
    anciennete_grade: 8,
    anciennete_echelon: 2,
    date_dernier_avancement: "2022-03-20",
    eligible_avancement: false,
    eligible_promotion: true,
  },
  {
    id: "3",
    matricule: "FP-2019-00789",
    nom: "NGUEMA",
    prenoms: "Paul",
    grade: "Attaché",
    echelon: "2",
    categorie: "A",
    anciennete_grade: 5,
    anciennete_echelon: 4,
    date_dernier_avancement: "2020-06-10",
    eligible_avancement: true,
    eligible_promotion: false,
  },
];

export default function CarrieresRH() {
  const [agents, setAgents] = useState<Agent[]>(mockAgents);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategorie, setFilterCategorie] = useState("tous");
  const [filterEligibilite, setFilterEligibilite] = useState("tous");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [justification, setJustification] = useState("");

  const handleInitierAvancement = (agent: Agent) => {
    toast.success(`Dossier d'avancement initié pour ${agent.nom} ${agent.prenoms}`);
    setSelectedAgent(null);
    setJustification("");
  };

  const handleInitierPromotion = (agent: Agent) => {
    toast.success(`Dossier de promotion initié pour ${agent.nom} ${agent.prenoms}`);
    setSelectedAgent(null);
    setJustification("");
  };

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = 
      agent.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.prenoms.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.matricule.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategorie = filterCategorie === "tous" || agent.categorie === filterCategorie;
    
    const matchesEligibilite = 
      filterEligibilite === "tous" ||
      (filterEligibilite === "avancement" && agent.eligible_avancement) ||
      (filterEligibilite === "promotion" && agent.eligible_promotion);

    return matchesSearch && matchesCategorie && matchesEligibilite;
  });

  const eligiblesAvancement = agents.filter(a => a.eligible_avancement).length;
  const eligiblesPromotion = agents.filter(a => a.eligible_promotion).length;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="neu-card p-6">
        <div className="flex items-center gap-4">
          <div className="neu-raised w-14 h-14 flex items-center justify-center">
            <Award className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-1">Carrières & Avancements</h1>
            <p className="text-muted-foreground">
              Gestion des parcours professionnels et promotions
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
                <p className="text-sm text-muted-foreground">Agents suivis</p>
                <p className="text-2xl font-bold">{agents.length}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Éligibles avancement</p>
                <p className="text-2xl font-bold">{eligiblesAvancement}</p>
                <p className="text-xs text-success mt-1">Échelon supérieur</p>
              </div>
              <TrendingUp className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Éligibles promotion</p>
                <p className="text-2xl font-bold">{eligiblesPromotion}</p>
                <p className="text-xs text-info mt-1">Grade supérieur</p>
              </div>
              <Award className="w-8 h-8 text-info" />
            </div>
          </CardContent>
        </Card>
        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dossiers en cours</p>
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-muted-foreground mt-1">Commission en attente</p>
              </div>
              <FileText className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="neu-card">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un agent..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategorie} onValueChange={setFilterCategorie}>
              <SelectTrigger>
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Toutes catégories</SelectItem>
                <SelectItem value="A">Catégorie A</SelectItem>
                <SelectItem value="B">Catégorie B</SelectItem>
                <SelectItem value="C">Catégorie C</SelectItem>
                <SelectItem value="D">Catégorie D</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterEligibilite} onValueChange={setFilterEligibilite}>
              <SelectTrigger>
                <SelectValue placeholder="Éligibilité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous</SelectItem>
                <SelectItem value="avancement">Éligibles avancement</SelectItem>
                <SelectItem value="promotion">Éligibles promotion</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="suivi" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="suivi">Suivi Carrières</TabsTrigger>
          <TabsTrigger value="avancements">Avancements</TabsTrigger>
          <TabsTrigger value="promotions">Promotions</TabsTrigger>
          <TabsTrigger value="historique">Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="suivi" className="mt-6">
      <Card className="neu-card">
        <CardHeader>
              <CardTitle>Agents ({filteredAgents.length})</CardTitle>
              <CardDescription>Suivi individuel des parcours professionnels</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Matricule</TableHead>
                      <TableHead>Grade actuel</TableHead>
                      <TableHead>Échelon</TableHead>
                      <TableHead>Ancienneté grade</TableHead>
                      <TableHead>Ancienneté échelon</TableHead>
                      <TableHead>Éligibilité</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredAgents.map((agent) => (
                      <TableRow key={agent.id}>
                        <TableCell className="font-medium">
                          {agent.nom} {agent.prenoms}
                        </TableCell>
                        <TableCell>{agent.matricule}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{agent.categorie}</Badge>
                            <span className="text-sm">{agent.grade}</span>
                          </div>
                        </TableCell>
                        <TableCell>{agent.echelon}</TableCell>
                        <TableCell>{agent.anciennete_grade} ans</TableCell>
                        <TableCell>{agent.anciennete_echelon} ans</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {agent.eligible_avancement && (
                              <Badge className="bg-green-500">Avancement</Badge>
                            )}
                            {agent.eligible_promotion && (
                              <Badge className="bg-blue-500">Promotion</Badge>
                            )}
                            {!agent.eligible_avancement && !agent.eligible_promotion && (
                              <Badge variant="secondary">Non éligible</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedAgent(agent)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Voir
                            </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Dossier Carrière</DialogTitle>
                                <DialogDescription>
                                  {agent.nom} {agent.prenoms} - {agent.matricule}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-muted-foreground">Grade actuel</Label>
                                    <p className="font-medium">{agent.grade}</p>
                                  </div>
                                  <div>
                                    <Label className="text-muted-foreground">Échelon</Label>
                                    <p className="font-medium">{agent.echelon}</p>
                                  </div>
                                  <div>
                                    <Label className="text-muted-foreground">Catégorie</Label>
                                    <Badge>{agent.categorie}</Badge>
                                  </div>
                                  <div>
                                    <Label className="text-muted-foreground">Ancienneté grade</Label>
                                    <p className="font-medium">{agent.anciennete_grade} ans</p>
                                  </div>
                                  <div>
                                    <Label className="text-muted-foreground">Ancienneté échelon</Label>
                                    <p className="font-medium">{agent.anciennete_echelon} ans</p>
                                  </div>
                                  <div>
                                    <Label className="text-muted-foreground">Dernier avancement</Label>
                                    <p className="font-medium">
                                      {new Date(agent.date_dernier_avancement).toLocaleDateString('fr-FR')}
                                    </p>
                                  </div>
                                </div>

                                {(agent.eligible_avancement || agent.eligible_promotion) && (
                                  <>
                                    <div>
                                      <Label htmlFor="justification">Justification / Observations</Label>
                                      <Textarea
                                        id="justification"
                                        placeholder="Motivations, mérites, formations suivies..."
                                        value={justification}
                                        onChange={(e) => setJustification(e.target.value)}
                                        rows={4}
                                        className="mt-2"
                                      />
                                    </div>

                                    <div className="flex gap-3">
                                      {agent.eligible_avancement && (
                                        <Button
                                          onClick={() => handleInitierAvancement(agent)}
                                          className="flex-1"
                                        >
                                          <TrendingUp className="w-4 h-4 mr-2" />
                                          Initier avancement d'échelon
                                </Button>
                                      )}
                                      {agent.eligible_promotion && (
                                        <Button
                                          onClick={() => handleInitierPromotion(agent)}
                                          className="flex-1"
                                          variant="secondary"
                                        >
                                          <Award className="w-4 h-4 mr-2" />
                                          Initier promotion de grade
                                </Button>
                                      )}
                                    </div>
                              </>
                            )}
                          </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="avancements" className="mt-6">
          <Card className="neu-card">
            <CardHeader>
              <CardTitle>Avancements d'Échelon</CardTitle>
              <CardDescription>{eligiblesAvancement} agents éligibles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAgents.filter(a => a.eligible_avancement).map((agent) => (
                  <div key={agent.id} className="neu-card p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{agent.nom} {agent.prenoms}</h4>
                          <Badge variant="outline">{agent.matricule}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {agent.grade} - Échelon {agent.echelon} → Échelon {parseInt(agent.echelon) + 1}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Ancienneté échelon: {agent.anciennete_echelon} ans
                        </p>
                      </div>
                      <Button size="sm">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Initier
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promotions" className="mt-6">
          <Card className="neu-card">
            <CardHeader>
              <CardTitle>Promotions de Grade</CardTitle>
              <CardDescription>{eligiblesPromotion} agents éligibles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAgents.filter(a => a.eligible_promotion).map((agent) => (
                  <div key={agent.id} className="neu-card p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{agent.nom} {agent.prenoms}</h4>
                          <Badge variant="outline">{agent.matricule}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {agent.grade} (Cat. {agent.categorie})
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Ancienneté grade: {agent.anciennete_grade} ans
                        </p>
                      </div>
                      <Button size="sm" variant="secondary">
                        <Award className="w-4 h-4 mr-2" />
                        Initier
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="historique" className="mt-6">
      <Card className="neu-card">
        <CardHeader>
              <CardTitle>Historique des Mouvements</CardTitle>
              <CardDescription>Avancements et promotions traités</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
                {[
                  { agent: "MBONGO Jean", type: "Avancement", from: "Échelon 2", to: "Échelon 3", date: "2024-01-15" },
                  { agent: "OBAME Marie", type: "Promotion", from: "Secrétaire", to: "Secrétaire Principal", date: "2023-12-10" },
                  { agent: "NGUEMA Paul", type: "Avancement", from: "Échelon 1", to: "Échelon 2", date: "2023-11-20" },
                ].map((item, index) => (
                  <div key={index} className="neu-inset p-4 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge>{item.type}</Badge>
                          <span className="font-medium">{item.agent}</span>
            </div>
                        <p className="text-sm text-muted-foreground">
                          {item.from} → {item.to}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(item.date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-green-50">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Validé
                      </Badge>
                    </div>
                  </div>
                ))}
          </div>
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
