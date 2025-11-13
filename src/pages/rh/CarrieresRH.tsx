import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Award, TrendingUp, Users, CheckCircle, Clock, XCircle, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface DossierAvancement {
  id: string;
  agent_id: string;
  agent?: {
    matricule: string;
    nom: string;
    prenoms: string;
    grade: string;
    categorie: string;
  };
  type_avancement: string;
  grade_actuel: string;
  grade_propose: string;
  date_demande: string;
  statut: "en_attente" | "approuve" | "rejete" | "en_cours";
  date_traitement?: string;
  observations?: string;
}

export default function CarrieresRH() {
  const [dossiers, setDossiers] = useState<DossierAvancement[]>([]);
  const [filterStatut, setFilterStatut] = useState<string>("tous");
  const [filterType, setFilterType] = useState<string>("tous");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDossiers();
  }, []);

  const loadDossiers = async () => {
    try {
      setIsLoading(true);
      // Pour l'instant, on simule avec les actes de type avancement
      const { data, error } = await supabase
        .from("actes_administratifs")
        .select(`
          id,
          agent_id,
          type_acte,
          statut,
          date_creation,
          date_signature,
          objet,
          agents (
            matricule,
            nom,
            prenoms,
            grade,
            categorie
          )
        `)
        .eq("type_acte", "avancement")
        .order("date_creation", { ascending: false });

      if (error) throw error;

      // Transformer les données pour correspondre à notre interface
      const transformedData = (data || []).map((acte: any) => ({
        id: acte.id,
        agent_id: acte.agent_id,
        agent: acte.agents,
        type_avancement: acte.type_acte,
        grade_actuel: acte.agents?.grade || "N/A",
        grade_propose: "Grade supérieur", // À implémenter avec une vraie logique
        date_demande: acte.date_creation,
        statut: acte.statut === "signe" ? "approuve" : acte.statut === "brouillon" ? "en_attente" : "en_cours",
        date_traitement: acte.date_signature,
        observations: acte.objet
      }));

      setDossiers(transformedData);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les dossiers d'avancement",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDossiers = dossiers.filter((dossier) => {
    if (filterStatut !== "tous" && dossier.statut !== filterStatut) return false;
    if (filterType !== "tous" && dossier.type_avancement !== filterType) return false;
    return true;
  });

  const getStatutBadge = (statut: string) => {
    const badges = {
      en_attente: { variant: "secondary" as const, label: "En attente", icon: Clock },
      en_cours: { variant: "outline" as const, label: "En cours", icon: Clock },
      approuve: { variant: "default" as const, label: "Approuvé", icon: CheckCircle },
      rejete: { variant: "destructive" as const, label: "Rejeté", icon: XCircle }
    };
    return badges[statut as keyof typeof badges] || badges.en_attente;
  };

  const stats = {
    total: dossiers.length,
    enAttente: dossiers.filter(d => d.statut === "en_attente").length,
    enCours: dossiers.filter(d => d.statut === "en_cours").length,
    approuves: dossiers.filter(d => d.statut === "approuve").length,
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      {/* En-tête */}
      <div className="neu-card p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gestion des Carrières et Avancements</h1>
            <p className="text-muted-foreground">
              Pilotage des promotions, avancements et évolutions de carrière des agents
            </p>
          </div>
          <div className="neu-raised w-16 h-16 flex items-center justify-center">
            <Award className="w-8 h-8 text-success" />
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Dossiers</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Award className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En Attente</p>
                <p className="text-2xl font-bold">{stats.enAttente}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En Cours</p>
                <p className="text-2xl font-bold">{stats.enCours}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-info" />
            </div>
          </CardContent>
        </Card>
        <Card className="neu-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approuvés</p>
                <p className="text-2xl font-bold">{stats.approuves}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card className="neu-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={filterStatut} onValueChange={setFilterStatut}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les statuts</SelectItem>
                <SelectItem value="en_attente">En attente</SelectItem>
                <SelectItem value="en_cours">En cours</SelectItem>
                <SelectItem value="approuve">Approuvé</SelectItem>
                <SelectItem value="rejete">Rejeté</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les types</SelectItem>
                <SelectItem value="avancement">Avancement</SelectItem>
                <SelectItem value="promotion">Promotion</SelectItem>
                <SelectItem value="reclassement">Reclassement</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des dossiers */}
      <Card className="neu-card">
        <CardHeader>
          <CardTitle>Dossiers d'Avancement ({filteredDossiers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Chargement des dossiers...
            </div>
          ) : filteredDossiers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucun dossier d'avancement trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Matricule</TableHead>
                    <TableHead>Grade Actuel</TableHead>
                    <TableHead>Grade Proposé</TableHead>
                    <TableHead>Date Demande</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDossiers.map((dossier) => {
                    const statutBadge = getStatutBadge(dossier.statut);
                    const StatusIcon = statutBadge.icon;
                    return (
                      <TableRow key={dossier.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{dossier.agent?.nom}</p>
                            <p className="text-sm text-muted-foreground">{dossier.agent?.prenoms}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {dossier.agent?.matricule || "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{dossier.grade_actuel}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                            {dossier.grade_propose}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(dossier.date_demande), "dd/MM/yyyy", { locale: fr })}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statutBadge.variant} className="flex items-center gap-1 w-fit">
                            <StatusIcon className="w-3 h-3" />
                            {statutBadge.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              Examiner
                            </Button>
                            {dossier.statut === "en_attente" && (
                              <>
                                <Button variant="default" size="sm" className="bg-success hover:bg-success/90">
                                  Approuver
                                </Button>
                                <Button variant="destructive" size="sm">
                                  Rejeter
                                </Button>
                              </>
                            )}
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

      {/* Informations complémentaires */}
      <Card className="neu-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Recommandations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="neu-inset p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Critères d'avancement</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Ancienneté requise dans le grade</li>
                <li>• Évaluation des performances</li>
                <li>• Formation continue</li>
                <li>• Disponibilité des postes dans le grade supérieur</li>
              </ul>
            </div>
            {stats.enAttente > 0 && (
              <div className="neu-inset p-4 rounded-lg border-l-4 border-amber-500">
                <p className="text-sm">
                  <span className="font-semibold">{stats.enAttente} dossier(s)</span> nécessite(nt) votre validation pour avancement.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

