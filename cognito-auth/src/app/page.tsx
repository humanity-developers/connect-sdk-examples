'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const [cognitoToken, setCognitoToken] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleExchange(tokenToUse?: string) {
    const token = tokenToUse ?? cognitoToken.trim();
    if (!token) {
      setErrorMsg('Please paste a Cognito token, or click "Use Demo Token".');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/cognito-exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cognitoToken: token }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setErrorMsg(data.error_description ?? data.error ?? 'Exchange failed');
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Unexpected error');
    }
  }

  async function handleDemoToken() {
    // Fetch a mock token from a dedicated endpoint
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/auth/mock-token', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.token) {
        setStatus('error');
        setErrorMsg('Failed to generate demo token');
        return;
      }
      setCognitoToken(data.token);
      await handleExchange(data.token);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Unexpected error');
    }
  }

  return (
    <div>
      <div className="container">
        <header className="header">
          <div className="logo">
            <span>Humanity</span> × Cognito
          </div>
          <nav>
            <a href="https://developer.humanity.org" target="_blank" rel="noreferrer">
              Dev Portal
            </a>
            <a
              href="https://github.com/humanity-developers/connect-sdk"
              target="_blank"
              rel="noreferrer"
            >
              SDK
            </a>
          </nav>
        </header>

        <section className="hero">
          <h1>
            <span className="cognito">Cognito</span> → <span className="humanity">Humanity</span>
          </h1>
          <p>
            If your users are already authenticated with AWS Cognito, skip the full OAuth consent
            flow. Exchange their Cognito JWT for a Humanity access token in one call.
          </p>

          {/* Flow diagram */}
          <div className="flow-diagram">
            <div className="flow-step cognito">
              <div className="step-label">Step 1</div>
              <div className="step-name">Cognito Login</div>
            </div>
            <span className="flow-arrow">→</span>
            <div className="flow-step">
              <div className="step-label">Step 2</div>
              <div className="step-name">Your Backend</div>
            </div>
            <span className="flow-arrow">→</span>
            <div className="flow-step humanity">
              <div className="step-label">Step 3</div>
              <div className="step-name">HP Token</div>
            </div>
            <span className="flow-arrow">→</span>
            <div className="flow-step humanity">
              <div className="step-label">Step 4</div>
              <div className="step-name">Verify Presets</div>
            </div>
          </div>
        </section>

        {/* Try it */}
        <div className="card">
          <h2>Try it</h2>

          <div className="notice notice-warning">
            <span>⚠️</span>
            <div>
              <strong>Demo mode.</strong> The "Use Demo Token" button generates a mock Cognito JWT
              for UI exploration. End-to-end exchange requires a real Cognito token and a configured
              HP server with{' '}
              <code>COGNITO_ENABLED=true</code>. See the README.
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <div className="section-label">Paste your Cognito id_token or access_token</div>
              <textarea
                value={cognitoToken}
                onChange={(e) => setCognitoToken(e.target.value)}
                placeholder="eyJhbGciOiJSUzI1NiIsImtpZCI6Ii4uLiJ9..."
                style={{
                  width: '100%',
                  height: '100px',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text)',
                  padding: '10px 14px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  resize: 'vertical',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                className="btn btn-humanity"
                onClick={() => handleExchange()}
                disabled={status === 'loading' || !cognitoToken.trim()}
              >
                {status === 'loading' ? '⏳ Exchanging…' : '🔄 Exchange for HP Token'}
              </button>
              <button
                className="btn btn-outline"
                onClick={handleDemoToken}
                disabled={status === 'loading'}
              >
                🧪 Use Demo Token
              </button>
            </div>

            {errorMsg && (
              <div className="notice notice-warning">
                <span>✗</span>
                <div>{errorMsg}</div>
              </div>
            )}
          </div>
        </div>

        {/* How it works */}
        <div className="card">
          <h2>How it works</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '14px' }}>
            One API call from your backend. No redirect loop. No consent screen (user already
            consented once).
          </p>
          <div className="code-block">{`// In your backend (Node.js / Next.js Route Handler)
import { HumanitySDK } from '@humanity-org/connect-sdk';

const sdk = new HumanitySDK({
  clientId: process.env.HUMANITY_CLIENT_ID,
  redirectUri: 'https://yourapp.com/callback',
  clientSecret: process.env.HUMANITY_CLIENT_SECRET,
  environment: 'production',
});

// cognitoToken = the id_token from AWS Amplify / Cognito Hosted UI
const humanityToken = await sdk.exchangeCognitoToken({
  cognitoToken,   // Cognito id_token or access_token
});

// Use the Humanity access token to verify user presets
const result = await sdk.verifyPreset({
  accessToken: humanityToken.accessToken,
  preset: 'isHuman',
});

console.log(result.verified); // true / false`}</div>
        </div>

        {/* Prerequisites */}
        <div className="card">
          <h2>Prerequisites</h2>
          <div className="grid-2">
            <div>
              <div className="section-label">HP API server</div>
              <ul style={{ paddingLeft: '20px', fontSize: '14px', color: 'var(--text-muted)' }}>
                <li>
                  <code>COGNITO_ENABLED=true</code>
                </li>
                <li>
                  <code>COGNITO_REGION</code> set
                </li>
                <li>
                  <code>COGNITO_USER_POOL_ID</code> set
                </li>
                <li>
                  <code>COGNITO_CLIENT_ID</code> (optional — validates <code>aud</code>)
                </li>
              </ul>
            </div>
            <div>
              <div className="section-label">User setup</div>
              <ul style={{ paddingLeft: '20px', fontSize: '14px', color: 'var(--text-muted)' }}>
                <li>User must have an HP account</li>
                <li>
                  User must have completed the HP consent flow <em>at least once</em> for this{' '}
                  <code>client_id</code>
                </li>
                <li>The HP user email must match the Cognito verified email (or same sub)</li>
              </ul>
            </div>
          </div>
        </div>

        <footer
          style={{
            borderTop: '1px solid var(--border)',
            padding: '24px 0',
            color: 'var(--text-muted)',
            fontSize: '13px',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <span>Humanity Protocol — Cognito Integration Example</span>
          <span>
            <a
              href="https://github.com/humanity-developers/connect-sdk-examples"
              target="_blank"
              rel="noreferrer"
            >
              View on GitHub
            </a>
          </span>
        </footer>
      </div>
    </div>
  );
}
