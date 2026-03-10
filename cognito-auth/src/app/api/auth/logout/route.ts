/**
 * GET /api/auth/logout
 * Clear all session cookies and redirect to the landing page.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { clearSession } from '@/services/session';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { origin } = new URL(request.url);
  await clearSession();
  return NextResponse.redirect(`${origin}/`);
}
