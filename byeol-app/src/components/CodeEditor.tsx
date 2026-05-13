"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightActiveLine } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import { html } from "@codemirror/lang-html";
import { oneDark } from "@codemirror/theme-one-dark";
import { memory } from "@/lib/memory";
import { CopyIcon, DownloadIcon, PlayIcon } from "./SvgIcons";

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  onRun: () => void;
}

const cosmicTheme = EditorView.theme({
  "&": {
    backgroundColor: "transparent",
    fontSize: "0.85rem",
    fontFamily: "var(--font-mono), 'Space Mono', monospace",
    height: "100%",
  },
  ".cm-content": {
    color: "var(--text-secondary)",
    caretColor: "var(--star-cyan)",
    lineHeight: "1.7",
  },
  ".cm-gutters": {
    backgroundColor: "transparent",
    borderRight: "1px solid var(--glass-border)",
    color: "var(--text-ghost)",
    fontFamily: "var(--font-mono), 'Space Mono', monospace",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "rgba(255,255,255,0.03)",
    color: "var(--text-secondary)",
  },
  ".cm-activeLine": {
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  ".cm-selectionBackground": {
    backgroundColor: "color-mix(in srgb, var(--star-cyan) 20%, transparent) !important",
  },
  ".cm-cursor": {
    borderLeftColor: "var(--star-cyan)",
  },
  ".cm-scroller": {
    fontFamily: "var(--font-mono), 'Space Mono', monospace",
    lineHeight: "1.7",
    overflow: "auto",
  },
}, { dark: true });

export default function CodeEditor({ code, onChange, onRun }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    if (!editorRef.current || viewRef.current) return;

    const state = EditorState.create({
      doc: code,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        html(),
        cosmicTheme,
        oneDark,
        keymap.of([...defaultKeymap, indentWithTab]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged && !isUpdatingRef.current) {
            const newCode = update.state.doc.toString();
            onChange(newCode);
            if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
            autoSaveRef.current = setTimeout(() => {
              memory.setProfile("lastCode", newCode);
              memory.setProfile("lastCodeTime", Date.now());
            }, 2000);
          }
        }),
      ],
    });

    const view = new EditorView({ state, parent: editorRef.current });
    viewRef.current = view;

    return () => { view.destroy(); viewRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const currentText = view.state.doc.toString();
    if (currentText === code) return;

    isUpdatingRef.current = true;
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: code },
    });
    requestAnimationFrame(() => { isUpdatingRef.current = false; });
  }, [code]);

  const copyCode = useCallback(() => {
    const text = viewRef.current?.state.doc.toString() || "";
    navigator.clipboard.writeText(text);
  }, []);

  const downloadCode = useCallback(() => {
    const text = viewRef.current?.state.doc.toString() || "";
    const blob = new Blob([text], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "byeol-project.html";
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div className="pane glass" style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div className="pane-header">
        <div className="pane-title">Source Code</div>
        <div className="pane-actions">
          <button className="icon-btn" title="Copy" onClick={copyCode}><CopyIcon size={16} /></button>
          <button className="icon-btn" title="Download" onClick={downloadCode}><DownloadIcon size={16} /></button>
          <button className="icon-btn" title="Run" onClick={onRun}><PlayIcon size={16} /></button>
        </div>
      </div>
      <div ref={editorRef} style={{ flex: 1, overflow: "hidden", minHeight: 0 }} />
    </div>
  );
}
