'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TokenSession {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  authorizationId: string;
  grantedScopes: string[];
  baseUrl: string;
  clientId: string;
  redirectUri: string;
  idToken?: string;
}

interface JwtParts {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
}

const ERROR_REFERENCE: Record<string, { description: string; solution: string }> = {
  invalid_redirect_uri: {
    description: 'The redirect URI does not match what is registered in the Developer Console.',
    solution: 'Ensure the redirect URI exactly matches (including trailing slashes and protocol).',
  },
  redirect_uri_mismatch: {
    description: 'Same as invalid_redirect_uri - URI mismatch between request and registration.',
    solution: 'Check for trailing slashes, http vs https, and port numbers.',
  },
  invalid_scope: {
    description: 'One or more requested scopes are not enabled for your application.',
    solution: 'Verify scopes in Developer Console and check for typos.',
  },
  invalid_state: {
    description: 'The state parameter in callback does not match the original request.',
    solution: 'Check that cookies are enabled and session is persisting correctly.',
  },
  nonce_mismatch: {
    description: 'The nonce in the ID token does not match the expected value.',
    solution: 'Ensure the OAuth session cookie is being read correctly in the callback.',
  },
  invalid_grant: {
    description: 'The authorization code is invalid, expired, or the code verifier is wrong.',
    solution: 'Check PKCE code_verifier is stored and retrieved correctly from session.',
  },
  missing_session: {
    description: 'OAuth session cookie was not found during callback.',
    solution: 'Ensure cookies are enabled and SameSite settings allow the redirect.',
  },
  exchange_failed: {
    description: 'Token exchange request to Humanity API failed.',
    solution: 'Check network connectivity and that client credentials are correct.',
  },
  token_expired: {
    description: 'The access token has expired.',
    solution: 'Use the refresh token to obtain a new access token, or re-authenticate.',
  },
  invalid_token: {
    description: 'The token is malformed or signature verification failed.',
    solution: 'Ensure you are using the correct token and it has not been modified.',
  },
  access_denied: {
    description: 'User denied the authorization request.',
    solution: 'This is expected behavior when user clicks "Deny" on consent screen.',
  },
  rate_limit_exceeded: {
    description: 'Too many API requests in a short period.',
    solution: 'Implement exponential backoff and respect rate limit headers.',
  },
};

function decodeBase64Url(str: string): string {
  const normalized = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return atob(padded);
}

function parseJwt(token: string): JwtParts | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    return {
      header: JSON.parse(decodeBase64Url(parts[0])),
      payload: JSON.parse(decodeBase64Url(parts[1])),
      signature: parts[2],
    };
  } catch {
    return null;
  }
}

function getTokenStatus(exp?: number): { status: 'valid' | 'expired' | 'unknown'; remaining?: string } {
  if (!exp) return { status: 'unknown' };
  
  const now = Math.floor(Date.now() / 1000);
  const diff = exp - now;
  
  if (diff <= 0) {
    return { status: 'expired', remaining: `Expired ${Math.abs(diff)} seconds ago` };
  }
  
  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;
  
  let remaining = '';
  if (hours > 0) remaining += `${hours}h `;
  if (minutes > 0) remaining += `${minutes}m `;
  remaining += `${seconds}s`;
  
  return { status: 'valid', remaining: remaining.trim() };
}

