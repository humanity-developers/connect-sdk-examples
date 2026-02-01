/**
 * GET /api/feed
 * 
 * Returns personalized news feed for the authenticated user.
 * Supports optional signal filtering via query params for demo purposes.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { readAppSession } from '@/lib/session';
import { findUserByAppScopedId, getNewsForUser, logApiCall } from '@/lib/database';
import { getRecommendationReason } from '@/lib/news-service';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const session = readAppSession();

  if (!session || session.expiresAt < Date.now()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '20', 10);
  const skip = parseInt(url.searchParams.get('skip') || '0', 10);
  
  // Optional: override signals for demo purposes (user-controlled filtering)
  const signalsParam = url.searchParams.get('signals');
  const signalOverrides = signalsParam 
    ? signalsParam.split(',').filter(s => s.trim().length > 0)
    : undefined;

  try {
    const user = await findUserByAppScopedId(session.userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Use signal overrides if provided, otherwise use all user signals
    const { articles, totalCount } = await getNewsForUser(user, limit, skip, signalOverrides);

    // Determine which signals are active for recommendation reasons
    const activeSocials = signalOverrides 
      ? signalOverrides.filter(s => session.linkedSocials.includes(s))
      : session.linkedSocials;
    const activePresets = signalOverrides 
      ? signalOverrides.filter(s => session.presets.includes(s))
      : session.presets;

    // Add recommendation reasons to each article
    const articlesWithReasons = articles.map((article) => ({
      id: article._id?.toString(),
      title: article.title,
      description: article.description,
      url: article.url,
      imageUrl: article.imageUrl,
      source: article.source,
      publishedAt: article.publishedAt,
      category: article.category,
      tags: article.tags,
      recommendationReason: getRecommendationReason(
        article,
        activeSocials,
        activePresets
      ),
    }));

    const response = {
      articles: articlesWithReasons,
      pagination: {
        total: totalCount,
        limit,
        skip,
        hasMore: skip + limit < totalCount,
      },
      personalization: {
        linkedSocials: activeSocials,
        activePresets: activePresets,
        isFiltered: !!signalOverrides,
      },
    };

    // Log API call for dev panel
    await logApiCall({
      userId: session.userId,
      endpoint: '/api/feed',
      method: 'GET',
      request: { limit, skip },
      response: {
        articlesCount: articlesWithReasons.length,
        totalCount,
        categories: Array.from(new Set(articles.map((a) => a.category))),
      },
      statusCode: 200,
      duration: Date.now() - startTime,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('[feed] Error:', error);

    await logApiCall({
      userId: session.userId,
      endpoint: '/api/feed',
      method: 'GET',
      request: { limit, skip },
      response: { error: error instanceof Error ? error.message : 'Unknown error' },
      statusCode: 500,
      duration: Date.now() - startTime,
    });

    return NextResponse.json(
      { error: 'Failed to fetch feed' },
      { status: 500 }
    );
  }
}

