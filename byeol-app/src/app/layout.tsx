import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Outfit, Space_Mono } from 'next/font/google';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Byeol — Dal\'s Personal Star',
  description: 'Crafted with love by Infinite for Dal. A cosmic coding companion.',
  manifest: '/manifest.json',
  themeColor: '#030308',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#030308',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="andromeda">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${outfit.variable} ${spaceMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
