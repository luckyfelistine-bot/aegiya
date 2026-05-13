"use client";

import React, { useRef, useEffect } from "react";
import { RefreshIcon, ExternalIcon } from "./SvgIcons";

interface PreviewFrameProps {
  html: string;
  onRefresh: () => void;
}

export default function PreviewFrame({ html, onRefresh }: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (iframeRef.current && html) {
      try {
        iframeRef.current.srcdoc = html;
        if (errorRef.current) errorRef.current.classList.remove("show");
      } catch (err: any) {
        if (errorRef.current) {
          errorRef.current.textContent = "⚠️ " + err.message;
          errorRef.current.classList.add("show");
        }
      }
    }
  }, [html]);

  const openInNewTab = () => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  return (
    <div className="pane glass" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="pane-header">
        <div className="pane-title">Live Preview</div>
        <div className="pane-actions">
          <button className="icon-btn" title="Refresh" onClick={onRefresh}>
            <RefreshIcon size={16} />
          </button>
          <button className="icon-btn" title="Open in new tab" onClick={openInNewTab}>
            <ExternalIcon size={16} />
          </button>
        </div>
      </div>
      <div className="preview-frame">
        <iframe
          ref={iframeRef}
          sandbox="allow-scripts"
          title="Live Preview"
          style={{ width: "100%", height: "100%", border: "none", background: "white" }}
        />
        <div className="error-overlay" ref={errorRef} />
      </div>
    </div>
  );
}
