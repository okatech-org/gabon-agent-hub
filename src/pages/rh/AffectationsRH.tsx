import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Briefcase, Plus, Eye, Edit, ArrowRightLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Affectation {
  id: string;
  agent_id: string;
  structure_id: string;
  poste_id: string | null;
  date_debut: string;
  date_fin: string | null;
  motif: string | null;
  created_at: string;
}

export default function AffectationsRH() {
  const [affectations, setAffectations] = useState<Affectation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAffectations();
  }, []);

  const loadAffectations = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("affectations")
        .select("*")
        .order("date_debut", { ascending: false });

      if (error) throw error;
      setAffectations(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des affectations",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const affectationsActives = affectations.filter(a => !a.date_fin);
  const affectationsTerminees = affectations.filter(a => a.date_fin);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      {/* En-tête */}
      <div className="neu-card p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gestion des Affectations & Mutations</h1>
            <p className="text-muted-foreground">
              Suivi des affectations et mutations des agents
            </p>
          </div>
          <Link to="/rh/affectations/nouvelle">
            <Button size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              Nouvelle Affectation
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Affectations</p>
                <p className="text-2xl font-bold">{affectations.length}</p>
              </div>
              <Briefcase className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En Cours</p>
                <p className="text-2xl font-bold">{affectationsActives.length}</p>
              </div>
              <div className="w-3 h-3 rounded-full bg-success"></div>
            </div>
          </CardContent>
        </Card>
        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Terminées</p>
                <p className="text-2xl font-bold">{affectationsTerminees.length}</p>
              </div>
              <div className="w-3 h-3 rounded-full bg-muted"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Affectations actives */}
      <Card className="neu-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-success" />
            Affectations Actives ({affectationsActives.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Chargement des affectations...
            </div>
          ) : affectationsActives.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune affectation active
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Structure</TableHead>
                    <TableHead>Poste</TableHead>
                    <TableHead>Date Début</TableHead>
                    <TableHead>Motif</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {affectationsActives.map((affectation) => (
                    <TableRow key={affectation.id}>
                      <TableCell className="font-medium">
                        {affectation.agent_id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        {affectation.structure_id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        {affectation.poste_id ? affectation.poste_id.substring(0, 8) + "..." : "N/A"}
                      </TableCell>
                      <TableCell>
                        {format(new Date(affectation.date_debut), "dd/MM/yyyy", { locale: fr })}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {affectation.motif || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">Active</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
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

      {/* Historique des affectations */}
      <Card className="neu-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-muted-foreground" />
            Historique des Affectations ({affectationsTerminees.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {affectationsTerminees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune affectation terminée
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Structure</TableHead>
                    <TableHead>Date Début</TableHead>
                    <TableHead>Date Fin</TableHead>
                    <TableHead>Durée</TableHead>
                    <TableHead>Motif</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {affectationsTerminees.slice(0, 10).map((affectation) => {
                    const duree = affectation.date_fin
                      ? Math.ceil(
                          (new Date(affectation.date_fin).getTime() -
                            new Date(affectation.date_debut).getTime()) /
                            (1000 * 60 * 60 * 24 * 30)
                        )
                      : 0;
                    
                    return (
                      <TableRow key={affectation.id}>
                        <TableCell className="font-medium">
                          {affectation.agent_id.substring(0, 8)}...
                        </TableCell>
                        <TableCell>
                          {affectation.structure_id.substring(0, 8)}...
                        </TableCell>
                        <TableCell>
                          {format(new Date(affectation.date_debut), "dd/MM/yyyy", { locale: fr })}
                        </TableCell>
                        <TableCell>
                          {affectation.date_fin
                            ? format(new Date(affectation.date_fin), "dd/MM/yyyy", { locale: fr })
                            : "-"}
                        </TableCell>
                        <TableCell>{duree} mois</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {affectation.motif || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
