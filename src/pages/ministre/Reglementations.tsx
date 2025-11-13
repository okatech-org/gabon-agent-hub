import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/lib/toast";
import { 
  FileCheck,
  Search, 
  Filter, 
  Download,
  Trash2,
  Edit,
  Clock,
  Plus,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Scale,
  BookOpen
} from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Reglementation {
  id: string;
  titre: string;
  reference: string;
  type_reglementation: string;
  date_publication: string;
  date_application: string | null;
  date_abrogation: string | null;
  statut: 'en_vigueur' | 'abroge' | 'en_projet';
  texte_integral: string | null;
  resume: string | null;
  domaine_application: string | null;
  ministere_origine: string | null;
  tags: string[] | null;
  fichier_url: string | null;
  fichier_nom: string | null;
  created_at: string;
  updated_at: string;
}

const TYPES_REGLEMENTATION = [
  { value: "loi", label: "Loi" },
  { value: "decret", label: "Décret" },
  { value: "arrete", label: "Arrêté" },
  { value: "ordonnance", label: "Ordonnance" },
  { value: "circulaire", label: "Circulaire" },
  { value: "directive", label: "Directive" },
  { value: "note_service", label: "Note de service" }
];

const DOMAINES = [
  { value: "fonction_publique", label: "Fonction Publique" },
  { value: "recrutement", label: "Recrutement" },
  { value: "carriere", label: "Carrière" },
  { value: "remuneration", label: "Rémunération" },
  { value: "formation", label: "Formation" },
  { value: "discipline", label: "Discipline" },
  { value: "retraite", label: "Retraite" },
  { value: "autre", label: "Autre" }
];

const STATUTS = [
  { value: "en_vigueur", label: "En vigueur", color: "bg-green-500" },
  { value: "en_projet", label: "En projet", color: "bg-blue-500" },
  { value: "abroge", label: "Abrogé", color: "bg-gray-500" }
];

