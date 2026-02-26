/**
 * GET /api/consent/start
 *
 * Build the Humanity OAuth authorization URL (with PKCE) and redirect the
 * user to the HP consent screen.
 *
 * The PKCE code verifier is saved in a short-lived cookie (hp_pkce) for use
 * at /api/consent/callback.
 *
 * Required: Cognito session cookie (user must be logged in via Cognito).
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createHumanityService } from '@/services/humanity';
import { getCognitoTokens, savePkceVerifier } from '@/services/session';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { origin } = new URL(request.url);

  // Must be logged in via Cognito first
  const cognitoTokens = await getCognitoTokens();
  if (!cognitoTokens) {
    return NextResponse.redirect(`${origin}/api/auth/login`);
  }

  const humanity = createHumanityService();
  const scopes = (process.env.HUMANITY_SCOPES ?? 'openid identity:read profile.full').split(' ');

  const { url, codeVerifier } = humanity.buildConsentUrl(scopes);

  // Save PKCE code verifier — needed when HP redirects back to /api/consent/callback
  await savePkceVerifier(codeVerifier);

  console.log('[consent/start] Redirecting to HP consent UI');
  return NextResponse.redirect(url);
}
