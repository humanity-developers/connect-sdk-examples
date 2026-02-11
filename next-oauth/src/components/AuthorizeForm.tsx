"use client";

import { useState, useTransition } from "react";

type Props = {
  defaults: {
    clientId: string;
    redirectUri: string;
    environment: string;
    scopes: string[];
  };
  isConnected: boolean;
};

type AuthorizePayload = {
  clientId: string;
  redirectUri: string;
  environment: string;
  scopes: string[];
};

export function AuthorizeForm({ defaults, isConnected }: Props) {
  const [clientId, setClientId] = useState(defaults.clientId);
  const [redirectUri, setRedirectUri] = useState(defaults.redirectUri);
  const [environment, setEnvironment] = useState(defaults.environment);
  const [scopes, setScopes] = useState(defaults.scopes.join(" "));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const canSubmit = !isConnected;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    setError(null);
    startTransition(async () => {
      try {
        const payload: AuthorizePayload = {
          clientId,
          redirectUri,
          environment,
          scopes: scopes
            .split(" ")
            .map((scope) => scope.trim())
            .filter(Boolean),
        };
        const res = await fetch("/api/oauth/authorize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.message ?? "Failed to start authorization");
        }
        const { url } = (await res.json()) as { url: string };
        window.location.assign(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="field">
        <label htmlFor="clientId">Client ID</label>
        <input
          id="clientId"
          value={clientId}
          onChange={(event) => setClientId(event.target.value)}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="redirectUri">Redirect URI</label>
        <input
          id="redirectUri"
          value={redirectUri}
          onChange={(event) => setRedirectUri(event.target.value)}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="environment">Environment</label>
        <input
          id="environment"
          value={environment}
          onChange={(event) => setEnvironment(event.target.value)}
          required
          placeholder="sandbox or production"
        />
      </div>
      <div className="field">
        <label htmlFor="scopes">Scopes</label>
        <input
          id="scopes"
          value={scopes}
          onChange={(event) => setScopes(event.target.value)}
          placeholder="profile.full data.read"
        />
      </div>
      {error ? <p className="error">{error}</p> : null}
      <button type="submit" disabled={!canSubmit || isPending}>
        {isPending ? (
          <span className="btn-content">
            <span className="spinner"></span>
            Preparing...
          </span>
        ) : isConnected ? (
          <span className="btn-content">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Connected
          </span>
        ) : (
          <span className="btn-content">
            <svg width="18" height="18" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="6"/>
              <circle cx="50" cy="38" r="10" fill="currentColor"/>
              <path d="M28 72c0-12 10-22 22-22s22 10 22 22" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
            </svg>
            Authorize with Humanity
          </span>
        )}
      </button>
      <style jsx>{`
        .form {
          display: grid;
          gap: 1rem;
        }
        .field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        label {
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        input {
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
          padding: 0.75rem 1rem;
          background: var(--color-bg-secondary);
          color: var(--color-text-primary);
          font-size: 0.9375rem;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        input:focus {
          outline: none;
          border-color: var(--color-accent);
          box-shadow: 0 0 0 3px var(--color-accent-glow);
        }
        input::placeholder {
          color: var(--color-text-muted);
        }
        button {
          border: none;
          border-radius: var(--radius-full);
          padding: 0.9rem 1.75rem;
          font-weight: 600;
          font-size: 0.9375rem;
          background: var(--color-accent);
          color: var(--color-text-on-accent);
          margin-top: 0.5rem;
          transition: all 0.2s ease;
          box-shadow: 0 4px 20px var(--color-accent-glow-strong);
        }
        button:hover:not(:disabled) {
          background: var(--color-accent-hover);
          transform: translateY(-1px);
          box-shadow: 0 6px 30px var(--color-accent-glow-strong);
        }
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        .btn-content {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top-color: currentColor;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .error {
          color: var(--color-error);
          margin: 0;
          font-size: 0.875rem;
          padding: 0.75rem 1rem;
          background: rgba(255, 77, 77, 0.08);
          border-radius: var(--radius-md);
          border: 1px solid rgba(255, 77, 77, 0.25);
        }
      `}</style>
    </form>
  );
}
