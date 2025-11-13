import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Upload, FileText, Trash2, Download, Plus, Tags, Search, History, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { KnowledgeVersionHistory } from './KnowledgeVersionHistory';

interface KnowledgeEntry {
  id: string;
  title: string;
  description: string;
  content: string;
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  category: string;
  tags: string[];
  is_active: boolean;
  version_number: number;
  created_at: string;
}

const categories = [
  'Règlement',
  'Procédure',
  'Documentation Technique',
  'Circulaire',
  'Note de Service',
  'Jurisprudence',
  'Référence',
  'Autre'
];

export const KnowledgeBase = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [selectedEntryForHistory, setSelectedEntryForHistory] = useState<KnowledgeEntry | null>(null);
  const [editingEntry, setEditingEntry] = useState<KnowledgeEntry | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: '',
    tags: '',
    file: null as File | null
  });

  // Récupérer les entrées de connaissances
  const { data: entries, isLoading } = useQuery({
    queryKey: ['knowledge-base', searchTerm, selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('iasted_knowledge_base' as any)
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as any as KnowledgeEntry[];
    }
  });

  // Mutation pour ajouter une entrée
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      let fileUrl = null;
      let fileName = null;
      let fileSize = null;

      // Upload du fichier si présent
      if (data.file) {
        setUploadingFile(true);
        const fileExt = data.file.name.split('.').pop();
        const filePath = `${user?.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('iasted-documents')
          .upload(filePath, data.file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('iasted-documents')
          .getPublicUrl(filePath);

        fileUrl = publicUrl;
        fileName = data.file.name;
        fileSize = data.file.size;
        setUploadingFile(false);
      }

      // Créer l'entrée
      const { error } = await supabase
        .from('iasted_knowledge_base' as any)
        .insert({
          title: data.title,
          description: data.description,
          content: data.content,
          category: data.category,
          tags: data.tags.split(',').map(t => t.trim()).filter(t => t),
          file_url: fileUrl,
          file_name: fileName,
          file_size: fileSize,
          user_id: user?.id
        } as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base'] });
      setIsDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        content: '',
        category: '',
        tags: '',
        file: null
      });
      toast.success('Document ajouté à la base de connaissances');
    },
    onError: (error) => {
      console.error('Error creating entry:', error);
      toast.error('Erreur lors de l\'ajout du document');
    }
  });

  // Mutation pour mettre à jour une entrée (crée automatiquement une version)
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      let fileUrl = null;
      let fileName = null;
      let fileSize = null;

      // Upload du fichier si présent
      if (data.file) {
        setUploadingFile(true);
        const fileExt = data.file.name.split('.').pop();
        const filePath = `${user?.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('iasted-documents')
          .upload(filePath, data.file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('iasted-documents')
          .getPublicUrl(filePath);

        fileUrl = publicUrl;
        fileName = data.file.name;
        fileSize = data.file.size;
        setUploadingFile(false);
      }

      // Mettre à jour l'entrée (le trigger créera automatiquement une version)
      const updateData: any = {
        title: data.title,
        description: data.description,
        content: data.content,
        category: data.category,
        tags: data.tags.split(',').map(t => t.trim()).filter(t => t),
        updated_at: new Date().toISOString()
      };

      if (fileUrl) {
        updateData.file_url = fileUrl;
        updateData.file_name = fileName;
        updateData.file_size = fileSize;
      }

      const { error } = await supabase
        .from('iasted_knowledge_base' as any)
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base'] });
      setEditDialogOpen(false);
      setEditingEntry(null);
      setFormData({
        title: '',
        description: '',
        content: '',
        category: '',
        tags: '',
        file: null
      });
      toast.success('Document mis à jour (nouvelle version créée)');
    },
    onError: (error) => {
      console.error('Error updating entry:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  });

  // Mutation pour supprimer une entrée
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('iasted_knowledge_base' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base'] });
      toast.success('Document supprimé');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.category) {
      toast.error('Le titre et la catégorie sont requis');
      return;
    }
    if (editingEntry) {
      updateMutation.mutate({ id: editingEntry.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (entry: KnowledgeEntry) => {
    setEditingEntry(entry);
    setFormData({
      title: entry.title,
      description: entry.description || '',
      content: entry.content || '',
      category: entry.category,
      tags: entry.tags?.join(', ') || '',
      file: null
    });
    setEditDialogOpen(true);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleShowHistory = (entry: KnowledgeEntry) => {
    setSelectedEntryForHistory(entry);
    setVersionHistoryOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Base de Connaissances iAsted
          </h2>
          <p className="text-muted-foreground mt-1">
            Enrichissez les connaissances d'iAsted avec des documents et règlements
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ajouter un document à la base de connaissances</DialogTitle>
              <DialogDescription>
                Ajoutez des règlements, procédures ou notes pour enrichir iAsted
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Statut Général de la Fonction Publique"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Catégorie *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brève description du document"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Contenu / Notes</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Contenu textuel, extraits importants, ou notes..."
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Mots-clés (séparés par des virgules)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="Ex: retraite, recrutement, avancement"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Fichier (optionnel)</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                  accept=".pdf,.doc,.docx,.txt,.md,.xls,.xlsx"
                />
                {formData.file && (
                  <p className="text-sm text-muted-foreground">
                    Fichier sélectionné: {formData.file.name} ({formatFileSize(formData.file.size)})
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={createMutation.isPending || uploadingFile}>
                  {uploadingFile ? 'Upload en cours...' : createMutation.isPending ? 'Ajout...' : 'Ajouter'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dialog d'édition */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => {
        setEditDialogOpen(open);
        if (!open) {
          setEditingEntry(null);
          setFormData({
            title: '',
            description: '',
            content: '',
            category: '',
            tags: '',
            file: null
          });
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le document</DialogTitle>
            <DialogDescription>
              Une nouvelle version sera créée automatiquement lors de la sauvegarde
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Titre *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Statut Général de la Fonction Publique"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">Catégorie *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brève description du document"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-content">Contenu / Notes</Label>
              <Textarea
                id="edit-content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Contenu textuel, extraits importants, ou notes..."
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-tags">Mots-clés (séparés par des virgules)</Label>
              <Input
                id="edit-tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="Ex: retraite, recrutement, avancement"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-file">Nouveau fichier (optionnel)</Label>
              <Input
                id="edit-file"
                type="file"
                onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                accept=".pdf,.doc,.docx,.txt,.md,.xls,.xlsx"
              />
              {formData.file && (
                <p className="text-sm text-muted-foreground">
                  Nouveau fichier: {formData.file.name} ({formatFileSize(formData.file.size)})
                </p>
              )}
              {editingEntry?.file_name && !formData.file && (
                <p className="text-sm text-muted-foreground">
                  Fichier actuel: {editingEntry.file_name}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={updateMutation.isPending || uploadingFile}>
                {uploadingFile ? 'Upload en cours...' : updateMutation.isPending ? 'Mise à jour...' : 'Enregistrer'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Filtres et recherche */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher dans la base de connaissances..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Liste des documents */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Chargement...</div>
      ) : entries?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Aucun document dans la base de connaissances
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {entries?.map((entry) => (
            <Card key={entry.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {entry.title}
                      <Badge variant="outline" className="ml-2 text-xs">
                        v{entry.version_number}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {entry.description}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(entry)}
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShowHistory(entry)}
                      title="Voir l'historique"
                    >
                      <History className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(entry.id)}
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">{entry.category}</Badge>
                  {entry.file_name && (
                    <Badge variant="outline" className="gap-1">
                      <Download className="h-3 w-3" />
                      {entry.file_name}
                      {entry.file_size && ` (${formatFileSize(entry.file_size)})`}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              {(entry.content || entry.tags?.length > 0) && (
                <CardContent>
                  {entry.content && (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-3">
                      {entry.content.length > 300 
                        ? entry.content.substring(0, 300) + '...' 
                        : entry.content}
                    </p>
                  )}
                  {entry.tags?.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Tags className="h-3 w-3 text-muted-foreground" />
                      {entry.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de l'historique des versions */}
      {selectedEntryForHistory && (
        <KnowledgeVersionHistory
          knowledgeId={selectedEntryForHistory.id}
          currentVersion={selectedEntryForHistory.version_number}
          isOpen={versionHistoryOpen}
          onClose={() => {
            setVersionHistoryOpen(false);
            setSelectedEntryForHistory(null);
          }}
        />
      )}
    </div>
  );
};
