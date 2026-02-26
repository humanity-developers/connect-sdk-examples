/**
 * CognitoService — Cognito Hosted UI token operations
 *
 * Handles:
 * - Building the Cognito Hosted UI login redirect URL
 * - Exchanging an authorization code for Cognito tokens
 * - Decoding Cognito id_token claims (without signature verification —
 *   HP API performs the verified JWKS check during JWT bearer exchange)
 */

import type { CognitoTokens, CognitoClaims } from '../types';

export class CognitoService {
  constructor(
    private readonly region: string,
    private readonly userPoolId: string,
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly domain: string,
    private readonly callbackUrl: string,
  ) {}

  /**
   * Build the Cognito Hosted UI authorization URL.
   * Redirect the user here to initiate login.
   *
   * Equivalent to:
   *   https://<domain>/login?client_id=<id>&response_type=code&scope=openid+email&redirect_uri=<url>
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
   * Exchange an authorization code (from Cognito callback) for Cognito tokens.
   *
   * Calls: POST https://<domain>/oauth2/token
   */
  async exchangeCode(code: string): Promise<CognitoTokens> {
    const tokenEndpoint = `https://${this.domain}/oauth2/token`;

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

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers,
      body: body.toString(),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Cognito token exchange failed (${response.status}): ${text}`);
    }

    return response.json() as Promise<CognitoTokens>;
  }

  /**
   * Decode the claims from a Cognito id_token without verifying the signature.
   *
   * ⚠️ Do NOT use this for authorization decisions — the HP API performs the
   *   verified JWKS check during the JWT bearer exchange. This is only for
   *   reading claims to display in the UI.
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
