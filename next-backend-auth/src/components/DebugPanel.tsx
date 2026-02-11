'use client';

import { useState } from 'react';

interface EnvStatus {
  clientId: boolean;
  clientSecret: boolean;
  redirectUri: string | null;
  environment: string | null;
  jwtSecret: boolean;
  jwtSecretLength: number;
}

interface JwtPayload {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  expiration: {
    expiresAt: string;
    isValid: boolean;
    timeLeft: string;
  } | null;
}

export function DebugPanel({ envStatus }: { envStatus: EnvStatus }) {
  const [jwtInput, setJwtInput] = useState('');
  const [jwtResult, setJwtResult] = useState<JwtPayload | null>(null);
  const [jwtError, setJwtError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'env' | 'jwt' | 'session' | 'errors'>('env');
  const [sessionData, setSessionData] = useState<Record<string, unknown> | null>(null);
  const [sessionLoading, setSessionLoading] = useState(false);

  const decodeBase64Url = (str: string): string => {
    const normalized = str.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return atob(padded);
  };

  const inspectJwt = () => {
    setJwtError(null);
    setJwtResult(null);

    const token = jwtInput.trim();
    if (!token) {
      setJwtError('Please enter a JWT token');
      return;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      setJwtError('Invalid JWT format. Expected 3 parts separated by dots.');
      return;
    }

    try {
      const [headerB64, payloadB64] = parts;
      const header = JSON.parse(decodeBase64Url(headerB64));
      const payload = JSON.parse(decodeBase64Url(payloadB64));

      let expiration = null;
      if (payload.exp) {
        const expDate = new Date(payload.exp * 1000);
        const now = new Date();
        const isValid = expDate > now;
        const diffMs = expDate.getTime() - now.getTime();
        const diffMins = Math.floor(Math.abs(diffMs) / 60000);
        const diffHours = Math.floor(diffMins / 60);
        
        expiration = {
          expiresAt: expDate.toISOString(),
          isValid,
          timeLeft: isValid 
            ? `${diffHours}h ${diffMins % 60}m remaining`
            : `Expired ${diffHours}h ${diffMins % 60}m ago`,
        };
      }

      setJwtResult({ header, payload, expiration });
    } catch (err) {
      setJwtError(`Failed to decode JWT: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const fetchSession = async () => {
    setSessionLoading(true);
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      setSessionData(data);
    } catch (err) {
      setSessionData({ error: err instanceof Error ? err.message : 'Failed to fetch session' });
    } finally {
      setSessionLoading(false);
    }
  };

  const commonErrors = [
    {
      code: 'invalid_redirect_uri',
      symptom: 'OAuth fails immediately with redirect_uri error',
      causes: [
        'Redirect URI doesn\'t match Developer Console exactly',
        'Missing or extra trailing slash',
        'HTTP vs HTTPS mismatch',
      ],
      solution: `Check HUMANITY_REDIRECT_URI matches exactly. Current: ${envStatus.redirectUri || 'NOT SET'}`,
    },
    {
      code: 'invalid_scope',
      symptom: 'Authorization fails or missing data in responses',
      causes: [
        'Requesting scopes not enabled for your app',
        'Typo in scope names',
      ],
      solution: 'Use valid scopes: openid, profile.full, data.read',
    },
    {
      code: 'invalid_grant',
      symptom: 'Token exchange fails after authorization',
      causes: [
        'PKCE code_verifier not stored properly',
        'Authorization code already used',
        'Session cookie lost',
      ],
      solution: 'Check session cookie is set and code_verifier is preserved',
    },
    {
      code: 'invalid_state',
      symptom: 'Callback verification fails',
      causes: [
        'Session cookie not set or lost',
        'Multiple tabs causing state conflicts',
        'Session expired',
      ],
      solution: 'Ensure cookies are enabled and complete flow in single tab',
    },
    {
      code: 'token_expired',
      symptom: 'API calls fail with fresh tokens',
      causes: [
        'Server clock out of sync',
        'Token validation timing issues',
      ],
      solution: 'Sync system clock: timedatectl set-ntp true',
    },
  ];

  return (
    <div className="debug-panel">
      {/* Tab Navigation */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'env' ? 'active' : ''}`}
          onClick={() => setActiveTab('env')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
          Environment
        </button>
        <button 
          className={`tab ${activeTab === 'jwt' ? 'active' : ''}`}
          onClick={() => setActiveTab('jwt')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          JWT Inspector
        </button>
        <button 
          className={`tab ${activeTab === 'session' ? 'active' : ''}`}
          onClick={() => setActiveTab('session')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          Session
        </button>
        <button 
          className={`tab ${activeTab === 'errors' ? 'active' : ''}`}
          onClick={() => setActiveTab('errors')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          Common Errors
        </button>
      </div>

      {/* Environment Tab */}
      {activeTab === 'env' && (
        <div className="card">
          <h3>Environment Configuration</h3>
          <p className="text-muted mb-3">
            Verify all required environment variables are configured correctly.
          </p>
          
          <div className="env-grid">
            <div className="env-item">
              <div className="env-header">
                <span className={`status-dot ${envStatus.clientId ? 'success' : 'error'}`}></span>
                <span className="env-name">HUMANITY_CLIENT_ID</span>
              </div>
              <span className={`env-value ${envStatus.clientId ? '' : 'missing'}`}>
                {envStatus.clientId ? '••••••••' : 'NOT SET'}
              </span>
            </div>

            <div className="env-item">
              <div className="env-header">
                <span className={`status-dot ${envStatus.clientSecret ? 'success' : 'error'}`}></span>
                <span className="env-name">HUMANITY_CLIENT_SECRET</span>
              </div>
              <span className={`env-value ${envStatus.clientSecret ? '' : 'missing'}`}>
                {envStatus.clientSecret ? '••••••••' : 'NOT SET'}
              </span>
            </div>

            <div className="env-item">
              <div className="env-header">
                <span className={`status-dot ${envStatus.redirectUri ? 'success' : 'error'}`}></span>
                <span className="env-name">HUMANITY_REDIRECT_URI</span>
              </div>
              <span className={`env-value mono ${envStatus.redirectUri ? '' : 'missing'}`}>
                {envStatus.redirectUri || 'NOT SET'}
              </span>
            </div>

            <div className="env-item">
              <div className="env-header">
                <span className={`status-dot ${envStatus.environment ? 'success' : 'error'}`}></span>
                <span className="env-name">HUMANITY_ENVIRONMENT</span>
              </div>
              <span className={`env-value mono ${envStatus.environment ? '' : 'missing'}`}>
                {envStatus.environment || 'NOT SET'}
              </span>
            </div>

            <div className="env-item">
              <div className="env-header">
                <span className={`status-dot ${envStatus.jwtSecretLength >= 32 ? 'success' : envStatus.jwtSecret ? 'warning' : 'error'}`}></span>
                <span className="env-name">APP_JWT_SECRET</span>
              </div>
              <span className={`env-value ${envStatus.jwtSecret ? '' : 'missing'}`}>
                {envStatus.jwtSecret 
                  ? `Set (${envStatus.jwtSecretLength} chars)${envStatus.jwtSecretLength < 32 ? ' ⚠️ Should be ≥32' : ''}`
                  : 'NOT SET'}
              </span>
            </div>
          </div>

          <div className="env-summary mt-3">
            {envStatus.clientId && envStatus.clientSecret && envStatus.redirectUri && envStatus.environment && envStatus.jwtSecret ? (
              <div className="alert alert-success">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                All required environment variables are configured
              </div>
            ) : (
              <div className="alert alert-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                Missing required environment variables. Check your .env.local file.
              </div>
            )}
          </div>
        </div>
      )}

      {/* JWT Inspector Tab */}
      {activeTab === 'jwt' && (
        <div className="card">
          <h3>JWT Token Inspector</h3>
          <p className="text-muted mb-3">
            Paste a JWT token to decode and inspect its header, payload, and expiration status.
          </p>

          <div className="jwt-input-group">
            <textarea
              value={jwtInput}
              onChange={(e) => setJwtInput(e.target.value)}
              placeholder="Paste your JWT token here (e.g., eyJhbGciOiJIUzI1NiIs...)"
              rows={4}
            />
            <button className="btn btn-primary" onClick={inspectJwt}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              Inspect Token
            </button>
          </div>

          {jwtError && (
            <div className="alert alert-error mt-2">
              {jwtError}
            </div>
          )}

          {jwtResult && (
            <div className="jwt-result mt-3">
              <div className="jwt-section">
                <h4>Header</h4>
                <pre><code>{JSON.stringify(jwtResult.header, null, 2)}</code></pre>
              </div>

              <div className="jwt-section">
                <h4>Payload</h4>
                <pre><code>{JSON.stringify(jwtResult.payload, null, 2)}</code></pre>
              </div>

              {jwtResult.expiration && (
                <div className="jwt-section">
                  <h4>Expiration Status</h4>
                  <div className={`expiration-status ${jwtResult.expiration.isValid ? 'valid' : 'expired'}`}>
                    <span className="status-indicator"></span>
                    <div>
                      <strong>{jwtResult.expiration.isValid ? 'VALID' : 'EXPIRED'}</strong>
                      <p>{jwtResult.expiration.timeLeft}</p>
                      <p className="text-muted">Expires at: {jwtResult.expiration.expiresAt}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Session Tab */}
      {activeTab === 'session' && (
        <div className="card">
          <h3>Current Session</h3>
          <p className="text-muted mb-3">
            Inspect the current authentication session stored in cookies.
          </p>

          <button 
            className="btn btn-secondary" 
            onClick={fetchSession}
            disabled={sessionLoading}
          >
            {sessionLoading ? (
              <>
                <span className="spinner"></span>
                Loading...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                </svg>
                Fetch Session
              </>
            )}
          </button>

          {sessionData && (
            <div className="session-result mt-3">
              <pre><code>{JSON.stringify(sessionData, null, 2)}</code></pre>
            </div>
          )}
        </div>
      )}

      {/* Common Errors Tab */}
      {activeTab === 'errors' && (
        <div className="card">
          <h3>Common Error Reference</h3>
          <p className="text-muted mb-3">
            Quick reference for diagnosing common OAuth and integration errors.
          </p>

          <div className="error-list">
            {commonErrors.map((error) => (
              <div key={error.code} className="error-item">
                <div className="error-header">
                  <code className="error-code">{error.code}</code>
                </div>
                <p className="error-symptom">{error.symptom}</p>
                <div className="error-causes">
                  <strong>Possible causes:</strong>
                  <ul>
                    {error.causes.map((cause, i) => (
                      <li key={i}>{cause}</li>
                    ))}
                  </ul>
                </div>
                <div className="error-solution">
                  <strong>Solution:</strong> {error.solution}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .debug-panel {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .tabs {
          display: flex;
          gap: 0.5rem;
          border-bottom: 1px solid var(--color-border);
          padding-bottom: 0.5rem;
          overflow-x: auto;
        }

        .tab {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          background: transparent;
          border: 1px solid transparent;
          border-radius: var(--radius-md);
          color: var(--color-text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .tab:hover {
          color: var(--color-text-primary);
          background: var(--color-bg-tertiary);
        }

        .tab.active {
          color: var(--color-accent);
          background: var(--color-accent-glow);
          border-color: rgba(109, 251, 63, 0.25);
        }

        h3 {
          margin: 0 0 0.25rem;
          font-size: 1.125rem;
        }

        .env-grid {
          display: grid;
          gap: 0.75rem;
        }

        .env-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background: var(--color-bg-secondary);
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border-subtle);
        }

        .env-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-dot.success {
          background: var(--color-success);
          box-shadow: 0 0 8px var(--color-success);
        }

        .status-dot.warning {
          background: var(--color-warning);
          box-shadow: 0 0 8px var(--color-warning);
        }

        .status-dot.error {
          background: var(--color-error);
          box-shadow: 0 0 8px var(--color-error);
        }

        .env-name {
          font-family: var(--font-mono);
          font-size: 0.8125rem;
          font-weight: 500;
        }

        .env-value {
          font-size: 0.8125rem;
          color: var(--color-text-secondary);
        }

        .env-value.mono {
          font-family: var(--font-mono);
        }

        .env-value.missing {
          color: var(--color-error);
        }

        .env-summary .alert {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .jwt-input-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        textarea {
          width: 100%;
          padding: 0.875rem 1rem;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-primary);
          font-family: var(--font-mono);
          font-size: 0.8125rem;
          resize: vertical;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        textarea:focus {
          outline: none;
          border-color: var(--color-accent);
          box-shadow: 0 0 0 3px var(--color-accent-glow);
        }

        textarea::placeholder {
          color: var(--color-text-muted);
        }

        .jwt-result {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .jwt-section h4 {
          margin: 0 0 0.5rem;
          font-size: 0.8125rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-muted);
        }

        .jwt-section pre {
          margin: 0;
          max-height: 200px;
          overflow: auto;
        }

        .expiration-status {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1rem;
          border-radius: var(--radius-md);
        }

        .expiration-status.valid {
          background: rgba(109, 251, 63, 0.08);
          border: 1px solid rgba(109, 251, 63, 0.25);
        }

        .expiration-status.expired {
          background: rgba(255, 77, 77, 0.08);
          border: 1px solid rgba(255, 77, 77, 0.25);
        }

        .expiration-status .status-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-top: 0.25rem;
        }

        .expiration-status.valid .status-indicator {
          background: var(--color-success);
          box-shadow: 0 0 12px var(--color-success);
        }

        .expiration-status.expired .status-indicator {
          background: var(--color-error);
          box-shadow: 0 0 12px var(--color-error);
        }

        .expiration-status strong {
          display: block;
          font-size: 0.875rem;
        }

        .expiration-status.valid strong {
          color: var(--color-success);
        }

        .expiration-status.expired strong {
          color: var(--color-error);
        }

        .expiration-status p {
          margin: 0.25rem 0 0;
          font-size: 0.8125rem;
        }

        .session-result pre {
          margin: 0;
          max-height: 400px;
          overflow: auto;
        }

        .error-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .error-item {
          padding: 1rem;
          background: var(--color-bg-secondary);
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border-subtle);
        }

        .error-header {
          margin-bottom: 0.5rem;
        }

        .error-code {
          font-size: 0.875rem;
          padding: 0.25rem 0.5rem;
          background: rgba(255, 77, 77, 0.12);
          color: var(--color-error);
          border: 1px solid rgba(255, 77, 77, 0.25);
        }

        .error-symptom {
          font-size: 0.9375rem;
          margin: 0 0 0.75rem;
          color: var(--color-text-primary);
        }

        .error-causes {
          font-size: 0.8125rem;
          margin-bottom: 0.75rem;
        }

        .error-causes strong {
          color: var(--color-text-muted);
          font-weight: 500;
        }

        .error-causes ul {
          margin: 0.375rem 0 0;
          padding-left: 1.25rem;
          color: var(--color-text-secondary);
        }

        .error-causes li {
          margin-bottom: 0.25rem;
        }

        .error-solution {
          font-size: 0.8125rem;
          padding: 0.625rem 0.75rem;
          background: rgba(109, 251, 63, 0.06);
          border-radius: var(--radius-sm);
          border: 1px solid rgba(109, 251, 63, 0.15);
        }

        .error-solution strong {
          color: var(--color-accent);
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}

