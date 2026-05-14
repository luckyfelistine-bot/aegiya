// src/components/FileUploader.tsx
"use client";

import React, { useRef, useCallback } from "react";
import { PaperclipIcon, CloseIcon } from "./SvgIcons";

/**
 * File attachment structure
 */
export interface FileAttachment {
  name: string;
  type: string;
  content: string;
  size: number;
}

/**
 * Props for FileUploader component
 */
interface FileUploaderProps {
  attachments: FileAttachment[];
  onAttachmentsChange: (attachments: FileAttachment[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
}

/**
 * Valid file types for upload
 */
const VALID_TYPES = [
  "text/plain",
  "text/html",
  "text/css",
  "text/javascript",
  "application/javascript",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const VALID_EXTENSIONS = [".txt", ".html", ".css", ".js", ".pdf", ".docx"];

/**
 * FileUploader - Reusable file upload component
 * Handles file reading, validation, and attachment management
 */
export default function FileUploader({
  attachments,
  onAttachmentsChange,
  accept = ".txt,.html,.css,.js,.pdf,.docx",
  multiple = true,
  maxSize = 5 * 1024 * 1024, // 5MB default
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Validate file type
   */
  const isValidFile = useCallback((file: File): boolean => {
    if (VALID_TYPES.includes(file.type)) return true;
    return VALID_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext));
  }, []);

  /**
   * Handle file selection
   */
  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      const newAttachments: FileAttachment[] = [];

      for (const file of Array.from(files)) {
        // Check file size
        if (file.size > maxSize) {
          console.warn(`File ${file.name} exceeds max size`);
          continue;
        }

        // Check file type
        if (!isValidFile(file)) {
          console.warn(`File ${file.name} is not a valid type`);
          continue;
        }

        try {
          const content = await file.text();
          newAttachments.push({
            name: file.name,
            type: file.type || "text/plain",
            content,
            size: file.size,
          });
        } catch (error) {
          console.error(`Failed to read file ${file.name}:`, error);
        }
      }

      onAttachmentsChange([...attachments, ...newAttachments]);

      // Reset input
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [attachments, onAttachmentsChange, maxSize, isValidFile]
  );

  /**
   * Remove an attachment
   */
  const removeAttachment = useCallback(
    (index: number) => {
      onAttachmentsChange(attachments.filter((_, i) => i !== index));
    },
    [attachments, onAttachmentsChange]
  );

  /**
   * Format file size for display
   */
  const formatSize = useCallback((bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }, []);

  return (
    <div className="flex flex-col gap-2">
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Upload files"
      />

      {/* Attachment list */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((attachment, index) => (
            <div
              key={`${attachment.name}-${index}`}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-glass-border text-xs group"
            >
              <PaperclipIcon size={12} className="text-starlight/50" />
              <span className="text-starlight/80 max-w-[150px] truncate">
                {attachment.name}
              </span>
              <span className="text-starlight/40">{formatSize(attachment.size)}</span>
              <button
                onClick={() => removeAttachment(index)}
                className="p-0.5 rounded hover:bg-white/20 transition-colors opacity-0 group-hover:opacity-100"
                aria-label={`Remove ${attachment.name}`}
              >
                <CloseIcon size={12} className="text-starlight/50" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <button
        onClick={() => inputRef.current?.click()}
        className="glass-button p-2 w-fit"
        title="Attach files"
      >
        <PaperclipIcon size={16} />
        <span className="text-xs">Attach</span>
      </button>
    </div>
  );
}
