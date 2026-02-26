/**
 * CognitoService — Cognito Hosted UI token operations.
 *
 * Handles:
 * - Building the Cognito Hosted UI login redirect URL
 * - Exchanging an authorization code for Cognito tokens
 * - Decoding Cognito id_token claims (for display only — NOT signature-verified)
 */

import type { CognitoTokens, CognitoClaims } from '@/types';

export class CognitoService {
  constructor(
    private readonly domain: string,
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly callbackUrl: string,
  ) {}

  /**
   * Build the Cognito Hosted UI authorization URL.
   * Redirect the browser here to initiate login.
   */
  buildLoginUrl(): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      scope: 'openid email profile',
      redirect_uri: this.callbackUrl,
    });
    return `https://${this.domain}/login?${params.toString()}`;
  }

  /**
   * Exchange an authorization code from the Cognito callback for tokens.
   * Calls: POST https://<domain>/oauth2/token
   */
  async exchangeCode(code: string): Promise<CognitoTokens> {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.clientId,
      redirect_uri: this.callbackUrl,
      code,
    });

    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    // If the App Client has a client secret, use HTTP Basic Auth
    if (this.clientSecret) {
      const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      headers['Authorization'] = `Basic ${credentials}`;
    }

    const res = await fetch(`https://${this.domain}/oauth2/token`, {
      method: 'POST',
      headers,
      body: body.toString(),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Cognito token exchange failed (${res.status}): ${text}`);
    }

    return res.json() as Promise<CognitoTokens>;
  }

  /**
   * Decode Cognito id_token claims without verifying the signature.
   *
   * ⚠️ Only for display purposes. HP API does the verified JWKS check during
   *    the JWT bearer exchange.
   */
  decodeIdToken(idToken: string): CognitoClaims | null {
    try {
      const parts = idToken.split('.');
      if (parts.length < 2) return null;
      const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = payload.padEnd(Math.ceil(payload.length / 4) * 4, '=');
      return JSON.parse(Buffer.from(padded, 'base64').toString('utf-8')) as CognitoClaims;
    } catch {
      return null;
    }
  }
}

/** Singleton — initialized once from config. */
export function createCognitoService(): CognitoService {
  return new CognitoService(
    process.env.COGNITO_DOMAIN!,
    process.env.COGNITO_CLIENT_ID!,
    process.env.COGNITO_CLIENT_SECRET ?? '',
    process.env.COGNITO_CALLBACK_URL!,
  );
}
