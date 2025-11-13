import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { History, RotateCcw, FileText, User, Calendar, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Version {
  id: string;
  version_number: number;
  title: string;
  description: string;
  content: string;
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  category: string;
  tags: string[];
  change_type: 'created' | 'updated' | 'restored';
  change_summary: string | null;
  created_at: string;
}

interface KnowledgeVersionHistoryProps {
  knowledgeId: string;
  isOpen: boolean;
  onClose: () => void;
  currentVersion: number;
}

export const KnowledgeVersionHistory = ({ 
  knowledgeId, 
  isOpen, 
  onClose,
  currentVersion 
}: KnowledgeVersionHistoryProps) => {
  const queryClient = useQueryClient();
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);

  // Récupérer l'historique des versions
  const { data: versions, isLoading } = useQuery({
    queryKey: ['knowledge-versions', knowledgeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('iasted_knowledge_versions' as any)
        .select('*')
        .eq('knowledge_id', knowledgeId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      return data as any as Version[];
    },
    enabled: isOpen && !!knowledgeId
  });

  // Mutation pour restaurer une version
  const restoreMutation = useMutation({
    mutationFn: async (version: Version) => {
      const { error } = await supabase
        .from('iasted_knowledge_base' as any)
        .update({
          title: version.title,
          description: version.description,
          content: version.content,
          file_url: version.file_url,
          file_name: version.file_name,
          file_size: version.file_size,
          category: version.category,
          tags: version.tags,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', knowledgeId);

      if (error) throw error;

      // Créer une entrée de version pour la restauration
      await supabase
        .from('iasted_knowledge_versions' as any)
        .insert({
          knowledge_id: knowledgeId,
          version_number: currentVersion + 1,
          title: version.title,
          description: version.description,
          content: version.content,
          file_url: version.file_url,
          file_name: version.file_name,
          file_size: version.file_size,
          category: version.category,
          tags: version.tags,
          change_type: 'restored',
          change_summary: `Restauration de la version ${version.version_number}`,
          user_id: (await supabase.auth.getUser()).data.user?.id
        } as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base'] });
      queryClient.invalidateQueries({ queryKey: ['knowledge-versions', knowledgeId] });
      setShowRestoreConfirm(false);
      setSelectedVersion(null);
      toast.success('Version restaurée avec succès');
      onClose();
    },
    onError: (error) => {
      console.error('Error restoring version:', error);
      toast.error('Erreur lors de la restauration');
    }
  });

  const handleRestore = () => {
    if (selectedVersion) {
      restoreMutation.mutate(selectedVersion);
    }
  };

  const getChangeTypeLabel = (type: string) => {
    switch (type) {
      case 'created': return 'Création';
      case 'updated': return 'Modification';
      case 'restored': return 'Restauration';
      default: return type;
    }
  };

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'created': return 'bg-green-100 text-green-800';
      case 'updated': return 'bg-blue-100 text-blue-800';
      case 'restored': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historique des versions
          </DialogTitle>
          <DialogDescription>
            Consultez l'historique complet et restaurez une version antérieure si nécessaire
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            Chargement de l'historique...
          </div>
        ) : versions?.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            Aucune version disponible
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Liste des versions */}
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                {versions?.map((version) => (
                  <div
                    key={version.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedVersion?.id === version.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    } ${version.version_number === currentVersion ? 'ring-2 ring-green-500' : ''}`}
                    onClick={() => setSelectedVersion(version)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">v{version.version_number}</Badge>
                        <Badge className={getChangeTypeColor(version.change_type)}>
                          {getChangeTypeLabel(version.change_type)}
                        </Badge>
                        {version.version_number === currentVersion && (
                          <Badge variant="default" className="bg-green-600">Actuelle</Badge>
                        )}
                      </div>
                    </div>
                    
                    <h4 className="font-semibold text-sm mb-1">{version.title}</h4>
                    
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(version.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                      </div>
                      {version.file_name && (
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {version.file_name}
                        </div>
                      )}
                    </div>

                    {version.change_summary && (
                      <p className="text-xs text-muted-foreground mt-2 italic">
                        {version.change_summary}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Détails de la version sélectionnée */}
            <div className="border rounded-lg">
              {selectedVersion ? (
                <ScrollArea className="h-[500px]">
                  <div className="p-4 space-y-4">
                    <div>
                      <h3 className="font-bold text-lg mb-2">{selectedVersion.title}</h3>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary">{selectedVersion.category}</Badge>
                        <Badge variant="outline">Version {selectedVersion.version_number}</Badge>
                      </div>
                    </div>

                    {selectedVersion.description && (
                      <div>
                        <h4 className="text-sm font-semibold mb-1">Description</h4>
                        <p className="text-sm text-muted-foreground">{selectedVersion.description}</p>
                      </div>
                    )}

                    {selectedVersion.content && (
                      <div>
                        <h4 className="text-sm font-semibold mb-1">Contenu</h4>
                        <div className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 p-3 rounded">
                          {selectedVersion.content}
                        </div>
                      </div>
                    )}

                    {selectedVersion.tags && selectedVersion.tags.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Mots-clés</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedVersion.tags.map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedVersion.file_name && (
                      <div>
                        <h4 className="text-sm font-semibold mb-1">Fichier</h4>
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4" />
                          <span>{selectedVersion.file_name}</span>
                          {selectedVersion.file_size && (
                            <span className="text-muted-foreground">
                              ({formatFileSize(selectedVersion.file_size)})
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <Separator />

                    {showRestoreConfirm ? (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="space-y-3">
                          <p className="text-sm">
                            Êtes-vous sûr de vouloir restaurer cette version ? 
                            L'état actuel sera sauvegardé avant la restauration.
                          </p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={handleRestore}
                              disabled={restoreMutation.isPending}
                            >
                              {restoreMutation.isPending ? 'Restauration...' : 'Confirmer la restauration'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowRestoreConfirm(false)}
                              disabled={restoreMutation.isPending}
                            >
                              Annuler
                            </Button>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ) : selectedVersion.version_number !== currentVersion ? (
                      <Button
                        className="w-full"
                        onClick={() => setShowRestoreConfirm(true)}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Restaurer cette version
                      </Button>
                    ) : (
                      <Alert>
                        <AlertDescription className="text-sm">
                          Cette version est actuellement active
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </ScrollArea>
              ) : (
                <div className="h-[500px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Sélectionnez une version pour voir les détails</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
