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
  Upload, 
  FileText, 
  Search, 
  Filter, 
  Download,
  Trash2,
  Eye,
  Clock,
  Folder,
  Plus,
  FileCheck,
  AlertCircle
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

interface Document {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  category: string;
  tags: string[] | null;
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  version_number: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface DocumentVersion {
  id: string;
  version_number: number;
  change_type: string;
  created_at: string;
  change_summary: string | null;
}

const CATEGORIES = [
  { value: "reglementation", label: "Réglementation" },
  { value: "procedure", label: "Procédures" },
  { value: "directive", label: "Directives" },
  { value: "rapport", label: "Rapports" },
  { value: "statistique", label: "Statistiques" },
  { value: "formation", label: "Formation" },
  { value: "autre", label: "Autre" }
];

export default function Documents() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [uploadProgress, setUploadProgress] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("reglementation");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (user) {
      loadDocuments();
    }
  }, [user]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('iasted_knowledge_base' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments((data || []) as unknown as Document[]);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Erreur lors du chargement des documents');
    } finally {
      setLoading(false);
    }
  };

  const loadVersions = async (documentId: string) => {
    try {
      const { data, error } = await supabase
        .from('iasted_knowledge_versions' as any)
        .select('*')
        .eq('knowledge_id', documentId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      setVersions((data || []) as unknown as DocumentVersion[]);
    } catch (error) {
      console.error('Error loading versions:', error);
      toast.error('Erreur lors du chargement des versions');
    }
  };

  const handleUpload = async () => {
    if (!title.trim() || !user) {
      toast.error('Le titre est obligatoire');
      return;
    }

    try {
      setUploadProgress(true);

      let fileUrl = null;
      let fileName = null;
      let fileSize = null;

      // Upload file to storage if provided
      if (file) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('iasted-documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('iasted-documents')
          .getPublicUrl(filePath);

        fileUrl = publicUrl;
        fileName = file.name;
        fileSize = file.size;
      }

      // Insert document
      const { error: insertError } = await supabase
        .from('iasted_knowledge_base' as any)
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          content: content.trim() || null,
          category,
          tags: tags.trim() ? tags.split(',').map(t => t.trim()) : null,
          file_url: fileUrl,
          file_name: fileName,
          file_size: fileSize,
          user_id: user.id
        });

      if (insertError) throw insertError;

      toast.success('Document ajouté avec succès');
      setUploadDialogOpen(false);
      resetForm();
      loadDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Erreur lors de l\'ajout du document');
    } finally {
      setUploadProgress(false);
    }
  };

  const handleDelete = async () => {
    if (!documentToDelete) return;

    try {
      const { error } = await supabase
        .from('iasted_knowledge_base' as any)
        .delete()
        .eq('id', documentToDelete);

      if (error) throw error;

      toast.success('Document supprimé avec succès');
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
      loadDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleToggleActive = async (doc: Document) => {
    try {
      const { error } = await supabase
        .from('iasted_knowledge_base' as any)
        .update({ is_active: !doc.is_active })
        .eq('id', doc.id);

      if (error) throw error;

      toast.success(doc.is_active ? 'Document désactivé' : 'Document activé');
      loadDocuments();
    } catch (error) {
      console.error('Error toggling document:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("reglementation");
    setTags("");
    setContent("");
    setFile(null);
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    const kb = bytes / 1024;
    const mb = kb / 1024;
    return mb >= 1 ? `${mb.toFixed(2)} MB` : `${kb.toFixed(2)} KB`;
  };

  const getCategoryStats = () => {
    const stats: Record<string, number> = {};
    documents.forEach(doc => {
      stats[doc.category] = (stats[doc.category] || 0) + 1;
    });
    return stats;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Documents</h1>
          <p className="text-muted-foreground mt-1">
            Base de connaissances pour iAsted - {documents.length} documents
          </p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Plus className="w-4 h-4" />
              Nouveau Document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Ajouter un Document</DialogTitle>
              <DialogDescription>
                Enrichissez la base de connaissances de iAsted
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Titre du document"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description du document"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Catégorie *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
                  <Input
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="RH, Formation, Procédure..."
                  />
                </div>

                <div>
                  <Label htmlFor="content">Contenu textuel</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Contenu du document (optionnel si fichier joint)"
                    rows={5}
                  />
                </div>

                <div>
                  <Label htmlFor="file">Fichier (optionnel)</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    accept=".pdf,.doc,.docx,.txt,.md"
                  />
                  {file && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Fichier sélectionné: {file.name} ({formatFileSize(file.size)})
                    </p>
                  )}
                </div>
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setUploadDialogOpen(false)}
                disabled={uploadProgress}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleUpload} 
                disabled={uploadProgress || !title.trim()}
              >
                {uploadProgress ? 'Upload en cours...' : 'Ajouter'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {documents.filter(d => d.is_active).length} actifs
            </p>
          </CardContent>
        </Card>

        {Object.entries(getCategoryStats()).slice(0, 3).map(([cat, count]) => (
          <Card key={cat}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {CATEGORIES.find(c => c.value === cat)?.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{count}</div>
              <p className="text-xs text-muted-foreground mt-1">documents</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par titre, description ou tag..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Chargement des documents...</p>
            </CardContent>
          </Card>
        ) : filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {searchTerm || selectedCategory !== "all" 
                  ? "Aucun document trouvé avec ces critères"
                  : "Aucun document. Commencez par en ajouter un."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredDocuments.map((doc) => (
            <Card key={doc.id} className={!doc.is_active ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{doc.title}</CardTitle>
                      <Badge variant={doc.is_active ? 'default' : 'secondary'}>
                        {doc.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                      <Badge variant="outline">
                        {CATEGORIES.find(c => c.value === doc.category)?.label}
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Clock className="w-3 h-3" />
                        v{doc.version_number}
                      </Badge>
                    </div>
                    {doc.description && (
                      <CardDescription>{doc.description}</CardDescription>
                    )}
                    {doc.tags && doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {doc.tags.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
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
                      onClick={() => handleToggleActive(doc)}
                    >
                      {doc.is_active ? <Eye className="w-4 h-4" /> : <FileCheck className="w-4 h-4" />}
                    </Button>
                    {doc.file_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(doc.file_url!, '_blank')}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedDocument(doc);
                        loadVersions(doc.id);
                      }}
                    >
                      <Clock className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setDocumentToDelete(doc.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {doc.content && (
                <CardContent>
                  <div className="text-sm text-muted-foreground line-clamp-3">
                    {doc.content}
                  </div>
                </CardContent>
              )}
              <CardContent className="pt-0">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {doc.file_name && (
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {doc.file_name} ({formatFileSize(doc.file_size)})
                    </span>
                  )}
                  <span>Ajouté le {new Date(doc.created_at).toLocaleDateString('fr-FR')}</span>
                  {doc.updated_at !== doc.created_at && (
                    <span>Modifié le {new Date(doc.updated_at).toLocaleDateString('fr-FR')}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Version History Dialog */}
      <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Historique des Versions</DialogTitle>
            <DialogDescription>
              {selectedDocument?.title}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {versions.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                Aucune version disponible
              </p>
            ) : (
              <div className="space-y-3">
                {versions.map((version) => (
                  <Card key={version.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge>Version {version.version_number}</Badge>
                          <Badge variant="outline">{version.change_type}</Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(version.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </CardHeader>
                    {version.change_summary && (
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {version.change_summary}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                ))}
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
              Êtes-vous sûr de vouloir supprimer ce document ? Cette action est irréversible.
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
