/**
 * POST /api/auth/login
 * 
 * Initiates OAuth flow with Humanity Protocol.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { getHumanitySdk, HumanitySDK } from '@/lib/humanity-sdk';
import { getConfig } from '@/lib/config';
import { saveOAuthSession } from '@/lib/session';
import { logApiCall } from '@/lib/database';
import { AUTH_SCOPES } from '@/lib/constants';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const sdk = getHumanitySdk();
    const config = getConfig();

    // Use scopes from constants - includes openid, profile.full, data.read, identity:read
    // Note: social_accounts is a PRESET (not a scope) - we verify it after auth
    const scopes = [...AUTH_SCOPES];

    // Generate PKCE state and nonce explicitly (more reliable than relying on SDK defaults)
    const state = HumanitySDK.generateState();
    const nonce = HumanitySDK.generateNonce();

    // Build authorization URL with PKCE
    const authResult = sdk.buildAuthUrl({
      scopes,
      state,
      nonce,
    });

    // Save OAuth session for callback validation
    // IMPORTANT: Save the state we generated, not the one from authResult
    saveOAuthSession({
      clientId: config.humanity.clientId,
      redirectUri: config.humanity.redirectUri,
      environment: config.humanity.environment,
      scopes,
      codeVerifier: authResult.codeVerifier,
      state: state, // Use our generated state
      nonce: nonce,
      createdAt: Date.now(),
    }, request);

    // Debug: Log cookie creation
    console.log('DEBUG - Login creating OAuth session:', {
      state,
      codeVerifier: authResult.codeVerifier.substring(0, 10) + '...',
      host: request.headers.get('host'),
      origin: request.headers.get('origin'),
      userAgent: request.headers.get('user-agent'),
    });

    const response = {
      success: true,
      authUrl: authResult.url,
      message: 'Redirect to authUrl to start OAuth flow',
    };

    // Log API call for dev panel
    await logApiCall({
      endpoint: '/api/auth/login',
      method: 'POST',
      request: { scopes },
      response: { success: true, hasAuthUrl: true },
      statusCode: 200,
      duration: Date.now() - startTime,
    });

    return NextResponse.json(response);
  } catch (error) {
    await logApiCall({
      endpoint: '/api/auth/login',
      method: 'POST',
      request: {},
      response: { error: error instanceof Error ? error.message : 'Unknown error' },
      statusCode: 500,
      duration: Date.now() - startTime,
    });

    return NextResponse.json(
      { error: 'Failed to initiate login' },
      { status: 500 }
    );
  }
}

