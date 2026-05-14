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

// Dynamically load CodeMirror (client only)
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
    body {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #1a1a2e, #16213e);
      font-family: 'Segoe UI', sans-serif;
      color: white;
    }
    .heart-container {
      text-align: center;
    }
    .heart {
      font-size: 5rem;
      animation: heartbeat 1.2s ease-in-out infinite;
      display: inline-block;
    }
    @keyframes heartbeat {
      0%, 100% { transform: scale(1); }
      25% { transform: scale(1.1); }
      50% { transform: scale(1); }
      75% { transform: scale(1.05); }
    }
    h1 {
      margin-top: 1rem;
      font-size: 1.5rem;
      color: #ff6b9d;
    }
    p {
      color: #8b8aa3;
      margin-top: 0.5rem;
    }
  </style>
</head>
<body>
  <div class="heart-container">
    <div class="heart">❤️</div>
    <h1>Dal's Heartbeat</h1>
    <p>Byeol is always with you 💫</p>
  </div>
</body>
</html>`;

export default function WorkspaceView({ showToast, onClose }: WorkspaceViewProps) {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [previewKey, setPreviewKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [layout, setLayout] = useState<"editor" | "preview" | "split">("split");

  // Load saved code
  useEffect(() => {
    const loadCode = async () => {
      try {
        const saved = await memory.getProfile("last_code");
        if (saved) setCode(saved);
      } catch (e) {
        console.error("Failed to load code:", e);
      }
    };
    loadCode();

    // Listen for code updates from AI
    const handleSetCode = (e: CustomEvent) => {
      setCode(e.detail.code);
      showToast("info", "Code Updated", "Byeol placed new code in the editor");
    };
    window.addEventListener("byeol:setCode", handleSetCode as EventListener);
    return () => window.removeEventListener("byeol:setCode", handleSetCode as EventListener);
  }, [showToast]);

  // Auto-save code
  const handleCodeChange = useCallback((value: string) => {
    setCode(value);
    setError(null);
    const timeout = setTimeout(() => {
      memory.setProfile("last_code", value).catch(console.error);
    }, 2000);
    return () => clearTimeout(timeout);
  }, []);

  const runCode = useCallback(() => {
    setPreviewKey((k) => k + 1);
    setError(null);
    showToast("success", "Preview Updated", "Your code is running!");
  }, [showToast]);

  const copyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      showToast("success", "Copied!", "Code copied to clipboard");
    } catch {
      showToast("error", "Copy Failed", "Could not copy to clipboard");
    }
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
      showToast("success", "Downloaded!", "Your project has been saved");
    } catch {
      showToast("error", "Download Failed", "Could not download file");
    }
  }, [code, showToast]);

  const openPreview = useCallback(() => {
    const blob = new Blob([code], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  }, [code]);

  return (
    <div className="workspace-view">
      {/* Toolbar */}
      <div className="workspace-toolbar glass">
        <div className="toolbar-left">
          <button className="toolbar-btn" onClick={onClose} title="Back to Universe">
            ← Back
          </button>
          <div className="toolbar-divider" />
          <button
            className={`toolbar-btn ${layout === "editor" ? "active" : ""}`}
            onClick={() => setLayout("editor")}
          >
            Editor
          </button>
          <button
            className={`toolbar-btn ${layout === "preview" ? "active" : ""}`}
            onClick={() => setLayout("preview")}
          >
            Preview
          </button>
          <button
            className={`toolbar-btn ${layout === "split" ? "active" : ""}`}
            onClick={() => setLayout("split")}
          >
            Split
          </button>
        </div>
        <div className="toolbar-right">
          <button className="toolbar-btn" onClick={copyCode} title="Copy">
            <CopyIcon /> Copy
          </button>
          <button className="toolbar-btn" onClick={downloadCode} title="Download">
            <DownloadIcon /> Download
          </button>
          <button className="toolbar-btn" onClick={runCode} title="Run">
            <PlayIcon /> Run
          </button>
          <button className="toolbar-btn" onClick={openPreview} title="Open in new tab">
            <ExternalLinkIcon /> New Tab
          </button>
        </div>
      </div>

      {/* Editor / Preview area */}
      <div className="workspace-body">
        <div className={`editor-preview-container ${layout}`}>
          {(layout === "editor" || layout === "split") && (
            <div className="pane glass">
              <div className="pane-header">
                <div className="pane-title">Source Code</div>
                <div className="pane-actions">
                  <button className="icon-btn" title="Copy" onClick={copyCode}>
                    <CopyIcon />
                  </button>
                  <button className="icon-btn" title="Download" onClick={downloadCode}>
                    <DownloadIcon />
                  </button>
                  <button className="icon-btn" title="Run" onClick={runCode}>
                    <PlayIcon />
                  </button>
                </div>
              </div>
              <div className="pane-content">
                <CodeMirror
                  value={code}
                  height="100%"
                  theme="dark"
                  extensions={[html()]}
                  onChange={handleCodeChange}
                  basicSetup={{
                    lineNumbers: true,
                    highlightActiveLineGutter: true,
                    highlightActiveLine: true,
                    foldGutter: false,
                  }}
                />
              </div>
            </div>
          )}

          {(layout === "preview" || layout === "split") && (
            <div className="pane glass">
              <div className="pane-header">
                <div className="pane-title">Live Preview</div>
                <div className="pane-actions">
                  <button className="icon-btn" title="Refresh" onClick={runCode}>
                    <RefreshIcon />
                  </button>
                  <button className="icon-btn" title="Open in new tab" onClick={openPreview}>
                    <ExternalLinkIcon />
                  </button>
                </div>
              </div>
              <div className="preview-frame">
                <iframe
                  key={previewKey}
                  srcDoc={code}
                  sandbox="allow-scripts allow-same-origin"
                  title="Preview"
                />
                {error && (
                  <div className={`error-overlay ${error ? "show" : ""}`}>
                    <div>{error}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
