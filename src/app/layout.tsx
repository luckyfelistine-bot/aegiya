import type { Metadata, Viewport } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

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
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Byeol",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#030308" },
    { media: "(prefers-color-scheme: light)", color: "#030308" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="cosmic">
      <body className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable} antialiased`}>
        {children}
        {/* Visual overlays */}
        <div className="scanlines" aria-hidden="true" />
        <div className="scanlines-dense" aria-hidden="true" />
        <div className="noise-overlay" aria-hidden="true" />
        <div className="vignette" aria-hidden="true" />
        <div className="chromatic" aria-hidden="true" />
      </body>
    </html>
  );
}
