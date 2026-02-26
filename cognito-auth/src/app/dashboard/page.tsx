'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

interface Session {
  authenticated: boolean;
  appScopedUserId?: string;
  authorizationId?: string;
  grantedScopes?: string[];
  expiresAt?: number;
}

interface PresetResult {
  verified: boolean;
  preset: string;
  status: string;
}

const PRESETS_TO_CHECK = ['isHuman', 'ageOver18', 'kycPassed'];

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [presets, setPresets] = useState<Record<string, PresetResult> | null>(null);
  const [loadingPresets, setLoadingPresets] = useState(false);
  const [loadingLogout, setLoadingLogout] = useState(false);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((data: Session) => {
        if (!data.authenticated) {
          router.push('/');
          return;
        }
        setSession(data);
      })
      .catch(() => router.push('/'));
  }, [router]);

  async function checkPresets() {
    setLoadingPresets(true);
    try {
      const res = await fetch(`/api/presets?presets=${PRESETS_TO_CHECK.join(',')}`);
      const data = await res.json() as { results?: Record<string, PresetResult> };
      setPresets(data.results ?? null);
    } catch {
      /* ignore */
    } finally {
      setLoadingPresets(false);
    }
  }

  async function handleLogout() {
    setLoadingLogout(true);
    await fetch('/api/auth/session', { method: 'DELETE' });
    router.push('/');
  }

  if (!session) {
    return (
      <>
        <Header />
        <div className="container" style={{ paddingTop: 40, color: 'var(--hp-muted)' }}>
          Loading session…
        </div>
      </>
    );
  }

  const expiresIn = session.expiresAt
    ? Math.max(0, session.expiresAt - Math.floor(Date.now() / 1000))
    : null;

  return (
    <>
      <Header />
      <main className="container" style={{ paddingBottom: 64 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 32,
          }}
        >
          <div>
            <h1 className="page-title" style={{ marginBottom: 4 }}>
              ✅ Token exchange successful
            </h1>
            <p className="muted" style={{ fontSize: 14 }}>
              Your Cognito JWT was exchanged for a Humanity OAuth access token.
            </p>
          </div>
          <button
            className="btn btn-ghost"
            onClick={handleLogout}
            disabled={loadingLogout}
            style={{ marginTop: 6 }}
          >
            {loadingLogout ? 'Signing out…' : 'Sign out'}
          </button>
        </div>

        {/* Token info */}
        <div className="card">
          <div className="card-title">Humanity session</div>
          <table className="kv-table" style={{ marginTop: 12 }}>
            <tbody>
              <tr>
                <td>App-scoped user ID</td>
                <td className="mono">{session.appScopedUserId}</td>
              </tr>
              <tr>
                <td>Authorization ID</td>
                <td className="mono">{session.authorizationId}</td>
              </tr>
              <tr>
                <td>Granted scopes</td>
                <td>
                  {session.grantedScopes?.map((s) => (
                    <span
                      key={s}
                      className="inline-code"
                      style={{ marginRight: 6 }}
                    >
                      {s}
                    </span>
                  ))}
                </td>
              </tr>
              <tr>
                <td>Token expires in</td>
                <td>
                  {expiresIn !== null ? (
                    <span
                      className={`badge ${
                        expiresIn > 600
                          ? 'badge-success'
                          : expiresIn > 60
                            ? 'badge-warning'
                            : 'badge-error'
                      }`}
                    >
                      {Math.floor(expiresIn / 60)}m {expiresIn % 60}s
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Preset verification */}
        <div className="card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <div className="card-title" style={{ marginBottom: 0 }}>
              Preset verification
            </div>
            <button
              className="btn btn-primary"
              onClick={checkPresets}
              disabled={loadingPresets}
              style={{ fontSize: 13 }}
            >
              {loadingPresets ? '⏳ Checking…' : '▶ Check presets'}
            </button>
          </div>
          <p className="card-desc" style={{ marginBottom: presets ? 16 : 0 }}>
            Use the HP access token (stored server-side) to verify user credentials.
          </p>

          {presets && (
            <table className="kv-table">
              <tbody>
                {Object.entries(presets).map(([key, r]) => (
                  <tr key={key}>
                    <td className="mono">{key}</td>
                    <td>
                      <span
                        className={`badge ${
                          r.verified
                            ? 'badge-success'
                            : r.status === 'error'
                              ? 'badge-error'
                              : 'badge-muted'
                        }`}
                      >
                        {r.verified ? '✓ verified' : r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* What happened */}
        <div className="card">
          <div className="card-title">What just happened</div>
          <div className="card-desc" style={{ marginTop: 8 }}>
            <ol style={{ paddingLeft: 20, lineHeight: 2 }}>
              <li>
                Your frontend obtained a Cognito JWT (mocked here; use{' '}
                <span className="inline-code">fetchAuthSession()</span> from AWS Amplify in
                production).
              </li>
              <li>
                The frontend sent the JWT to{' '}
                <span className="inline-code">POST /api/auth/cognito-exchange</span>.
              </li>
              <li>
                The backend called{' '}
                <span className="inline-code">sdk.exchangeCognitoToken(&#123; cognitoToken &#125;)</span>,
                which sent:
                <pre style={{ marginTop: 8 }}><code>{`POST /oauth/token
{
  "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
  "assertion": "<cognito id_token>",
  "client_id": "<your HP client_id>"
}`}</code></pre>
              </li>
              <li>
                The Humanity API verified the Cognito JWT&apos;s signature against your User
                Pool&apos;s JWKS, resolved the user by{' '}
                <span className="inline-code">sub</span>, found an active HP authorization,
                and issued an access + refresh token pair.
              </li>
              <li>
                The token was stored in a server-only{' '}
                <span className="inline-code">httpOnly</span> cookie — the browser never sees
                the raw token.
              </li>
            </ol>
          </div>
        </div>
      </main>
    </>
  );
}
