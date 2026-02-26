/**
 * GET /api/auth/session
 * Returns the current Humanity session (without the raw token).
 *
 * DELETE /api/auth/session
 * Clears the Humanity session cookie (logout).
 */

import { NextResponse } from 'next/server';
import { readSession, deleteSession } from '@/lib/session';

export const runtime = 'nodejs';

export async function GET() {
  const session = await readSession();

  if (!session) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    appScopedUserId: session.appScopedUserId,
    authorizationId: session.authorizationId,
    grantedScopes: session.grantedScopes,
    expiresAt: session.expiresAt,
  });
}

export async function DELETE() {
  await deleteSession();
  return NextResponse.json({ ok: true });
}
