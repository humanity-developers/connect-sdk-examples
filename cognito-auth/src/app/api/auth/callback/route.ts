/**
 * GET /api/auth/callback
 *
 * Cognito Hosted UI redirects here after login with ?code=...
 *
 * Steps:
 *   1. Exchange the Cognito authorization code for Cognito tokens (id_token, access_token)
 *   2. Try to exchange the Cognito id_token for a Humanity access token via JWT Bearer Grant
 *   3a. Success  → save both token sets, redirect to /dashboard
 *   3b. ConsentRequiredError → save Cognito tokens only, redirect to /consent
 *       (the user hasn't granted HP access yet — first-time only)
 *   3c. Other HP error → redirect to / with error message
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createCognitoService } from '@/services/cognito';
import { createHumanityService, ConsentRequiredError } from '@/services/humanity';
import { saveCognitoTokens, saveHumanityTokens } from '@/services/session';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    const msg = errorDescription || error;
    return NextResponse.redirect(`${origin}/?error=${encodeURIComponent(msg)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/?error=missing_code`);
  }

  const cognito = createCognitoService();
  const humanity = createHumanityService();

  // Step 1 — Exchange Cognito authorization code for Cognito tokens
  let cognitoTokens;
  try {
    cognitoTokens = await cognito.exchangeCode(code);
  } catch (err) {
    console.error('[auth/callback] Cognito code exchange failed:', err);
    return NextResponse.redirect(`${origin}/?error=cognito_exchange_failed`);
  }

  await saveCognitoTokens(cognitoTokens);

  // Step 2 — Try to exchange the Cognito id_token for a Humanity access token.
  //
  // This works immediately if:
  //   • The user previously completed the HP consent flow for this app
  //   • The HP app has cognitoRegion/userPoolId/clientId configured (Step 2 of guide)
  try {
    const humanityTokens = await humanity.exchangeCognitoToken(cognitoTokens.id_token);
    await saveHumanityTokens(humanityTokens);

    console.log('[auth/callback] JWT bearer exchange succeeded → /dashboard');
    return NextResponse.redirect(`${origin}/dashboard`);
  } catch (err) {
    if (err instanceof ConsentRequiredError) {
      // First-time user — send them through the HP consent flow
      console.log('[auth/callback] Consent required → /consent');
      return NextResponse.redirect(`${origin}/consent`);
    }

    // JWT validation failed: expired token, wrong pool, audience mismatch, etc.
    const msg = (err as Error).message;
    console.error('[auth/callback] HP JWT bearer failed:', msg);
    return NextResponse.redirect(`${origin}/?error=${encodeURIComponent(msg)}`);
  }
}
