import { useState } from "react";
import { Search, Filter, X, FileText, User, Calendar, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface SearchFilters {
  nom: string;
  matricule: string;
  typeAgent: string;
  statut: string;
  grade: string;
  categorie: string;
  sexe: string;
  structure: string;
}

const mockResults = [
  {
    id: "1",
    matricule: "FP-2023-00123",
    nom: "MBONGO",
    prenoms: "Jean-Claude",
    typeAgent: "Fonctionnaire",
    grade: "Attaché Principal",
    categorie: "A",
    statut: "Actif",
    structure: "Direction des Affaires Générales",
    sexe: "M",
  },
  {
    id: "2",
    matricule: "FP-2022-00456",
    nom: "OBAME",
    prenoms: "Marie-Louise",
    typeAgent: "Fonctionnaire",
    grade: "Secrétaire d'Administration",
    categorie: "B",
    statut: "Actif",
    structure: "Secrétariat Général",
    sexe: "F",
  },
];

export default function RechercheRH() {
  const [filters, setFilters] = useState<SearchFilters>({
    nom: "",
    matricule: "",
    typeAgent: "tous",
    statut: "tous",
    grade: "tous",
    categorie: "tous",
    sexe: "tous",
    structure: "tous",
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    setIsSearching(true);
    // Simulate search
    setTimeout(() => {
      setSearchResults(mockResults);
      setIsSearching(false);
    }, 500);
  };

  const handleReset = () => {
    setFilters({
      nom: "",
      matricule: "",
      typeAgent: "tous",
      statut: "tous",
      grade: "tous",
      categorie: "tous",
      sexe: "tous",
      structure: "tous",
    });
    setSearchResults([]);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="neu-card p-6">
        <div className="flex items-center gap-4">
          <div className="neu-raised w-14 h-14 flex items-center justify-center">
            <Search className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-1">Recherche Avancée</h1>
            <p className="text-muted-foreground">
              Rechercher un agent avec des critères multiples
            </p>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <Card className="neu-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Critères de Recherche</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Filter className="w-4 h-4 mr-2" />
              {showAdvanced ? "Masquer" : "Afficher"} filtres avancés
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Search */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom de l'agent</Label>
              <Input
                id="nom"
                placeholder="Entrez le nom..."
                value={filters.nom}
                onChange={(e) => setFilters({ ...filters, nom: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="matricule">Matricule</Label>
              <Input
                id="matricule"
                placeholder="Ex: FP-2023-00123"
                value={filters.matricule}
                onChange={(e) => setFilters({ ...filters, matricule: e.target.value })}
              />
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Type d'agent</Label>
                  <Select value={filters.typeAgent} onValueChange={(v) => setFilters({ ...filters, typeAgent: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tous">Tous</SelectItem>
                      <SelectItem value="fonctionnaire">Fonctionnaire</SelectItem>
                      <SelectItem value="contractuel">Contractuel</SelectItem>
                      <SelectItem value="stagiaire">Stagiaire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Statut</Label>
                  <Select value={filters.statut} onValueChange={(v) => setFilters({ ...filters, statut: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tous">Tous</SelectItem>
                      <SelectItem value="actif">Actif</SelectItem>
                      <SelectItem value="suspendu">Suspendu</SelectItem>
                      <SelectItem value="retraite">Retraité</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Catégorie</Label>
                  <Select value={filters.categorie} onValueChange={(v) => setFilters({ ...filters, categorie: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tous">Toutes</SelectItem>
                      <SelectItem value="A">Catégorie A</SelectItem>
                      <SelectItem value="B">Catégorie B</SelectItem>
                      <SelectItem value="C">Catégorie C</SelectItem>
                      <SelectItem value="D">Catégorie D</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Sexe</Label>
                  <Select value={filters.sexe} onValueChange={(v) => setFilters({ ...filters, sexe: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tous">Tous</SelectItem>
                      <SelectItem value="M">Homme</SelectItem>
                      <SelectItem value="F">Femme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Grade</Label>
                  <Select value={filters.grade} onValueChange={(v) => setFilters({ ...filters, grade: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tous">Tous</SelectItem>
                      <SelectItem value="administrateur">Administrateur</SelectItem>
                      <SelectItem value="attache">Attaché</SelectItem>
                      <SelectItem value="secretaire">Secrétaire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Structure</Label>
                  <Select value={filters.structure} onValueChange={(v) => setFilters({ ...filters, structure: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tous">Toutes</SelectItem>
                      <SelectItem value="dag">Direction des Affaires Générales</SelectItem>
                      <SelectItem value="drh">Direction des Ressources Humaines</SelectItem>
                      <SelectItem value="sg">Secrétariat Général</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={handleSearch} className="flex-1" disabled={isSearching}>
              <Search className="w-4 h-4 mr-2" />
              {isSearching ? "Recherche..." : "Rechercher"}
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <X className="w-4 h-4 mr-2" />
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {searchResults.length > 0 && (
        <Card className="neu-card">
          <CardHeader>
            <CardTitle>
              Résultats de la recherche ({searchResults.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {searchResults.map((agent) => (
                <div key={agent.id} className="neu-card p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="neu-raised w-12 h-12 flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">
                            {agent.nom} {agent.prenoms}
                          </h3>
                          <Badge variant={agent.statut === "Actif" ? "default" : "secondary"}>
                            {agent.statut}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            <span>Matricule: {agent.matricule}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{agent.typeAgent} - Cat. {agent.categorie}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            <span>{agent.structure}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{agent.grade}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button size="sm" variant="outline">
                        Voir le dossier
                      </Button>
                      <Button size="sm">
                        Modifier
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {searchResults.length === 0 && !isSearching && (
        <Card className="neu-card">
          <CardContent className="py-12 text-center">
            <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              Utilisez les critères ci-dessus pour rechercher un agent
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

