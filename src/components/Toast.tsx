"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { InfoIcon, CheckIcon, WarningIcon, CloseIcon } from "./SvgIcons";

export type ToastType = "info" | "success" | "warning" | "error";

interface ToastItem {
  id: string;
  title: string;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastContextType {
  showToast: (title: string, message: string, type?: ToastType, duration?: number) => string;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (title: string, message: string, type: ToastType = "info", duration = 5000) => {
      const id = Math.random().toString(36).slice(2, 9);
      const toast: ToastItem = { id, title, message, type, duration };
      setToasts((prev) => [...prev, toast]);

      const timer = setTimeout(() => {
        dismissToast(id);
      }, duration);
      timersRef.current.set(id, timer);

      return id;
    },
    [dismissToast]
  );

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const iconMap = {
    info: <InfoIcon size={16} className="text-star-cyan" />,
    success: <CheckIcon size={16} className="text-star-pink" />,
    warning: <WarningIcon size={16} className="text-star-gold" />,
    error: <WarningIcon size={16} className="text-star-rose" />,
  };

  const bgMap = {
    info: "toast-icon info",
    success: "toast-icon success",
    warning: "toast-icon warning",
    error: "toast-icon error",
  };

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast">
            <div className={bgMap[toast.type]}>{iconMap[toast.type]}</div>
            <div className="toast-content">
              <div className="toast-title">{toast.title}</div>
              <div className="toast-message">{toast.message}</div>
            </div>
            <button
              className="toast-close"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
            >
              <CloseIcon size={14} />
            </button>
            <div className="toast-progress" />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
