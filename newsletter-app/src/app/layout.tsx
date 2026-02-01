import type { Metadata } from 'next';
import { DemoBanner } from '@/components/DemoBanner';
import { StickyFooterCTA } from '@/components/StickyFooterCTA';
import './globals.css';

export const metadata: Metadata = {
  title: 'Newsletter Demo | Humanity Protocol SDK',
  description: 'Example app showing how to build personalized experiences with the Humanity Protocol SDK.',
  icons: {
    icon: '/favicon.svg',
  },
};

function BackgroundEffects() {
  return (
    <div className="bg-effects">
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />
      <div className="bg-grid" />
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">
        <div className="page-wrapper">
          <BackgroundEffects />
          <div className="main-content">
            <DemoBanner />
            {children}
            <StickyFooterCTA />
          </div>
        </div>
      </body>
    </html>
  );
}
