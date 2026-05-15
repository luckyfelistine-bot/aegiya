/**
 * generateArtifact.ts
 * Universal artifact generator for Byeol.
 */

import jsPDF from 'jspdf';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
  Header,
  Footer,
  PageNumber,
} from 'docx';

export type ArtifactType =
  | 'pdf' | 'docx' | 'txt' | 'md' | 'html' | 'latex'
  | 'css' | 'scss' | 'sass' | 'less' | 'svg' | 'xml' | 'xsl' | 'rss' | 'atom'
  | 'js' | 'ts' | 'jsx' | 'tsx' | 'mjs' | 'cjs' | 'vue' | 'svelte'
  | 'py' | 'ipynb'
  | 'json' | 'csv' | 'tsv' | 'yaml' | 'yml' | 'toml' | 'ini' | 'env' | 'log'
  | 'sql' | 'sh' | 'bash' | 'zsh' | 'ps1' | 'bat' | 'cmd'
  | 'c' | 'cpp' | 'h' | 'hpp' | 'cs' | 'java' | 'go' | 'rs' | 'swift' | 'kt' | 'dart'
  | 'rb' | 'php' | 'lua' | 'r' | 'matlab' | 'scala' | 'clj' | 'hs' | 'erl' | 'ex' | 'fs'
  | 'vb' | 'asm' | 'pl' | 'groovy' | 'coffee' | 'elm' | 'nim' | 'crystal' | 'v'
  | 'zip';

export interface ArtifactFile {
  name: string;
  content: string;
  type?: string;
}

export interface ArtifactConfig {
  type: ArtifactType;
  content: string;
  title?: string;
  filename?: string;
  metadata?: Record<string, any>;
  files?: ArtifactFile[];
  options?: {
    author?: string;
    subject?: string;
    keywords?: string[];
    pageNumbers?: boolean;
    headerText?: string;
    footerText?: string;
  };
}

const MIME_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  txt: 'text/plain', md: 'text/markdown', html: 'text/html', latex: 'application/x-latex',
  css: 'text/css', scss: 'text/x-scss', sass: 'text/x-sass', less: 'text/less',
  svg: 'image/svg+xml', xml: 'application/xml', xsl: 'application/xml',
  rss: 'application/rss+xml', atom: 'application/atom+xml',
  js: 'application/javascript', ts: 'application/typescript', jsx: 'text/jsx', tsx: 'text/tsx',
  mjs: 'application/javascript', cjs: 'application/javascript', vue: 'text/x-vue', svelte: 'text/x-svelte',
  py: 'text/x-python', ipynb: 'application/x-ipynb+json',
  json: 'application/json', csv: 'text/csv', tsv: 'text/tab-separated-values',
  yaml: 'application/x-yaml', yml: 'application/x-yaml', toml: 'application/toml',
  ini: 'text/x-ini', env: 'text/x-env', log: 'text/x-log',
  sql: 'application/sql', sh: 'application/x-sh', bash: 'application/x-sh', zsh: 'application/x-zsh',
  ps1: 'application/x-powershell', bat: 'application/x-bat', cmd: 'application/x-bat',
  c: 'text/x-c', cpp: 'text/x-c++', h: 'text/x-c', hpp: 'text/x-c++',
  cs: 'text/x-csharp', java: 'text/x-java', go: 'text/x-go', rs: 'text/x-rust',
  swift: 'text/x-swift', kt: 'text/x-kotlin', dart: 'text/x-dart',
  rb: 'text/x-ruby', php: 'application/x-php', lua: 'text/x-lua', r: 'text/x-r',
  matlab: 'text/x-matlab', scala: 'text/x-scala', clj: 'text/x-clojure',
  hs: 'text/x-haskell', erl: 'text/x-erlang', ex: 'text/x-elixir', fs: 'text/x-fsharp',
  vb: 'text/x-vb', asm: 'text/x-asm', pl: 'text/x-perl', groovy: 'text/x-groovy',
  coffee: 'text/coffeescript', elm: 'text/x-elm', nim: 'text/x-nim',
  crystal: 'text/x-crystal', v: 'text/x-vlang', zip: 'application/zip',
};

