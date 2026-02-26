/**
 * HumanityService — JWT Bearer Exchange + HP token operations.
 *
 * The core method is exchangeCognitoToken(), which exchanges a Cognito id_token
 * for a Humanity Protocol access token using the RFC 7523 JWT Bearer Grant.
 *
 * Uses @humanity-org/connect-sdk for type safety and rate-limit handling.
 * Raw fetch equivalent is shown in comments for reference.
 */

import { HumanitySDK } from '@humanity-org/connect-sdk';
import type { HumanityTokenResponse, HumanityUserInfo } from '@/types';

/**
 * Thrown when the user has not yet completed the Humanity consent flow.
 * Catch this to redirect the user to /consent.
 */
export class ConsentRequiredError extends Error {
  constructor(message = 'User has not granted Humanity access for this application.') {
    super(message);
    this.name = 'ConsentRequiredError';
  }
}

export class HumanityService {
  private sdk: HumanitySDK;

  constructor(
    private readonly apiUrl: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string,
  ) {
    this.sdk = new HumanitySDK({
      clientId,
      clientSecret,
      redirectUri,
      baseUrl: apiUrl !== 'https://api.humanity.org' ? apiUrl : undefined,
    });
  }

  /**
   * Exchange a Cognito id_token for Humanity Protocol OAuth tokens.
   *
   * Sends:
   *   POST /oauth/token
   *   { grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
   *     assertion: <cognito_id_token>,
   *     client_id: <hp_client_id> }
   *
   * HP API steps:
   *   1. Validates JWT signature via Cognito User Pool JWKS
   *   2. Checks issuer and audience against cognitoRegion/userPoolId/clientId
   *      configured on the HP app (PUT /v2/developer/applications/:id)
   *   3. Resolves HP user by Cognito `sub` (falls back to verified email)
   *   4. Checks for an active HP authorization for this client_id
   *   5. Issues HP access + refresh tokens
   *
   * @throws ConsentRequiredError  user hasn't completed the HP consent flow yet
   * @throws Error                 token validation failed or server error
   */
  async exchangeCognitoToken(cognitoIdToken: string): Promise<HumanityTokenResponse> {
    try {
      const result = await this.sdk.exchangeCognitoToken({ cognitoToken: cognitoIdToken });
      return this.mapTokenResult(result);
    } catch (err) {
      if (isConsentRequiredError(err)) {
        throw new ConsentRequiredError((err as Error).message);
      }
      throw err;
    }

    // ── Equivalent raw fetch (for reference) ─────────────────────────────────
    // const res = await fetch(`${this.apiUrl}/oauth/token`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    //     assertion: cognitoIdToken,
    //     client_id: this.sdk.config.clientId,
    //   }),
    // });
    // if (!res.ok) {
    //   const err = await res.json();
    //   if (err.error === 'invalid_grant' && err.error_description?.includes('consent')) {
    //     throw new ConsentRequiredError(err.error_description);
    //   }
    //   throw new Error(`Token exchange failed: ${err.error_description || err.error}`);
    // }
    // return res.json();
  }

  /**
   * Build the HP authorization URL for the initial consent flow (PKCE).
   * Store the returned codeVerifier in the session cookie before redirecting.
   */
  buildConsentUrl(scopes: string[]): { url: string; codeVerifier: string } {
    return this.sdk.buildAuthUrl({ scopes });
  }

  /**
   * Exchange the HP authorization code (from /api/consent/callback) for HP tokens.
   * Requires the codeVerifier from buildConsentUrl().
   */
  async exchangeConsentCode(code: string, codeVerifier: string): Promise<HumanityTokenResponse> {
    const result = await this.sdk.exchangeCodeForToken({ code, codeVerifier });
    return this.mapTokenResult(result);
  }

  /** GET /userinfo — fetch the user's HP profile */
  async getUserInfo(accessToken: string): Promise<HumanityUserInfo> {
    const res = await fetch(`${this.apiUrl}/userinfo`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error(`Failed to fetch userinfo: ${res.status}`);
    return res.json() as Promise<HumanityUserInfo>;
  }

  /** GET /v2/presets/:presetName — verify a single preset */
  async verifyPreset(accessToken: string, presetName: string): Promise<unknown> {
    const res = await fetch(`${this.apiUrl}/v2/presets/${presetName}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error(`Preset check failed: ${res.status}`);
    return res.json();
  }

  // Map SDK camelCase TokenResult → snake_case HumanityTokenResponse
  private mapTokenResult(r: Awaited<ReturnType<HumanitySDK['exchangeCodeForToken']>>): HumanityTokenResponse {
    return {
      access_token: r.accessToken,
      token_type: 'Bearer',
      expires_in: r.expiresIn,
      scope: r.scope,
      granted_scopes: r.grantedScopes,
      authorization_id: r.authorizationId,
      app_scoped_user_id: r.appScopedUserId,
      issued_at: r.issuedAt,
      refresh_token: r.refreshToken,
      refresh_token_expires_in: r.refreshTokenExpiresIn,
      refresh_issued_at: r.refreshIssuedAt,
    };
  }
}

function isConsentRequiredError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return msg.includes('consent') || msg.includes('no active') || msg.includes('authorization not found');
}

/** Singleton factory — reads from env vars directly so no config threading needed. */
export function createHumanityService(): HumanityService {
  return new HumanityService(
    process.env.HUMANITY_API_URL ?? 'https://api.humanity.org',
    process.env.HUMANITY_CLIENT_ID!,
    process.env.HUMANITY_CLIENT_SECRET!,
    process.env.HUMANITY_REDIRECT_URI!,
  );
}
