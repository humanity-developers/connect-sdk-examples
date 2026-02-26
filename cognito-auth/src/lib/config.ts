/**
 * Application configuration loaded from environment variables.
 */

export interface HumanityConfig {
  clientId: string;
  clientSecret: string;
  environment: string;
}

export interface CognitoConfig {
  userPoolId: string;
  region: string;
  clientId: string;
}

export interface AppConfig {
  humanity: HumanityConfig;
  cognito: CognitoConfig;
  sessionSecret: string;
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
  if (cachedConfig) return cachedConfig;

  cachedConfig = {
    humanity: {
      clientId: requireEnv('HUMANITY_CLIENT_ID'),
      clientSecret: requireEnv('HUMANITY_CLIENT_SECRET'),
      environment: optionalEnv('HUMANITY_ENVIRONMENT', 'sandbox'),
    },
    cognito: {
      userPoolId: optionalEnv('COGNITO_USER_POOL_ID', ''),
      region: optionalEnv('COGNITO_REGION', 'us-east-1'),
      clientId: optionalEnv('COGNITO_CLIENT_ID', ''),
    },
    sessionSecret: requireEnv('SESSION_SECRET'),
  };

  return cachedConfig;
}

export function clearConfigCache(): void {
  cachedConfig = null;
}
