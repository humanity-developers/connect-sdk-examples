/**
 * POST /api/auth/login
 * 
 * Initiates the OAuth authorization flow.
 * Generates PKCE challenge and redirects to Humanity Protocol.
 * 
 * Request body (optional):
 * {
 *   "scopes": ["openid", "profile.full", "data.read"]
 * }
 * 
 * Response:
 * {
 *   "authUrl": "https://auth.humanity.org/oauth/authorize?..."
 * }
 */

import { NextResponse, type NextRequest } from 'next/server';
import { getHumanitySdk, HumanitySDK } from '@/lib/humanity-sdk';
import { getConfig } from '@/lib/config';
import { saveOAuthSession } from '@/lib/session';

export const runtime = 'nodejs';

// Default scopes to request
// Include preset scopes for verification capabilities
const DEFAULT_SCOPES = [
  'profile.full',
  'data.read',
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const requestedScopes = body.scopes?.length ? body.scopes : DEFAULT_SCOPES;

    const config = getConfig();
    const sdk = getHumanitySdk();

    // Generate PKCE state and nonce
    const state = HumanitySDK.generateState();
    const nonce = HumanitySDK.generateNonce();

    // Build the authorization URL with PKCE
    const { url, codeVerifier } = sdk.buildAuthUrl({
      scopes: requestedScopes,
      state,
      nonce,
    });

    // Save the OAuth session for the callback
    saveOAuthSession({
      clientId: config.humanity.clientId,
      redirectUri: config.humanity.redirectUri,
      environment: config.humanity.environment,
      scopes: requestedScopes,
      codeVerifier,
      state,
      nonce,
      createdAt: Date.now(),
    });

    return NextResponse.json({ authUrl: url });
  } catch (error) {
    console.error('[auth/login] Error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate login' },
      { status: 500 },
    );
  }
}

