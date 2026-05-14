"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { memory } from "@/lib/memory";
import {
  CopyIcon,
  DownloadIcon,
  PlayIcon,
  RefreshIcon,
  ExternalLinkIcon,
  XIcon,
  FilePlusIcon,
  FolderIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from "@/components/SvgIcons";

const CodeMirror = dynamic(
  () => import("@uiw/react-codemirror").then((mod) => mod.default),
  { ssr: false }
);

interface WorkspaceViewProps {
  showToast: (type: "info" | "success" | "warning" | "error", title: string, message: string) => void;
  onClose: () => void;
}

interface ProjectFile {
  id: string;
  name: string;
  content: string;
  language: string;
  isOpen: boolean;
}

interface ProjectFolder {
  id: string;
  name: string;
  files: ProjectFile[];
  isExpanded: boolean;
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

const LANGUAGE_MAP: Record<string, any> = {
  html: html(),
  js: javascript(),
  jsx: javascript({ jsx: true }),
  ts: javascript({ typescript: true }),
  tsx: javascript({ jsx: true, typescript: true }),
  css: css(),
  json: json(),
  md: markdown(),
};

export default function WorkspaceView({ showToast, onClose }: WorkspaceViewProps) {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [previewKey, setPreviewKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"editor" | "preview" | "split">("split");
  const [language, setLanguage] = useState("html");
  const [projects, setProjects] = useState<ProjectFolder[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [showProjectPanel, setShowProjectPanel] = useState(true);
  const codeRef = useRef(code);

  // Keep ref in sync
  useEffect(() => { codeRef.current = code; }, [code]);

  // Listen for Byeol's code commands
  useEffect(() => {
    const handleSetCode = (e: any) => {
      const newCode = e.detail?.code || e.detail;
      setCode(newCode);
      setPreviewKey((k) => k + 1);
      showToast("success", "Code Updated", "Byeol updated the editor");
    };

    const handleGetCode = (e: any) => {
      if (e.detail?.callback) {
        e.detail.callback(codeRef.current);
      }
      window.dispatchEvent(
        new CustomEvent("byeol:editorCode", { detail: { code: codeRef.current } })
      );
    };

    window.addEventListener("byeol:setCode", handleSetCode);
    window.addEventListener("byeol:getCode", handleGetCode);

    return () => {
      window.removeEventListener("byeol:setCode", handleSetCode);
      window.removeEventListener("byeol:getCode", handleGetCode);
    };
  }, [showToast]);

  // Load saved code
  useEffect(() => {
    const load = async () => {
      try {
        const saved = await memory.getProfile("last_code");
        if (saved) setCode(saved);

        const savedProjects = await memory.getProfile("projects");
        if (savedProjects) setProjects(JSON.parse(savedProjects));
      } catch (e) {
        console.error("Load error:", e);
      }
    };
    load();
  }, []);

  // Auto-save
  const handleCodeChange = useCallback(
    (value: string) => {
      setCode(value);
      setError(null);
      const timeout = setTimeout(() => {
        memory.setProfile("last_code", value).catch(console.error);
      }, 2000);
      return () => clearTimeout(timeout);
    },
    []
  );

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

  const createProject = useCallback(async () => {
    const name = prompt("Project name?");
    if (!name) return;
    const newProject: ProjectFolder = {
      id: `proj-${Date.now()}`,
      name,
      files: [
        {
          id: `file-${Date.now()}`,
          name: "index.html",
          content: DEFAULT_CODE,
          language: "html",
          isOpen: true,
        },
      ],
      isExpanded: true,
    };
    const updated = [...projects, newProject];
    setProjects(updated);
    await memory.setProfile("projects", JSON.stringify(updated));
    showToast("success", "Project Created", `${name} is ready`);
  }, [projects, showToast]);

  const createFile = useCallback(
    async (projectId: string) => {
      const name = prompt("File name? (e.g. style.css)");
      if (!name) return;
      const ext = name.split(".").pop() || "html";
      const langMap: Record<string, string> = {
        html: "html", htm: "html", css: "css", js: "js", jsx: "jsx",
        ts: "ts", tsx: "tsx", json: "json", md: "md",
      };
      const newFile: ProjectFile = {
        id: `file-${Date.now()}`,
        name,
        content: "",
        language: langMap[ext] || "html",
        isOpen: true,
      };
      const updated = projects.map((p) =>
        p.id === projectId
          ? { ...p, files: [...p.files, newFile], isExpanded: true }
          : p
      );
      setProjects(updated);
      setActiveFile(newFile.id);
      setCode("");
      setLanguage(newFile.language);
      await memory.setProfile("projects", JSON.stringify(updated));
    },
    [projects]
  );

  const openFile = useCallback(
    (file: ProjectFile) => {
      setCode(file.content);
      setLanguage(file.language);
      setActiveFile(file.id);
      setPreviewKey((k) => k + 1);
    },
    []
  );

  const saveCurrentFile = useCallback(async () => {
    if (!activeFile) {
      // Save as new project
      await createProject();
      return;
    }
    const updated = projects.map((p) => ({
      ...p,
      files: p.files.map((f) =>
        f.id === activeFile ? { ...f, content: code } : f
      ),
    }));
    setProjects(updated);
    await memory.setProfile("projects", JSON.stringify(updated));
    showToast("success", "Saved!", "File saved to project");
  }, [activeFile, code, projects, createProject, showToast]);

  const extensions = [LANGUAGE_MAP[language] || html()];

  return (
    <div className="workspace-view">
      {/* Toolbar */}
      <div className="workspace-toolbar glass">
        <div className="toolbar-left">
          <button className="toolbar-btn" onClick={onClose} title="Close">
            <XIcon />
          </button>
          <div className="toolbar-divider" />
          <button
            className={`toolbar-btn ${viewMode === "editor" ? "active" : ""}`}
            onClick={() => setViewMode("editor")}
            title="Editor Only"
          >
            Editor
          </button>
          <button
            className={`toolbar-btn ${viewMode === "split" ? "active" : ""}`}
            onClick={() => setViewMode("split")}
            title="Split View"
          >
            Split
          </button>
          <button
            className={`toolbar-btn ${viewMode === "preview" ? "active" : ""}`}
            onClick={() => setViewMode("preview")}
            title="Preview Only"
          >
            Preview
          </button>
          <div className="toolbar-divider" />
          <button className="toolbar-btn" onClick={saveCurrentFile} title="Save">
            Save
          </button>
          <button className="toolbar-btn" onClick={runCode} title="Run">
            <PlayIcon /> Run
          </button>
        </div>
        <div className="toolbar-right">
          <button className="toolbar-btn" onClick={copyCode} title="Copy">
            <CopyIcon />
          </button>
          <button className="toolbar-btn" onClick={downloadCode} title="Download">
            <DownloadIcon />
          </button>
          <button className="toolbar-btn" onClick={() => setShowProjectPanel(!showProjectPanel)} title="Projects">
            <FolderIcon />
          </button>
        </div>
      </div>

      <div className="workspace-body">
        {/* Project Panel */}
        {showProjectPanel && (
          <div className="project-panel glass">
            <div className="project-panel-header">
              <span>Projects</span>
              <button className="icon-btn" onClick={createProject} title="New Project">
                <FilePlusIcon />
              </button>
            </div>
            <div className="project-list">
              {projects.length === 0 && (
                <div className="project-empty">
                  <p>No projects yet</p>
                  <button className="neon-btn" onClick={createProject}>
                    Create First Project
                  </button>
                </div>
              )}
              {projects.map((project) => (
                <div key={project.id} className="project-item">
                  <button
                    className="project-toggle"
                    onClick={() => {
                      const updated = projects.map((p) =>
                        p.id === project.id ? { ...p, isExpanded: !p.isExpanded } : p
                      );
                      setProjects(updated);
                    }}
                  >
                    {project.isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
                    <FolderIcon />
                    <span>{project.name}</span>
                  </button>
                  {project.isExpanded && (
                    <div className="file-list">
                      {project.files.map((file) => (
                        <button
                          key={file.id}
                          className={`file-item ${activeFile === file.id ? "active" : ""}`}
                          onClick={() => openFile(file)}
                        >
                          <span>{file.name}</span>
                        </button>
                      ))}
                      <button
                        className="add-file-btn"
                        onClick={() => createFile(project.id)}
                      >
                        + New File
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Editor + Preview */}
        <div className={`editor-preview-container ${viewMode}`}>
          {/* Editor Pane */}
          {(viewMode === "editor" || viewMode === "split") && (
            <div className="pane glass">
              <div className="pane-header">
                <div className="pane-title">
                  {activeFile ? projects.find((p) => p.files.find((f) => f.id === activeFile))?.files.find((f) => f.id === activeFile)?.name : "Untitled"}
                </div>
                <div className="pane-actions">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="lang-select"
                  >
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="js">JavaScript</option>
                    <option value="jsx">JSX</option>
                    <option value="ts">TypeScript</option>
                    <option value="tsx">TSX</option>
                    <option value="json">JSON</option>
                    <option value="md">Markdown</option>
                  </select>
                </div>
              </div>
              <div className="pane-content">
                <CodeMirror
                  value={code}
                  height="100%"
                  theme="dark"
                  extensions={extensions}
                  onChange={handleCodeChange}
                  basicSetup={{
                    lineNumbers: true,
                    highlightActiveLineGutter: true,
                    highlightActiveLine: true,
                    foldGutter: true,
                    autocompletion: true,
                    bracketMatching: true,
                    closeBrackets: true,
                  }}
                />
              </div>
            </div>
          )}

          {/* Preview Pane */}
          {(viewMode === "preview" || viewMode === "split") && (
            <div className="pane glass">
              <div className="pane-header">
                <div className="pane-title">Live Preview</div>
                <div className="pane-actions">
                  <button className="icon-btn" onClick={runCode} title="Refresh">
                    <RefreshIcon />
                  </button>
                  <button className="icon-btn" onClick={openPreview} title="Open in new tab">
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
                  <div className="error-overlay show">
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
