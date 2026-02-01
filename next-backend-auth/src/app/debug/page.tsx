import { Header } from '@/components/Header';
import { DebugPanel } from '@/components/DebugPanel';

export const dynamic = 'force-dynamic';

export default function DebugPage() {
  // Collect environment info server-side
  const envStatus = {
    clientId: !!process.env.NEXT_PUBLIC_HUMANITY_CLIENT_ID,
    clientSecret: !!process.env.NEXT_PUBLIC_HUMANITY_CLIENT_SECRET,
    redirectUri: process.env.NEXT_PUBLIC_HUMANITY_REDIRECT_URI || null,
    baseUrl: process.env.NEXT_PUBLIC_HUMANITY_BASE_URL || null,
    jwtSecret: !!process.env.NEXT_PUBLIC_APP_JWT_SECRET,
    jwtSecretLength: process.env.NEXT_PUBLIC_APP_JWT_SECRET?.length || 0,
  };

  return (
    <>
      <Header />
      
      <main className="container">
        <section className="mb-4">
          <h1>Debug Tools</h1>
          <p className="text-muted">
            Interactive debugging utilities for Humanity Protocol integration.
            Use these tools to inspect tokens, verify configuration, and diagnose issues.
          </p>
        </section>

        <DebugPanel envStatus={envStatus} />
      </main>
    </>
  );
}

