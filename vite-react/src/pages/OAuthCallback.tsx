import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { sdk, getCodeVerifier, clearCodeVerifier } from '../lib/humanity';
import { useAuth } from '../hooks/useAuth';

export function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      // Check for OAuth error first
      const oauthError = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (oauthError) {
        setError(`OAuth Error: ${oauthError}${errorDescription ? ` - ${errorDescription}` : ''}`);
        return;
      }

      const code = searchParams.get('code');
      const codeVerifier = getCodeVerifier();

      console.log('Callback params:', {
        hasCode: !!code,
        hasCodeVerifier: !!codeVerifier,
        code: code?.substring(0, 10) + '...',
        allParams: Object.fromEntries(searchParams.entries())
      });

      if (!code) {
        setError('Missing authorization code from callback URL');
        return;
      }

      if (!codeVerifier) {
        setError('Missing PKCE code verifier from session storage');
        return;
      }

      try {
        // exchangeCodeForToken expects an object, not separate params
        const token = await sdk.exchangeCodeForToken({
          code,
          codeVerifier,
        });

        console.log('Token response:', token);

        const verification = await sdk.verifyPresets({
          accessToken: token.accessToken,
          presets: ['is_human', 'email'],
        });

        console.log('Verification response:', verification);

        setAuth(token.accessToken, verification.results, token);
        clearCodeVerifier();
        navigate('/dashboard');
      } catch (err) {
        console.error('Authentication error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
      }
    }

    handleCallback();
  }, [searchParams, navigate, setAuth]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <h2 className="text-xl font-semibold text-center text-red-400">
            Authentication Error
          </h2>
          <div className="rounded-md border border-red-400/50 bg-red-400/10 p-4">
            <p className="text-sm text-center">{error}</p>
          </div>
          <a
            href="/"
            className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Try again
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-sm text-muted-foreground">Processing authentication...</p>
      </div>
    </div>
  );
}
