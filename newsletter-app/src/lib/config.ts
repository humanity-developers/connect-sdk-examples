/**
 * Application configuration loaded from environment variables.
 */

export interface HumanityConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  environment: string;
}

export interface MongoConfig {
  uri: string;
  dbName: string;
}

export interface NewsConfig {
  apiKey: string;
  baseUrl: string;
}

export interface JwtConfig {
  secret: string;
  issuer: string;
  expiresIn: number;
}

export interface AppConfig {
  humanity: HumanityConfig;
  mongo: MongoConfig;
  news: NewsConfig;
  jwt: JwtConfig;
  cronSecret: string;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

let cachedConfig: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  cachedConfig = {
    humanity: {
      clientId: requireEnv('HUMANITY_CLIENT_ID'),
      clientSecret: requireEnv('HUMANITY_CLIENT_SECRET'),
      redirectUri: requireEnv('HUMANITY_REDIRECT_URI'),
      environment: optionalEnv('HUMANITY_ENVIRONMENT', 'sandbox'),
    },
    mongo: {
      uri: requireEnv('MONGODB_URI'),
      dbName: optionalEnv('MONGODB_DB_NAME', 'newsletter-app'),
    },
    news: {
      apiKey: requireEnv('NEWS_API_KEY'),
      baseUrl: optionalEnv('NEWS_API_BASE_URL', 'https://gnews.io/api/v4'),
    },
    jwt: {
      secret: requireEnv('APP_JWT_SECRET'),
      issuer: optionalEnv('APP_JWT_ISSUER', 'newsletter-app'),
      expiresIn: parseInt(optionalEnv('APP_JWT_EXPIRES_IN', '86400'), 10),
    },
    cronSecret: optionalEnv('CRON_SECRET', 'dev-secret'),
  };

  return cachedConfig;
}

export function clearConfigCache(): void {
  cachedConfig = null;
}

