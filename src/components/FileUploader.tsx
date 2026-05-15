"use client";

import { useState, useCallback } from "react";
import { PaperclipIcon, FileIcon, XIcon } from "./SvgIcons";

export interface UploadedFile {
  name: string;
  type: string;
  size: number;
  content?: string;
}

interface FileUploaderProps {
  onFilesSelected: (files: UploadedFile[]) => void;
  attachments: UploadedFile[];
  onRemove: (index: number) => void;
}

export default function FileUploader({ onFilesSelected, attachments, onRemove }: FileUploaderProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      processFiles(files);
    },
    []
  );

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
    e.target.value = "";
  }, []);

  const processFiles = (files: File[]) => {
    const processed: UploadedFile[] = [];
    let pending = files.length;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        processed.push({
          name: file.name,
          type: file.type,
          size: file.size,
          content: reader.result as string,
        });
        pending--;
        if (pending === 0) onFilesSelected(processed);
      };
      reader.onerror = () => {
        pending--;
        if (pending === 0 && processed.length > 0) onFilesSelected(processed);
      };
      if (file.type.startsWith("text/") || file.name.endsWith(".md") || file.name.endsWith(".json") || file.name.endsWith(".js") || file.name.endsWith(".ts") || file.name.endsWith(".tsx") || file.name.endsWith(".css") || file.name.endsWith(".html")) {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <label
        className={`file-uploader ${dragOver ? "dragover" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <PaperclipIcon size={24} style={{ marginBottom: 8, opacity: 0.5 }} />
        <p style={{ fontSize: "0.85rem", marginBottom: 4 }}>Drop files here or click to upload</p>
        <p style={{ fontSize: "0.7rem", opacity: 0.4 }}>Supports: .txt, .md, .js, .ts, .html, .css, images</p>
        <input
          type="file"
          multiple
          onChange={handleInput}
          style={{ display: "none" }}
          accept=".txt,.md,.json,.js,.ts,.tsx,.css,.html,.pdf,.doc,.docx,.png,.jpg,.jpeg"
        />
      </label>
      {attachments.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {attachments.map((att, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 12px",
                background: "var(--glass)",
                border: "1px solid var(--glass-border)",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.78rem",
              }}
            >
              <FileIcon size={12} />
              <span style={{ maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {att.name}
              </span>
              <button
                onClick={() => onRemove(i)}
                style={{ background: "none", border: "none", color: "var(--lunar)", cursor: "pointer", padding: 2 }}
              >
                <XIcon size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
