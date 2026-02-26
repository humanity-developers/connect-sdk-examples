import { redirect } from 'next/navigation';
import { getHumanityTokens, getCognitoTokens } from '@/services/session';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  // Already fully authenticated → skip login screen
  const [hp, cog] = await Promise.all([getHumanityTokens(), getCognitoTokens()]);
  if (hp && cog) redirect('/dashboard');
  if (cog && !hp) redirect('/consent');

  const { error } = await searchParams;

  return (
    <>
      <header className="header">
        <div className="header-brand">
          <span>⚡ Humanity Protocol</span>
          <span className="header-badge">Cognito</span>
        </div>
        <nav className="header-nav">
          <a href="https://docs.humanity.org/build-with-humanity/build-with-the-sdk-api/" target="_blank" rel="noreferrer">Docs</a>
          <a href="https://github.com/humanity-developers/connect-sdk" target="_blank" rel="noreferrer">SDK</a>
          <a href="https://developers.humanity.org" target="_blank" rel="noreferrer">Dev Portal</a>
        </nav>
      </header>

      <main className="page">
        <h1 className="page-title">Cognito → Humanity Protocol</h1>
        <p className="page-subtitle">
          Already using AWS Cognito? Exchange a Cognito JWT for a Humanity access token
          in a single backend call — no second consent screen after the first login.
        </p>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 24 }}>
            {decodeURIComponent(error)}
          </div>
        )}

        {/* Flow */}
        <div className="card">
          <div className="card-title">How it works</div>
          <div className="flow">
            <div className="flow-step">
              <div className="flow-icon cognito">👤</div>
              <div className="flow-label">Login via Cognito</div>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step">
              <div className="flow-icon cognito">🔑</div>
              <div className="flow-label">Cognito id_token</div>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step">
              <div className="flow-icon server">⚙️</div>
              <div className="flow-label">Backend calls <code>exchangeCognitoToken()</code></div>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step">
              <div className="flow-icon hp">✅</div>
              <div className="flow-label">HP issues access token</div>
            </div>
          </div>
          <p className="muted" style={{ fontSize: 13 }}>
            The HP API verifies the Cognito JWT against your User Pool's JWKS,
            resolves the user by <span className="inline-code">sub</span>, confirms
            an active HP authorization, and returns an access + refresh token pair.
          </p>
        </div>

        {/* Prerequisites */}
        <div className="alert alert-info">
          <strong>Before the JWT Bearer Grant works:</strong> the user must complete the
          Humanity consent flow once. After that, every Cognito login auto-exchanges to
          an HP token — no second screen.
        </div>

        {/* SDK snippet */}
        <div className="card">
          <div className="card-title">The backend call (3 lines)</div>
          <pre><code>{`const result = await sdk.exchangeCognitoToken({ cognitoToken: cognitoIdToken });
// result.accessToken, result.grantedScopes, result.appScopedUserId...

const presets = await sdk.verifyPresets({ accessToken: result.accessToken, presets: ['isHuman'] });`}</code></pre>
          <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>
            See <a href="/api/auth/callback" style={{ pointerEvents: 'none', color: 'inherit', textDecoration: 'underline' }}><code>src/app/api/auth/callback/route.ts</code></a> for the full implementation.
          </p>
        </div>

        <a href="/api/auth/login" className="btn btn-cognito" style={{ marginTop: 8 }}>
          🔶 Login with Cognito
        </a>
      </main>
    </>
  );
}
