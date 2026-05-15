"use client";

import { useState } from "react";
import { FolderIcon, FolderOpenIcon, FileIcon, PlusIcon, TrashIcon, EditIcon } from "./SvgIcons";

export interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  content?: string;
  language?: string;
  children?: FileNode[];
  isOpen?: boolean;
}

interface FileExplorerProps {
  files: FileNode[];
  onSelect: (file: FileNode) => void;
  onCreate: (parentId: string | null, type: "file" | "folder", name: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
  selectedId?: string;
}

export default function FileExplorer({ files, onSelect, onCreate, onDelete, onRename, selectedId }: FileExplorerProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [renaming, setRenaming] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState<{ parentId: string | null; type: "file" | "folder" } | null>(null);
  const [createName, setCreateName] = useState("");

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const startRename = (file: FileNode) => {
    setRenaming(file.id);
    setNewName(file.name);
  };

  const confirmRename = () => {
    if (renaming && newName.trim()) {
      onRename(renaming, newName.trim());
    }
    setRenaming(null);
    setNewName("");
  };

  const startCreate = (parentId: string | null, type: "file" | "folder") => {
    setCreating({ parentId, type });
    setCreateName("");
  };

  const confirmCreate = () => {
    if (creating && createName.trim()) {
      onCreate(creating.parentId, creating.type, createName.trim());
    }
    setCreating(null);
    setCreateName("");
  };

  const renderNode = (node: FileNode, depth: number = 0) => {
    const isExpanded = expanded.has(node.id);
    const isSelected = selectedId === node.id;
    const isFolder = node.type === "folder";

    return (
      <div key={node.id}>
        <div
          className={`file-item ${isFolder ? "folder" : ""} ${isSelected ? "active" : ""}`}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
          onClick={() => {
            if (isFolder) {
              toggleExpand(node.id);
            } else {
              onSelect(node);
            }
          }}
        >
          {isFolder ? (
            isExpanded ? <FolderOpenIcon size={16} /> : <FolderIcon size={16} />
          ) : (
            <FileIcon size={16} />
          )}
          {renaming === node.id ? (
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={confirmRename}
              onKeyDown={(e) => e.key === "Enter" && confirmRename()}
              autoFocus
              style={{
                background: "var(--glass)",
                border: "1px solid var(--accent)",
                borderRadius: "var(--radius-sm)",
                padding: "2px 8px",
                color: "var(--stardust)",
                fontSize: "0.85rem",
                flex: 1,
              }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {node.name}
            </span>
          )}
          <div style={{ display: "flex", gap: 4, opacity: 0, transition: "opacity 0.2s" }} className="file-actions">
            {isFolder && (
              <button
                onClick={(e) => { e.stopPropagation(); startCreate(node.id, "file"); }}
                style={{ background: "none", border: "none", color: "var(--lunar)", cursor: "pointer", padding: 2 }}
              >
                <PlusIcon size={12} />
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); startRename(node); }}
              style={{ background: "none", border: "none", color: "var(--lunar)", cursor: "pointer", padding: 2 }}
            >
              <EditIcon size={12} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
              style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", padding: 2 }}
            >
              <TrashIcon size={12} />
            </button>
          </div>
        </div>
        {isFolder && isExpanded && node.children && (
          <div>
            {node.children.map((child) => renderNode(child, depth + 1))}
            {creating?.parentId === node.id && (
              <div className="file-item" style={{ paddingLeft: `${12 + (depth + 1) * 16}px` }}>
                {creating.type === "folder" ? <FolderIcon size={16} /> : <FileIcon size={16} />}
                <input
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  onBlur={confirmCreate}
                  onKeyDown={(e) => e.key === "Enter" && confirmCreate()}
                  autoFocus
                  placeholder={`New ${creating.type}...`}
                  style={{
                    background: "var(--glass)",
                    border: "1px solid var(--accent)",
                    borderRadius: "var(--radius-sm)",
                    padding: "2px 8px",
                    color: "var(--stardust)",
                    fontSize: "0.85rem",
                    flex: 1,
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="file-explorer">
      <div className="file-explorer-header">
        <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>Projects</span>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            className="glass-button"
            style={{ padding: "6px 10px" }}
            onClick={() => startCreate(null, "folder")}
          >
            <PlusIcon size={14} />
            <span>Folder</span>
          </button>
          <button
            className="glass-button"
            style={{ padding: "6px 10px" }}
            onClick={() => startCreate(null, "file")}
          >
            <PlusIcon size={14} />
            <span>File</span>
          </button>
        </div>
      </div>
      <div className="file-tree scrollable">
        {files.map((node) => renderNode(node))}
        {creating?.parentId === null && (
          <div className="file-item">
            {creating.type === "folder" ? <FolderIcon size={16} /> : <FileIcon size={16} />}
            <input
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              onBlur={confirmCreate}
              onKeyDown={(e) => e.key === "Enter" && confirmCreate()}
              autoFocus
              placeholder={`New ${creating.type}...`}
              style={{
                background: "var(--glass)",
                border: "1px solid var(--accent)",
                borderRadius: "var(--radius-sm)",
                padding: "2px 8px",
                color: "var(--stardust)",
                fontSize: "0.85rem",
                flex: 1,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
