"use client";
import { useRef, useEffect } from "react";

interface PreviewFrameProps {
  html: string;
}

export default function PreviewFrame({ html }: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current && html) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
      }
    }
  }, [html]);

  return (
    <iframe
      ref={iframeRef}
      className="w-full h-full"
      sandbox="allow-scripts"
      title="Live Preview"
    />
  );
}
