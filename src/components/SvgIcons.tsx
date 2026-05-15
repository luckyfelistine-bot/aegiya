import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

const createIcon = (
  children: React.ReactNode,
  { size = 24, className = "", ...rest }: IconProps
) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...rest}
  >
    {children}
  </svg>
);

export const StarIcon = (props: IconProps) =>
  createIcon(<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />, props);

export const HeartIcon = (props: IconProps) =>
  createIcon(<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />, props);

export const CodeIcon = (props: IconProps) =>
  createIcon(<><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></>, props);

export const ChatIcon = (props: IconProps) =>
  createIcon(<><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></>, props);

export const SettingsIcon = (props: IconProps) =>
  createIcon(<><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></>, props);

export const CloseIcon = (props: IconProps) =>
  createIcon(<><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>, props);

export const XIcon = CloseIcon;

export const CopyIcon = (props: IconProps) =>
  createIcon(<><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>, props);

export const DownloadIcon = (props: IconProps) =>
  createIcon(<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>, props);

export const RunIcon = (props: IconProps) =>
  createIcon(<><polygon points="5 3 19 12 5 21 5 3" /></>, props);

export const PlayIcon = RunIcon;

export const RefreshIcon = (props: IconProps) =>
  createIcon(<><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></>, props);

export const ExternalLinkIcon = (props: IconProps) =>
  createIcon(<><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></>, props);

export const PaperclipIcon = (props: IconProps) =>
  createIcon(<><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></>, props);

export const SendIcon = (props: IconProps) =>
  createIcon(<><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></>, props);

export const MicIcon = (props: IconProps) =>
  createIcon(<><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></>, props);

export const FileIcon = (props: IconProps) =>
  createIcon(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></>, props);

export const FolderIcon = (props: IconProps) =>
  createIcon(<><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></>, props);

export const FolderOpenIcon = (props: IconProps) =>
  createIcon(<><path d="M6 17h12l2-9H8l-2-3H2v12a2 2 0 0 0 2 2z" /><path d="M6 17l-2 3h14l2-3" /></>, props);

export const PlusIcon = (props: IconProps) =>
  createIcon(<><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>, props);

export const CalendarIcon = (props: IconProps) =>
  createIcon(<><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>, props);

export const ConstellationIcon = (props: IconProps) =>
  createIcon(<><circle cx="12" cy="12" r="1" /><circle cx="18" cy="6" r="1" /><circle cx="6" cy="18" r="1" /><line x1="12" y1="12" x2="18" y2="6" /><line x1="12" y1="12" x2="6" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></>, props);

export const SparklesIcon = (props: IconProps) =>
  createIcon(<><path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" /></>, props);

export const HomeIcon = (props: IconProps) =>
  createIcon(<><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>, props);

export const PlaneIcon = (props: IconProps) =>
  createIcon(<><path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" /></>, props);

export const BuildingIcon = (props: IconProps) =>
  createIcon(<><path d="M3 21h18" /><path d="M5 21V7l8-4 8 4v14" /><path d="M9 21v-6h6v6" /></>, props);

export const MapPinIcon = (props: IconProps) =>
  createIcon(<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></>, props);

export const CarIcon = (props: IconProps) =>
  createIcon(<><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" /><circle cx="6.5" cy="16.5" r="2.5" /><circle cx="16.5" cy="16.5" r="2.5" /></>, props);

export const BabyIcon = (props: IconProps) =>
  createIcon(<><path d="M9 12h.01" /><path d="M15 12h.01" /><path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5" /><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3 1 4 1.5" /></>, props);

export const MenuIcon = (props: IconProps) =>
  createIcon(<><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></>, props);

export const CheckIcon = (props: IconProps) =>
  createIcon(<polyline points="20 6 9 17 4 12" />, props);

export const AlertIcon = (props: IconProps) =>
  createIcon(<><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>, props);

export const InfoIcon = (props: IconProps) =>
  createIcon(<><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></>, props);

export const ErrorIcon = (props: IconProps) =>
  createIcon(<><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></>, props);

export const MoonIcon = (props: IconProps) =>
  createIcon(<><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></>, props);

export const SunIcon = (props: IconProps) =>
  createIcon(<><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></>, props);

export const PaletteIcon = (props: IconProps) =>
  createIcon(<><circle cx="13.5" cy="6.5" r=".5" /><circle cx="17.5" cy="10.5" r=".5" /><circle cx="8.5" cy="7.5" r=".5" /><circle cx="6.5" cy="12.5" r=".5" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.01 17.461 2 12 2z" /></>, props);

export const TrashIcon = (props: IconProps) =>
  createIcon(<><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>, props);

export const EditIcon = (props: IconProps) =>
  createIcon(<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></>, props);

export const EyeIcon = (props: IconProps) =>
  createIcon(<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>, props);

export const EyeOffIcon = (props: IconProps) =>
  createIcon(<><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>, props);

export const ZapIcon = (props: IconProps) =>
  createIcon(<><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></>, props);

export const GlobeIcon = (props: IconProps) =>
  createIcon(<><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>, props);

export const LayoutIcon = (props: IconProps) =>
  createIcon(<><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></>, props);

export const SplitIcon = (props: IconProps) =>
  createIcon(<><path d="M16 3h3v3h-3z" /><path d="M8 3h3v3H8z" /><path d="M11 8h3v3h-3z" /><path d="M3 8h3v3H3z" /><path d="M16 8h3v3h-3z" /><path d="M8 13h3v3H8z" /><path d="M3 13h3v3H3z" /><path d="M16 13h3v3h-3z" /><path d="M11 18h3v3h-3z" /><path d="M3 18h3v3H3z" /><path d="M16 18h3v3h-3z" /></>, props);

export const MaximizeIcon = (props: IconProps) =>
  createIcon(<><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" /></>, props);

export const MinimizeIcon = (props: IconProps) =>
  createIcon(<><path x1="8" y1="3" x2="8" y2="3" /><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" /></>, props);

export const ChevronRightIcon = (props: IconProps) =>
  createIcon(<polyline points="9 18 15 12 9 6" />, props);

export const ArrowRightIcon = ChevronRightIcon;

export const ChevronLeftIcon = (props: IconProps) =>
  createIcon(<polyline points="15 18 9 12 15 6" />, props);

export const ChevronDownIcon = (props: IconProps) =>
  createIcon(<polyline points="6 9 12 15 18 9" />, props);

export const ChevronUpIcon = (props: IconProps) =>
  createIcon(<polyline points="18 15 12 9 6 15" />, props);

export const UserIcon = (props: IconProps) =>
  createIcon(<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>, props);

export const LoaderIcon = ({ size = 24, className = "", ...rest }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`animate-spin ${className}`}
    {...rest}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export const BarChartIcon = (props: IconProps) =>
  createIcon(<><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></>, props);

export const SearchIcon = (props: IconProps) =>
  createIcon(<><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>, props);

export const MoreVerticalIcon = (props: IconProps) =>
  createIcon(<><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></>, props);

export const SaveIcon = (props: IconProps) =>
  createIcon(<><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></>, props);

export const TerminalIcon = (props: IconProps) =>
  createIcon(<><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></>, props);
