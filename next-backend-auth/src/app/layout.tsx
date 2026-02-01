import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Humanity Protocol Auth Example',
  description: 'Example Next.js app demonstrating Humanity Protocol OAuth integration with backend JWT authentication',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

