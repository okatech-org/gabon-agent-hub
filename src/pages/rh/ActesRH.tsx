import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, FilePlus, Eye, Edit, Download, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Acte {
  id: string;
  numero_acte: string;
  type_acte: string;
  objet: string;
  statut: string;
  date_creation: string;
  date_signature: string | null;
  agent_id: string;
}

export default function ActesRH() {
  const [actes, setActes] = useState<Acte[]>([]);
  const [filterStatut, setFilterStatut] = useState<string>("tous");
  const [filterType, setFilterType] = useState<string>("tous");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadActes();
  }, []);

  const loadActes = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("actes_administratifs")
        .select("*")
        .order("date_creation", { ascending: false });

      if (error) throw error;
      setActes(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des actes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredActes = actes.filter((acte) => {
    if (filterStatut !== "tous" && acte.statut !== filterStatut) return false;
    if (filterType !== "tous" && acte.type_acte !== filterType) return false;
    return true;
  });

  const getStatutBadgeVariant = (statut: string) => {
    switch (statut) {
      case "signe":
        return "default";
      case "brouillon":
        return "secondary";
      case "en_attente":
        return "outline";
      case "annule":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const typesActes = [
    { value: "nomination", label: "Nomination" },
    { value: "avancement", label: "Avancement" },
    { value: "mutation", label: "Mutation" },
    { value: "affectation", label: "Affectation" },
    { value: "promotion", label: "Promotion" },
    { value: "conge", label: "Congé" },
    { value: "mise_disponibilite", label: "Mise en disponibilité" },
    { value: "retraite", label: "Retraite" }
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      {/* En-tête */}
      <div className="neu-card p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gestion des Actes Administratifs</h1>
            <p className="text-muted-foreground">
              Génération et suivi des actes de carrière
            </p>
          </div>
          <Link to="/rh/actes/nouveau">
            <Button size="lg" className="gap-2">
              <FilePlus className="w-5 h-5" />
              Générer un Acte
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Actes</p>
                <p className="text-2xl font-bold">{actes.length}</p>
              </div>
              <FileText className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Brouillon</p>
                <p className="text-2xl font-bold">
                  {actes.filter((a) => a.statut === "brouillon").length}
                </p>
              </div>
              <div className="w-3 h-3 rounded-full bg-secondary"></div>
            </div>
          </CardContent>
        </Card>
        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En Attente</p>
                <p className="text-2xl font-bold">
                  {actes.filter((a) => a.statut === "en_attente").length}
                </p>
              </div>
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            </div>
          </CardContent>
        </Card>
        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Signés</p>
                <p className="text-2xl font-bold">
                  {actes.filter((a) => a.statut === "signe").length}
                </p>
              </div>
              <div className="w-3 h-3 rounded-full bg-success"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card className="neu-card">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={filterStatut} onValueChange={setFilterStatut}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les statuts</SelectItem>
                <SelectItem value="brouillon">Brouillon</SelectItem>
                <SelectItem value="en_attente">En attente</SelectItem>
                <SelectItem value="signe">Signé</SelectItem>
                <SelectItem value="annule">Annulé</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les types</SelectItem>
                {typesActes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des actes */}
      <Card className="neu-card">
        <CardHeader>
          <CardTitle>Liste des Actes ({filteredActes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Chargement des actes...
            </div>
          ) : filteredActes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun acte trouvé
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numéro</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Objet</TableHead>
                    <TableHead>Date Création</TableHead>
                    <TableHead>Date Signature</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActes.map((acte) => (
                    <TableRow key={acte.id}>
                      <TableCell className="font-medium">
                        {acte.numero_acte || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{acte.type_acte}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{acte.objet}</TableCell>
                      <TableCell>
                        {acte.date_creation
                          ? format(new Date(acte.date_creation), "dd/MM/yyyy", { locale: fr })
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {acte.date_signature
                          ? format(new Date(acte.date_signature), "dd/MM/yyyy", { locale: fr })
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatutBadgeVariant(acte.statut)}>
                          {acte.statut}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {acte.statut === "brouillon" && (
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          {acte.statut === "signe" && (
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                          {acte.statut === "brouillon" && (
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          )}
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
