/**
 * GET /api/protected/profile
 * 
 * Example protected route that returns user profile information.
 * Requires authentication but not human verification.
 */

import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withAuth(async (_request, { user }) => {
  return NextResponse.json({
    profile: {
      id: user.appScopedUserId,
      humanityUserId: user.humanityUserId,
      isHuman: user.isHuman,
      presets: user.presets,
      scopes: user.scopes,
      authorizationId: user.authorizationId,
      tokenIssuedAt: new Date(user.iat * 1000).toISOString(),
      tokenExpiresAt: new Date(user.exp * 1000).toISOString(),
    },
  });
});

