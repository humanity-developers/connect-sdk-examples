/**
 * Load and validate all required environment variables.
 * Throws at startup if anything critical is missing.
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
    redirectUri: string;
    scopes: string[];
  };
  session: {
    secret: string;
  };
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
}

function optionalEnv(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

export function getConfig(): Config {
  return {
    cognito: {
      region: requireEnv('COGNITO_REGION'),
      userPoolId: requireEnv('COGNITO_USER_POOL_ID'),
      clientId: requireEnv('COGNITO_CLIENT_ID'),
      clientSecret: optionalEnv('COGNITO_CLIENT_SECRET', ''),
      domain: requireEnv('COGNITO_DOMAIN'),
      callbackUrl: requireEnv('COGNITO_CALLBACK_URL'),
    },
    humanity: {
      clientId: requireEnv('HUMANITY_CLIENT_ID'),
      clientSecret: requireEnv('HUMANITY_CLIENT_SECRET'),
      apiUrl: optionalEnv('HUMANITY_API_URL', 'https://api.humanity.org'),
      redirectUri: requireEnv('HUMANITY_REDIRECT_URI'),
      scopes: optionalEnv('HUMANITY_SCOPES', 'openid identity:read profile.full').split(' '),
    },
    session: {
      secret: requireEnv('SESSION_SECRET'),
    },
  };
}
