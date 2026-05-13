import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/ThemePicker';
import InstallButton from '@/components/InstallButton';

export const metadata: Metadata = {
  title: 'Byeol – Dal\'s Personal Star',
  description: 'Crafted with love by Infinite for Dal',
  manifest: '/manifest.json',
  themeColor: '#ec4899',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          {children}
          <InstallButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