const EXTENSIONS: Record<ArtifactType, string> = {
  pdf: 'pdf', docx: 'docx', txt: 'txt', md: 'md', html: 'html', latex: 'tex',
  css: 'css', scss: 'scss', sass: 'sass', less: 'less', svg: 'svg', xml: 'xml',
  xsl: 'xsl', rss: 'rss', atom: 'atom', js: 'js', ts: 'ts', jsx: 'jsx', tsx: 'tsx',
  mjs: 'mjs', cjs: 'cjs', vue: 'vue', svelte: 'svelte', py: 'py', ipynb: 'ipynb',
  json: 'json', csv: 'csv', tsv: 'tsv', yaml: 'yaml', yml: 'yml', toml: 'toml',
  ini: 'ini', env: 'env', log: 'log', sql: 'sql', sh: 'sh', bash: 'sh', zsh: 'zsh',
  ps1: 'ps1', bat: 'bat', cmd: 'cmd', c: 'c', cpp: 'cpp', h: 'h', hpp: 'hpp',
  cs: 'cs', java: 'java', go: 'go', rs: 'rs', swift: 'swift', kt: 'kt', dart: 'dart',
  rb: 'rb', php: 'php', lua: 'lua', r: 'r', matlab: 'm', scala: 'scala', clj: 'clj',
  hs: 'hs', erl: 'erl', ex: 'ex', fs: 'fs', vb: 'vb', asm: 'asm', pl: 'pl',
  groovy: 'groovy', coffee: 'coffee', elm: 'elm', nim: 'nim', crystal: 'cr', v: 'v',
  zip: 'zip',
};

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadTextFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, filename);
}

