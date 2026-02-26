/**
 * POST /api/auth/cognito-exchange
 *
 * Exchanges a Cognito JWT for a Humanity Protocol OAuth token.
 *
 * This is the heart of the Cognito integration. When a user is already
 * authenticated with your AWS Cognito User Pool, you can obtain a Humanity
 * access token without sending them through the full HP OAuth consent flow again
 * — as long as they have an existing active HP authorization for your client_id.
 *
 * Flow:
 *   1. Frontend sends the Cognito id_token (or access_token) in the request body
 *   2. This route calls sdk.exchangeCognitoToken({ cognitoToken })
 *   3. The HP API verifies the Cognito JWT against the pool's JWKS
 *   4. Resolves the HP user by Cognito sub (falls back to verified email)
 *   5. Checks for an active HP authorization for this client_id
 *   6. Issues and returns a full HP access + refresh token pair
 *   7. We store it in a server-only session cookie
 *
 * Request body:
 * {
 *   "cognitoToken": "eyJhbGc..." // Cognito id_token or access_token
 * }
 *
 * Response:
 * {
 *   "ok": true,
 *   "appScopedUserId": "...",
 *   "authorizationId": "...",
 *   "grantedScopes": [...],
 *   "expiresIn": 3600
 * }
 *
 * Error responses:
 * - 400 invalid_request: missing cognitoToken
 * - 400 invalid_grant: Cognito JWT is invalid, expired, or no HP authorization exists
 * - 503 unsupported_grant_type: Cognito integration disabled on the HP API server
 */

import { NextResponse, type NextRequest } from 'next/server';
import { getHumanitySdk, HumanityError } from '@/lib/humanity-sdk';
import { saveSession } from '@/lib/session';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  let cognitoToken: string;

  try {
    const body = await request.json();
    cognitoToken = body?.cognitoToken;
  } catch {
    return NextResponse.json(
      { error: 'invalid_request', error_description: 'Request body must be JSON.' },
      { status: 400 },
    );
  }

  if (!cognitoToken) {
    return NextResponse.json(
      {
        error: 'invalid_request',
        error_description: 'cognitoToken is required in the request body.',
      },
      { status: 400 },
    );
  }

  try {
    const sdk = getHumanitySdk();

    // ── The core call ──────────────────────────────────────────────────────────
    // sdk.exchangeCognitoToken() sends:
    //   POST /oauth/token
    //   { grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    //     assertion: cognitoToken,
    //     client_id: '<your client id>' }
    //
    // The HP API:
    //   1. Verifies the Cognito JWT signature against the pool's JWKS
    //   2. Resolves the HP user by Cognito sub (or verified email as fallback)
    //   3. Checks for an active HP authorization for this client_id
    //   4. Issues access + refresh tokens
    // ──────────────────────────────────────────────────────────────────────────
    const humanityToken = await sdk.exchangeCognitoToken({ cognitoToken });

    // Persist the token in a server-only session cookie
    await saveSession({
      accessToken: humanityToken.accessToken,
      refreshToken: humanityToken.refreshToken,
      expiresAt: Math.floor(Date.now() / 1000) + humanityToken.expiresIn,
      appScopedUserId: humanityToken.appScopedUserId,
      authorizationId: humanityToken.authorizationId,
      grantedScopes: humanityToken.grantedScopes,
    });

    return NextResponse.json({
      ok: true,
      appScopedUserId: humanityToken.appScopedUserId,
      authorizationId: humanityToken.authorizationId,
      grantedScopes: humanityToken.grantedScopes,
      expiresIn: humanityToken.expiresIn,
    });
  } catch (err) {
    if (err instanceof HumanityError) {
      console.error('[cognito-exchange] HP API error:', err.toJSON());

      const statusCode = err.statusCode ?? 400;
      return NextResponse.json(
        {
          error: err.code,
          error_description: err.message,
        },
        { status: statusCode },
      );
    }

    console.error('[cognito-exchange] Unexpected error:', err);
    return NextResponse.json(
      {
        error: 'server_error',
        error_description: 'An unexpected error occurred during token exchange.',
      },
      { status: 500 },
    );
  }
}
