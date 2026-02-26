/**
 * Load and validate all required environment variables.
 * Throws at startup if anything is missing so you get a clear error message
 * instead of a cryptic runtime failure.
 */

export interface Config {
  cognito: {
    region: string;
    userPoolId: string;
    clientId: string;
    clientSecret: string;
    domain: string;
    callbackUrl: string;
  };
  humanity: {
    clientId: string;
    clientSecret: string;
    apiUrl: string;
    authUrl: string;
    redirectUri: string;
    scopes: string[];
  };
  session: {
    secret: string;
  };
  port: number;
}

function require(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
}

function optional(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

let _config: Config | null = null;

export function getConfig(): Config {
  if (_config) return _config;

  _config = {
    cognito: {
      region: require('COGNITO_REGION'),
      userPoolId: require('COGNITO_USER_POOL_ID'),
      clientId: require('COGNITO_CLIENT_ID'),
      clientSecret: optional('COGNITO_CLIENT_SECRET', ''),
      domain: require('COGNITO_DOMAIN'),
      callbackUrl: require('COGNITO_CALLBACK_URL'),
    },
    humanity: {
      clientId: require('HUMANITY_CLIENT_ID'),
      clientSecret: require('HUMANITY_CLIENT_SECRET'),
      apiUrl: optional('HUMANITY_API_URL', 'https://api.humanity.org'),
      authUrl: optional('HUMANITY_AUTH_URL', 'https://app.humanity.org'),
      redirectUri: require('HUMANITY_REDIRECT_URI'),
      scopes: optional('HUMANITY_SCOPES', 'openid identity:read profile.full').split(' '),
    },
    session: {
      secret: require('SESSION_SECRET'),
    },
    port: parseInt(optional('PORT', '3000'), 10),
  };

  return _config;
}
