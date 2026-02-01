/**
 * GET /api/auth/session
 * 
 * Returns the current session information.
 * Use this to check if the user is logged in.
 */

import { NextResponse } from 'next/server';
import { readAppSession } from '@/lib/session';
import { getAuthService } from '@/lib/auth-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = readAppSession();

  if (!session) {
    return NextResponse.json({
      authenticated: false,
      user: null,
    });
  }

  // Check if session is expired
  if (session.expiresAt < Date.now()) {
    return NextResponse.json({
      authenticated: false,
      user: null,
      error: 'session_expired',
    });
  }

  // Optionally verify the app token
  const authService = getAuthService();
  const payload = await authService.verifyAppToken(session.appToken);

  if (!payload) {
    return NextResponse.json({
      authenticated: false,
      user: null,
      error: 'invalid_token',
    });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: payload.appScopedUserId,
      humanityUserId: payload.humanityUserId,
      isHuman: payload.isHuman,
      presets: payload.presets,
      scopes: payload.scopes,
    },
    expiresAt: new Date(payload.exp * 1000).toISOString(),
  });
}

