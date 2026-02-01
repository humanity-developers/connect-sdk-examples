import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'QuickLoan - Instant Pre-qualification',
  description: 'See if you pre-qualify for a loan in seconds',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
