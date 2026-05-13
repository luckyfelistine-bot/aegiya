/**
 * generateArtifact.ts
 * Generates downloadable PDF or DOCX from content strings.
 * Used by Byeol to create study artifacts for Dal.
 * Upgraded: better formatting, page breaks, styling, metadata.
 */

import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak } from 'docx';

/**
 * Generates a PDF file and triggers download.
 * Upgraded: colored headers, page numbers, better text wrapping.
 * @param content - Plain text or simple HTML (tags stripped).
 * @param title - Title used in the document and as the filename.
 */
export function generatePDF(content: string, title: string): void {
  const doc = new jsPDF();
  const cleanText = content.replace(/<[^>]*>/g, '').trim();

  // Title page styling
  doc.setFillColor(255, 107, 157); // Pink accent
  doc.rect(0, 0, 210, 15, 'F');

  doc.setFontSize(20);
  doc.setTextColor(255, 107, 157);
  doc.text(title, 105, 35, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text(`Crafted with love by Byeol for Dal • ${new Date().toLocaleDateString()}`, 105, 45, { align: 'center' });

  // Content
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  const lines = doc.splitTextToSize(cleanText, 180);

  let y = 60;
  const lineHeight = 7;
  const pageHeight = 280;

  for (let i = 0; i < lines.length; i++) {
    if (y + lineHeight > pageHeight) {
      doc.addPage();
      y = 20;
      // Add header on new page
      doc.setFillColor(255, 107, 157);
      doc.rect(0, 0, 210, 8, 'F');
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text(title, 105, 6, { align: 'center' });
      doc.setFontSize(12);
      doc.setTextColor(60, 60, 60);
    }
    doc.text(lines[i], 15, y);
    y += lineHeight;
  }

  // Footer with page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pageCount} • Byeol ✨`, 105, 290, { align: 'center' });
  }

  doc.save(`${title.replace(/\s/g, '_').replace(/[^a-zA-Z0-9_-]/g, '')}.pdf`);
}

/**
 * Generates a Word (DOCX) file and triggers download.
 * Upgraded: styled headings, proper paragraphs, metadata.
 * @param content - Plain text or simple HTML (tags stripped).
 * @param title - Title used in the document and as the filename.
 */
export async function generateDOCX(content: string, title: string): Promise<void> {
  const cleanText = content.replace(/<[^>]*>/g, '').trim();

  // Split into paragraphs
  const paragraphs = cleanText.split('\n\n').filter((p) => p.trim());

  const children: Paragraph[] = [
    // Title
    new Paragraph({
      text: title,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    // Subtitle
    new Paragraph({
      text: `Crafted with love by Byeol for Dal • ${new Date().toLocaleDateString()}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      run: { color: 'FF6B9D', size: 20 },
    }),
  ];

  // Content paragraphs
  for (const para of paragraphs) {
    // Check if it looks like a heading (short, no period)
    const isHeading = para.length < 60 && !para.includes('.');
    children.push(
      new Paragraph({
        text: para.trim(),
        heading: isHeading ? HeadingLevel.HEADING_2 : undefined,
        spacing: { after: 200, before: isHeading ? 200 : 0 },
        run: isHeading ? { bold: true, size: 26, color: 'A855F7' } : { size: 24 },
      })
    );
  }

  // Footer
  children.push(
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({
      text: '✨ Keep shining, Dal. Byeol is always here for you.',
      alignment: AlignmentType.CENTER,
      spacing: { before: 400 },
      run: { italics: true, color: 'FF6B9D', size: 22 },
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
    creator: 'Byeol',
    title,
    description: `Study artifact for Dal - ${title}`,
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/\s/g, '_').replace(/[^a-zA-Z0-9_-]/g, '')}.docx`;
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
  title: string = 'Byeol_Study_Artifact'
): Promise<void> {
  const safeTitle = title || 'Byeol_Artifact';
  if (type === 'pdf') {
    generatePDF(content, safeTitle);
  } else if (type === 'docx') {
    await generateDOCX(content, safeTitle);
  }
}

/**
 * Generates a plain text download.
 * @param content - Text content
 * @param title - Filename
 */
export function generateTXT(content: string, title: string): void {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/\s/g, '_').replace(/[^a-zA-Z0-9_-]/g, '')}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
