import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Humanity Protocol — Cognito Integration Example',
  description:
    'Example: exchange an AWS Cognito JWT for a Humanity Protocol OAuth token using the JWT Bearer Grant (RFC 7523)',
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
