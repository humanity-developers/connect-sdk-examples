/**
 * GET /callback
 * 
 * OAuth callback handler.
 * Exchanges authorization code for tokens and creates user session.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { getHumanitySdk, HumanitySDK } from '@/lib/humanity-sdk';
import { getAuthService } from '@/lib/auth-service';
import { readOAuthSession, deleteOAuthSession, saveAppSession } from '@/lib/session';
import { logApiCall } from '@/lib/database';
import { SOCIAL_CONNECTIONS_URL } from '@/lib/constants';
import { resolvePath } from '@/lib/paths';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const callbackState = url.searchParams.get('state');
  const errorParam = url.searchParams.get('error');

  // Handle OAuth errors
  if (errorParam) {
    const errorDescription = url.searchParams.get('error_description') || errorParam;
    const response = NextResponse.redirect(
      new URL(`${resolvePath('/', request)}?error=${encodeURIComponent(errorDescription)}`, request.url)
    );
    deleteOAuthSession(response);
    return response;
  }

  // Debug: Log all relevant headers for Next.js rewrites troubleshooting
  const debugHeaders = {
    host: request.headers.get('host'),
    'x-forwarded-host': request.headers.get('x-forwarded-host'),
    'x-forwarded-for': request.headers.get('x-forwarded-for'),
    'x-forwarded-proto': request.headers.get('x-forwarded-proto'),
    referer: request.headers.get('referer'),
    origin: request.headers.get('origin'),
    'user-agent': request.headers.get('user-agent'),
    cookies: request.headers.get('cookie'),
  };

  console.log('DEBUG - Callback headers:', debugHeaders);
  console.log('DEBUG - URL params:', { code: !!code, callbackState: !!callbackState, error: errorParam });

  // Read OAuth session (pass request for header-based cookie fallback)
  const session = readOAuthSession(request);

  // Debug: Log session status and cookies
  console.log('DEBUG - Callback session check:', {
    hasSession: !!session,
    sessionState: session?.state,
    cookieCount: request.headers.get('cookie')?.split(';').length || 0,
    requestUrl: request.url,
    callbackState,
    stateMatch: session ? session.state === callbackState : false,
  });

  if (!session) {
    console.log('DEBUG - No OAuth session found, redirecting with session_expired');
    return NextResponse.redirect(new URL(`${resolvePath('/', request)}?error=session_expired`, request.url));
  }

  // Verify state (CSRF protection)
  const statesMatchSimple = session.state === callbackState;
  const statesMatchSDK = HumanitySDK.verifyState(session.state, callbackState);

  if (!code || !callbackState || (!statesMatchSimple && !statesMatchSDK)) {
    const response = NextResponse.redirect(
      new URL(`${resolvePath('/', request)}?error=invalid_state`, request.url)
    );
    deleteOAuthSession(response);
    return response;
  }

  try {
    const sdk = getHumanitySdk();
    const authService = getAuthService();

    // Exchange code for tokens
    const tokenResult = await sdk.exchangeCodeForToken({
      code,
      codeVerifier: session.codeVerifier,
    });

    // Log the token exchange
    await logApiCall({
      endpoint: 'Humanity /oauth/token',
      method: 'POST',
      request: { 
        grant_type: 'authorization_code', 
        code: '***redacted***',
        code_verifier: '***redacted***',
        client_id: 'your_client_id',
        redirect_uri: '/callback',
      },
      response: {
        token_type: tokenResult.tokenType,
        expires_in: tokenResult.expiresIn,
        scope: tokenResult.scope,
        has_access_token: !!tokenResult.accessToken,
        has_refresh_token: !!tokenResult.refreshToken,
        has_id_token: !!tokenResult.idToken,
      },
      statusCode: 200,
      duration: Date.now() - startTime,
      category: 'oauth',
    });

    // Extract user data from Humanity
    const userData = await authService.extractUserData(tokenResult.accessToken);

    // Log the email preset call
    await logApiCall({
      userId: userData.appScopedUserId,
      endpoint: 'Humanity /presets/single',
      method: 'POST',
      request: { preset: 'email' },
      response: {
        preset: 'email',
        value: userData.email ? '***@***.com' : null,
        status: userData.email ? 'valid' : 'unavailable',
      },
      statusCode: 200,
      duration: 0,
      category: 'presets',
    });

    // Log the social presets batch call
    const connectedSocials = userData.linkedSocials.filter((s) => s.connected);
    await logApiCall({
      userId: userData.appScopedUserId,
      endpoint: 'Humanity /presets/batch',
      method: 'POST',
      request: { 
        presets: [
          'google_connected',
          'linkedin_connected',
          'twitter_connected',
          'discord_connected',
          'github_connected',
          'telegram_connected',
        ],
      },
      response: {
        results: userData.linkedSocials.map((s) => ({
          presetName: `${s.provider}_connected`,
          value: s.connected,
        })),
      },
      statusCode: 200,
      duration: 0,
      category: 'presets',
    });

    // Log the hotel membership query
    await logApiCall({
      userId: userData.appScopedUserId,
      endpoint: 'Humanity /query/evaluate',
      method: 'POST',
      request: { 
        query: {
          policy: {
            anyOf: [
              { check: { claim: 'membership.marriott', operator: 'isDefined' } },
              { check: { claim: 'membership.hilton', operator: 'isDefined' } },
              { check: { claim: 'membership.accor', operator: 'isDefined' } },
            ],
          },
        },
      },
      response: {
        passed: userData.travelProfile.hasHotelMembership,
        queryType: 'hotel_membership',
      },
      statusCode: 200,
      duration: 0,
      category: 'query_engine',
    });

    // Log the airline membership query
    await logApiCall({
      userId: userData.appScopedUserId,
      endpoint: 'Humanity /query/evaluate',
      method: 'POST',
      request: { 
        query: {
          policy: {
            anyOf: [
              { check: { claim: 'membership.delta', operator: 'isDefined' } },
              { check: { claim: 'membership.emirates', operator: 'isDefined' } },
              { check: { claim: 'membership.united', operator: 'isDefined' } },
            ],
          },
        },
      },
      response: {
        passed: userData.travelProfile.hasAirlineMembership,
        queryType: 'airline_membership',
      },
      statusCode: 200,
      duration: 0,
      category: 'query_engine',
    });

    // Log derived frequent traveler status
    await logApiCall({
      userId: userData.appScopedUserId,
      endpoint: 'App: Derive frequent traveler',
      method: 'COMPUTE',
      request: { 
        hasHotelMembership: userData.travelProfile.hasHotelMembership,
        hasAirlineMembership: userData.travelProfile.hasAirlineMembership,
      },
      response: {
        isFrequentTraveler: userData.travelProfile.isFrequentTraveler,
        logic: 'hasHotelMembership AND hasAirlineMembership',
      },
      statusCode: 200,
      duration: 0,
      category: 'app_logic',
    });

    // GATE: Check if user has at least 1 social connection
    if (!authService.hasAnySocialConnection(userData.linkedSocials)) {
      await logApiCall({
        userId: userData.appScopedUserId,
        endpoint: '/callback',
        method: 'GET',
        request: {},
        response: { 
          error: 'no_social_connections',
          redirectTo: SOCIAL_CONNECTIONS_URL,
        },
        statusCode: 403,
        duration: Date.now() - startTime,
        category: 'app_logic',
      });

      const response = NextResponse.redirect(
        new URL(`${resolvePath('/', request)}?error=no_social_connections`, request.url)
      );
      deleteOAuthSession(response);
      return response;
    }

    // Create or update user in database
    const user = await authService.createOrUpdateUser(userData);

    // Log user profile creation
    await logApiCall({
      userId: userData.appScopedUserId,
      endpoint: 'App: Upsert User Profile',
      method: 'DB',
      request: { 
        humanityUserId: userData.humanityUserId,
        appScopedUserId: userData.appScopedUserId,
        linkedSocials: connectedSocials.map((s) => s.provider),
        presetsCount: userData.presets.length,
      },
      response: {
        userId: user.appScopedUserId,
        created: !user.createdAt || user.createdAt.getTime() === user.updatedAt?.getTime(),
      },
      statusCode: 200,
      duration: 0,
      category: 'app_logic',
    });

    // Issue app token with travel profile
    const appToken = await authService.issueAppToken(user, userData.travelProfile);

    // Log session token issuance
    await logApiCall({
      userId: userData.appScopedUserId,
      endpoint: 'App: Issue Session Token',
      method: 'JWT',
      request: { 
        userId: appToken.payload.appScopedUserId,
        linkedSocials: appToken.payload.linkedSocials,
        presets: appToken.payload.presets,
        isFrequentTraveler: appToken.payload.isFrequentTraveler,
      },
      response: {
        tokenIssued: true,
        expiresAt: appToken.expiresAt.toISOString(),
        claims: Object.keys(appToken.payload),
      },
      statusCode: 200,
      duration: Date.now() - startTime,
      category: 'app_logic',
    });

    // Save session and redirect
    const response = NextResponse.redirect(new URL(resolvePath('/feed', request), request.url));
    deleteOAuthSession(response);
    saveAppSession(
      {
        appToken: appToken.token,
        expiresAt: appToken.expiresAt.getTime(),
        userId: appToken.payload.appScopedUserId,
        humanityUserId: appToken.payload.humanityUserId,
        email: appToken.payload.email,
        evmAddress: appToken.payload.evmAddress,
        linkedSocials: appToken.payload.linkedSocials,
        presets: appToken.payload.presets,
        isFrequentTraveler: appToken.payload.isFrequentTraveler,
      },
      response
    );

    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'authentication_failed';

    await logApiCall({
      endpoint: '/callback',
      method: 'GET',
      request: { hasCode: !!code },
      response: { error: errorMessage },
      statusCode: 500,
      duration: Date.now() - startTime,
      category: 'oauth',
    });

    const response = NextResponse.redirect(
      new URL(`${resolvePath('/', request)}?error=${encodeURIComponent(errorMessage)}`, request.url)
    );
    deleteOAuthSession(response);
    return response;
  }
}