export async function generateArtifact(config: ArtifactConfig): Promise<void> {
  const { type, content, title = 'Byeol_Artifact', filename, files, options } = config;
  const safeName = (filename || title)
    .replace(/[<>:"/\|?*\s]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

  if (type === 'pdf') {
    await generateEnhancedPDF(content, title, options);
  } else if (type === 'docx') {
    await generateEnhancedDOCX(content, title, options);
  } else if (type === 'zip') {
    await generateZIP(files || [], safeName);
  } else {
    const ext = EXTENSIONS[type] || type;
    const mime = MIME_TYPES[type] || 'text/plain';
    downloadTextFile(content, `${safeName}.${ext}`, mime);
  }
}

function sanitizeForPDF(text: string): string {
  return text.replace(/<[^>]*>/g, '');
}

export async function generateEnhancedPDF(
  content: string,
  title: string,
  options?: ArtifactConfig['options']
): Promise<void> {
  const doc = new jsPDF();
  const cleanText = sanitizeForPDF(content);
  const lines = cleanText.split('\n');

  doc.setFontSize(18);
  doc.setTextColor(45, 55, 72);
  doc.text(title, 105, 20, { align: 'center' });

  doc.setDrawColor(255, 107, 157);
  doc.setLineWidth(0.5);
  doc.line(20, 25, 190, 25);

  if (options?.author) {
    doc.setFontSize(9);
    doc.setTextColor(128, 128, 128);
    doc.text(`By ${options.author}`, 20, 32);
  }

  let y = 40;
  const margin = 20;
  const pageHeight = 280;
  const maxWidth = 170;

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!line.trim()) { y += 4; continue; }
    if (y > pageHeight) { doc.addPage(); y = 20; }

    if (line.startsWith('# ')) {
      doc.setFontSize(16); doc.setTextColor(45, 55, 72);
      const split = doc.splitTextToSize(line.slice(2), maxWidth);
      doc.text(split, margin, y); y += split.length * 7 + 4;
      doc.setFontSize(10); doc.setTextColor(0, 0, 0);
    } else if (line.startsWith('## ')) {
      doc.setFontSize(13); doc.setTextColor(74, 85, 104);
      const split = doc.splitTextToSize(line.slice(3), maxWidth);
      doc.text(split, margin, y); y += split.length * 6 + 3;
      doc.setFontSize(10); doc.setTextColor(0, 0, 0);
    } else if (line.startsWith('### ')) {
      doc.setFontSize(11); doc.setTextColor(74, 85, 104);
      const split = doc.splitTextToSize(line.slice(4), maxWidth);
      doc.text(split, margin, y); y += split.length * 5 + 2;
      doc.setFontSize(10); doc.setTextColor(0, 0, 0);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const split = doc.splitTextToSize('• ' + line.slice(2), maxWidth);
      doc.text(split, margin, y); y += split.length * 5 + 2;
    } else if (/^\d+\.\s/.test(line)) {
      const split = doc.splitTextToSize(line, maxWidth);
      doc.text(split, margin, y); y += split.length * 5 + 2;
    } else {
      const split = doc.splitTextToSize(line, maxWidth);
      doc.text(split, margin, y); y += split.length * 5 + 2;
    }
  }

  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${totalPages}`, 105, 292, { align: 'center' });
    if (options?.footerText) doc.text(options.footerText, 20, 292);
  }

  doc.save(`${title.replace(/\s/g, '_')}.pdf`);
}

export async function generateEnhancedDOCX(
  content: string,
  title: string,
  options?: ArtifactConfig['options']
): Promise<void> {
  const cleanText = sanitizeForPDF(content);
  const paragraphs = parseMarkdownToDOCX(cleanText);

  const children: any[] = [
    new Paragraph({
      children: [new TextRun({ text: title, bold: true, size: 32, color: '2D3748' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    }),
  ];

  if (options?.author) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: `By ${options.author}`, italics: true, size: 20, color: '718096' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
      })
    );
  }

  children.push(...paragraphs);

  const doc = new Document({
    sections: [{
      properties: {},
      children,
      ...(options?.headerText ? {
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [new TextRun({ text: options.headerText, size: 18, color: 'A0AEC0' })],
                alignment: AlignmentType.RIGHT,
              }),
            ],
          }),
        },
      } : {}),
      ...(options?.footerText || options?.pageNumbers ? {
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: options?.footerText ? options.footerText + '  |  ' : '', size: 18, color: 'A0AEC0' }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 18, color: 'A0AEC0' }),
                  new TextRun({ text: ' / ', size: 18, color: 'A0AEC0' }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: 'A0AEC0' }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        },
      } : {}),
    }],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `${title.replace(/\s/g, '_')}.docx`);
}

function parseMarkdownToDOCX(text: string): Paragraph[] {
  const lines = text.split('\n');
  const out: Paragraph[] = [];

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) { out.push(new Paragraph({ text: '' })); continue; }

    if (line.startsWith('# ')) {
      out.push(new Paragraph({
        children: [new TextRun({ text: line.slice(2), bold: true, size: 28, color: '2D3748' })],
        spacing: { after: 200 }, heading: HeadingLevel.HEADING_1,
      }));
    } else if (line.startsWith('## ')) {
      out.push(new Paragraph({
        children: [new TextRun({ text: line.slice(3), bold: true, size: 24, color: '4A5568' })],
        spacing: { after: 150 }, heading: HeadingLevel.HEADING_2,
      }));
    } else if (line.startsWith('### ')) {
      out.push(new Paragraph({
        children: [new TextRun({ text: line.slice(4), bold: true, size: 22, color: '4A5568' })],
        spacing: { after: 100 }, heading: HeadingLevel.HEADING_3,
      }));
    } else if (line.startsWith('#### ')) {
      out.push(new Paragraph({
        children: [new TextRun({ text: line.slice(5), bold: true, size: 22, color: '4A5568' })],
        spacing: { after: 80 }, heading: HeadingLevel.HEADING_4,
      }));
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      out.push(new Paragraph({
        children: [new TextRun({ text: '• ' + line.slice(2), size: 22 })],
        spacing: { after: 60 }, bullet: { level: 0 },
      }));
    } else if (/^\d+\.\s/.test(line)) {
      out.push(new Paragraph({
        children: [new TextRun({ text: line, size: 22 })],
        spacing: { after: 60 },
      }));
    } else if (line.startsWith('> ')) {
      out.push(new Paragraph({
        children: [new TextRun({ text: line.slice(2), italics: true, size: 22, color: '4A5568' })],
        spacing: { after: 80 }, indent: { left: 400 },
      }));
    } else if (line.startsWith('```')) {
      out.push(new Paragraph({ text: '' }));
    } else {
      out.push(new Paragraph({
        children: [new TextRun({ text: line, size: 22 })],
        spacing: { after: 80 },
      }));
    }
  }
  return out;
}

