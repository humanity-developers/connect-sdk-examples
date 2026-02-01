'use client';

import { useState } from 'react';

interface LoginButtonProps {
  scopes?: string[];
  className?: string;
  children?: React.ReactNode;
}

export function LoginButton({ scopes, className, children }: LoginButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scopes }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate login');
      }

      // Redirect to Humanity Protocol authorization page
      window.location.href = data.authUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleLogin}
        disabled={loading}
        className={className || 'btn btn-primary'}
      >
        {loading ? (
          <>
            <span className="spinner" />
            Connecting...
          </>
        ) : (
          children || 'Login with Humanity Protocol'
        )}
      </button>
      {error && (
        <p className="text-muted mt-1" style={{ color: 'var(--color-error)' }}>
          {error}
        </p>
      )}
    </div>
  );
}

