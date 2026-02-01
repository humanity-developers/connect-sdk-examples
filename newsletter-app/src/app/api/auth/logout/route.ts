/**
 * POST /api/auth/logout
 * 
 * Clears the application session.
 */

import { NextResponse } from 'next/server';
import { deleteAppSession, readAppSession } from '@/lib/session';
import { logApiCall } from '@/lib/database';

export const runtime = 'nodejs';

export async function POST() {
  const startTime = Date.now();
  const session = readAppSession();

  const response = NextResponse.json({ success: true });
  deleteAppSession(response);

  await logApiCall({
    userId: session?.userId,
    endpoint: '/api/auth/logout',
    method: 'POST',
    request: {},
    response: { success: true },
    statusCode: 200,
    duration: Date.now() - startTime,
  });

  return response;
}

