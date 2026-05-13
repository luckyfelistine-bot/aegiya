/**
 * generateArtifact.ts
 * Generates downloadable PDF or DOCX from content strings.
 * Used by Byeol to create study artifacts for Dal.
 */

import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';

/**
 * Generates a PDF file and triggers download.
 * @param content - Plain text or simple HTML (tags stripped).
 * @param title - Title used in the document and as the filename.
 */
export function generatePDF(content: string, title: string): void {
  const doc = new jsPDF();
  const cleanText = content.replace(/<[^>]*>/g, '');

  // Add title
  doc.setFontSize(16);
  doc.text(title, 10, 20);

  // Split text into lines that fit the page width
  const lines = doc.splitTextToSize(cleanText, 180);
  doc.setFontSize(12);
  doc.text(lines, 10, 30);

  doc.save(`${title.replace(/\s/g, '_')}.pdf`);
}

/**
 * Generates a Word (DOCX) file and triggers download.
 * @param content - Plain text or simple HTML (tags stripped).
 * @param title - Title used in the document and as the filename.
 */
export async function generateDOCX(content: string, title: string): Promise<void> {
  const cleanText = content.replace(/<[^>]*>/g, '');

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [new TextRun({ text: title, bold: true, size: 28 })],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [new TextRun({ text: cleanText, size: 24 })],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/\s/g, '_')}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Unified artifact generator – calls the appropriate function based on type.
 * @param type - "pdf" or "docx"
 * @param content - Text content for the document
 * @param title - Document title and filename
 */
export async function generateArtifact(
  type: 'pdf' | 'docx',
  content: string,
  title: string = 'Byeol_Artifact'
): Promise<void> {
  if (type === 'pdf') {
    generatePDF(content, title);
  } else if (type === 'docx') {
    await generateDOCX(content, title);
  }
}
