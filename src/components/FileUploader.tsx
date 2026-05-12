"use client";
import { useRef } from "react";

export default function FileUploader() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // We'll eventually send the file content to the chat API;
    // for now, just log the file name.
    console.log("File selected:", file.name);
    // TODO: upload and insert text into chat
  };

  return (
    <button
      onClick={() => fileInputRef.current?.click()}
      className="p-2 rounded-full bg-[var(--primary)]"
      title="Upload a file"
    >
      📎
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFile} />
    </button>
  );
}
