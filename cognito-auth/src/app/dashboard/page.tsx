/**
 * Dashboard page — server component.
 *
 * Reads the Humanity session from the cookie and verifies a set of presets
 * server-side. The HP access token never leaves the server.
 */

import { redirect } from 'next/navigation';
import { readSession } from '@/lib/session';
import { getHumanitySdk, HumanityError } from '@/lib/humanity-sdk';
import { LogoutButton } from '@/components/LogoutButton';
import { PresetTable } from '@/components/PresetTable';
import type { DeveloperPresetKey } from '@humanity-org/connect-sdk/dist/adapters/preset-registry';

const PRESETS_TO_CHECK: DeveloperPresetKey[] = [
  'isHuman',
  'ageOver18',
  'kycPassed',
];

export default async function DashboardPage() {
  const session = await readSession();

  if (!session) {
    redirect('/');
  }

  // Verify presets server-side — token never touches the browser
  let presetResults: Record<string, { verified: boolean; status: string }> = {};
  let presetError: string | null = null;

  try {
    const sdk = getHumanitySdk();
    const batch = await sdk.verifyPresets({
      accessToken: session.accessToken,
      presets: PRESETS_TO_CHECK,
    });

    for (const result of batch.results) {
      presetResults[result.preset] = { verified: result.verified, status: result.status };
    }
    for (const err of batch.errors) {
      presetResults[err.preset] = { verified: false, status: 'error' };
    }
  } catch (err) {
    if (err instanceof HumanityError) {
      presetError = err.message;
    } else {
      presetError = 'Failed to verify presets';
    }
  }

  const expiresDate = new Date(session.expiresAt * 1000);
  const tokenAge = Math.round((session.expiresAt * 1000 - Date.now()) / 1000 / 60);

  return (
    <div>
      <div className="container">
        <header className="header">
          <div className="logo">
            <span>Humanity</span> × Cognito
          </div>
          <nav>
            <a href="/">← Back</a>
            <LogoutButton />
          </nav>
        </header>

        <div style={{ padding: '40px 0' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>
            ✅ Token Exchange Successful
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '14px' }}>
            Your Cognito JWT was exchanged for a Humanity Protocol access token via the JWT Bearer
            Grant (RFC 7523).
          </p>

          <div className="grid-2">
            {/* Session info */}
            <div className="card">
              <h2>Humanity Session</h2>
              <div className="kv-list">
                <div className="kv-row">
                  <span className="kv-key">App-scoped user ID</span>
                  <span className="kv-val">{session.appScopedUserId}</span>
                </div>
                <div className="kv-row">
                  <span className="kv-key">Authorization ID</span>
                  <span className="kv-val">{session.authorizationId}</span>
                </div>
                <div className="kv-row">
                  <span className="kv-key">Token expires in</span>
                  <span className="kv-val">{tokenAge}m ({expiresDate.toLocaleTimeString()})</span>
                </div>
                <div className="kv-row">
                  <span className="kv-key">Granted scopes</span>
                  <span className="kv-val">{session.grantedScopes.join(', ') || '—'}</span>
                </div>
              </div>
            </div>

            {/* Grant type info */}
            <div className="card">
              <h2>Grant Used</h2>
              <div style={{ marginBottom: '12px' }}>
                <span className="badge badge-info">JWT Bearer Grant</span>
              </div>
              <div className="kv-list">
                <div className="kv-row">
                  <span className="kv-key">grant_type</span>
                  <span className="kv-val" style={{ fontSize: '11px' }}>
                    urn:ietf:params:oauth:grant-type:jwt-bearer
                  </span>
                </div>
                <div className="kv-row">
                  <span className="kv-key">assertion</span>
                  <span className="kv-val">Cognito id_token (RS256)</span>
                </div>
                <div className="kv-row">
                  <span className="kv-key">Verification</span>
                  <span className="kv-val">Cognito JWKS → HP user lookup → active authorization check</span>
                </div>
              </div>
            </div>
          </div>

          {/* Preset verification */}
          <div className="card">
            <h2>Preset Verification</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
              Verified server-side using the Humanity access token. The token never reaches the
              browser.
            </p>

            {presetError ? (
              <div className="notice notice-warning">
                <span>⚠️</span>
                <div>Could not verify presets: {presetError}</div>
              </div>
            ) : (
              <PresetTable results={presetResults} presets={PRESETS_TO_CHECK} />
            )}
          </div>

          {/* Code sample */}
          <div className="card">
            <h2>Server-side code (this page)</h2>
            <div className="code-block">{`// app/dashboard/page.tsx (Next.js Server Component)
const session = await readSession(); // HP access token from cookie

const batch = await sdk.verifyPresets({
  accessToken: session.accessToken,
  presets: ['isHuman', 'ageOver18', 'kycPassed'],
});

// batch.results: PresetCheckResult[]
// batch.errors:  PresetErrorResult[]`}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
