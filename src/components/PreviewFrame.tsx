"use client";

import { useEffect, useRef } from "react";

interface PreviewFrameProps {
  code: string;
  language: string;
}

export default function PreviewFrame({ code, language }: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let src = "";
    if (language === "html" || language === "htm") {
      src = code;
    } else if (language === "css") {
      src = `<style>${code}</style><div style="padding:20px;font-family:sans-serif"><h1>CSS Preview</h1><p>Your CSS is applied to this page.</p><div class="test-box" style="width:100px;height:100px;background:#c084fc;margin-top:20px;border-radius:12px"></div></div>`;
    } else if (language === "javascript" || language === "js" || language === "typescript" || language === "ts") {
      src = `<script>try{${code}}catch(e){document.write('<pre style="color:red;padding:20px">Error: '+e.message+'</pre>')}</script><div style="padding:20px;font-family:sans-serif"><h1>JS Preview</h1><p>Check the console for output.</p></div>`;
    } else {
      src = `<pre style="padding:20px;font-family:monospace;font-size:0.9rem">${code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>`;
    }

    iframe.srcdoc = src;
  }, [code, language]);

  return (
    <div style={{ width: "100%", height: "100%", borderRadius: "0 0 var(--radius-md) var(--radius-md)", overflow: "hidden", background: "white" }}>
      <iframe
        ref={iframeRef}
        title="preview"
        sandbox="allow-scripts allow-same-origin"
        style={{ width: "100%", height: "100%", border: "none" }}
      />
    </div>
  );
}
