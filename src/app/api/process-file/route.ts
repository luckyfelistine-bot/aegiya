import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const TEXT_EXTENSIONS = new Set([
  'txt', 'md', 'html', 'htm', 'css', 'scss', 'sass', 'less', 'svg', 'xml', 'xsl',
  'rss', 'atom', 'js', 'ts', 'jsx', 'tsx', 'mjs', 'cjs', 'vue', 'svelte', 'py',
  'json', 'csv', 'tsv', 'yaml', 'yml', 'toml', 'ini', 'env', 'log', 'sql', 'sh',
  'bash', 'zsh', 'ps1', 'bat', 'cmd', 'c', 'cpp', 'h', 'hpp', 'cs', 'java', 'go',
  'rs', 'swift', 'kt', 'dart', 'rb', 'php', 'lua', 'r', 'm', 'scala', 'clj', 'hs',
  'erl', 'ex', 'fs', 'vb', 'asm', 'pl', 'groovy', 'coffee', 'elm', 'nim', 'cr',
  'v', 'tex', 'bib', 'rtf', 'pod', 'rst', 'adoc', 'gradle', 'dockerfile', 'makefile',
  'cmake', 'graphql', 'prisma', 'sql', 'http', 'rest', 'lock', 'sum', 'mod', 'work',
  'nix', 'flake', 'dhall', 'cue', 'proto', 'thrift', 'avsc', 'pom', 'iml', 'editorconfig',
  'gitignore', 'gitattributes', 'npmrc', 'yarnrc', 'prettierrc', 'eslintrc', 'babelrc',
  'browserslistrc', 'nvmrc', 'node-version', 'ruby-version', 'python-version', 'java-version',
]);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const buffer = Buffer.from(await file.arrayBuffer());
    let text = '';
    let meta: Record<string, any> = { fileName: file.name, size: file.size, extension: ext };

    // ─── Plain Text / Code / Config / Markup / Data ───
    if (TEXT_EXTENSIONS.has(ext) || !ext) {
      // Try UTF-8 first, fallback to latin1
      try {
        text = new TextDecoder('utf-8', { fatal: true }).decode(buffer);
      } catch {
        text = new TextDecoder('iso-8859-1').decode(buffer);
      }
    }
    // ─── PDF ───
    else if (ext === 'pdf') {
      const pdfParse = (await import('pdf-parse')).default;
      const data = await pdfParse(buffer);
      text = data.text;
      meta.pdfInfo = data.info || {};
      meta.numpages = data.numpages;
      meta.numrender = data.numrender;
    }
    // ─── DOCX ───
    else if (ext === 'docx') {
      const mammoth = (await import('mammoth')).default;
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
      meta.messages = result.messages;
    }
    // ─── XLSX (basic text extraction) ───
    else if (ext === 'xlsx' || ext === 'xls') {
      try {
        const XLSX = await import('xlsx');
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetNames = workbook.SheetNames;
        const sheets: Record<string, string> = {};
        for (const name of sheetNames) {
          const sheet = workbook.Sheets[name];
          sheets[name] = XLSX.utils.sheet_to_csv(sheet);
        }
        text = Object.entries(sheets)
          .map(([name, csv]) => `--- Sheet: ${name} ---\n${csv}`)
          .join('\n\n');
        meta.sheets = sheetNames;
      } catch {
        return NextResponse.json(
          { error: `Failed to parse .${ext}. Install xlsx package if needed.` },
          { status: 400 }
        );
      }
    }
    // ─── EPUB (basic) ───
    else if (ext === 'epub') {
      return NextResponse.json(
        { error: 'EPUB parsing not yet implemented. Convert to PDF/DOCX or plain text first.' },
        { status: 400 }
      );
    }
    // ─── Unsupported ───
    else {
      return NextResponse.json(
        { error: `Unsupported file type: .${ext}. Supported: ${Array.from(TEXT_EXTENSIONS).join(', ')}, pdf, docx, xlsx` },
        { status: 400 }
      );
    }

    // ─── Truncate if massive ───
    const maxChars = 25000;
    const wasTruncated = text.length > maxChars;
    if (wasTruncated) {
      text = text.slice(0, maxChars) + '\n\n... [truncated]';
    }

    return NextResponse.json({
      fileName: file.name,
      text,
      meta,
      wasTruncated,
      charCount: text.length,
    });
  } catch (error: any) {
    console.error('File processing error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process file' },
      { status: 500 }
    );
  }
}
