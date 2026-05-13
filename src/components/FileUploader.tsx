"use client";
import { useRef, useState } from "react";

const ALLOWED_TYPES = [
  'text/plain','text/markdown','text/html','text/css','text/x-scss','text/x-sass',
  'text/less','application/javascript','application/typescript','text/jsx','text/tsx',
  'text/x-python','application/json','text/csv','text/tab-separated-values',
  'application/xml','text/x-yaml','application/sql','application/x-sh','text/x-c',
  'text/x-c++','text/x-java','text/x-go','text/x-rust','text/x-ruby','application/x-php',
  'text/x-lua','text/x-r','text/x-swift','text/x-kotlin','text/x-dart','text/x-csharp',
  'text/x-vue','text/x-svelte','application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
];

const ALLOWED_EXTS = [
  'txt','md','html','htm','css','scss','sass','less','js','ts','jsx','tsx','py',
  'json','csv','tsv','xml','yaml','yml','sql','sh','bash','c','cpp','h','hpp','java',
  'go','rs','rb','php','lua','r','swift','kt','dart','cs','vue','svelte','pdf',
  'docx','xlsx','xls',
];

export default function FileUploader() {
  const fileInputRef = useRef<<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const processFile = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const isAllowed = ALLOWED_EXTS.includes(ext) || ALLOWED_TYPES.includes(file.type);

    if (!isAllowed) {
      alert(`Unsupported file type: .${ext}`);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/process-file', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.error) {
        alert(`Upload error: ${data.error}`);
        return;
      }
      console.log('File processed:', data);
      window.dispatchEvent(new CustomEvent('byeol:fileProcessed', { detail: data }));
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload file.');
    }
  };

  const handleFile = async (e: React.ChangeEvent<<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
    e.target.value = '';
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`relative inline-block ${dragOver ? 'scale-110' : ''} transition-transform`}
    >
      <button
        onClick={() => fileInputRef.current?.click()}
        className="p-2 rounded-full bg-[var(--primary)] text-white hover:opacity-90 transition"
        title="Upload a file (click or drop)"
      >
        📎
      </button>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={ALLOWED_EXTS.map(e => `.${e}`).join(',')}
        onChange={handleFile}
      />
    </div>
  );
}
