import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TrustMarket - Verified Sellers Only',
  description: 'A marketplace where sellers verify they are real humans',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
