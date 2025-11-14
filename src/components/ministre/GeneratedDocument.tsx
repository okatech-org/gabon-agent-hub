import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Download, Eye, FileCheck, Scale, Mail, ScrollText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GeneratedDocumentProps {
  fileUrl: string;
  fileName: string;
  fileType: 'pdf' | 'docx';
  timestamp: string;
  documentType?: 'decree' | 'letter' | 'report' | 'note';
}

export function GeneratedDocument({
  fileUrl,
  fileName,
  fileType,
  timestamp,
  documentType,
}: GeneratedDocumentProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const getDocumentIcon = () => {
    switch (documentType) {
      case 'decree':
        return <Scale className="w-6 h-6" />;
      case 'letter':
        return <Mail className="w-6 h-6" />;
      case 'report':
        return <ScrollText className="w-6 h-6" />;
      case 'note':
        return <FileCheck className="w-6 h-6" />;
      default:
        return <FileText className="w-6 h-6" />;
    }
  };

  const getDocumentLabel = () => {
    switch (documentType) {
      case 'decree':
        return 'Arrêté Ministériel';
      case 'letter':
        return 'Lettre Officielle';
      case 'report':
        return 'Rapport Analytique';
      case 'note':
        return 'Note de Service';
      default:
        return 'Document';
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.click();
  };

  const handlePreview = () => {
    if (fileType === 'pdf') {
      window.open(fileUrl, '_blank');
    } else {
      handleDownload();
    }
  };

  return (
    <Card className="neu-card-sm overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center gap-4 p-4">
          <div
            className={cn(
              'flex-shrink-0 w-14 h-14 rounded-lg flex items-center justify-center',
              'bg-gradient-to-br from-primary/20 to-secondary/20',
            )}
          >
            {getDocumentIcon()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate">{getDocumentLabel()}</h4>
                <p className="text-xs text-muted-foreground mt-1">{fileName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(timestamp).toLocaleString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              <div className="flex-shrink-0">
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary">
                  {fileType.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 bg-muted/30 px-4 py-3 flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePreview} className="flex-1 gap-2">
            <Eye className="w-4 h-4" />
            Visualiser
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload} className="flex-1 gap-2">
            <Download className="w-4 h-4" />
            Télécharger
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface DocumentListProps {
  documents: GeneratedDocumentProps[];
  emptyMessage?: string;
}

export function DocumentList({
  documents,
  emptyMessage = 'Aucun document généré pour le moment',
}: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-12 neu-inset rounded-lg">
        <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
        <p className="text-muted-foreground">{emptyMessage}</p>
        <p className="text-sm text-muted-foreground mt-2">Demandez à iAsted de créer un document</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc, index) => (
        <GeneratedDocument key={index} {...doc} />
      ))}
    </div>
  );
}

export function InlineDocumentPreview({
  fileUrl,
  fileName,
  fileType,
  documentType,
}: Omit<GeneratedDocumentProps, 'timestamp'>) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.click();
  };

  const getDocumentLabel = () => {
    switch (documentType) {
      case 'decree':
        return 'Arrêté Ministériel';
      case 'letter':
        return 'Lettre Officielle';
      case 'report':
        return 'Rapport Analytique';
      case 'note':
        return 'Note de Service';
      default:
        return 'Document';
    }
  };

  return (
    <div className="mt-3 inline-flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-primary" />
        <div>
          <p className="text-sm font-medium">{getDocumentLabel()}</p>
          <p className="text-xs text-muted-foreground">{fileName}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open(fileUrl, '_blank')}
          className="h-8"
        >
          <Eye className="w-4 h-4 mr-1" />
          Voir
        </Button>
        <Button variant="ghost" size="sm" onClick={handleDownload} className="h-8">
          <Download className="w-4 h-4 mr-1" />
          Télécharger
        </Button>
      </div>
    </div>
  );
}


