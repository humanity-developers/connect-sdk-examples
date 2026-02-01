import { Header } from '@/components/Header';
import { ApiTester } from '@/components/ApiTester';
import { redirect } from 'next/navigation';
import { readAppSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const session = readAppSession();
  
  // Redirect to home if not logged in
  if (!session || session.expiresAt < Date.now()) {
    redirect('/');
  }

  return (
    <>
      <Header />
      
      <main className="container">
        {/* Welcome Section */}
        <section className="mb-4">
          <h1>Dashboard</h1>
          <p className="text-muted">
            You&apos;re authenticated! Test the protected API endpoints below.
          </p>
        </section>

        {/* Session Info */}
        <section className="mb-4">
          <h2 className="mb-2">Your Session</h2>
          <div className="card">
            <div className="grid grid-2">
              <div>
                <h4 className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  User ID
                </h4>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
                  {session.userId}
                </p>
              </div>
              
              <div>
                <h4 className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Human Verification
                </h4>
                <p>
                  {session.isHuman ? (
                    <span className="badge badge-success">✓ Verified Human</span>
                  ) : (
                    <span className="badge badge-warning">Not Verified</span>
                  )}
                </p>
              </div>
              
              <div>
                <h4 className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Verified Presets
                </h4>
                <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
                  {session.presets.length > 0 ? (
                    session.presets.map((preset) => (
                      <span key={preset} className="badge badge-info">
                        {preset}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted">None</span>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Session Expires
                </h4>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
                  {new Date(session.expiresAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-3">
              <h4 className="text-muted mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Granted Scopes
              </h4>
              <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
                {session.scopes.map((scope) => (
                  <span key={scope} className="badge badge-info" style={{ fontSize: '0.6875rem' }}>
                    {scope}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* API Tester */}
        <section className="mb-4">
          <h2 className="mb-2">Test Protected APIs</h2>
          <p className="text-muted mb-3">
            Click the buttons below to test each protected endpoint. 
            {!session.isHuman && (
              <span style={{ color: 'var(--color-warning)' }}>
                {' '}Note: Some endpoints require human verification.
              </span>
            )}
          </p>
          <ApiTester />
        </section>

        {/* Code Examples */}
        <section className="mb-4">
          <h2 className="mb-2">Using the App Token</h2>
          <div className="card">
            <p className="text-muted mb-2">
              Your application JWT can be used to authenticate API requests:
            </p>
            <pre>
              <code>{`// Option 1: Session cookie (automatic in browser)
const response = await fetch('/api/protected/profile');

// Option 2: Authorization header (for external clients)
const response = await fetch('/api/protected/profile', {
  headers: {
    'Authorization': 'Bearer YOUR_APP_JWT_TOKEN'
  }
});`}</code>
            </pre>
          </div>
        </section>

        {/* Server-to-Server Example */}
        <section className="mb-4">
          <h2 className="mb-2">Server-to-Server Token</h2>
          <div className="card">
            <p className="text-muted mb-2">
              Use the client credentials to get tokens for users who have already authorized your app:
            </p>
            <pre>
              <code>{`// In your backend code
import { getHumanitySdk } from '@/lib/humanity-sdk';
import { getConfig } from '@/lib/config';

const sdk = getHumanitySdk();
const config = getConfig();

// Get a token for a specific user
const userToken = await sdk.getClientUserToken({
  clientSecret: config.humanity.clientSecret,
  email: 'user@example.com',
  // or: userId: 'user_id_here',
  // or: evmAddress: '0x...',
});

// Use the token to verify presets
const presets = await sdk.verifyPresets(
  ['isHuman', 'ageOver18'],
  userToken.accessToken,
);`}</code>
            </pre>
          </div>
        </section>
      </main>
    </>
  );
}

