import { redirect } from 'next/navigation';
import { getCognitoTokens, getHumanityTokens } from '@/services/session';

const SCOPES: { name: string; desc: string }[] = [
  { name: 'openid', desc: 'Verify your Humanity identity' },
  { name: 'identity:read', desc: 'Read your humanity score and verification status' },
  { name: 'profile.full', desc: 'Access your full Humanity profile' },
];

export default async function ConsentPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [cog, hp] = await Promise.all([getCognitoTokens(), getHumanityTokens()]);

  // Not logged in via Cognito → back to login
  if (!cog) redirect('/api/auth/login');
  // Already has HP tokens → go straight to dashboard
  if (hp) redirect('/dashboard');

  const { error } = await searchParams;

  return (
    <>
      <header className="header">
        <div className="header-brand">
          <span>⚡ Humanity Protocol</span>
          <span className="header-badge">Cognito</span>
        </div>
        <nav className="header-nav">
          <a href="/api/auth/logout">Sign out</a>
        </nav>
      </header>

      <main className="page" style={{ maxWidth: 520 }}>
        <h1 className="page-title" style={{ fontSize: 22 }}>🔐 One-time consent required</h1>
        <p className="page-subtitle" style={{ fontSize: 14 }}>
          This is a one-time step. Grant your app permission to access your Humanity
          credentials. After you approve, future Cognito logins will automatically
          exchange to a Humanity token — you won&apos;t see this screen again.
        </p>

        {error && (
          <div className="alert alert-error">{decodeURIComponent(error)}</div>
        )}

        <div className="card">
          <div className="card-title">Requested permissions</div>
          <div style={{ marginTop: 12 }}>
            {SCOPES.map((s) => (
              <div key={s.name} className="scope-item">
                <span className="scope-check">✓</span>
                <div>
                  <div className="scope-name">{s.name}</div>
                  <div className="scope-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <a href="/api/consent/start" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }}>
          ✅ Grant access to Humanity
        </a>
        <a href="/api/auth/logout" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
          Cancel — sign out
        </a>

        <p className="muted" style={{ fontSize: 12, textAlign: 'center', marginTop: 16 }}>
          You can revoke this access at any time from the{' '}
          <a href="https://developers.humanity.org" target="_blank" rel="noreferrer">developer dashboard</a>.
        </p>
      </main>
    </>
  );
}
