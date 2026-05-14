"use client";

import { useEffect, useState } from "react";
import {
  InfoIcon,
  CheckIcon,
  AlertIcon,
  ErrorIcon,
  CloseIcon,
} from "@/components/SvgIcons";

interface ToastProps {
  show: boolean;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  onClose: () => void;
}

const icons = {
  info: InfoIcon,
  success: CheckIcon,
  warning: AlertIcon,
  error: ErrorIcon,
};

export default function Toast({ show, type, title, message, onClose }: ToastProps) {
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    if (show) {
      setHiding(false);
      const timer = setTimeout(() => {
        setHiding(true);
        setTimeout(onClose, 300);
      }, 4700);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show && !hiding) return null;

  const Icon = icons[type];

  return (
    <div className="toast-container">
      <div className={`toast ${hiding ? "hiding" : ""}`}>
        <div className={`toast-icon ${type}`}>
          <Icon size={20} />
        </div>
        <div className="toast-content">
          <div className="toast-title">{title}</div>
          <div className="toast-message">{message}</div>
        </div>
        <button
          className="toast-close"
          onClick={() => {
            setHiding(true);
            setTimeout(onClose, 300);
          }}
          aria-label="Close notification"
        >
          <CloseIcon size={16} />
        </button>
        <div className="toast-progress" />
      </div>
    </div>
  );
}
