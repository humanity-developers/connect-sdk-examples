/**
 * GET /api/dev/logs
 * 
 * Returns recent API logs for the developer panel.
 */

import { NextResponse } from 'next/server';
import { readAppSession } from '@/lib/session';
import { getRecentApiLogs } from '@/lib/database';

export const runtime = 'nodejs';

export async function GET() {
  const session = readAppSession();

  if (!session || session.expiresAt < Date.now()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const logs = await getRecentApiLogs(session.userId, 50);

    // Filter out internal API calls that aren't relevant for the SDK demo
    const INTERNAL_ENDPOINTS = ['/api/feed', '/api/dev/logs', '/api/auth/session'];
    const filteredLogs = logs.filter(
      (log) => !INTERNAL_ENDPOINTS.some((ep) => log.endpoint.startsWith(ep))
    );

    return NextResponse.json({
      logs: filteredLogs.map((log) => ({
        id: log._id?.toString(),
        endpoint: log.endpoint,
        method: log.method,
        request: log.request,
        response: log.response,
        statusCode: log.statusCode,
        duration: log.duration,
        timestamp: log.timestamp,
        category: log.category,
      })),
    });
  } catch (error) {
    console.error('[dev/logs] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}

