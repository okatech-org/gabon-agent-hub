import PDFDocument from "npm:pdfkit@0.15.0";

export interface DocumentMetadata {
  title: string;
  type: "decree" | "letter" | "report" | "note";
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
  headerFont: "Helvetica-Bold",
  bodyFont: "Helvetica",
  titleSize: 16,
  headerSize: 14,
  bodySize: 11,
  lineHeight: 1.5,
  marginTop: 72,
  marginBottom: 72,
  marginLeft: 72,
  marginRight: 72,
};

export async function generateProfessionalPDF(
  markdown: string,
  metadata: DocumentMetadata,
  style: Partial<PDFStyle> = {},
): Promise<Uint8Array> {
  const fullStyle = { ...DEFAULT_STYLE, ...style };

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margins: {
          top: fullStyle.marginTop,
          bottom: fullStyle.marginBottom,
          left: fullStyle.marginLeft,
          right: fullStyle.marginRight,
        },
        info: {
          Title: metadata.title,
          Author: metadata.author,
          Subject: metadata.type,
          CreationDate: new Date(metadata.date),
        },
      });

      const chunks: Uint8Array[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => {
        const result = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
        let offset = 0;
        for (const chunk of chunks) {
          result.set(chunk, offset);
          offset += chunk.length;
        }
        resolve(result);
      });
      doc.on("error", reject);

      doc.font(fullStyle.headerFont).fontSize(12).text("RÉPUBLIQUE GABONAISE", { align: "center" }).fontSize(10).text("Unité – Travail – Justice", {
        align: "center",
      }).moveDown(0.5);

      doc.moveTo(fullStyle.marginLeft, doc.y).lineTo(doc.page.width - fullStyle.marginRight, doc.y).stroke().moveDown();

      if (metadata.type === "decree") {
        doc
          .fontSize(11)
          .text("MINISTÈRE DE LA FONCTION PUBLIQUE", { align: "center" })
          .moveDown(0.3)
          .text("DE LA TRANSFORMATION PUBLIQUE", { align: "center" })
          .text("ET DE LA RÉFORME DE L'ÉTAT", { align: "center" })
          .moveDown();

        if (metadata.reference) {
          doc.fontSize(10).text(`ARRÊTÉ N° ${metadata.reference} du ${metadata.date}`, { align: "center" }).moveDown(1.5);
        }
      } else if (metadata.type === "letter") {
        doc
          .fontSize(11)
          .text("MINISTÈRE DE LA FONCTION PUBLIQUE", { align: "left" })
          .text("DE LA TRANSFORMATION PUBLIQUE", { align: "left" })
          .text("ET DE LA RÉFORME DE L'ÉTAT", { align: "left" })
          .moveDown(0.5)
          .fontSize(10)
          .text("Le Ministre", { align: "left" })
          .moveDown()
          .text(`Libreville, le ${metadata.date}`, { align: "left" })
          .moveDown(1);

        if (metadata.reference) {
          doc.text(`N° ${metadata.reference}`, { align: "left" }).moveDown(1.5);
        }
      }

      doc.font(fullStyle.headerFont).fontSize(fullStyle.titleSize).text(metadata.title, { align: "center" }).moveDown(1.5);

      const lines = markdown.split("\n");
      doc.font(fullStyle.bodyFont).fontSize(fullStyle.bodySize);

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (!line) {
          doc.moveDown(0.5);
          continue;
        }

        if (line.startsWith("## ")) {
          doc
            .font(fullStyle.headerFont)
            .fontSize(fullStyle.headerSize)
            .text(line.substring(3), { align: "left" })
            .font(fullStyle.bodyFont)
            .fontSize(fullStyle.bodySize)
            .moveDown(0.5);
        } else if (line.startsWith("### ")) {
          doc
            .font(fullStyle.headerFont)
            .fontSize(fullStyle.bodySize + 1)
            .text(line.substring(4), { align: "left" })
            .font(fullStyle.bodyFont)
            .fontSize(fullStyle.bodySize)
            .moveDown(0.3);
        } else if (line.startsWith("# ")) {
          doc
            .font(fullStyle.headerFont)
            .fontSize(fullStyle.titleSize)
            .text(line.substring(2), { align: "center" })
            .font(fullStyle.bodyFont)
            .fontSize(fullStyle.bodySize)
            .moveDown(1);
        } else if (line.includes("**")) {
          const parts = line.split("**");
          for (let j = 0; j < parts.length; j++) {
            if (j % 2 === 1) {
              doc.font(fullStyle.headerFont).text(parts[j], { continued: j < parts.length - 1 });
              doc.font(fullStyle.bodyFont);
            } else {
              doc.text(parts[j], { continued: j < parts.length - 1 });
            }
          }
          doc.text("");
          doc.moveDown(0.3);
        } else if (/^[\-\*]\s/.test(line)) {
          doc.text(`  • ${line.substring(2)}`, {
            indent: 20,
            paragraphGap: 3,
          });
        } else if (/^\d+\.\s/.test(line)) {
          const match = line.match(/^(\d+)\.\s(.*)$/);
          if (match) {
            doc.text(`  ${match[1]}. ${match[2]}`, {
              indent: 20,
              paragraphGap: 3,
            });
          }
        } else {
          doc.text(line, {
            align: "justify",
            lineGap: 2,
            paragraphGap: 5,
          });
        }

        if (doc.y > doc.page.height - fullStyle.marginBottom - 50) {
          doc.addPage();
        }
      }

      if (metadata.type === "decree") {
        doc
          .moveDown(2)
          .font(fullStyle.headerFont)
          .fontSize(10)
          .text("Le Ministre", { align: "center" })
          .moveDown(2)
          .text("[SIGNATURE]", { align: "center" })
          .moveDown(0.5)
          .text("[NOM DU MINISTRE]", { align: "center" })
          .moveDown(1.5)
          .font(fullStyle.bodyFont)
          .fontSize(9)
          .text("Pour Ampliation:", { align: "left" })
          .text("- Président de la République", { align: "left" })
          .text("- Premier Ministre", { align: "left" })
          .text("- Secrétaire Général du Gouvernement", { align: "left" })
          .text("- Archives Nationales", { align: "left" });
      }

      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        doc
          .font(fullStyle.bodyFont)
          .fontSize(9)
          .text(`Page ${i + 1} / ${range.count}`, fullStyle.marginLeft, doc.page.height - fullStyle.marginBottom + 20, {
            align: "center",
          });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export async function generateSimplePDF(
  content: string,
  title: string,
  author: string = "Ministère de la Fonction Publique",
): Promise<Uint8Array> {
  return generateProfessionalPDF(content, {
    title,
    type: "report",
    author,
    date: new Date().toLocaleDateString("fr-FR"),
  });
}