export default function DebugPage() {
  const [activeTab, setActiveTab] = useState<'jwt' | 'session' | 'env' | 'errors'>('jwt');
  const [jwtInput, setJwtInput] = useState('');
  const [parsedJwt, setParsedJwt] = useState<JwtParts | null>(null);
  const [jwtError, setJwtError] = useState<string | null>(null);
  const [session, setSession] = useState<TokenSession | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [envVars, setEnvVars] = useState<Record<string, string | undefined>>({});
  const [errorFilter, setErrorFilter] = useState('');

  // Load session on mount
  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch('/api/session');
        if (res.ok) {
          const data = await res.json();
          // API returns the token session directly (not wrapped)
          setSession(data.accessToken ? data : null);
        }
      } catch (e) {
        console.error('Failed to load session:', e);
      } finally {
        setSessionLoading(false);
      }
    }
    loadSession();

    // Check environment from URL (these would be set on the main page)
    const params = new URLSearchParams(window.location.search);
    setEnvVars({
      HUMANITY_CLIENT_ID: params.get('clientId') || process.env.NEXT_PUBLIC_HUMANITY_CLIENT_ID || undefined,
      HUMANITY_REDIRECT_URI: params.get('redirectUri') || process.env.NEXT_PUBLIC_HUMANITY_REDIRECT_URI || undefined,
      HUMANITY_BASE_URL: params.get('baseUrl') || process.env.NEXT_PUBLIC_HUMANITY_BASE_URL || undefined,
    });
  }, []);

  // Parse JWT when input changes
  useEffect(() => {
    if (!jwtInput.trim()) {
      setParsedJwt(null);
      setJwtError(null);
      return;
    }
    
    const result = parseJwt(jwtInput.trim());
    if (result) {
      setParsedJwt(result);
      setJwtError(null);
    } else {
      setParsedJwt(null);
      setJwtError('Invalid JWT format. Expected three base64url-encoded parts separated by dots.');
    }
  }, [jwtInput]);

  const filteredErrors = Object.entries(ERROR_REFERENCE).filter(([code, info]) =>
    code.toLowerCase().includes(errorFilter.toLowerCase()) ||
    info.description.toLowerCase().includes(errorFilter.toLowerCase())
  );

  const tokenStatus = parsedJwt?.payload?.exp 
    ? getTokenStatus(parsedJwt.payload.exp as number) 
    : null;

  return (
    <main>
      <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <Link href="/" style={{ 
          display: 'inline-block',
          fontSize: '0.875rem',
          color: 'var(--color-text-secondary)',
          marginBottom: '1rem',
        }}>
          ← Back to OAuth Demo
        </Link>
        <p className="eyebrow">Debug Tools</p>
        <h1>
          <span style={{ color: 'var(--color-accent)' }}>OAuth</span> Debugging Toolkit
        </h1>
        <p>
          Inspect JWTs, view session state, check environment configuration, and troubleshoot common OAuth errors.
        </p>
      </header>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
      }}>
        {[
          { id: 'jwt', label: 'JWT Inspector' },
          { id: 'session', label: 'Session Viewer' },
          { id: 'env', label: 'Environment' },
          { id: 'errors', label: 'Error Reference' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            style={{
              padding: '0.625rem 1.25rem',
              borderRadius: 'var(--radius-full)',
              border: activeTab === tab.id 
                ? '1px solid var(--color-accent)' 
                : '1px solid var(--color-border)',
              background: activeTab === tab.id 
                ? 'var(--color-accent-glow)' 
                : 'var(--color-bg-secondary)',
              color: activeTab === tab.id 
                ? 'var(--color-accent)' 
                : 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
              transition: 'all 0.2s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* JWT Inspector */}
      {activeTab === 'jwt' && (
        <section>
          <h2>JWT Inspector</h2>
          <p>Paste any JWT token to decode and inspect its header, payload, and expiration status.</p>
          
          <textarea
            value={jwtInput}
            onChange={(e) => setJwtInput(e.target.value)}
            placeholder="Paste your JWT token here (e.g., eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...)"
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '1rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text-primary)',
              resize: 'vertical',
              marginBottom: '1rem',
            }}
          />

          {jwtError && (
            <div style={{
              padding: '0.75rem 1rem',
              background: 'rgba(255, 77, 77, 0.08)',
              border: '1px solid rgba(255, 77, 77, 0.25)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-error)',
              fontSize: '0.875rem',
              marginBottom: '1rem',
            }}>
              {jwtError}
            </div>
          )}

          {parsedJwt && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Token Status */}
              {tokenStatus && (
                <div style={{
                  padding: '0.75rem 1rem',
                  background: tokenStatus.status === 'valid' 
                    ? 'rgba(109, 251, 63, 0.08)' 
                    : 'rgba(255, 77, 77, 0.08)',
                  border: `1px solid ${tokenStatus.status === 'valid' 
                    ? 'rgba(109, 251, 63, 0.25)' 
                    : 'rgba(255, 77, 77, 0.25)'}`,
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}>
                  <span style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: tokenStatus.status === 'valid' 
                      ? 'var(--color-success)' 
                      : 'var(--color-error)',
                  }} />
                  <span style={{ 
                    fontSize: '0.875rem',
                    color: tokenStatus.status === 'valid' 
                      ? 'var(--color-success)' 
                      : 'var(--color-error)',
                  }}>
                    {tokenStatus.status === 'valid' ? 'Token Valid' : 'Token Expired'}
                    {tokenStatus.remaining && ` — ${tokenStatus.remaining}`}
                  </span>
                </div>
              )}

              {/* Header */}
              <div>
                <h3 style={{ 
                  fontSize: '0.75rem', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em',
                  color: 'var(--color-text-muted)',
                  marginBottom: '0.5rem',
                }}>
                  Header
                </h3>
                <pre style={{
                  padding: '1rem',
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8125rem',
                  overflow: 'auto',
                  color: 'var(--color-text-primary)',
                }}>
                  {JSON.stringify(parsedJwt.header, null, 2)}
                </pre>
              </div>

              {/* Payload */}
              <div>
                <h3 style={{ 
                  fontSize: '0.75rem', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em',
                  color: 'var(--color-text-muted)',
                  marginBottom: '0.5rem',
                }}>
                  Payload
                </h3>
                <pre style={{
                  padding: '1rem',
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8125rem',
                  overflow: 'auto',
                  color: 'var(--color-text-primary)',
                }}>
                  {JSON.stringify(parsedJwt.payload, null, 2)}
                </pre>
              </div>

              {/* Timestamps */}
              {(parsedJwt.payload.iat || parsedJwt.payload.exp || parsedJwt.payload.nbf) && (
                <div>
                  <h3 style={{ 
                    fontSize: '0.75rem', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em',
                    color: 'var(--color-text-muted)',
                    marginBottom: '0.5rem',
                  }}>
                    Timestamps
                  </h3>
                  <div style={{
                    padding: '1rem',
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    display: 'grid',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                  }}>
                    {parsedJwt.payload.iat && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>Issued At (iat):</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                          {new Date((parsedJwt.payload.iat as number) * 1000).toISOString()}
                        </span>
                      </div>
                    )}
                    {parsedJwt.payload.exp && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>Expires At (exp):</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                          {new Date((parsedJwt.payload.exp as number) * 1000).toISOString()}
                        </span>
                      </div>
                    )}
                    {parsedJwt.payload.nbf && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>Not Before (nbf):</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                          {new Date((parsedJwt.payload.nbf as number) * 1000).toISOString()}
                        </span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Current Time:</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                        {new Date().toISOString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Session Viewer */}
      {activeTab === 'session' && (
        <section>
          <h2>Session Viewer</h2>
          <p>View the current OAuth session stored in cookies.</p>

          {sessionLoading ? (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              color: 'var(--color-text-muted)',
            }}>
              Loading session...
            </div>
          ) : session ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                padding: '0.75rem 1rem',
                background: 'rgba(109, 251, 63, 0.08)',
                border: '1px solid rgba(109, 251, 63, 0.25)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}>
                <span style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: 'var(--color-success)',
                }} />
                <span style={{ fontSize: '0.875rem', color: 'var(--color-success)' }}>
                  Active Session
                </span>
              </div>

              <div style={{
                display: 'grid',
                gap: '0.75rem',
                padding: '1rem',
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
              }}>
                <div>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    textTransform: 'uppercase', 
                    color: 'var(--color-text-muted)',
                    display: 'block',
                    marginBottom: '0.25rem',
                  }}>
                    Authorization ID
                  </span>
                  <code style={{ fontSize: '0.8125rem' }}>{session.authorizationId}</code>
                </div>
                <div>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    textTransform: 'uppercase', 
                    color: 'var(--color-text-muted)',
                    display: 'block',
                    marginBottom: '0.25rem',
                  }}>
                    Expires At
                  </span>
                  <code style={{ fontSize: '0.8125rem' }}>
                    {new Date(session.expiresAt).toISOString()}
                  </code>
                </div>
                <div>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    textTransform: 'uppercase', 
                    color: 'var(--color-text-muted)',
                    display: 'block',
                    marginBottom: '0.25rem',
                  }}>
                    Granted Scopes
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                    {session.grantedScopes.map((scope) => (
                      <span
                        key={scope}
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: 'var(--color-bg-tertiary)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    textTransform: 'uppercase', 
                    color: 'var(--color-text-muted)',
                    display: 'block',
                    marginBottom: '0.25rem',
                  }}>
                    Base URL
                  </span>
                  <code style={{ fontSize: '0.8125rem' }}>{session.baseUrl}</code>
                </div>
              </div>

              {session.accessToken && (
                <button
                  onClick={() => {
                    setJwtInput(session.accessToken);
                    setActiveTab('jwt');
                  }}
                  style={{
                    padding: '0.75rem 1.25rem',
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-accent)',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                >
                  Inspect Access Token in JWT Inspector →
                </button>
              )}

              {session.idToken && (
                <button
                  onClick={() => {
                    setJwtInput(session.idToken!);
                    setActiveTab('jwt');
                  }}
                  style={{
                    padding: '0.75rem 1.25rem',
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-accent)',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                >
                  Inspect ID Token in JWT Inspector →
                </button>
              )}
            </div>
          ) : (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              color: 'var(--color-text-muted)',
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
            }}>
              <p style={{ marginBottom: '1rem' }}>No active session found.</p>
              <Link 
                href="/"
                style={{
                  display: 'inline-block',
                  padding: '0.625rem 1.25rem',
                  background: 'var(--color-accent)',
                  color: 'var(--color-text-on-accent)',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                }}
              >
                Start OAuth Flow
              </Link>
            </div>
          )}
        </section>
      )}

      {/* Environment */}
      {activeTab === 'env' && (
        <section>
          <h2>Environment Checker</h2>
          <p>Verify that required environment variables are configured correctly.</p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            marginTop: '1rem',
          }}>
            {[
              { key: 'HUMANITY_CLIENT_ID', required: true, description: 'OAuth client ID from Developer Console' },
              { key: 'HUMANITY_REDIRECT_URI', required: true, description: 'Must match registered redirect URI exactly' },
              { key: 'HUMANITY_BASE_URL', required: false, description: 'API base URL (defaults to production)' },
            ].map((env) => {
              const value = envVars[env.key];
              const isSet = !!value;
              
              return (
                <div
                  key={env.key}
                  style={{
                    padding: '1rem',
                    background: 'var(--color-bg-secondary)',
                    border: `1px solid ${isSet ? 'var(--color-border)' : env.required ? 'rgba(255, 77, 77, 0.25)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: isSet ? 'var(--color-success)' : env.required ? 'var(--color-error)' : 'var(--color-warning)',
                    }} />
                    <code style={{ 
                      fontSize: '0.875rem', 
                      background: 'none', 
                      padding: 0,
                      border: 'none',
                    }}>
                      {env.key}
                    </code>
                    {env.required && (
                      <span style={{ 
                        fontSize: '0.625rem', 
                        textTransform: 'uppercase', 
                        color: 'var(--color-error)',
                        fontWeight: 600,
                      }}>
                        Required
                      </span>
                    )}
                  </div>
                  <p style={{ 
                    fontSize: '0.8125rem', 
                    color: 'var(--color-text-muted)',
                    marginBottom: '0.5rem',
                  }}>
                    {env.description}
                  </p>
                  <div style={{
                    fontSize: '0.8125rem',
                    fontFamily: 'var(--font-mono)',
                    color: isSet ? 'var(--color-text-secondary)' : 'var(--color-text-muted)',
                    wordBreak: 'break-all',
                  }}>
                    {isSet ? value : '(not set)'}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: 'var(--color-bg-tertiary)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
          }}>
            <h3 style={{ 
              fontSize: '0.875rem', 
              marginBottom: '0.75rem',
              color: 'var(--color-text-primary)',
            }}>
              💡 Debugging Tips
            </h3>
            <ul style={{
              fontSize: '0.8125rem',
              color: 'var(--color-text-secondary)',
              paddingLeft: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}>
              <li>Environment variables prefixed with <code>NEXT_PUBLIC_</code> are exposed to the browser</li>
              <li>Create a <code>.env.local</code> file from <code>.env.example</code> for local development</li>
              <li>Redirect URI must match <em>exactly</em> including trailing slashes and protocol</li>
              <li>Use the main page to test different configurations without changing env vars</li>
            </ul>
          </div>
        </section>
      )}

      {/* Error Reference */}
      {activeTab === 'errors' && (
        <section>
          <h2>Error Reference</h2>
          <p>Common OAuth errors and how to fix them.</p>

          <input
            type="text"
            placeholder="Search errors..."
            value={errorFilter}
            onChange={(e) => setErrorFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text-primary)',
              fontSize: '0.875rem',
              marginBottom: '1rem',
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredErrors.map(([code, info]) => (
              <details
                key={code}
                style={{
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                }}
              >
                <summary style={{
                  padding: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'var(--color-text-primary)',
                }}>
                  <code style={{ 
                    background: 'rgba(255, 77, 77, 0.1)', 
                    color: 'var(--color-error)',
                    padding: '0.25rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(255, 77, 77, 0.2)',
                  }}>
                    {code}
                  </code>
                  <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400 }}>
                    {info.description.slice(0, 60)}...
                  </span>
                </summary>
                <div style={{
                  padding: '0 1rem 1rem',
                  borderTop: '1px solid var(--color-border)',
                  marginTop: '-1px',
                }}>
                  <div style={{ paddingTop: '1rem' }}>
                    <h4 style={{ 
                      fontSize: '0.75rem', 
                      textTransform: 'uppercase',
                      color: 'var(--color-text-muted)',
                      marginBottom: '0.375rem',
                    }}>
                      Description
                    </h4>
                    <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                      {info.description}
                    </p>
                    <h4 style={{ 
                      fontSize: '0.75rem', 
                      textTransform: 'uppercase',
                      color: 'var(--color-text-muted)',
                      marginBottom: '0.375rem',
                    }}>
                      Solution
                    </h4>
                    <p style={{ 
                      fontSize: '0.875rem',
                      color: 'var(--color-success)',
                    }}>
                      {info.solution}
                    </p>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* SDK Debug Logging Section */}
      <section style={{ marginTop: '1.5rem' }}>
        <h2>Enable SDK Debug Logging</h2>
        <p>Add this wrapper to your SDK initialization to log all HTTP requests and responses:</p>
        
        <pre style={{
          padding: '1rem',
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          overflow: 'auto',
          color: 'var(--color-text-primary)',
          lineHeight: 1.6,
        }}>
{`// In src/lib/sdk.ts
const debugFetch: typeof fetch = async (input, init) => {
  const url = typeof input === 'string' ? input : input.toString();
  console.log('[SDK Request]', init?.method ?? 'GET', url);
  if (init?.body) console.log('[SDK Body]', init.body);
  
  const response = await fetch(input, init);
  const clone = response.clone();
  const body = await clone.text();
  console.log('[SDK Response]', response.status, body);
  
  return response;
};

export function createSdk(config: HumanitySdkConfig): HumanitySDK {
  return new HumanitySDK({ ...config, fetch: debugFetch });
}`}
        </pre>
      </section>
    </main>
  );
}
