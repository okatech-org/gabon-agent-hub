/**
 * Générateur de PDF professionnel pour documents ministériels
 * Utilise jsPDF pour Deno
 */

import { jsPDF } from 'https://esm.sh/jspdf@2.5.2';

export interface DocumentMetadata {
  title: string;
  type: 'decree' | 'letter' | 'report' | 'note';
  author: string;
  date: string;
  reference?: string;
}

export interface PDFStyle {
  headerFont: string;
  bodyFont: string;
  titleSize: number;
  headerSize: number;
  bodySize: number;
  lineHeight: number;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
}

const DEFAULT_STYLE: PDFStyle = {
  headerFont: 'helvetica',
  bodyFont: 'helvetica',
  titleSize: 16,
  headerSize: 14,
  bodySize: 11,
  lineHeight: 1.6,
  marginTop: 50,
  marginBottom: 50,
  marginLeft: 50,
  marginRight: 50,
};

/**
 * Parse le markdown et génère un PDF formaté
 */
export async function generateProfessionalPDF(
  markdown: string,
  metadata: DocumentMetadata,
  style: Partial<PDFStyle> = {}
): Promise<Uint8Array> {
  
  const fullStyle = { ...DEFAULT_STYLE, ...style };
  
  // Créer un nouveau document PDF
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  let yPosition = fullStyle.marginTop;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - fullStyle.marginLeft - fullStyle.marginRight;

  // En-tête du document
  doc.setFont(fullStyle.headerFont, 'bold');
  doc.setFontSize(fullStyle.titleSize);
  
  // Titre
  const titleLines = doc.splitTextToSize(metadata.title, contentWidth);
  titleLines.forEach((line: string) => {
    doc.text(line, fullStyle.marginLeft, yPosition);
    yPosition += fullStyle.titleSize * 1.2;
  });

  yPosition += 10;

  // Métadonnées
  doc.setFontSize(fullStyle.bodySize);
  doc.setFont(fullStyle.bodyFont, 'normal');
  doc.text(`Type: ${metadata.type}`, fullStyle.marginLeft, yPosition);
  yPosition += fullStyle.bodySize * fullStyle.lineHeight;
  doc.text(`Auteur: ${metadata.author}`, fullStyle.marginLeft, yPosition);
  yPosition += fullStyle.bodySize * fullStyle.lineHeight;
  doc.text(`Date: ${metadata.date}`, fullStyle.marginLeft, yPosition);
  yPosition += fullStyle.bodySize * fullStyle.lineHeight;
  
  if (metadata.reference) {
    doc.text(`Référence: ${metadata.reference}`, fullStyle.marginLeft, yPosition);
    yPosition += fullStyle.bodySize * fullStyle.lineHeight;
  }

  yPosition += 20;

  // Ligne de séparation
  doc.setLineWidth(0.5);
  doc.line(fullStyle.marginLeft, yPosition, pageWidth - fullStyle.marginRight, yPosition);
  yPosition += 20;

  // Contenu du document
  const lines = markdown.split('\n');
  
  for (const line of lines) {
    // Vérifier si on doit passer à une nouvelle page
    if (yPosition > pageHeight - fullStyle.marginBottom) {
      doc.addPage();
      yPosition = fullStyle.marginTop;
    }

    // Traiter les titres
    if (line.startsWith('# ')) {
      yPosition += 10;
      doc.setFont(fullStyle.headerFont, 'bold');
      doc.setFontSize(fullStyle.headerSize);
      const text = line.replace('# ', '');
      const textLines = doc.splitTextToSize(text, contentWidth);
      textLines.forEach((textLine: string) => {
        doc.text(textLine, fullStyle.marginLeft, yPosition);
        yPosition += fullStyle.headerSize * fullStyle.lineHeight;
      });
      yPosition += 5;
    }
    // Sous-titres
    else if (line.startsWith('## ')) {
      yPosition += 8;
      doc.setFont(fullStyle.headerFont, 'bold');
      doc.setFontSize(fullStyle.bodySize + 1);
      const text = line.replace('## ', '');
      const textLines = doc.splitTextToSize(text, contentWidth);
      textLines.forEach((textLine: string) => {
        doc.text(textLine, fullStyle.marginLeft, yPosition);
        yPosition += (fullStyle.bodySize + 1) * fullStyle.lineHeight;
      });
      yPosition += 3;
    }
    // Texte gras
    else if (line.includes('**')) {
      doc.setFont(fullStyle.bodyFont, 'bold');
      doc.setFontSize(fullStyle.bodySize);
      const text = line.replace(/\*\*/g, '');
      const textLines = doc.splitTextToSize(text, contentWidth);
      textLines.forEach((textLine: string) => {
        doc.text(textLine, fullStyle.marginLeft, yPosition);
        yPosition += fullStyle.bodySize * fullStyle.lineHeight;
      });
    }
    // Ligne vide
    else if (line.trim() === '') {
      yPosition += fullStyle.bodySize * 0.5;
    }
    // Texte normal
    else {
      doc.setFont(fullStyle.bodyFont, 'normal');
      doc.setFontSize(fullStyle.bodySize);
      const textLines = doc.splitTextToSize(line, contentWidth);
      textLines.forEach((textLine: string) => {
        if (yPosition > pageHeight - fullStyle.marginBottom) {
          doc.addPage();
          yPosition = fullStyle.marginTop;
        }
        doc.text(textLine, fullStyle.marginLeft, yPosition);
        yPosition += fullStyle.bodySize * fullStyle.lineHeight;
      });
    }
  }

  // Convertir en Uint8Array
  const pdfOutput = doc.output('arraybuffer');
  return new Uint8Array(pdfOutput);
}

/**
 * Génère un PDF simple sans mise en forme avancée
 */
export async function generateSimplePDF(
  content: string,
  title: string
): Promise<Uint8Array> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  const contentWidth = pageWidth - (margin * 2);

  // Titre
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(title, margin, 60);

  // Contenu
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const lines = doc.splitTextToSize(content, contentWidth);
  doc.text(lines, margin, 90);

  // Convertir en Uint8Array
  const pdfOutput = doc.output('arraybuffer');
  return new Uint8Array(pdfOutput);
}
