/**
 * Application configuration loaded from environment variables.
 * 
 * This module centralizes all configuration needed for:
 * - Humanity Protocol OAuth integration
 * - Your application's custom JWT authentication
 */

export interface HumanityConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  environment: string;
}

export interface AppJwtConfig {
  secret: string;
  issuer: string;
  expiresIn: number; // seconds
}

export interface AppConfig {
  humanity: HumanityConfig;
  jwt: AppJwtConfig;
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

/**
 * Get the application configuration.
 * Configuration is cached after first load.
 */
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
    jwt: {
      secret: requireEnv('APP_JWT_SECRET'),
      issuer: optionalEnv('APP_JWT_ISSUER', 'my-app'),
      expiresIn: parseInt(optionalEnv('APP_JWT_EXPIRES_IN', '3600'), 10),
    },
  };

  return cachedConfig;
}

/**
 * Clear the configuration cache.
 * Useful for testing or when environment variables change.
 */
export function clearConfigCache(): void {
  cachedConfig = null;
}

