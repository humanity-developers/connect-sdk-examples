'use client';

import { useState } from 'react';

interface ApiEndpoint {
  name: string;
  method: 'GET' | 'POST';
  path: string;
  description: string;
  body?: object;
  requiresHuman?: boolean;
}

const ENDPOINTS: ApiEndpoint[] = [
  {
    name: 'Get Profile',
    method: 'GET',
    path: '/api/protected/profile',
    description: 'Returns your user profile (requires authentication)',
  },
  {
    name: 'Sensitive Data',
    method: 'GET',
    path: '/api/protected/sensitive',
    description: 'Access sensitive data (requires human verification)',
    requiresHuman: true,
  },
  {
    name: 'Sensitive Action',
    method: 'POST',
    path: '/api/protected/sensitive',
    description: 'Perform a sensitive action (requires human verification)',
    body: { action: 'vote', choice: 'option_a' },
    requiresHuman: true,
  },
  {
    name: 'Verify Presets',
    method: 'POST',
    path: '/api/protected/verify-presets',
    description: 'Re-verify specific presets on demand',
    body: { presets: ['humanity_user'] },
  },
];

export function ApiTester() {
  const [results, setResults] = useState<Record<string, { loading: boolean; data?: any; error?: string }>>({});

  const testEndpoint = async (endpoint: ApiEndpoint) => {
    setResults((prev) => ({
      ...prev,
      [endpoint.path + endpoint.method]: { loading: true },
    }));

    try {
      const response = await fetch(endpoint.path, {
        method: endpoint.method,
        headers: endpoint.body ? { 'Content-Type': 'application/json' } : undefined,
        body: endpoint.body ? JSON.stringify(endpoint.body) : undefined,
      });

      const data = await response.json();

      setResults((prev) => ({
        ...prev,
        [endpoint.path + endpoint.method]: {
          loading: false,
          data,
          error: response.ok ? undefined : data.error || 'Request failed',
        },
      }));
    } catch (err) {
      setResults((prev) => ({
        ...prev,
        [endpoint.path + endpoint.method]: {
          loading: false,
          error: err instanceof Error ? err.message : 'Request failed',
        },
      }));
    }
  };

  return (
    <div className="grid gap-3">
      {ENDPOINTS.map((endpoint) => {
        const key = endpoint.path + endpoint.method;
        const result = results[key];

        return (
          <div key={key} className="card">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h4 className="flex items-center gap-2">
                  {endpoint.name}
                  {endpoint.requiresHuman && (
                    <span className="badge badge-warning">Requires Human</span>
                  )}
                </h4>
                <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                  {endpoint.description}
                </p>
              </div>
              <button
                onClick={() => testEndpoint(endpoint)}
                disabled={result?.loading}
                className="btn btn-secondary"
              >
                {result?.loading ? (
                  <span className="spinner" />
                ) : (
                  <>
                    <span className="badge badge-info">{endpoint.method}</span>
                    Test
                  </>
                )}
              </button>
            </div>

            <div className="text-muted" style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-mono)' }}>
              {endpoint.method} {endpoint.path}
              {endpoint.body && (
                <div className="mt-1">
                  Body: {JSON.stringify(endpoint.body)}
                </div>
              )}
            </div>

            {result && !result.loading && (
              <div className="mt-2">
                {result.error ? (
                  <div className="alert alert-error">
                    <strong>Error:</strong> {result.error}
                  </div>
                ) : (
                  <pre style={{ maxHeight: '200px', overflow: 'auto' }}>
                    <code>{JSON.stringify(result.data, null, 2)}</code>
                  </pre>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

