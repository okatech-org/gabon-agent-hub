import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Search, Eye, Edit, FileText, Users, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Agent {
  id: string;
  matricule: string;
  nom: string;
  prenoms: string;
  email: string;
  telephone: string;
  grade: string;
  categorie: string;
  statut: string;
  type_agent: string;
  created_at: string;
}

export default function AgentsRH() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatut, setFilterStatut] = useState<string>("tous");
  const [filterType, setFilterType] = useState<string>("tous");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAgents();
  }, []);

  useEffect(() => {
    filterAgents();
  }, [agents, searchTerm, filterStatut, filterType]);

  const loadAgents = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("agents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAgents(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des agents",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterAgents = () => {
    let filtered = [...agents];

    // Filtre par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (agent) =>
          agent.matricule?.toLowerCase().includes(term) ||
          agent.nom?.toLowerCase().includes(term) ||
          agent.prenoms?.toLowerCase().includes(term) ||
          agent.email?.toLowerCase().includes(term)
      );
    }

    // Filtre par statut
    if (filterStatut !== "tous") {
      filtered = filtered.filter((agent) => agent.statut === filterStatut);
    }

    // Filtre par type
    if (filterType !== "tous") {
      filtered = filtered.filter((agent) => agent.type_agent === filterType);
    }

    setFilteredAgents(filtered);
  };

  const getStatutBadgeVariant = (statut: string) => {
    switch (statut) {
      case "actif":
        return "default";
      case "suspendu":
        return "secondary";
      case "retraite":
        return "outline";
      case "detache":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      {/* En-tête */}
      <div className="neu-card p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gestion des Agents</h1>
            <p className="text-muted-foreground">
              Consultation et gestion des dossiers des agents publics
            </p>
          </div>
          <Link to="/rh/agents/nouveau">
            <Button size="lg" className="gap-2">
              <UserPlus className="w-5 h-5" />
              Nouvel Agent
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Agents</p>
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
                <p className="text-sm text-muted-foreground">Actifs</p>
                <p className="text-2xl font-bold">
                  {agents.filter((a) => a.statut === "actif").length}
                </p>
              </div>
              <div className="w-3 h-3 rounded-full bg-success"></div>
            </div>
          </CardContent>
        </Card>
        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Titulaires</p>
                <p className="text-2xl font-bold">
                  {agents.filter((a) => a.type_agent === "titulaire").length}
                </p>
              </div>
              <div className="w-3 h-3 rounded-full bg-info"></div>
            </div>
          </CardContent>
        </Card>
        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Contractuels</p>
                <p className="text-2xl font-bold">
                  {agents.filter((a) => a.type_agent === "contractuel").length}
                </p>
              </div>
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card className="neu-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Recherche et Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher (matricule, nom, email...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterStatut} onValueChange={setFilterStatut}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les statuts</SelectItem>
                <SelectItem value="actif">Actif</SelectItem>
                <SelectItem value="suspendu">Suspendu</SelectItem>
                <SelectItem value="retraite">Retraité</SelectItem>
                <SelectItem value="detache">Détaché</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les types</SelectItem>
                <SelectItem value="titulaire">Titulaire</SelectItem>
                <SelectItem value="contractuel">Contractuel</SelectItem>
                <SelectItem value="stagiaire">Stagiaire</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des agents */}
      <Card className="neu-card">
        <CardHeader>
          <CardTitle>
            Liste des Agents ({filteredAgents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Chargement des agents...
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun agent trouvé
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Matricule</TableHead>
                    <TableHead>Nom & Prénoms</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAgents.map((agent) => (
                    <TableRow key={agent.id}>
                      <TableCell className="font-medium">{agent.matricule}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{agent.nom}</p>
                          <p className="text-sm text-muted-foreground">{agent.prenoms}</p>
                        </div>
                      </TableCell>
                      <TableCell>{agent.grade || "N/A"}</TableCell>
                      <TableCell>{agent.categorie || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{agent.type_agent}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatutBadgeVariant(agent.statut)}>
                          {agent.statut}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Link to={`/rh/agents/${agent.id}/modifier`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm">
                            <FileText className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
