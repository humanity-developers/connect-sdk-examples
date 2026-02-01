/**
 * GET /api/cron/fetch-news
 * 
 * Cron job endpoint to fetch news from external API.
 * Called by Vercel cron every hour.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { fetchAllCategoryNews } from '@/lib/news-service';
import { getConfig } from '@/lib/config';

export const runtime = 'nodejs';
export const maxDuration = 60; // Allow up to 60 seconds

export async function GET(request: NextRequest) {
  const config = getConfig();

  // Verify cron secret in production
  const authHeader = request.headers.get('authorization');
  const cronSecret = authHeader?.replace('Bearer ', '');

  if (process.env.NODE_ENV === 'production' && cronSecret !== config.cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();

  try {
    const result = await fetchAllCategoryNews();
    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      ...result,
      duration,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

