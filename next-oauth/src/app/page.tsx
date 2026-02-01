import Link from 'next/link';
import { AuthorizeForm } from '@/components/AuthorizeForm';
import { ProfileCard } from '@/components/ProfileCard';
import { TokenDetails } from '@/components/TokenDetails';
import { resolveDemoConfig } from '@/lib/demo-config';
import { fetchHumanityProfile } from '@/lib/profile';
import { readTokenSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const defaults = resolveDemoConfig();
  const token = readTokenSession();

  let profile: Awaited<ReturnType<typeof fetchHumanityProfile>> | null = null;
  let profileError: string | null = null;

  if (token) {
    try {
      profile = await fetchHumanityProfile(token);
    } catch (error) {
      profileError = error instanceof Error ? error.message : 'Failed to load profile';
    }
  }

  return (
    <main>
      <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <Link 
            href="/debug"
            style={{
              fontSize: '0.8125rem',
              padding: '0.5rem 1rem',
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
            }}
          >
            🔧 Debug Tools
          </Link>
        </div>
        <p className="eyebrow">hp-public-dev-api</p>
        <h1>
          <span style={{ color: 'var(--color-accent)' }}>Next.js + Bun</span> OAuth Playground
        </h1>
        <p>
          This example uses the linked <code>HumanitySDK</code> package to drive PKCE authorization,
          exchange tokens, and then verify the <code>humanity_user</code> preset which returns OpenID Connect 
          claims as evidence (requires <code>openid</code> + <code>profile.full</code> scopes).
        </p>
      </header>

      <section style={{ marginBottom: '1.5rem' }}>
        <h2>Request OAuth consent</h2>
        <p>
          Update the fields below (or keep the defaults), then click the button to generate the Humanity OAuth
          authorize URL via <code>HumanitySDK.buildAuthUrl</code>.
        </p>
        <AuthorizeForm defaults={defaults} isConnected={!!token} />
      </section>

      <section style={{ marginBottom: '1.5rem' }}>
        <h2>Session snapshot</h2>
        <TokenDetails
          session={
            token
              ? {
                  authorizationId: token.authorizationId,
                  grantedScopes: token.grantedScopes,
                  expiresAt: token.expiresAt,
                  baseUrl: token.baseUrl,
                  idToken: token.idToken,
                }
              : null
          }
        />
      </section>

      <section>
        <h2>humanity_user preset evidence</h2>
        {profileError ? (
          <p style={{ 
            color: 'var(--color-error)', 
            background: 'rgba(255, 77, 77, 0.08)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255, 77, 77, 0.25)'
          }}>
            {profileError}
          </p>
        ) : null}
        <ProfileCard initialProfile={profile} canFetch={!!token} />
      </section>
    </main>
  );
}
