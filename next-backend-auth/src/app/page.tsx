import { Header } from '@/components/Header';
import { LoginButton } from '@/components/LoginButton';
import { redirect } from 'next/navigation';
import { readAppSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default function HomePage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  // Redirect to dashboard if already logged in
  const session = readAppSession();
  if (session && session.expiresAt > Date.now()) {
    redirect('/dashboard');
  }

  const error = searchParams.error;

  return (
    <>
      <Header />
      
      <main className="container">
        {/* Error Alert */}
        {error && (
          <div className="alert alert-error mb-4">
            <strong>Authentication Error:</strong> {decodeURIComponent(error)}
          </div>
        )}

        {/* Hero Section */}
        <section className="hero">
          <h1 className="hero-title">
            <span>Humanity Protocol</span><br />Authentication Demo
          </h1>
          <p className="hero-subtitle">
            A complete example showing how to integrate Humanity Protocol OAuth
            with your own backend JWT authentication system.
          </p>
          <LoginButton>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            Connect with Humanity Protocol
          </LoginButton>
        </section>

        {/* Features */}
        <section className="mt-4">
          <h2 className="text-center mb-3">How It Works</h2>
          <div className="grid grid-3">
            <div className="feature-card">
              <div className="feature-icon">1</div>
              <h3>OAuth Authorization</h3>
              <p className="text-muted mt-1">
                User authorizes your app through Humanity Protocol&apos;s OAuth flow with PKCE protection.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">2</div>
              <h3>Backend Validation</h3>
              <p className="text-muted mt-1">
                Your backend validates the Humanity token and verifies presets like &quot;isHuman&quot;.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">3</div>
              <h3>Custom JWT</h3>
              <p className="text-muted mt-1">
                Issue your own JWT with custom claims for use throughout your application.
              </p>
            </div>
          </div>
        </section>

        {/* Code Example */}
        <section className="mt-4">
          <h2 className="mb-2">Integration Example</h2>
          <div className="card">
            <pre>
              <code>{`// Protect any API route with authentication
import { withAuth, requireHuman } from '@/lib/auth-middleware';

// Basic authentication
export const GET = withAuth(async (request, { user }) => {
  return NextResponse.json({ 
    message: \`Hello \${user.appScopedUserId}\` 
  });
});

// Require human verification for sensitive operations
export const POST = requireHuman(async (request, { user }) => {
  // Only verified humans can access this
  return NextResponse.json({ sensitive: 'data' });
});`}</code>
            </pre>
          </div>
        </section>

        {/* Architecture */}
        <section className="mt-4">
          <h2 className="mb-2">Architecture</h2>
          <div className="card">
            <pre style={{ fontSize: '0.75rem' }}>
              <code>{`┌─────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend  │────▶│  Your Backend   │────▶│ Humanity Proto  │
│             │     │                 │     │      API        │
└─────────────┘     └─────────────────┘     └─────────────────┘
      │                     │                       │
      │  1. OAuth Flow      │  2. Validate Token    │
      │     (PKCE)          │     + Verify Presets  │
      │                     │                       │
      │  4. Use App JWT     │  3. Issue App JWT     │
      │     for API calls   │     with user claims  │
      ▼                     ▼                       ▼`}</code>
            </pre>
          </div>
        </section>

        {/* API Endpoints */}
        <section className="mt-4 mb-4">
          <h2 className="mb-2">Available Endpoints</h2>
          <div className="grid grid-2">
            <div className="card">
              <h3>Authentication</h3>
              <ul className="mt-2" style={{ listStyle: 'none' }}>
                <li className="mb-1">
                  <code>POST /api/auth/login</code>
                  <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                    Initiates OAuth flow
                  </p>
                </li>
                <li className="mb-1">
                  <code>GET /api/auth/callback</code>
                  <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                    OAuth callback handler
                  </p>
                </li>
                <li className="mb-1">
                  <code>POST /api/auth/logout</code>
                  <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                    Clears session
                  </p>
                </li>
                <li>
                  <code>GET /api/auth/session</code>
                  <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                    Returns current session
                  </p>
                </li>
              </ul>
            </div>
            
            <div className="card">
              <h3>Protected Routes</h3>
              <ul className="mt-2" style={{ listStyle: 'none' }}>
                <li className="mb-1">
                  <code>GET /api/protected/profile</code>
                  <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                    User profile (auth required)
                  </p>
                </li>
                <li className="mb-1">
                  <code>GET /api/protected/sensitive</code>
                  <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                    Sensitive data (human required)
                  </p>
                </li>
                <li>
                  <code>POST /api/protected/verify-presets</code>
                  <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                    Re-verify presets on demand
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

