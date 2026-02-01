import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Humanity OAuth Demo',
  description: 'Example Next.js app using the Humanity SDK via Bun',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

