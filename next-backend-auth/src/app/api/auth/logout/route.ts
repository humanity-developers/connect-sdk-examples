/**
 * POST /api/auth/logout
 * 
 * Logs out the user by clearing the session.
 */

import { NextResponse } from 'next/server';
import { deleteAppSession, deleteOAuthSession } from '@/lib/session';

export const runtime = 'nodejs';

export async function POST() {
  const response = NextResponse.json({ success: true });
  deleteAppSession(response);
  deleteOAuthSession(response);
  return response;
}

