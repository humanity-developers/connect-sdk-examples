/**
 * GET /callback
 * 
 * OAuth callback handler.
 * Exchanges the authorization code for tokens, validates with Humanity,
 * and issues your application's JWT.
 * 
 * Query parameters:
 * - code: Authorization code from Humanity
 * - state: State parameter for CSRF protection
 * - error: Error code if authorization failed
 */

import { NextResponse, type NextRequest } from 'next/server';
import { getHumanitySdk, HumanitySDK } from '@/lib/humanity-sdk';
import { getAuthService } from '@/lib/auth-service';
import {
  readOAuthSession,
  deleteOAuthSession,
  saveAppSession,
} from '@/lib/session';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const callbackState = url.searchParams.get('state');
  const errorParam = url.searchParams.get('error');

  // Handle OAuth errors
  if (errorParam) {
    const errorDescription = url.searchParams.get('error_description') || errorParam;
    const response = NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(errorDescription)}`, request.url),
    );
    deleteOAuthSession(response);
    return response;
  }

  // Read the OAuth session
  const session = readOAuthSession();
  if (!session) {
    return NextResponse.redirect(
      new URL('/?error=session_expired', request.url),
    );
  }

  // Verify state parameter (CSRF protection)
  if (!code || !callbackState || !HumanitySDK.verifyState(session.state, callbackState)) {
    const response = NextResponse.redirect(
      new URL('/?error=invalid_state', request.url),
    );
    deleteOAuthSession(response);
    return response;
  }

  try {
    const sdk = getHumanitySdk();
    const authService = getAuthService();

    // Step 1: Exchange authorization code for Humanity tokens
    console.log('[callback] Exchanging code for tokens...');
    const humanityToken = await sdk.exchangeCodeForToken(code, session.codeVerifier);
    console.log('[callback] Token exchange successful');

    // Step 2: Verify nonce if OpenID was requested
    if (session.scopes.includes('openid') && session.nonce && humanityToken.idToken) {
      const idTokenPayload = decodeJwtPayload(humanityToken.idToken);
      if (!idTokenPayload || !HumanitySDK.verifyNonce(session.nonce, idTokenPayload.nonce as string)) {
        const response = NextResponse.redirect(
          new URL('/?error=nonce_mismatch', request.url),
        );
        deleteOAuthSession(response);
        return response;
      }
    }

    // Step 3: Validate the Humanity token and verify presets
    console.log('[callback] Validating Humanity token...');
    const validation = await authService.validateHumanityToken(
      humanityToken.accessToken,
      ['isHuman'], // Verify the isHuman preset
    );

    if (!validation.valid || !validation.user) {
      console.error('[callback] Token validation failed:', validation.error);
      const response = NextResponse.redirect(
        new URL(`/?error=${encodeURIComponent(validation.error || 'validation_failed')}`, request.url),
      );
      deleteOAuthSession(response);
      return response;
    }

    console.log('[callback] Token validated successfully');

    // Step 4: Issue your application's JWT
    console.log('[callback] Issuing application token...');
    const appToken = await authService.issueAppToken(validation.user, {
      // Add any custom claims you need
      loginMethod: 'oauth',
      loginTime: new Date().toISOString(),
    });

    // Step 5: Save the app session and redirect
    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    deleteOAuthSession(response);
    saveAppSession(
      {
        appToken: appToken.token,
        expiresAt: appToken.expiresAt.getTime(),
        userId: appToken.payload.appScopedUserId,
        isHuman: appToken.payload.isHuman,
        presets: appToken.payload.presets,
        scopes: appToken.payload.scopes,
        authorizationId: appToken.payload.authorizationId,
      },
      response,
    );

    console.log('[callback] Authentication complete, redirecting to dashboard');
    return response;
  } catch (error) {
    console.error('[callback] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'authentication_failed';
    const response = NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(errorMessage)}`, request.url),
    );
    deleteOAuthSession(response);
    return response;
  }
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payload.padEnd(Math.ceil(payload.length / 4) * 4, '=');
    return JSON.parse(Buffer.from(padded, 'base64').toString('utf-8'));
  } catch {
    return null;
  }
}