export default function Reglementations() {
  const { user } = useAuth();
  const [reglementations, setReglementations] = useState<Reglementation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatut, setSelectedStatut] = useState<string>("all");
  const [selectedDomaine, setSelectedDomaine] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReglementation, setEditingReglementation] = useState<Reglementation | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reglementationToDelete, setReglementationToDelete] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedReglementation, setSelectedReglementation] = useState<Reglementation | null>(null);

  // Form states
  const [titre, setTitre] = useState("");
  const [reference, setReference] = useState("");
  const [typeReglementation, setTypeReglementation] = useState("decret");
  const [datePublication, setDatePublication] = useState("");
  const [dateApplication, setDateApplication] = useState("");
  const [dateAbrogation, setDateAbrogation] = useState("");
  const [statut, setStatut] = useState<'en_vigueur' | 'abroge' | 'en_projet'>("en_vigueur");
  const [texteIntegral, setTexteIntegral] = useState("");
  const [resume, setResume] = useState("");
  const [domaineApplication, setDomaineApplication] = useState("fonction_publique");
  const [ministereOrigine, setMinistereOrigine] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (user) {
      loadReglementations();
    }
  }, [user]);

  const loadReglementations = async () => {
    try {
      setLoading(true);
      // Simuler le chargement depuis une table (à créer)
      // Pour l'instant, données mockées
      const mockData: Reglementation[] = [
        {
          id: "1",
          titre: "Décret portant statut général de la fonction publique",
          reference: "Décret n°001/2024",
          type_reglementation: "decret",
          date_publication: "2024-01-15",
          date_application: "2024-02-01",
          date_abrogation: null,
          statut: "en_vigueur",
          texte_integral: "Le présent décret fixe le statut général de la fonction publique...",
          resume: "Définit les règles générales applicables aux fonctionnaires",
          domaine_application: "fonction_publique",
          ministere_origine: "Ministère de la Fonction Publique",
          tags: ["fonction publique", "statut", "fonctionnaires"],
          fichier_url: null,
          fichier_nom: null,
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-15T10:00:00Z"
        },
        {
          id: "2",
          titre: "Arrêté fixant les modalités de recrutement dans la fonction publique",
          reference: "Arrêté n°045/2024",
          type_reglementation: "arrete",
          date_publication: "2024-03-20",
          date_application: "2024-04-01",
          date_abrogation: null,
          statut: "en_vigueur",
          texte_integral: null,
          resume: "Définit les procédures et critères de recrutement des agents publics",
          domaine_application: "recrutement",
          ministere_origine: "Ministère de la Fonction Publique",
          tags: ["recrutement", "concours", "sélection"],
          fichier_url: null,
          fichier_nom: null,
          created_at: "2024-03-20T10:00:00Z",
          updated_at: "2024-03-20T10:00:00Z"
        }
      ];
      
      setReglementations(mockData);
    } catch (error) {
      console.error('Error loading reglementations:', error);
      toast.error('Erreur lors du chargement des réglementations');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!titre.trim() || !reference.trim() || !datePublication) {
      toast.error('Les champs titre, référence et date de publication sont obligatoires');
      return;
    }

    try {
      setUploadProgress(true);

      const newReglementation: Reglementation = {
        id: editingReglementation?.id || Date.now().toString(),
        titre: titre.trim(),
        reference: reference.trim(),
        type_reglementation: typeReglementation,
        date_publication: datePublication,
        date_application: dateApplication || null,
        date_abrogation: dateAbrogation || null,
        statut,
        texte_integral: texteIntegral.trim() || null,
        resume: resume.trim() || null,
        domaine_application: domaineApplication,
        ministere_origine: ministereOrigine.trim() || null,
        tags: tags.trim() ? tags.split(',').map(t => t.trim()) : null,
        fichier_url: null,
        fichier_nom: file?.name || null,
        created_at: editingReglementation?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (editingReglementation) {
        setReglementations(prev => 
          prev.map(r => r.id === editingReglementation.id ? newReglementation : r)
        );
        toast.success('Réglementation mise à jour');
      } else {
        setReglementations(prev => [newReglementation, ...prev]);
        toast.success('Réglementation ajoutée');
      }

      setDialogOpen(false);
      setEditingReglementation(null);
      resetForm();
    } catch (error) {
      console.error('Error saving reglementation:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setUploadProgress(false);
    }
  };

  const handleEdit = (reglementation: Reglementation) => {
    setEditingReglementation(reglementation);
    setTitre(reglementation.titre);
    setReference(reglementation.reference);
    setTypeReglementation(reglementation.type_reglementation);
    setDatePublication(reglementation.date_publication);
    setDateApplication(reglementation.date_application || "");
    setDateAbrogation(reglementation.date_abrogation || "");
    setStatut(reglementation.statut);
    setTexteIntegral(reglementation.texte_integral || "");
    setResume(reglementation.resume || "");
    setDomaineApplication(reglementation.domaine_application || "fonction_publique");
    setMinistereOrigine(reglementation.ministere_origine || "");
    setTags(reglementation.tags?.join(', ') || "");
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!reglementationToDelete) return;

    try {
      setReglementations(prev => prev.filter(r => r.id !== reglementationToDelete));
      toast.success('Réglementation supprimée');
      setDeleteDialogOpen(false);
      setReglementationToDelete(null);
    } catch (error) {
      console.error('Error deleting reglementation:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setTitre("");
    setReference("");
    setTypeReglementation("decret");
    setDatePublication("");
    setDateApplication("");
    setDateAbrogation("");
    setStatut("en_vigueur");
    setTexteIntegral("");
    setResume("");
    setDomaineApplication("fonction_publique");
    setMinistereOrigine("");
    setTags("");
    setFile(null);
  };

  const filteredReglementations = reglementations.filter(reg => {
    const matchesSearch = reg.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reg.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reg.resume?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || reg.type_reglementation === selectedType;
    const matchesStatut = selectedStatut === "all" || reg.statut === selectedStatut;
    const matchesDomaine = selectedDomaine === "all" || reg.domaine_application === selectedDomaine;
    return matchesSearch && matchesType && matchesStatut && matchesDomaine;
  });

  const getStatutBadge = (statut: string) => {
    const statutInfo = STATUTS.find(s => s.value === statut);
    return (
      <Badge className={`${statutInfo?.color} text-white`}>
        {statutInfo?.label}
      </Badge>
    );
  };

  const getTypeLabel = (type: string) => {
    return TYPES_REGLEMENTATION.find(t => t.value === type)?.label || type;
  };

  const getDomaineLabel = (domaine: string | null) => {
    return DOMAINES.find(d => d.value === domaine)?.label || domaine;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Réglementations</h1>
          <p className="text-muted-foreground mt-1">
            Textes juridiques et réglementaires - {reglementations.length} documents
          </p>
        </div>
        <Button 
          size="lg" 
          className="gap-2"
          onClick={() => {
            setEditingReglementation(null);
            resetForm();
            setDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4" />
          Nouvelle Réglementation
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Scale className="w-4 h-4" />
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reglementations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              En vigueur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {reglementations.filter(r => r.statut === 'en_vigueur').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              En projet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {reglementations.filter(r => r.statut === 'en_projet').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-gray-600" />
              Abrogés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {reglementations.filter(r => r.statut === 'abroge').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous types</SelectItem>
                {TYPES_REGLEMENTATION.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatut} onValueChange={setSelectedStatut}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                {STATUTS.map(statut => (
                  <SelectItem key={statut.value} value={statut.value}>
                    {statut.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDomaine} onValueChange={setSelectedDomaine}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Domaine" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous domaines</SelectItem>
                {DOMAINES.map(domaine => (
                  <SelectItem key={domaine.value} value={domaine.value}>
                    {domaine.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reglementations List */}
      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Chargement...</p>
            </CardContent>
          </Card>
        ) : filteredReglementations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Aucune réglementation trouvée</p>
            </CardContent>
          </Card>
        ) : (
          filteredReglementations.map((reg) => (
            <Card key={reg.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <CardTitle className="text-lg">{reg.titre}</CardTitle>
                      {getStatutBadge(reg.statut)}
                      <Badge variant="outline">
                        {getTypeLabel(reg.type_reglementation)}
                      </Badge>
                    </div>
                    <CardDescription className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Référence:</span>
                        <span>{reg.reference}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-3 h-3" />
                        <span>Publié le {new Date(reg.date_publication).toLocaleDateString('fr-FR')}</span>
                        {reg.date_application && (
                          <span className="ml-4">
                            • Applicable le {new Date(reg.date_application).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                      </div>
                      {reg.domaine_application && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Domaine:</span>
                          <Badge variant="secondary" className="text-xs">
                            {getDomaineLabel(reg.domaine_application)}
                          </Badge>
                        </div>
                      )}
                    </CardDescription>
                    {reg.resume && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {reg.resume}
                      </p>
                    )}
                    {reg.tags && reg.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {reg.tags.map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedReglementation(reg);
                        setViewDialogOpen(true);
                      }}
                    >
                      <BookOpen className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(reg)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setReglementationToDelete(reg.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {editingReglementation ? 'Modifier' : 'Ajouter'} une réglementation
            </DialogTitle>
            <DialogDescription>
              Saisissez les informations du texte réglementaire
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="titre">Titre *</Label>
                  <Input
                    id="titre"
                    value={titre}
                    onChange={(e) => setTitre(e.target.value)}
                    placeholder="Titre de la réglementation"
                  />
                </div>
                <div>
                  <Label htmlFor="reference">Référence *</Label>
                  <Input
                    id="reference"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="Ex: Décret n°001/2024"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type de texte *</Label>
                  <Select value={typeReglementation} onValueChange={setTypeReglementation}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPES_REGLEMENTATION.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="statut">Statut *</Label>
                  <Select value={statut} onValueChange={(v: any) => setStatut(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUTS.map(s => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="datePublication">Date de publication *</Label>
                  <Input
                    id="datePublication"
                    type="date"
                    value={datePublication}
                    onChange={(e) => setDatePublication(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="dateApplication">Date d'application</Label>
                  <Input
                    id="dateApplication"
                    type="date"
                    value={dateApplication}
                    onChange={(e) => setDateApplication(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="dateAbrogation">Date d'abrogation</Label>
                  <Input
                    id="dateAbrogation"
                    type="date"
                    value={dateAbrogation}
                    onChange={(e) => setDateAbrogation(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="domaine">Domaine d'application</Label>
                  <Select value={domaineApplication} onValueChange={setDomaineApplication}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DOMAINES.map(domaine => (
                        <SelectItem key={domaine.value} value={domaine.value}>
                          {domaine.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ministere">Ministère d'origine</Label>
                  <Input
                    id="ministere"
                    value={ministereOrigine}
                    onChange={(e) => setMinistereOrigine(e.target.value)}
                    placeholder="Ex: Ministère de la Fonction Publique"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="resume">Résumé</Label>
                <Textarea
                  id="resume"
                  value={resume}
                  onChange={(e) => setResume(e.target.value)}
                  placeholder="Résumé du texte"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="texte">Texte intégral</Label>
                <Textarea
                  id="texte"
                  value={texteIntegral}
                  onChange={(e) => setTexteIntegral(e.target.value)}
                  placeholder="Texte intégral de la réglementation"
                  rows={6}
                />
              </div>

              <div>
                <Label htmlFor="tags">Mots-clés (séparés par des virgules)</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="fonction publique, recrutement, statut..."
                />
              </div>

              <div>
                <Label htmlFor="file">Document PDF (optionnel)</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  accept=".pdf"
                />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDialogOpen(false)}
              disabled={uploadProgress}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={uploadProgress || !titre.trim() || !reference.trim() || !datePublication}
            >
              {uploadProgress ? 'Enregistrement...' : editingReglementation ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedReglementation?.titre}</DialogTitle>
            <DialogDescription>
              <div className="flex items-center gap-2 mt-2">
                {selectedReglementation && getStatutBadge(selectedReglementation.statut)}
                <Badge variant="outline">
                  {selectedReglementation && getTypeLabel(selectedReglementation.type_reglementation)}
                </Badge>
                <span className="text-sm">
                  {selectedReglementation?.reference}
                </span>
              </div>
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            {selectedReglementation && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Date de publication:</span>
                    <p className="text-muted-foreground">
                      {new Date(selectedReglementation.date_publication).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  {selectedReglementation.date_application && (
                    <div>
                      <span className="font-medium">Date d'application:</span>
                      <p className="text-muted-foreground">
                        {new Date(selectedReglementation.date_application).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  )}
                  {selectedReglementation.domaine_application && (
                    <div>
                      <span className="font-medium">Domaine:</span>
                      <p className="text-muted-foreground">
                        {getDomaineLabel(selectedReglementation.domaine_application)}
                      </p>
                    </div>
                  )}
                  {selectedReglementation.ministere_origine && (
                    <div>
                      <span className="font-medium">Ministère d'origine:</span>
                      <p className="text-muted-foreground">
                        {selectedReglementation.ministere_origine}
                      </p>
                    </div>
                  )}
                </div>

                {selectedReglementation.resume && (
                  <div>
                    <h4 className="font-medium mb-2">Résumé</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedReglementation.resume}
                    </p>
                  </div>
                )}

                {selectedReglementation.texte_integral && (
                  <div>
                    <h4 className="font-medium mb-2">Texte intégral</h4>
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted p-4 rounded-md">
                      {selectedReglementation.texte_integral}
                    </div>
                  </div>
                )}

                {selectedReglementation.tags && selectedReglementation.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Mots-clés</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedReglementation.tags.map((tag, i) => (
                        <Badge key={i} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette réglementation ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
