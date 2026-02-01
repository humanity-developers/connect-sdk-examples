/**
 * News API Service
 * 
 * Fetches news from GNews API and categorizes for different user segments.
 * Uses GNews.io which has a free tier.
 */

import { getConfig } from './config';
import { insertNewsArticles, type NewsArticle, type NewsCategory, type RelevanceSignal } from './database';

interface GNewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  publishedAt: string;
  source: {
    name: string;
    url: string;
  };
}

interface GNewsResponse {
  totalArticles: number;
  articles: GNewsArticle[];
}

// Category to search query mapping
// Maps user signals (social accounts + presets) to content categories
const CATEGORY_QUERIES: Record<NewsCategory, { topics: string[]; signals: RelevanceSignal[] }> = {
  professional: {
    topics: ['business leadership', 'career development', 'professional networking', 'industry trends'],
    signals: [
      { type: 'social', signal: 'linkedin', reason: 'Recommended because you\'ve linked LinkedIn' },
    ],
  },
  community: {
    topics: ['gaming community', 'online communities', 'esports', 'content creators'],
    signals: [
      { type: 'social', signal: 'discord', reason: 'Recommended because you\'ve linked Discord' },
      { type: 'social', signal: 'telegram', reason: 'Recommended because you\'ve linked Telegram' },
    ],
  },
  social: {
    topics: ['trending topics', 'social media', 'viral content', 'influencers'],
    signals: [
      { type: 'social', signal: 'twitter', reason: 'Recommended because you\'ve linked Twitter/X' },
    ],
  },
  tech: {
    topics: ['software development', 'open source', 'programming', 'tech startups'],
    signals: [
      { type: 'social', signal: 'github', reason: 'Recommended because you\'ve linked GitHub' },
      { type: 'social', signal: 'google', reason: 'Recommended for tech enthusiasts' },
    ],
  },
  travel: {
    topics: ['travel destinations', 'conferences events', 'business travel', 'aviation', 'hotels'],
    signals: [
      // Travel presets from query engine
      { type: 'preset', signal: 'is_frequent_traveler', reason: 'Recommended because you frequently travel' },
      { type: 'preset', signal: 'has_hotel_membership', reason: 'Recommended based on your hotel loyalty status' },
      { type: 'preset', signal: 'has_airline_membership', reason: 'Recommended based on your airline loyalty status' },
    ],
  },
  general: {
    topics: ['world news', 'technology', 'science', 'innovation'],
    signals: [],
  },
};

/**
 * Fetch news articles from GNews API.
 */
async function fetchFromGNews(query: string, maxResults: number = 10): Promise<GNewsArticle[]> {
  const config = getConfig();

  const params = new URLSearchParams({
    q: query,
    lang: 'en',
    max: maxResults.toString(),
    apikey: config.news.apiKey,
  });

  const response = await fetch(`${config.news.baseUrl}/search?${params}`);

  if (!response.ok) {
    throw new Error(`GNews API error: ${response.status} ${response.statusText}`);
  }

  const data: GNewsResponse = await response.json();
  return data.articles || [];
}

/**
 * Transform GNews article to our format.
 */
function transformArticle(
  article: GNewsArticle,
  category: NewsCategory,
  signals: RelevanceSignal[]
): NewsArticle {
  return {
    externalId: Buffer.from(article.url).toString('base64').slice(0, 64),
    title: article.title,
    description: article.description || '',
    content: article.content,
    url: article.url,
    imageUrl: article.image,
    source: article.source.name,
    author: undefined,
    publishedAt: new Date(article.publishedAt),
    category,
    tags: extractTags(article.title, article.description),
    relevanceSignals: signals,
    fetchedAt: new Date(),
  };
}

/**
 * Extract basic tags from title and description.
 */
function extractTags(title: string, description: string): string[] {
  const text = `${title} ${description}`.toLowerCase();
  const tags: string[] = [];

  const keywords: Record<string, string> = {
    'ai': 'AI',
    'artificial intelligence': 'AI',
    'blockchain': 'Blockchain',
    'crypto': 'Crypto',
    'startup': 'Startups',
    'conference': 'Events',
    'event': 'Events',
    'summit': 'Events',
    'developer': 'Development',
    'programming': 'Development',
    'career': 'Career',
    'leadership': 'Leadership',
    'gaming': 'Gaming',
    'esports': 'Esports',
    'travel': 'Travel',
  };

  for (const [keyword, tag] of Object.entries(keywords)) {
    if (text.includes(keyword) && !tags.includes(tag)) {
      tags.push(tag);
    }
  }

  return tags.slice(0, 5);
}

/**
 * Fetch news for all categories.
 */
export async function fetchAllCategoryNews(): Promise<{
  fetched: number;
  inserted: number;
  errors: string[];
}> {
  let totalFetched = 0;
  let totalInserted = 0;
  const errors: string[] = [];

  for (const [category, config] of Object.entries(CATEGORY_QUERIES) as [NewsCategory, typeof CATEGORY_QUERIES[NewsCategory]][]) {
    try {
      // Pick a random topic for variety
      const topic = config.topics[Math.floor(Math.random() * config.topics.length)];

      const articles = await fetchFromGNews(topic, 5);
      totalFetched += articles.length;

      const transformedArticles = articles.map((a) =>
        transformArticle(a, category, config.signals)
      );

      const inserted = await insertNewsArticles(transformedArticles);
      totalInserted += inserted;

      // Small delay between requests to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`${category}: ${message}`);
    }
  }

  return { fetched: totalFetched, inserted: totalInserted, errors };
}

/**
 * Get recommended news for a user based on their signals.
 */
export function getRecommendationReason(
  article: NewsArticle,
  userSocials: string[],
  userPresets: string[]
): string | null {
  for (const signal of article.relevanceSignals) {
    if (signal.type === 'social' && userSocials.includes(signal.signal)) {
      return signal.reason;
    }
    if (signal.type === 'preset' && userPresets.includes(signal.signal)) {
      return signal.reason;
    }
  }

  // Default reason for general content
  if (article.category === 'general') {
    return 'General content';
  }

  return null;
}

// Re-export derived labels utilities from client-safe module
export { getDerivedLabels, getArticleDerivedLabel, type DerivedLabel } from './derived-labels';

