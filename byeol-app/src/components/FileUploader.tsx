"use client";

import React, { useRef } from "react";
import { FileIcon } from "./SvgIcons";

interface FileUploaderProps {
  onUpload: (text: string, filename: string) => void;
}

export default function FileUploader({ onUpload }: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      onUpload(text, file.name);
    } catch (err) {
      console.error("File read error:", err);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>
      <button
        className="dock-btn"
        title="Upload a file"
        onClick={() => fileInputRef.current?.click()}
      >
        <FileIcon size={22} />
      </button>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.docx,.txt,.html,.css,.js"
        onChange={handleFile}
      />
    </>
  );
}
