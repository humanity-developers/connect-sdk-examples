/**
 * GET /api/auth/session
 * 
 * Returns the current session data.
 */

import { NextResponse } from 'next/server';
import { readAppSession } from '@/lib/session';
import { findUserByAppScopedId } from '@/lib/database';

export const runtime = 'nodejs';

export async function GET() {
  const session = readAppSession();

  if (!session || session.expiresAt < Date.now()) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }

  // Get full user data from database
  const user = await findUserByAppScopedId(session.userId);

  return NextResponse.json({
    authenticated: true,
    userId: session.userId,
    humanityUserId: session.humanityUserId,
    email: session.email,
    linkedSocials: session.linkedSocials,
    presets: session.presets,
    expiresAt: session.expiresAt,
    user: user ? {
      linkedSocials: user.linkedSocials,
      presets: user.presets,
      lastLoginAt: user.lastLoginAt,
    } : null,
  });
}

