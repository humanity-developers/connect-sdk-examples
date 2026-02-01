/**
 * MongoDB database service using native driver.
 * 
 * Collections:
 * - users: Authenticated users with their Humanity data
 * - news: Fetched news articles from external API
 * - api_logs: Developer panel logs for debugging
 */

import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import { getConfig } from './config';

// Types
export interface UserDocument {
  _id?: ObjectId;
  humanityUserId: string;
  appScopedUserId: string;
  email?: string;
  evmAddress?: string;
  linkedSocials: SocialAccount[];
  presets: UserPreset[];
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
}

export interface SocialAccount {
  provider: 'google' | 'linkedin' | 'discord' | 'twitter' | 'github' | 'telegram';
  connected: boolean;
  username?: string;
  connectedAt?: Date;
}

export interface UserPreset {
  name: string;
  value: boolean | string | number;
  status: 'valid' | 'expired' | 'pending' | 'unavailable';
  expiresAt?: Date;
  updatedAt: Date;
}

export interface NewsArticle {
  _id?: ObjectId;
  externalId: string;
  title: string;
  description: string;
  content?: string;
  url: string;
  imageUrl?: string;
  source: string;
  author?: string;
  publishedAt: Date;
  category: NewsCategory;
  tags: string[];
  relevanceSignals: RelevanceSignal[];
  fetchedAt: Date;
}

export type NewsCategory = 
  | 'professional'    // LinkedIn users - business, career
  | 'community'       // Discord users - gaming, communities
  | 'social'          // Twitter users - trends, social
  | 'tech'            // GitHub users - technology, dev
  | 'travel'          // Flight enjoyer preset
  | 'general';

export interface RelevanceSignal {
  type: 'social' | 'preset';
  signal: string;
  reason: string;
}

export type ApiLogCategory = 'oauth' | 'presets' | 'query_engine' | 'app_logic';

export interface ApiLogDocument {
  _id?: ObjectId;
  userId?: string;
  endpoint: string;
  method: string;
  request: object;
  response: object;
  statusCode: number;
  duration: number;
  timestamp: Date;
  category?: ApiLogCategory;
}

// MongoDB connection
let client: MongoClient | null = null;
let db: Db | null = null;

export async function getDatabase(): Promise<Db> {
  if (db) return db;

  const config = getConfig();
  client = new MongoClient(config.mongo.uri);
  await client.connect();
  db = client.db(config.mongo.dbName);

  // Create indexes
  await createIndexes(db);

  return db;
}

async function createIndexes(database: Db): Promise<void> {
  const users = database.collection<UserDocument>('users');
  const news = database.collection<NewsArticle>('news');
  const apiLogs = database.collection<ApiLogDocument>('api_logs');

  await Promise.all([
    users.createIndex({ humanityUserId: 1 }, { unique: true }),
    users.createIndex({ appScopedUserId: 1 }, { unique: true }),
    users.createIndex({ email: 1 }),
    news.createIndex({ externalId: 1 }, { unique: true }),
    news.createIndex({ category: 1, publishedAt: -1 }),
    news.createIndex({ publishedAt: -1 }),
    news.createIndex({ 'relevanceSignals.signal': 1 }),
    apiLogs.createIndex({ userId: 1, timestamp: -1 }),
    apiLogs.createIndex({ timestamp: -1 }, { expireAfterSeconds: 86400 }), // TTL 24h
  ]);
}

// User operations
export async function findUserByHumanityId(humanityUserId: string): Promise<UserDocument | null> {
  const database = await getDatabase();
  return database.collection<UserDocument>('users').findOne({ humanityUserId });
}

export async function findUserByAppScopedId(appScopedUserId: string): Promise<UserDocument | null> {
  const database = await getDatabase();
  return database.collection<UserDocument>('users').findOne({ appScopedUserId });
}

export async function upsertUser(user: Omit<UserDocument, '_id' | 'createdAt'>): Promise<UserDocument> {
  const database = await getDatabase();
  const now = new Date();

  const result = await database.collection<UserDocument>('users').findOneAndUpdate(
    { humanityUserId: user.humanityUserId },
    {
      $set: {
        ...user,
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
      },
    },
    { upsert: true, returnDocument: 'after' }
  );

  return result!;
}

export async function updateUserSocials(
  humanityUserId: string,
  socials: SocialAccount[]
): Promise<void> {
  const database = await getDatabase();
  await database.collection<UserDocument>('users').updateOne(
    { humanityUserId },
    { $set: { linkedSocials: socials, updatedAt: new Date() } }
  );
}

export async function updateUserPresets(
  humanityUserId: string,
  presets: UserPreset[]
): Promise<void> {
  const database = await getDatabase();
  await database.collection<UserDocument>('users').updateOne(
    { humanityUserId },
    { $set: { presets, updatedAt: new Date() } }
  );
}

// News operations
export async function insertNewsArticles(articles: NewsArticle[]): Promise<number> {
  if (articles.length === 0) return 0;

  const database = await getDatabase();
  const collection = database.collection<NewsArticle>('news');

  // Use ordered: false to continue on duplicate key errors
  try {
    const result = await collection.insertMany(articles, { ordered: false });
    return result.insertedCount;
  } catch (error: any) {
    // Handle duplicate key errors gracefully
    if (error.code === 11000) {
      return error.insertedCount || 0;
    }
    throw error;
  }
}

export async function getNewsForUser(
  user: UserDocument,
  limit: number = 20,
  skip: number = 0,
  signalOverrides?: string[]  // Optional: override which signals to use for filtering
): Promise<{ articles: NewsArticle[]; totalCount: number }> {
  const database = await getDatabase();
  const collection = database.collection<NewsArticle>('news');

  // Build relevance filter based on user's socials and presets
  // or use the provided signal overrides
  let signals: string[];

  if (signalOverrides) {
    signals = signalOverrides;
  } else {
    signals = [];
    for (const social of user.linkedSocials) {
      if (social.connected) {
        signals.push(social.provider);
      }
    }
    for (const preset of user.presets) {
      if (preset.status === 'valid' && preset.value === true) {
        signals.push(preset.name);
      }
    }
  }

  // Get articles matching user's signals, fallback to general
  const query = signals.length > 0
    ? { $or: [{ 'relevanceSignals.signal': { $in: signals } }, { category: 'general' as NewsCategory }] }
    : { category: 'general' as NewsCategory };

  const [articles, totalCount] = await Promise.all([
    collection
      .find(query)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    collection.countDocuments(query),
  ]);

  return { articles, totalCount };
}

export async function getAllNewsCategories(): Promise<NewsCategory[]> {
  const database = await getDatabase();
  const categories = await database
    .collection<NewsArticle>('news')
    .distinct('category');
  return categories as NewsCategory[];
}

// API Logging operations
export async function logApiCall(log: Omit<ApiLogDocument, '_id' | 'timestamp'>): Promise<void> {
  const database = await getDatabase();
  await database.collection<ApiLogDocument>('api_logs').insertOne({
    ...log,
    timestamp: new Date(),
  });
}

export async function getRecentApiLogs(
  userId: string,
  limit: number = 50
): Promise<ApiLogDocument[]> {
  const database = await getDatabase();
  return database
    .collection<ApiLogDocument>('api_logs')
    .find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray();
}

// Cleanup
export async function closeDatabase(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

