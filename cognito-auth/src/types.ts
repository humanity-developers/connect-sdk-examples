/**
 * Shared types for the cognito-auth example.
 */

/** HP token response from POST /oauth/token */
export interface HumanityTokenResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  scope: string;
  granted_scopes: string[];
  authorization_id: string;
  app_scoped_user_id: string;
  issued_at?: string;
  refresh_token?: string;
  refresh_token_expires_in?: number;
  refresh_issued_at?: string;
}

/** HP /userinfo response */
export interface HumanityUserInfo {
  sub: string;
  iss: string;
  aud: string;
  authorization_id: string;
  scopes: string[];
  humanity_id?: string | null;
  wallet_address?: string | null;
  email?: string | null;
  email_verified?: boolean;
}

/** Cognito tokens obtained after code exchange */
export interface CognitoTokens {
  id_token: string;
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

/** Decoded Cognito id_token claims */
export interface CognitoClaims {
  sub: string;
  email?: string;
  email_verified?: boolean;
  'cognito:username'?: string;
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  [key: string]: unknown;
}

/** Data stored in the server-side session */
export interface AppSession {
  cognitoTokens?: CognitoTokens;
  humanityTokens?: HumanityTokenResponse;
  /** PKCE code verifier — stored between /consent/start and /consent/callback */
  pkceCodeVerifier?: string;
}

// Augment express-session so TypeScript knows about our session shape
declare module 'express-session' {
  interface SessionData {
    cognito?: CognitoTokens;
    humanity?: HumanityTokenResponse;
    pkceCodeVerifier?: string;
  }
}
