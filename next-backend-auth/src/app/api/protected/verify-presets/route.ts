/**
 * POST /api/protected/verify-presets
 * 
 * Example route that verifies specific presets on demand.
 * Useful when you need to re-verify presets for sensitive operations.
 * 
 * Request body:
 * {
 *   "presets": ["isHuman", "ageOver18"]
 * }
 */

import { NextResponse, type NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';
import { getHumanitySdk } from '@/lib/humanity-sdk';
import { getConfig } from '@/lib/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withAuth(async (request: NextRequest, { user }) => {
  const body = await request.json().catch(() => ({}));
  const presetsToVerify = body.presets as string[] | undefined;

  if (!presetsToVerify?.length) {
    return NextResponse.json(
      { error: 'presets array is required' },
      { status: 400 },
    );
  }

  if (presetsToVerify.length > 10) {
    return NextResponse.json(
      { error: 'Maximum 10 presets can be verified at once' },
      { status: 400 },
    );
  }

  try {
    const sdk = getHumanitySdk();
    const config = getConfig();

    // Debug: Log the client secret prefix to verify it's loaded correctly
    const secretPrefix = config.humanity.clientSecret?.substring(0, 10);
    console.log('[verify-presets] Using client secret starting with:', secretPrefix);
    console.log('[verify-presets] Client ID:', config.humanity.clientId);
    console.log('[verify-presets] Looking up user:', user.humanityUserId);

    // Get a fresh token for this user using client credentials
    // Note: This requires the HUMANITY_CLIENT_SECRET to be correctly configured
    const userToken = await sdk.getClientUserToken({
      clientSecret: config.humanity.clientSecret,
      userId: user.humanityUserId,
    });

    // Verify the requested presets
    const result = await sdk.verifyPresets({
      presets: presetsToVerify,
      accessToken: userToken.accessToken,
    });

    // Check if any errors are due to missing scopes
    const missingScopeErrors = result.errors.filter(
      (e: any) => e.error?.error_subcode === 'missing_scope',
    );
    
    const response: Record<string, unknown> = {
      userId: user.appScopedUserId,
      verificationTime: new Date().toISOString(),
      results: result.results.map((r: any) => ({
        preset: r.preset,
        status: r.status,
        scope: r.scope,
        value: r.value,
        expiresAt: r.expiresAt,
        verifiedAt: r.verifiedAt,
        evidence: r.evidence,
      })),
      errors: result.errors.map((e: any) => ({
        preset: e.preset,
        error: e.error,
      })),
    };
    
    // Add helpful hint if user needs to re-authorize with additional scopes
    if (missingScopeErrors.length > 0) {
      const requiredScopes = missingScopeErrors.map(
        (e) => e.error?.context?.required_scope,
      ).filter(Boolean);
      response.hint = `User needs to re-authorize with additional scopes: ${requiredScopes.join(', ')}. Log out and log in again to request these scopes.`;
    }
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('[verify-presets] Error:', error);
    
    const errorCode = error?.code || error?.httpError?.body_?.message;
    const statusCode = error?.statusCode || 500;
    
    if (errorCode === 'invalid_client_secret') {
      return NextResponse.json(
        { 
          error: 'Configuration error: Invalid client secret',
          hint: 'Check that HUMANITY_CLIENT_SECRET matches your application credentials',
        },
        { status: 500 },
      );
    }
    
    if (errorCode === 'user_not_found') {
      return NextResponse.json(
        { error: 'User not found in Humanity Protocol' },
        { status: 404 },
      );
    }
    
    if (errorCode === 'user_not_authorized') {
      return NextResponse.json(
        { error: 'User has not authorized this application' },
        { status: 403 },
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to verify presets', code: errorCode },
      { status: statusCode },
    );
  }
});

