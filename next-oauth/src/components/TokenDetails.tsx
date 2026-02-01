"use client";

type TokenSummary = {
  authorizationId: string;
  grantedScopes: string[];
  expiresAt: number;
  baseUrl: string;
  idToken?: string;
} | null;

import { useTransition } from "react";

export function TokenDetails({ session }: { session: TokenSummary }) {
  const [isPending, startTransition] = useTransition();

  function signOut() {
    startTransition(async () => {
      await fetch("/api/session", { method: "DELETE" });
      window.location.reload();
    });
  }

  if (!session) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <p>No access token stored yet. Complete the OAuth flow to populate this card.</p>
        <style jsx>{`
          .empty-state {
            text-align: center;
            padding: 1rem 0;
          }
          .empty-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 48px;
            height: 48px;
            background: var(--color-bg-tertiary);
            border-radius: var(--radius-md);
            margin-bottom: 1rem;
            color: var(--color-text-muted);
          }
          p {
            color: var(--color-text-muted);
            font-size: 0.9375rem;
            margin: 0;
          }
        `}</style>
      </div>
    );
  }

  const expiresInMs = session.expiresAt - Date.now();
  const expiresInMinutes = Math.max(0, Math.floor(expiresInMs / 60000));

  return (
    <div className="token-details">
      <header>
        <div className="header-title">
          <span className="status-dot"></span>
          <h3>Active Session</h3>
        </div>
        <button onClick={signOut} disabled={isPending}>
          {isPending ? "Clearing…" : "Sign out"}
        </button>
      </header>
      <dl>
        <div className="field">
          <dt>Authorization ID</dt>
          <dd className="mono">{session.authorizationId}</dd>
        </div>
        <div className="field">
          <dt>Granted scopes</dt>
          <dd>
            <div className="scopes">
              {session.grantedScopes.map((scope) => (
                <span key={scope} className="scope-badge">{scope}</span>
              ))}
            </div>
          </dd>
        </div>
        <div className="field">
          <dt>Access token expires in</dt>
          <dd>
            <span className={expiresInMinutes < 5 ? 'warning' : ''}>{expiresInMinutes} min</span>
          </dd>
        </div>
        <div className="field">
          <dt>API base URL</dt>
          <dd className="mono">{session.baseUrl}</dd>
        </div>
        {session.idToken ? (
          <div className="field">
            <dt>ID Token</dt>
            <dd className="mono truncate">{session.idToken.slice(0, 40)}…</dd>
          </div>
        ) : null}
      </dl>
      <style jsx>{`
        .token-details {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .header-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .status-dot {
          width: 8px;
          height: 8px;
          background: var(--color-accent);
          border-radius: 50%;
          box-shadow: 0 0 8px var(--color-accent);
        }
        h3 {
          margin: 0;
          font-size: 1rem;
        }
        dl {
          display: grid;
          gap: 1rem;
          margin: 0;
        }
        .field {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        dt {
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-muted);
        }
        dd {
          margin: 0;
          font-size: 0.9375rem;
          color: var(--color-text-primary);
        }
        .mono {
          font-family: var(--font-mono);
          font-size: 0.8125rem;
          word-break: break-all;
          color: var(--color-text-secondary);
        }
        .truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .scopes {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
        }
        .scope-badge {
          display: inline-block;
          font-size: 0.6875rem;
          font-weight: 500;
          padding: 0.2rem 0.5rem;
          background: var(--color-accent-glow);
          color: var(--color-accent);
          border-radius: var(--radius-full);
          border: 1px solid rgba(109, 251, 63, 0.25);
          text-transform: lowercase;
        }
        .warning {
          color: var(--color-warning);
        }
        button {
          border: 1px solid var(--color-border);
          background: transparent;
          color: var(--color-text-secondary);
          border-radius: var(--radius-full);
          padding: 0.5rem 1rem;
          font-size: 0.8125rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        button:hover:not(:disabled) {
          border-color: var(--color-error);
          color: var(--color-error);
          background: rgba(255, 77, 77, 0.08);
        }
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
