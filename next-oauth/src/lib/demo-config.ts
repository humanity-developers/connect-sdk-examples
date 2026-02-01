import type { HumanitySdkConfig } from '@humanity-org/connect-sdk';

export type DemoConfig = {
  clientId: string;
  redirectUri: string;
  baseUrl: string;
  scopes: string[];
};

export const DEFAULT_SCOPES = ['profile.full', 'data.read'];

export function resolveDemoConfig(partial?: Partial<DemoConfig>): DemoConfig {
  const envDefaults = {
    clientId: process.env.HUMANITY_CLIENT_ID ?? 'developer-console',
    redirectUri: process.env.HUMANITY_REDIRECT_URI ?? 'http://localhost:5173/oauth/callback',
    baseUrl: process.env.HUMANITY_BASE_URL ?? 'http://localhost:3333',
  };

  return {
    clientId: partial?.clientId?.trim() || envDefaults.clientId,
    redirectUri: partial?.redirectUri?.trim() || envDefaults.redirectUri,
    baseUrl: partial?.baseUrl?.trim() || envDefaults.baseUrl,
    scopes: partial?.scopes?.length ? partial.scopes : DEFAULT_SCOPES,
  };
}

export function toSdkConfig(config: DemoConfig): HumanitySdkConfig {
  return {
    clientId: config.clientId,
    redirectUri: config.redirectUri,
    baseUrl: config.baseUrl,
  };
}

