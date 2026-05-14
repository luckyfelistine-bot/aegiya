// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";

/**
 * Display font for headings and brand elements
 */
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

/**
 * Body font for readable text
 */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

/**
 * Monospace font for code and technical content
 */
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

/**
 * Metadata for the Byeol application
 * Optimized for PWA and SEO
 */
export const metadata: Metadata = {
  title: "Byeol — For Dal",
  description: "A personal AI companion built with love for Dal. Explore the universe, create code, and chat with Byeol.",
  keywords: ["AI", "companion", "Byeol", "Dal", "universe", "code editor", "chat"],
  authors: [{ name: "Byeol" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
  themeColor: "#050510",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Byeol",
  },
};

/**
 * Viewport configuration for responsive design
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#050510" },
    { media: "(prefers-color-scheme: light)", color: "#050510" },
  ],
};

/**
 * Root layout component
 * Wraps the entire application with font variables and global structure
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      data-theme="cosmic"
    >
      <body className="font-body antialiased overflow-hidden bg-void text-starlight">
        {children}
      </body>
    </html>
  );
}
