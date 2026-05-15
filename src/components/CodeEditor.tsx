"use client";

import { useState, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import { CopyIcon, DownloadIcon, RunIcon, RefreshIcon, SaveIcon } from "./SvgIcons";
import { generatePDF, downloadBlob } from "@/utils/generateArtifact";

interface CodeEditorProps {
  initialCode?: string;
  language?: string;
  onRun?: (code: string) => void;
  onSave?: (code: string, language: string) => void;
}

export default function CodeEditor({ initialCode = "", language = "javascript", onRun, onSave }: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [lang, setLang] = useState(language);

  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  const getExtension = () => {
    switch (lang) {
      case "javascript":
      case "typescript":
        return javascript();
      case "html":
        return html();
      case "css":
        return css();
      case "python":
        return python();
      default:
        return javascript();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
  };

  const handleDownload = async () => {
    const blob = await generatePDF(code, `Code Export - ${new Date().toLocaleDateString()}`);
    downloadBlob(blob, `code-export-${Date.now()}.pdf`);
  };

  const handleRun = () => {
    onRun?.(code);
  };

  const handleSave = () => {
    onSave?.(code, lang);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 10 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          style={{
            padding: "7px 12px",
            background: "var(--glass)",
            border: "1px solid var(--glass-border)",
            borderRadius: "var(--radius-sm)",
            color: "var(--stardust)",
            fontSize: "0.82rem",
            cursor: "pointer",
          }}
        >
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
          <option value="python">Python</option>
        </select>
        <button className="glass-button" onClick={handleCopy}>
          <CopyIcon size={14} />
          <span>Copy</span>
        </button>
        <button className="glass-button" onClick={handleDownload}>
          <DownloadIcon size={14} />
          <span>PDF</span>
        </button>
        <button className="glass-button active" onClick={handleRun}>
          <RunIcon size={14} />
          <span>Run</span>
        </button>
        <button className="glass-button" onClick={handleSave}>
          <SaveIcon size={14} />
          <span>Save</span>
        </button>
        <button className="glass-button" onClick={() => setCode("")}>
          <RefreshIcon size={14} />
          <span>Clear</span>
        </button>
      </div>
      <div style={{ flex: 1, borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--glass-border)" }}>
        <CodeMirror
          value={code}
          height="100%"
          theme={oneDark}
          extensions={[getExtension()]}
          onChange={(value) => setCode(value)}
          style={{ fontSize: "0.88rem" }}
        />
      </div>
    </div>
  );
}
