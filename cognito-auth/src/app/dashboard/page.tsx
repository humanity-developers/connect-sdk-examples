'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface SessionData {
  humanity: {
    app_scoped_user_id: string;
    authorization_id: string;
    granted_scopes: string[];
    expires_in: number;
    issued_at?: string;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiResult, setApiResult] = useState<unknown>(null);
  const [loadingApi, setLoadingApi] = useState(false);

  useEffect(() => {
    fetch('/api/hp/me')
      .then(async (r) => {
        if (r.status === 401) { router.push('/api/auth/login'); return; }
        if (r.status === 403) { router.push('/consent'); return; }
        if (!r.ok) { setError('Failed to load session'); return; }
        setSession(await r.json() as SessionData);
      })
      .catch(() => setError('Network error'));
  }, [router]);

  async function callApi(path: string) {
    setLoadingApi(true);
    setApiResult(null);
    try {
      const r = await fetch(path);
      setApiResult(await r.json());
    } catch (e) {
      setApiResult({ error: (e as Error).message });
    } finally {
      setLoadingApi(false);
    }
  }

  if (error) {
    return <div className="page"><div className="alert alert-error">{error}</div></div>;
  }

  if (!session) {
    return <div className="page" style={{ color: 'var(--muted)' }}>Loading session…</div>;
  }

  const hp = session.humanity;

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

      <main className="page">
        <h1 className="page-title">✅ Token exchange successful</h1>
        <p className="page-subtitle">
          Your Cognito JWT was exchanged for a Humanity access token via the JWT Bearer Grant.
        </p>

        <div className="grid-2">
          {/* Session info */}
          <div className="card">
            <div className="card-title">Humanity session</div>
            <table className="kv-table" style={{ marginTop: 12 }}>
              <tbody>
                <tr>
                  <td>App-scoped user ID</td>
                  <td className="mono">{hp.app_scoped_user_id}</td>
                </tr>
                <tr>
                  <td>Authorization ID</td>
                  <td className="mono">{hp.authorization_id}</td>
                </tr>
                <tr>
                  <td>Expires in</td>
                  <td>
                    <span className="badge badge-success">
                      {Math.floor(hp.expires_in / 60)}m
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>Issued at</td>
                  <td className="mono">{hp.issued_at ?? '—'}</td>
                </tr>
                <tr>
                  <td>Granted scopes</td>
                  <td>
                    {hp.granted_scopes.map((s) => (
                      <span key={s} className="inline-code" style={{ marginRight: 4 }}>{s}</span>
                    ))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* What happened */}
          <div className="card">
            <div className="card-title">What just happened</div>
            <table className="kv-table" style={{ marginTop: 12 }}>
              <tbody>
                <tr>
                  <td>Step 1</td>
                  <td style={{ fontSize: 13 }}>Logged in via Cognito Hosted UI</td>
                </tr>
                <tr>
                  <td>Step 2</td>
                  <td style={{ fontSize: 13 }}>Backend called <span className="inline-code">sdk.exchangeCognitoToken()</span></td>
                </tr>
                <tr>
                  <td>Step 3</td>
                  <td style={{ fontSize: 13 }}>HP verified Cognito JWT via JWKS</td>
                </tr>
                <tr>
                  <td>Step 4</td>
                  <td style={{ fontSize: 13 }}>HP issued access + refresh tokens</td>
                </tr>
                <tr>
                  <td>Next login</td>
                  <td style={{ fontSize: 13, color: 'var(--success)' }}>Auto-exchange — no consent screen</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* API explorer */}
        <div className="card">
          <div className="card-title">Explore HP API</div>
          <p className="card-desc" style={{ marginBottom: 16 }}>
            The HP access token is stored server-side — the browser never sees it.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" style={{ fontSize: 13 }}
              disabled={loadingApi} onClick={() => callApi('/api/hp/userinfo')}>
              👤 GET /userinfo
            </button>
            <button className="btn btn-primary" style={{ fontSize: 13 }}
              disabled={loadingApi} onClick={() => callApi('/api/hp/presets?presets=isHuman')}>
              🧬 Verify isHuman
            </button>
            <button className="btn btn-primary" style={{ fontSize: 13 }}
              disabled={loadingApi} onClick={() => callApi('/api/hp/presets?presets=isHuman,ageOver18')}>
              🔢 isHuman + ageOver18
            </button>
          </div>
          {loadingApi && <p className="muted" style={{ marginTop: 12, fontSize: 13 }}>Loading…</p>}
          {apiResult && (
            <pre style={{ marginTop: 12 }}>{JSON.stringify(apiResult, null, 2)}</pre>
          )}
        </div>

        {/* Code reference */}
        <div className="card">
          <div className="card-title">The request that was sent</div>
          <pre><code>{`POST /oauth/token
{
  "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
  "assertion": "<cognito id_token>",
  "client_id": "${process.env.NEXT_PUBLIC_HP_CLIENT_HINT ?? '<your HP client_id>'}"
}`}</code></pre>
          <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>
            See <span className="inline-code">src/app/api/auth/callback/route.ts</span>
          </p>
        </div>
      </main>
    </>
  );
}
