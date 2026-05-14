"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { memory } from "@/lib/memory";
import { html } from "@codemirror/lang-html";
import {
  CopyIcon,
  DownloadIcon,
  PlayIcon,
  RefreshIcon,
  ExternalLinkIcon,
} from "@/components/SvgIcons";

const CodeMirror = dynamic(
  () => import("@uiw/react-codemirror").then((mod) => mod.default),
  { ssr: false }
);

interface WorkspaceViewProps {
  showToast: (type: "info" | "success" | "warning" | "error", title: string, message: string) => void;
  onClose: () => void;
}

const DEFAULT_CODE = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: linear-gradient(135deg, #1a1a2e, #16213e); font-family: 'Segoe UI', sans-serif; color: white; }
    .heart-container { text-align: center; }
    .heart { font-size: 5rem; animation: heartbeat 1.2s ease-in-out infinite; }
    @keyframes heartbeat { 0%,100%{transform:scale(1)} 25%{transform:scale(1.1)} 50%{transform:scale(1)} 75%{transform:scale(1.05)} }
    h1 { margin-top: 1rem; color: #ff6b9d; }
    p { color: #8b8aa3; }
  </style>
</head>
<body>
  <div class="heart-container"><div class="heart">❤️</div><h1>Dal's Heartbeat</h1><p>Byeol is always with you 💫</p></div>
</body>
</html>`;

export default function WorkspaceView({ showToast, onClose }: WorkspaceViewProps) {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [previewKey, setPreviewKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [layout, setLayout] = useState<"editor" | "preview" | "split">("split");

  useEffect(() => {
    const loadCode = async () => {
      try {
        const saved = await memory.getProfile("last_code");
        if (saved) setCode(saved);
      } catch (e) { console.error(e); }
    };
    loadCode();

    const handleSetCode = (e: CustomEvent) => {
      setCode(e.detail.code);
      showToast("info", "Code Updated", "Byeol placed new code in the editor");
    };
    window.addEventListener("byeol:setCode", handleSetCode as EventListener);
    return () => window.removeEventListener("byeol:setCode", handleSetCode as EventListener);
  }, [showToast]);

  const handleCodeChange = useCallback((value: string) => {
    setCode(value);
    setError(null);
    const timeout = setTimeout(() => {
      memory.setProfile("last_code", value).catch(console.error);
    }, 2000);
    return () => clearTimeout(timeout);
  }, []);

  const runCode = useCallback(() => {
    setPreviewKey(prev => prev + 1);
    setError(null);
    showToast("success", "Preview Updated", "Your code is running!");
  }, [showToast]);

  const copyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      showToast("success", "Copied!", "Code copied to clipboard");
    } catch { showToast("error", "Copy Failed", "Could not copy to clipboard"); }
  }, [code, showToast]);

  const downloadCode = useCallback(() => {
    try {
      const blob = new Blob([code], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "byeol-project.html";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("success", "Downloaded!", "Project saved");
    } catch { showToast("error", "Download Failed", "Could not download file"); }
  }, [code, showToast]);

  const openPreview = useCallback(() => {
    const blob = new Blob([code], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  }, [code]);

  // Inline styles to force correct layout
  const splitContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    gap: '12px',
    width: '100%',
    height: '100%',
  };

  const paneStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  const editorPreviewStyle = (isSplit: boolean) => {
    if (!isSplit) return { width: '100%', height: '100%' };
    return splitContainerStyle;
  };

  return (
    <div className="workspace-view">
      {/* Toolbar */}
      <div className="workspace-toolbar glass">
        <div className="toolbar-left">
          <button className="toolbar-btn" onClick={onClose}>← Back</button>
          <div className="toolbar-divider" />
          <button className={`toolbar-btn ${layout === "editor" ? "active" : ""}`} onClick={() => setLayout("editor")}>Editor</button>
          <button className={`toolbar-btn ${layout === "preview" ? "active" : ""}`} onClick={() => setLayout("preview")}>Preview</button>
          <button className={`toolbar-btn ${layout === "split" ? "active" : ""}`} onClick={() => setLayout("split")}>Split</button>
        </div>
        <div className="toolbar-right">
          <button className="toolbar-btn" onClick={copyCode}><CopyIcon /> Copy</button>
          <button className="toolbar-btn" onClick={downloadCode}><DownloadIcon /> Download</button>
          <button className="toolbar-btn" onClick={runCode}><PlayIcon /> Run</button>
          <button className="toolbar-btn" onClick={openPreview}><ExternalLinkIcon /> New Tab</button>
        </div>
      </div>

      {/* Main area */}
      <div className="workspace-body">
        <div style={editorPreviewStyle(layout === "split")}>
          {(layout === "editor" || layout === "split") && (
            <div style={layout === "split" ? paneStyle : { ...paneStyle, width: '100%' }} className="pane glass">
              <div className="pane-header">
                <div className="pane-title">Source Code</div>
                <div className="pane-actions">
                  <button className="icon-btn" title="Copy" onClick={copyCode}><CopyIcon /></button>
                  <button className="icon-btn" title="Download" onClick={downloadCode}><DownloadIcon /></button>
                  <button className="icon-btn" title="Run" onClick={runCode}><PlayIcon /></button>
                </div>
              </div>
              <div className="pane-content" style={{ flex: 1, overflow: 'auto' }}>
                <CodeMirror
                  value={code}
                  height="100%"
                  theme="dark"
                  extensions={[html()]}
                  onChange={handleCodeChange}
                  basicSetup={{ lineNumbers: true, highlightActiveLineGutter: true, highlightActiveLine: true }}
                />
              </div>
            </div>
          )}

          {(layout === "preview" || layout === "split") && (
            <div style={layout === "split" ? paneStyle : { ...paneStyle, width: '100%' }} className="pane glass">
              <div className="pane-header">
                <div className="pane-title">Live Preview</div>
                <div className="pane-actions">
                  <button className="icon-btn" title="Refresh" onClick={runCode}><RefreshIcon /></button>
                  <button className="icon-btn" title="Open in new tab" onClick={openPreview}><ExternalLinkIcon /></button>
                </div>
              </div>
              <div className="preview-frame" style={{ flex: 1, position: 'relative' }}>
                <iframe
                  key={previewKey}
                  srcDoc={code}
                  sandbox="allow-scripts allow-same-origin"
                  title="Preview"
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
                {error && <div className="error-overlay show"><div>{error}</div></div>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
