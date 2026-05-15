"use client";

import { useEffect, useState } from "react";
import { AlertIcon, InfoIcon, CheckIcon, ErrorIcon } from "./SvgIcons";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, showToast, removeToast };
}

export default function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: ToastItem[];
  removeToast: (id: string) => void;
}) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function Toast({ toast, onClose }: { toast: ToastItem; onClose: () => void }) {
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHiding(true), 4700);
    const removeTimer = setTimeout(onClose, 5000);
    return () => {
      clearTimeout(timer);
      clearTimeout(removeTimer);
    };
  }, [onClose]);

  const icons = {
    success: <CheckIcon size={18} style={{ color: "var(--success)", flexShrink: 0 }} />,
    error: <ErrorIcon size={18} style={{ color: "var(--danger)", flexShrink: 0 }} />,
    warning: <AlertIcon size={18} style={{ color: "var(--warning)", flexShrink: 0 }} />,
    info: <InfoIcon size={18} style={{ color: "var(--info)", flexShrink: 0 }} />,
  };

  return (
    <div className={`toast ${hiding ? "hiding" : ""}`}>
      {icons[toast.type]}
      <span style={{ fontSize: "0.88rem", color: "var(--stardust)", flex: 1, lineHeight: 1.5 }}>
        {toast.message}
      </span>
      <button
        onClick={() => {
          setHiding(true);
          setTimeout(onClose, 300);
        }}
        style={{
          background: "none",
          border: "none",
          color: "var(--lunar)",
          cursor: "pointer",
          padding: 4,
          borderRadius: 4,
          transition: "color 0.2s",
        }}
        onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "var(--stardust)"; }}
        onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "var(--lunar)"; }}
      >
        <ErrorIcon size={14} />
      </button>
      <div className="toast-progress" />
    </div>
  );
}
