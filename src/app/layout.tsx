import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/ThemePicker';

export const metadata: Metadata = {
  title: 'Byeol — Your Personal Star',
  description: 'Crafted with love by Dal for Maureen',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
