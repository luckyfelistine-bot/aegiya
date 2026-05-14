// src/components/SvgIcons.tsx
import React from "react";

interface IconProps {
  size?: number;
  className?: string;
}

const createIcon = (children: React.ReactNode, { size = 24, className = "" }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

// Existing icons (keep all your current ones)
export const StarIcon = ({ size = 24, className = "" }: IconProps) =>
  createIcon(<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />, { size, className });

export const HeartIcon = ({ size = 24, className = "" }: IconProps) =>
  createIcon(<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />, { size, className });

export const CodeIcon = ({ size = 24, className = "" }: IconProps) =>
  createIcon(<><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></>, { size, className });

export const ChatIcon = ({ size = 24, className = "" }: IconProps) =>
  createIcon(<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />, { size, className });

export const SettingsIcon = ({ size = 24, className = "" }: IconProps) =>
  createIcon(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></>, { size, className });

export const CloseIcon = ({ size = 24, className = "" }: IconProps) =>
  createIcon(<><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>, { size, className });

// Add missing XIcon (alias for CloseIcon if you prefer)
export const XIcon = CloseIcon;

export const CopyIcon = ({ size = 24, className = "" }: IconProps) =>
  createIcon(<><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>, { size, className });

export const DownloadIcon = ({ size = 24, className = "" }: IconProps) =>
  createIcon(<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>, { size, className });

export const RunIcon = ({ size = 24, className = "" }: IconProps) =>
  createIcon(<polygon points="5 3 19 12 5 21 5 3" />, { size, className });

export const PlayIcon = RunIcon;

export const RefreshIcon = ({ size = 24, className = "" }: IconProps) =>
  createIcon(<><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></>, { size, className });

export const ExternalLinkIcon = ({ size = 24, className = "" }: IconProps) =>
  createIcon(<><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></>, { size, className });

export const PaperclipIcon = ({ size = 24, className = "" }: IconProps) =>
  createIcon(<path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />, { size, className });

export const SendIcon = ({ size = 24, className = "" }: IconProps) =>
  createIcon(<><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></>, { size, className });

export const MicIcon = ({ size = 24, className = "" }: IconProps) =>
  createIcon(<><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></>, { size, className });

export const FileIcon = ({ size = 24, className = "" }: IconProps) =>
  createIcon(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></>, { size, className });

export const CalendarIcon = ({ size = 24, className = "" }: IconProps) =>
  createIcon(<><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>, { size, className });

export const ConstellationIcon = ({ size = 24, className = "" }: IconProps) =>
  createIcon(<><circle cx="12" cy="12" r="1" /><circle cx="18" cy="6" r="1" /><circle cx="6" cy="18" r="1" /><circle cx="6" cy="6" r="1" /><circle cx="18" cy="18" r="1" /><line x1="12" y1="12" x2="18" y2="6" /><line x1="12" y1="12" x2="6" y2="18" /><line x1="12" y1="12" x2="6" y2="6" /><line x1="12" y1="12" x2="18" y2="18" /><line x1="6" y1="6" x2="18" y2="6" /><line x1="6" y1="18" x2="18" y2="18" /></>, { size, className });

export const DoveIcon = ({ size = 24, className = "" }: IconProps) =>
  createIcon(<><path d="M12 2C8 2 5 5 5 9c0 3 2 5 4 7l3 6 3-6c2-2 4-4 4-7 0-4-3-7-7-7z" /><path d="M12 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" /></>, { size, className });

export const SparklesIcon = ({ size = 24, className = "" }: IconProps) =>
  createIcon(<><path d="M12 3L14.5 8.5L20 11L14.5 13.5L12 19L9.5 13.5L4 11L9.5 8.5L12 3Z" /><path d="M5 3L6 5L8 6L6 7L5 9L4 7L2 6L4 5L5 3Z" /><path d="M19 15L20 17L22 18L20 19L19 21L18 19L16 18L18 17L19 15Z" /></>, { size, className });

export const HomeIcon = ({ size = 24, className = "" }: IconProps) =>
  createIcon(<><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>, { size, className });

export const PlaneIcon = ({ size = 24, className = "" }: IconProps) =>
  createIcon(<><path d="M22 2L11 13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></>, { size, className });

export const BuildingIcon = ({ size = 24, className = "" }: IconProps) =>
  createIcon(<><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><line x1="9" y1="22" x2="9" y2="2" /><line x1="15" y1="22" x2="15" y2="2" /><line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="7" x2="15" y2="7" /><line x1="9" y1="17" x2="15" y2="17" /></>, { size, className });

export const MapPinIcon = ({ size = 24, className = "" }: IconProps) =>
  createIcon(<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></>, { size, className });

export const CarIcon = ({ size = 24, className = "" }: IconProps) =>
  createIcon(<><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-5.25a1 1 0 0 0-.9-.55H8.5a1 1 0 0 0-.9.55L5 11l-3.16.86a1 1 0 0 0-.84.99V16h3m10 0h-5" /><circle cx="6.5" cy="16.5" r="2.5" /><circle cx="17.5" cy="16.5" r="2.5" /></>, { size, className });

export const BabyIcon = ({ size = 24, className = "" }: IconProps) =>
  createIcon(<><path d="M9 12h.01" /><path d="M15 12h.01" /><path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5" /><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3 1.33 5 3.3z" /></>, { size, className });

export const MenuIcon = ({ size = 24, className = "" }: IconProps) =>
  createIcon(<><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></>, { size, className });

export const CheckIcon = ({ size = 24, className = "" }: IconProps) =>
  createIcon(<polyline points="20 6 9 17 4 12" />, { size, className });

export const AlertIcon = ({ size = 24, className = "" }: IconProps) =>
  createIcon(<><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>, { size, className });

export const InfoIcon = ({ size = 24, className = "" }: IconProps) =>
  createIcon(<><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></>, { size, className });

export const ErrorIcon = ({ size = 24, className = "" }: IconProps) =>
  createIcon(<><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /><line x1="8" y1="8" x2="16" y2="16" /></>, { size, className });

export const MoonIcon = ({ size = 24, className = "" }: IconProps) =>
  createIcon(<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />, { size, className });

export const SunIcon = ({ size = 24, className = "" }: IconProps) =>
  createIcon(<><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></>, { size, className });

export const PaletteIcon = ({ size = 24, className = "" }: IconProps) =>
  createIcon(<><circle cx="13.5" cy="6.5" r=".5" fill="currentColor" /><circle cx="17.5" cy="10.5" r=".5" fill="currentColor" /><circle cx="8.5" cy="7.5" r=".5" fill="currentColor" /><circle cx="6.5" cy="12.5" r=".5" fill="currentColor" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.01 17.461 2 12 2z" /></>, { size, className });

export const TrashIcon = ({ size = 24, className = "" }: IconProps) =>
  createIcon(<><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></>, { size, className });

export const EditIcon = ({ size = 24, className = "" }: IconProps) =>
  createIcon(<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></>, { size, className });

export const EyeIcon = ({ size = 24, className = "" }: IconProps) =>
  createIcon(<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>, { size, className });

export const EyeOffIcon = ({ size = 24, className = "" }: IconProps) =>
  createIcon(<><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>, { size, className });

export const ZapIcon = ({ size = 24, className = "" }: IconProps) =>
  createIcon(<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />, { size, className });

export const GlobeIcon = ({ size = 24, className = "" }: IconProps) =>
  createIcon(<><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>, { size, className });

export const LayoutIcon = ({ size = 24, className = "" }: IconProps) =>
  createIcon(<><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></>, { size, className });

export const SplitIcon = ({ size = 24, className = "" }: IconProps) =>
  createIcon(<><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="12" y1="3" x2="12" y2="21" /></>, { size, className });

export const MaximizeIcon = ({ size = 24, className = "" }: IconProps) =>
  createIcon(<><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" /></>, { size, className });

export const MinimizeIcon = ({ size = 24, className = "" }: IconProps) =>
  createIcon(<><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" /></>, { size, className });

export const ChevronRightIcon = ({ size = 24, className = "" }: IconProps) =>
  createIcon(<polyline points="9 18 15 12 9 6" />, { size, className });

export const ArrowRightIcon = ChevronRightIcon; // Alias for ArrowRightIcon

export const ChevronLeftIcon = ({ size = 24, className = "" }: IconProps) =>
  createIcon(<polyline points="15 18 9 12 15 6" />, { size, className });

export const ChevronDownIcon = ({ size = 24, className = "" }: IconProps) =>
  createIcon(<polyline points="6 9 12 15 18 9" />, { size, className });

export const UserIcon = ({ size = 24, className = "" }: IconProps) =>
  createIcon(<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>, { size, className });

export const LoaderIcon = ({ size = 24, className = "" }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`animate-spin ${className}`}
    aria-hidden="true"
  >
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
  </svg>
);
