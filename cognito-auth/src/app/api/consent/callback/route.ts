/**
 * GET /api/consent/callback
 *
 * Humanity redirects here after the user grants consent with ?code=...
 *
 * Steps:
 *   1. Retrieve and consume the PKCE code verifier from the session cookie
 *   2. Exchange the HP authorization code for HP tokens
 *   3. Save HP tokens and redirect to /dashboard
 *
 * After this succeeds, all future Cognito logins will automatically get HP tokens
 * via the JWT Bearer Grant — no consent screen needed again.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createHumanityService } from '@/services/humanity';
import { getCognitoTokens, saveHumanityTokens, consumePkceVerifier } from '@/services/session';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    const msg = errorDescription || error;
    console.error('[consent/callback] HP authorization error:', msg);
    return NextResponse.redirect(`${origin}/consent?error=${encodeURIComponent(msg)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/consent?error=missing_code`);
  }

  // Require active Cognito session
  const cognitoTokens = await getCognitoTokens();
  if (!cognitoTokens) {
    return NextResponse.redirect(`${origin}/api/auth/login`);
  }

  // Retrieve and consume the PKCE code verifier (single-use)
  const codeVerifier = await consumePkceVerifier();
  if (!codeVerifier) {
    return NextResponse.redirect(`${origin}/consent?error=session_expired`);
  }

  const humanity = createHumanityService();

  try {
    const humanityTokens = await humanity.exchangeConsentCode(code, codeVerifier);
    await saveHumanityTokens(humanityTokens);

    console.log('[consent/callback] HP consent complete');
    console.log('[consent/callback] app_scoped_user_id:', humanityTokens.app_scoped_user_id);

    // From now on, Cognito logins will auto-exchange to HP tokens — no consent screen.
    return NextResponse.redirect(`${origin}/dashboard`);
  } catch (err) {
    const msg = (err as Error).message;
    console.error('[consent/callback] HP code exchange failed:', msg);
    return NextResponse.redirect(`${origin}/consent?error=${encodeURIComponent(msg)}`);
  }
}
