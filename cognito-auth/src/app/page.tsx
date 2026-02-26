'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Simulate a Cognito login + HP token exchange in one shot.
   *
   * In a real app, step 1 happens on the frontend with AWS Amplify or the
   * Cognito Hosted UI, and you send the resulting id_token to your backend.
   * Here we ask our own backend to generate a mock token so the UI flow is
   * demonstrable without a live Cognito deployment.
   */
  async function handleConnect() {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Obtain a Cognito JWT.
      //
      // REAL APP — replace this block with:
      //   import { fetchAuthSession } from 'aws-amplify/auth';
      //   const { tokens } = await fetchAuthSession();
      //   const cognitoToken = tokens?.idToken?.toString();
      //
      // This demo calls a local helper that returns a mock-signed JWT so the
      // UI renders correctly. The HP token exchange will fail with invalid_grant
      // unless a real Cognito JWT from a configured pool is supplied.
      const mockRes = await fetch('/api/dev/mock-cognito-token', { method: 'POST' });
      if (!mockRes.ok) throw new Error('Could not generate demo token');
      const { cognitoToken } = await mockRes.json() as { cognitoToken: string };

      // Step 2: Exchange the Cognito JWT for a Humanity OAuth token.
      const exchangeRes = await fetch('/api/auth/cognito-exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cognitoToken }),
      });

      const data = await exchangeRes.json() as {
        ok?: boolean;
        error?: string;
        error_description?: string;
      };

      if (!exchangeRes.ok) {
        throw new Error(data.error_description ?? data.error ?? 'Token exchange failed');
      }

      router.push('/dashboard');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main className="container" style={{ paddingBottom: 64 }}>
        <h1 className="page-title">Cognito → Humanity Protocol</h1>
        <p className="page-subtitle">
          Already using AWS Cognito? Exchange your Cognito JWT for a Humanity OAuth token
          in a single backend call — no second consent screen required.
        </p>

        {/* Flow diagram */}
        <div className="card">
          <div className="card-title">How it works</div>
          <div className="flow">
            <div className="flow-step">
              <div className="flow-icon cognito">👤</div>
              <div className="flow-label">User authenticates with Cognito</div>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step">
              <div className="flow-icon cognito">🔑</div>
              <div className="flow-label">Frontend receives Cognito id_token</div>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step">
              <div className="flow-icon backend">⚙️</div>
              <div className="flow-label">Backend calls <span className="inline-code">exchangeCognitoToken()</span></div>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step">
              <div className="flow-icon hp">✅</div>
              <div className="flow-label">Humanity issues access token</div>
            </div>
          </div>
          <p className="muted" style={{ fontSize: 13 }}>
            The HP API verifies the Cognito JWT against your User Pool&apos;s JWKS,
            resolves the user by <code>sub</code> (or verified email), confirms an active
            HP authorization, and returns a full access + refresh token pair.
          </p>
        </div>

        {/* Prerequisite callout */}
        <div className="alert alert-info">
          <strong>Prerequisites:</strong> The user must have completed the Humanity consent flow
          at least once, creating an active authorization for your{' '}
          <span className="inline-code">client_id</span>. The HP API must have{' '}
          <span className="inline-code">COGNITO_ENABLED=true</span> configured.
        </div>

        {/* SDK code snippet */}
        <div className="card">
          <div className="card-title">The backend call</div>
          <pre><code>{`import { HumanitySDK } from '@humanity-org/connect-sdk';

const sdk = new HumanitySDK({
  clientId: process.env.HUMANITY_CLIENT_ID,
  redirectUri: process.env.HUMANITY_REDIRECT_URI,
  environment: 'production',
});

// Exchange a Cognito id_token for a Humanity access token
const humanityToken = await sdk.exchangeCognitoToken({
  cognitoToken: cognitoIdToken, // from Amplify: tokens?.idToken?.toString()
});

// Use it like any other HP token
const result = await sdk.verifyPresets({
  accessToken: humanityToken.accessToken,
  presets: ['isHuman', 'ageOver18'],
});`}</code></pre>
        </div>

        {/* Demo section */}
        <div className="card">
          <div className="card-title">Live demo</div>
          <div className="card-desc" style={{ marginBottom: 20 }}>
            Click below to simulate the full flow. This demo generates a mock-signed Cognito
            JWT locally — the HP token exchange will return <span className="inline-code">invalid_grant</span>{' '}
            unless you configure a real Cognito User Pool and HP credentials in{' '}
            <span className="inline-code">.env.local</span>.
          </div>

          <div className="alert alert-warning" style={{ marginBottom: 16 }}>
            ⚠️ Demo only — mock tokens cannot pass HP&apos;s Cognito JWKS verification.
            Configure <span className="inline-code">.env.local</span> with real credentials to
            test end-to-end. See the <a href="#setup">setup guide</a> below.
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button
            className="btn btn-cognito"
            onClick={handleConnect}
            disabled={loading}
          >
            {loading ? '⏳ Connecting…' : '🔶 Simulate Cognito Login + HP Exchange'}
          </button>
        </div>

        {/* Setup guide */}
        <hr className="divider" id="setup" />
        <h2 className="section-title">Setup guide</h2>

        <div className="grid-2">
          <div className="card">
            <div className="card-title">1. Configure .env.local</div>
            <pre><code>{`HUMANITY_CLIENT_ID=hp_...
HUMANITY_CLIENT_SECRET=sk_...
HUMANITY_ENVIRONMENT=sandbox
COGNITO_USER_POOL_ID=us-east-1_xxx
COGNITO_REGION=us-east-1
COGNITO_CLIENT_ID=your_app_client
SESSION_SECRET=<openssl rand -base64 32>`}</code></pre>
          </div>

          <div className="card">
            <div className="card-title">2. Replace the mock token</div>
            <div className="card-desc">
              In <span className="inline-code">src/app/page.tsx</span>, replace the{' '}
              <span className="inline-code">/api/dev/mock-cognito-token</span> call with
              your real Cognito authentication:
            </div>
            <pre><code>{`// AWS Amplify v6
import { fetchAuthSession } from 'aws-amplify/auth';

const { tokens } = await fetchAuthSession();
const cognitoToken = tokens?.idToken?.toString();`}</code></pre>
          </div>

          <div className="card">
            <div className="card-title">3. Complete the HP consent flow</div>
            <div className="card-desc">
              The first time, users must consent through the standard Humanity
              OAuth flow. After that, all subsequent logins use the JWT bearer
              grant — no second consent screen.
            </div>
          </div>

          <div className="card">
            <div className="card-title">4. Enable on HP API server</div>
            <div className="card-desc">
              The Humanity API server must be configured with:
            </div>
            <pre><code>{`COGNITO_ENABLED=true
COGNITO_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_xxx
COGNITO_CLIENT_ID=...        # optional audience check
COGNITO_JWKS_CACHE_TTL_MS=3600000`}</code></pre>
          </div>
        </div>

        <hr className="divider" />
        <p className="muted" style={{ fontSize: 13 }}>
          See the <a href="https://docs.humanity.org">Humanity Protocol docs</a> and the{' '}
          <a href="https://github.com/humanity-developers/connect-sdk">connect-sdk repo</a> for
          more details on the JWT bearer grant integration.
        </p>
      </main>
    </>
  );
}
