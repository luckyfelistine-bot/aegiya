// src/components/WorkspaceView.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  RunIcon,
  CopyIcon,
  DownloadIcon,
  ExternalLinkIcon,
  LayoutIcon,
  SplitIcon,
  MaximizeIcon,
  MinimizeIcon,
  CheckIcon,
  RefreshIcon,
} from "./SvgIcons";

/**
 * Layout modes for the workspace
 */
type LayoutMode = "editor" | "preview" | "split";

/**
 * Props for WorkspaceView
 */
interface WorkspaceViewProps {
  className?: string;
}

/**
 * Default starter code for the editor
 */
const DEFAULT_CODE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Creation</title>
  <style>
    body {
      font-family: 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #1a1a2e, #16213e);
      color: #e8e8ff;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
    }
    .card {
      background: rgba(255,255,255,0.05);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      padding: 40px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    h1 { color: #c084fc; margin-bottom: 10px; }
    p { color: rgba(232,232,255,0.6); }
  </style>
</head>
<body>
  <div class="card">
    <h1>Hello, Dal!</h1>
    <p>Welcome to your creative workspace.</p>
  </div>
</body>
</html>`;

/**
 * WorkspaceView - Code editor with live preview
 * Supports layout switching, auto-save, and external code injection
 */
export default function WorkspaceView({ className = "" }: WorkspaceViewProps) {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [layout, setLayout] = useState<LayoutMode>("split");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  /**
   * Load saved code from IndexedDB on mount
   */
  useEffect(() => {
    const loadCode = async () => {
      try {
        const { default: memory } = await import("@/lib/memory");
        const saved = await memory.getProfile("workspaceCode");
        if (saved) {
          setCode(saved);
        }
      } catch {
        // Use default code
      }
    };
    loadCode();
  }, []);

  /**
   * Auto-save code to IndexedDB
   */
  useEffect(() => {
    const saveTimer = setTimeout(async () => {
      try {
        const { default: memory } = await import("@/lib/memory");
        await memory.setProfile("workspaceCode", code);
      } catch {
        // Silently fail
      }
    }, 1000);

    return () => clearTimeout(saveTimer);
  }, [code]);

  /**
   * Listen for external code events from AI chat
   */
  useEffect(() => {
    const handleSetCode = (e: CustomEvent<string>) => {
      if (e.detail) {
        setCode(e.detail);
        setPreviewKey((k) => k + 1);
      }
    };

    window.addEventListener("byeol:setCode", handleSetCode as EventListener);
    return () => {
      window.removeEventListener("byeol:setCode", handleSetCode as EventListener);
    };
  }, []);

  /**
   * Handle code changes
   */
  const handleCodeChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  }, []);

  /**
   * Run/preview the code
   */
  const handleRun = useCallback(() => {
    setPreviewKey((k) => k + 1);
  }, []);

  /**
   * Copy code to clipboard
   */
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select all and copy
      if (editorRef.current) {
        editorRef.current.select();
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  }, [code]);

  /**
   * Download code as HTML file
   */
  const handleDownload = useCallback(() => {
    const blob = new Blob([code], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-creation.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [code]);

  /**
   * Open preview in new tab
   */
  const handleOpenNewTab = useCallback(() => {
    const blob = new Blob([code], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  }, [code]);

  /**
   * Toggle fullscreen mode
   */
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  /**
   * Get layout classes based on current mode
   */
  const getLayoutClasses = () => {
    switch (layout) {
      case "editor":
        return "grid-cols-1";
      case "preview":
        return "grid-cols-1";
      case "split":
        return "grid-cols-1 md:grid-cols-2";
      default:
        return "grid-cols-1 md:grid-cols-2";
    }
  };

  /**
   * Get visibility for editor panel
   */
  const isEditorVisible = layout === "editor" || layout === "split";
  const isPreviewVisible = layout === "preview" || layout === "split";

  return (
    <div className={`flex flex-col h-full ${className} ${isFullscreen ? "fixed inset-0 z-[100] bg-void" : ""}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 glass-surface border-b border-glass-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-display font-semibold text-sm text-starlight mr-4">Workspace</span>

          {/* Layout toggles */}
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setLayout("editor")}
              className={`p-2 rounded-md transition-all ${
                layout === "editor" ? "bg-white/15 text-aurora" : "text-starlight/50 hover:text-starlight"
              }`}
              title="Editor only"
            >
              <LayoutIcon size={16} />
            </button>
            <button
              onClick={() => setLayout("split")}
              className={`p-2 rounded-md transition-all ${
                layout === "split" ? "bg-white/15 text-aurora" : "text-starlight/50 hover:text-starlight"
              }`}
              title="Split view"
            >
              <SplitIcon size={16} />
            </button>
            <button
              onClick={() => setLayout("preview")}
              className={`p-2 rounded-md transition-all ${
                layout === "preview" ? "bg-white/15 text-aurora" : "text-starlight/50 hover:text-starlight"
              }`}
              title="Preview only"
            >
              <RefreshIcon size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRun}
            className="glass-button px-4 py-2 text-sm font-medium hover:bg-aurora/20 hover:border-aurora/50"
          >
            <RunIcon size={16} />
            <span className="hidden sm:inline">Run</span>
          </button>

          <button
            onClick={handleCopy}
            className="glass-button p-2"
            title="Copy code"
          >
            {copied ? <CheckIcon size={16} className="text-success" /> : <CopyIcon size={16} />}
          </button>

          <button
            onClick={handleDownload}
            className="glass-button p-2"
            title="Download HTML"
          >
            <DownloadIcon size={16} />
          </button>

          <button
            onClick={handleOpenNewTab}
            className="glass-button p-2"
            title="Open in new tab"
          >
            <ExternalLinkIcon size={16} />
          </button>

          <button
            onClick={toggleFullscreen}
            className="glass-button p-2"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <MinimizeIcon size={16} /> : <MaximizeIcon size={16} />}
          </button>
        </div>
      </div>

      {/* Editor + Preview Grid */}
      <div className={`flex-1 grid ${getLayoutClasses()} gap-0 overflow-hidden`}>
        {/* Editor Panel */}
        {isEditorVisible && (
          <div className="relative flex flex-col min-h-0">
            <div className="absolute top-2 right-2 z-10">
              <span className="text-[10px] uppercase tracking-wider text-starlight/30 bg-void/80 px-2 py-1 rounded">
                HTML
              </span>
            </div>
            <textarea
              ref={editorRef}
              value={code}
              onChange={handleCodeChange}
              className="flex-1 w-full h-full bg-eclipse text-starlight font-mono text-sm p-4 resize-none outline-none border-none leading-relaxed"
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              aria-label="Code editor"
            />
          </div>
        )}

        {/* Preview Panel */}
        {isPreviewVisible && (
          <div className="relative flex flex-col min-h-0 bg-white">
            <div className="absolute top-2 right-2 z-10">
              <span className="text-[10px] uppercase tracking-wider text-gray-500 bg-white/90 px-2 py-1 rounded shadow">
                Preview
              </span>
            </div>
            <iframe
              ref={iframeRef}
              key={previewKey}
              srcDoc={code}
              className="flex-1 w-full h-full border-none"
              sandbox="allow-scripts allow-same-origin"
              title="Preview"
            />
          </div>
        )}
      </div>
    </div>
  );
}
