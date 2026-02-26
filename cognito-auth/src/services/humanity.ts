/**
 * HumanityService — JWT Bearer Exchange + Token Operations
 *
 * The primary method is `exchangeCognitoToken()`, which exchanges a Cognito
 * id_token for a Humanity Protocol access token using the RFC 7523 JWT Bearer Grant.
 *
 * This service uses the @humanity-org/connect-sdk when possible for type safety
 * and automatic rate-limit handling. Raw fetch is shown in comments for reference.
 */

import { HumanitySDK } from '@humanity-org/connect-sdk';
import type { HumanityTokenResponse, HumanityUserInfo } from '../types';

/**
 * Thrown when the user has not yet completed the Humanity consent flow.
 * Catch this in route handlers to redirect the user to /consent.
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
    private readonly clientId: string,
    clientSecret: string,
    redirectUri: string,
  ) {
    this.sdk = new HumanitySDK({
      clientId,
      clientSecret,
      redirectUri,
      // baseUrl allows pointing the SDK at a custom API URL (staging, etc.)
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
   *     client_id: <humanity_client_id> }
   *
   * The HP API:
   *   1. Validates the Cognito JWT signature via the User Pool's JWKS
   *   2. Checks issuer and audience against the cognitoRegion/userPoolId/clientId
   *      configured on the HP application (via PUT /v2/developer/applications/:id)
   *   3. Resolves the HP user by Cognito `sub` (falls back to verified email)
   *   4. Checks for an active HP authorization for this client_id
   *   5. Issues HP access + refresh tokens
   *
   * @throws ConsentRequiredError  — user hasn't completed the HP consent flow yet
   * @throws Error                 — token validation failed, unknown user, or server error
   */
  async exchangeCognitoToken(cognitoIdToken: string): Promise<HumanityTokenResponse> {
    // Using the SDK helper (recommended — handles rate limits, type safety)
    // The SDK maps to the same POST /oauth/token call shown below.
    try {
      const result = await this.sdk.exchangeCognitoToken({ cognitoToken: cognitoIdToken });

      // Map the SDK's camelCase TokenResult back to the snake_case shape for consistency
      // with the raw response format documented in the guide.
      return {
        access_token: result.accessToken,
        token_type: 'Bearer',
        expires_in: result.expiresIn,
        scope: result.scope,
        granted_scopes: result.grantedScopes,
        authorization_id: result.authorizationId,
        app_scoped_user_id: result.appScopedUserId,
        issued_at: result.issuedAt,
        refresh_token: result.refreshToken,
        refresh_token_expires_in: result.refreshTokenExpiresIn,
        refresh_issued_at: result.refreshIssuedAt,
      };
    } catch (err) {
      // Re-throw ConsentRequiredError so callers can redirect to the consent flow
      if (isConsentRequiredError(err)) {
        throw new ConsentRequiredError((err as Error).message);
      }
      throw err;
    }

    // ── Equivalent raw fetch (for reference) ─────────────────────────────────
    // const response = await fetch(`${this.apiUrl}/oauth/token`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    //     assertion: cognitoIdToken,
    //     client_id: this.clientId,
    //   }),
    // });
    // if (!response.ok) {
    //   const error = await response.json();
    //   if (error.error === 'invalid_grant' && error.error_description?.includes('consent')) {
    //     throw new ConsentRequiredError(error.error_description);
    //   }
    //   throw new Error(`Token exchange failed: ${error.error_description || error.error}`);
    // }
    // return response.json();
  }

  /**
   * Build the Humanity OAuth authorization URL for the initial consent flow.
   * Store the returned `codeVerifier` in the session for use at /consent/callback.
   */
  buildConsentUrl(scopes: string[]): { url: string; codeVerifier: string } {
    return this.sdk.buildAuthUrl({ scopes });
  }

  /**
   * Exchange an authorization code (from the HP consent callback) for HP tokens.
   * Requires the `codeVerifier` from `buildConsentUrl()`.
   */
  async exchangeConsentCode(
    code: string,
    codeVerifier: string,
  ): Promise<HumanityTokenResponse> {
    const result = await this.sdk.exchangeCodeForToken({ code, codeVerifier });
    return {
      access_token: result.accessToken,
      token_type: 'Bearer',
      expires_in: result.expiresIn,
      scope: result.scope,
      granted_scopes: result.grantedScopes,
      authorization_id: result.authorizationId,
      app_scoped_user_id: result.appScopedUserId,
      issued_at: result.issuedAt,
      refresh_token: result.refreshToken,
      refresh_token_expires_in: result.refreshTokenExpiresIn,
      refresh_issued_at: result.refreshIssuedAt,
    };
  }

  /**
   * Fetch the user's Humanity profile using an access token.
   * GET /userinfo
   */
  async getUserInfo(accessToken: string): Promise<HumanityUserInfo> {
    const response = await fetch(`${this.apiUrl}/userinfo`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch user info: ${response.status}`);
    }
    return response.json() as Promise<HumanityUserInfo>;
  }

  /**
   * Verify a preset for the authenticated user.
   * GET /v2/presets/:presetName
   */
  async verifyPreset(accessToken: string, presetName: string): Promise<unknown> {
    const response = await fetch(`${this.apiUrl}/v2/presets/${presetName}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      throw new Error(`Preset check failed: ${response.status}`);
    }
    return response.json();
  }
}

/**
 * Detect a "consent required" error from the HP API.
 * Matches on error code or description from both SDK errors and raw fetch errors.
 */
function isConsentRequiredError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return (
    msg.includes('consent') ||
    msg.includes('no active') ||
    msg.includes('authorization not found')
  );
}