export async function generateZIP(files: ArtifactFile[], baseName: string): Promise<void> {
  try {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    for (const file of files) zip.file(file.name, file.content);
    const blob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(blob, `${baseName}.zip`);
  } catch (err) {
    console.warn('JSZip not available; falling back to individual downloads', err);
    for (const file of files) {
      const ext = file.name.split('.').pop() || 'txt';
      const mime = MIME_TYPES[ext] || 'text/plain';
      downloadTextFile(file.content, file.name, mime);
    }
  }
}

export function detectArtifactType(content: string): ArtifactType {
  const t = content.trim();
  if (t.startsWith('<!DOCTYPE html') || t.startsWith('<html')) return 'html';
  if (t.startsWith('<?xml')) return 'xml';
  if (t.startsWith('\\documentclass') || t.includes('\\begin{document}')) return 'latex';
  if (t.startsWith('---') && t.includes('title:')) return 'md';
  if (t.startsWith('# ') || t.startsWith('## ')) return 'md';
  if (t.startsWith('import ') || t.includes('export ') || t.includes('function ') || t.includes('const ')) {
    if (t.includes('React') || t.includes('jsx') || t.includes('tsx') || t.includes('return (')) return 'tsx';
    if (t.includes(':') && (t.includes('interface') || t.includes('type '))) return 'ts';
    if (t.includes('.vue')) return 'vue';
    if (t.includes('.svelte')) return 'svelte';
    return 'js';
  }
  if (t.startsWith('def ') || t.startsWith('class ') || (t.includes('import ') && t.includes('print('))) return 'py';
  if (t.startsWith('package ') && t.includes('class ')) return 'java';
  if (t.startsWith('using ') && t.includes('namespace')) return 'cs';
  if (t.startsWith('package main') || t.includes('func main()')) return 'go';
  if (t.startsWith('fn main()') || t.includes('use std::')) return 'rs';
  if (t.startsWith('#!/bin/bash') || t.startsWith('#!/bin/sh')) return 'sh';
  if ((t.startsWith('{') || t.startsWith('['))) {
    try { JSON.parse(t); return 'json'; } catch { /* not json */ }
  }
  if (t.includes(',') && t.split('\n').slice(1, 6).every(l => l.split(',').length > 1)) return 'csv';
  if (t.includes('|') && t.split('\n').slice(1, 6).every(l => l.split('|').length > 1)) return 'md';
  return 'txt';
}

export async function generateSmartArtifact(
  content: string,
  title?: string,
  preferredType?: ArtifactType
): Promise<void> {
  const type = preferredType || detectArtifactType(content);
  await generateArtifact({ type, content, title: title || 'Byeol_Artifact' });
}

// Legacy exports for backward compatibility
export function generatePDF(content: string, title: string): void {
  generateEnhancedPDF(content, title);
}

export function generateDOCX(content: string, title: string): Promise<void> {
  return generateEnhancedDOCX(content, title);
}
