"use client";

import { useEffect, useState } from "react";
import type { HumanityProfile } from "@/lib/profile";

type Props = {
  initialProfile: HumanityProfile | null;
  canFetch: boolean;
};

export function ProfileCard({ initialProfile, canFetch }: Props) {
  const [profile, setProfile] = useState(initialProfile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  async function refresh() {
    if (!canFetch) return;
    setLoading(true);
    setError(null);
    try {
      // Fetch profile using the SDK via the profile library
      const { fetchProfileFromSession } = await import("@/lib/profile");
      const data = await fetchProfileFromSession();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  if (!canFetch) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <p>Connect with Humanity OAuth to read the <code>humanity_user</code> preset.</p>
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

  return (
    <div className="profile-card">
      <header>
        <div className="header-info">
          <h3>Humanity User Info</h3>
          <p>Verifies the <code>humanity_user</code> preset using the HumanitySDK</p>
        </div>
        <button onClick={refresh} disabled={loading}>
          {loading ? (
            <>
              <span className="spinner"></span>
              Refreshing…
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="23 4 23 10 17 10"></polyline>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
              </svg>
              Refresh
            </>
          )}
        </button>
      </header>
      {error ? <p className="error">{error}</p> : null}
      {profile ? (
        <ul>
          <li>
            <span className="label">Preset</span>
            <strong>{profile.preset}</strong>
          </li>
          <li>
            <span className="label">Status</span>
            <strong className={`status status-${profile.status}`}>
              <span className="status-indicator"></span>
              {profile.status}
            </strong>
          </li>
          <li>
            <span className="label">subject (sub)</span>
            <strong className="mono">{profile.evidence.sub}</strong>
          </li>
          <li>
            <span className="label">humanity_id</span>
            <strong className="mono">{profile.evidence.humanity_id ?? "—"}</strong>
          </li>
          <li>
            <span className="label">email</span>
            <strong>
              {profile.evidence.email ?? "—"}
              {profile.evidence.email ? (
                <span className={`email-status ${profile.evidence.email_verified ? 'verified' : 'unverified'}`}>
                  {profile.evidence.email_verified ? "verified" : "unverified"}
                </span>
              ) : null}
            </strong>
          </li>
          <li>
            <span className="label">wallet_address</span>
            <strong className="mono">{profile.evidence.wallet_address ?? "—"}</strong>
          </li>
          <li>
            <span className="label">authorization_id</span>
            <strong className="mono">{profile.evidence.authorization_id}</strong>
          </li>
          <li>
            <span className="label">scopes</span>
            <strong>
              <span className="scopes">
                {profile.evidence.scopes.map((scope) => (
                  <span key={scope} className="scope-badge">{scope}</span>
                ))}
              </span>
            </strong>
          </li>
          <li>
            <span className="label">updated_at</span>
            <strong>{formatDate(profile.evidence.updated_at)}</strong>
          </li>
          {profile.expiresAt && (
            <li>
              <span className="label">expires_at</span>
              <strong>{formatDate(profile.expiresAt)}</strong>
            </li>
          )}
        </ul>
      ) : (
        <div className="loading-state">
          <p>Profile data not loaded yet.</p>
        </div>
      )}
      <style jsx>{`
        .profile-card {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
        }
        .header-info h3 {
          margin: 0 0 0.25rem;
          font-size: 1rem;
        }
        .header-info p {
          margin: 0;
          font-size: 0.8125rem;
          color: var(--color-text-muted);
        }
        button {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-full);
          background: transparent;
          color: var(--color-text-secondary);
          padding: 0.5rem 1rem;
          font-size: 0.8125rem;
          font-weight: 500;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        button:hover:not(:disabled) {
          border-color: var(--color-accent);
          color: var(--color-accent);
          background: var(--color-accent-glow);
        }
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid transparent;
          border-top-color: currentColor;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 0.875rem;
        }
        li {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--color-border-subtle);
          padding-bottom: 0.75rem;
          gap: 1rem;
        }
        li:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        .label {
          text-transform: uppercase;
          font-size: 0.6875rem;
          font-weight: 500;
          letter-spacing: 0.05em;
          color: var(--color-text-muted);
        }
        strong {
          font-weight: 500;
          font-size: 0.875rem;
          text-align: right;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .mono {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          word-break: break-all;
          color: var(--color-text-secondary);
        }
        .status {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
        }
        .status-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }
        .status-valid {
          color: var(--color-success);
        }
        .status-expired {
          color: var(--color-warning);
        }
        .status-pending {
          color: var(--color-info);
        }
        .status-unavailable {
          color: var(--color-text-muted);
        }
        .email-status {
          font-size: 0.625rem;
          font-weight: 600;
          text-transform: uppercase;
          padding: 0.15rem 0.4rem;
          border-radius: var(--radius-full);
        }
        .email-status.verified {
          background: rgba(109, 251, 63, 0.12);
          color: var(--color-success);
        }
        .email-status.unverified {
          background: rgba(255, 184, 0, 0.12);
          color: var(--color-warning);
        }
        .scopes {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
          justify-content: flex-end;
        }
        .scope-badge {
          display: inline-block;
          font-size: 0.625rem;
          font-weight: 500;
          padding: 0.15rem 0.4rem;
          background: var(--color-bg-tertiary);
          color: var(--color-text-secondary);
          border-radius: var(--radius-full);
          border: 1px solid var(--color-border);
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
        .loading-state {
          text-align: center;
          padding: 1rem;
        }
        .loading-state p {
          color: var(--color-text-muted);
          margin: 0;
        }
      `}</style>
    </div>
  );
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}
