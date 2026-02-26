/**
 * Cognito mock for local development and testing.
 *
 * ⚠️  THIS IS NOT FOR PRODUCTION USE. ⚠️
 *
 * In a real application you would obtain a Cognito JWT from the frontend using:
 *
 * **AWS Amplify v6:**
 * ```ts
 * import { fetchAuthSession } from 'aws-amplify/auth';
 * const { tokens } = await fetchAuthSession();
 * const cognitoToken = tokens?.idToken?.toString();
 * ```
 *
 * **Amazon Cognito Hosted UI / PKCE:**
 * The id_token is returned in the callback after the user authenticates through
 * the Cognito Hosted UI.
 *
 * **cognito-express (server-side validation):**
 * ```ts
 * const CognitoExpress = require('cognito-express');
 * const cognitoExpress = new CognitoExpress({
 *   region: 'us-east-1',
 *   cognitoUserPoolId: 'us-east-1_xxxxxx',
 *   tokenUse: 'id',
 * });
 * ```
 *
 * This mock is only used so the example runs without a real Cognito deployment.
 * It creates a **locally-signed** JWT that the HP API will reject (since it can't
 * verify against a real Cognito JWKS). You need a real Cognito token for the
 * exchange to succeed end-to-end.
 */

import { SignJWT, generateKeyPair } from 'jose';

export interface MockCognitoUser {
  sub: string;
  email: string;
  emailVerified: boolean;
  username: string;
  name?: string;
}

/**
 * Generate a mock Cognito id_token for local UI development.
 *
 * The token is correctly structured (RS256, standard Cognito claims) but
 * signed with an ephemeral key pair — so it will fail HP's JWKS verification.
 *
 * Replace calls to this function with real Cognito token acquisition in production.
 */
export async function generateMockCognitoToken(
  user: MockCognitoUser,
  userPoolId: string = 'us-east-1_MOCK',
  clientId: string = 'mock-client-id',
): Promise<string> {
  const { privateKey } = await generateKeyPair('RS256');
  const region = userPoolId.split('_')[0];
  const issuer = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;

  const now = Math.floor(Date.now() / 1000);

  const token = await new SignJWT({
    sub: user.sub,
    email: user.email,
    email_verified: user.emailVerified,
    'cognito:username': user.username,
    name: user.name,
    iss: issuer,
    aud: clientId,
    token_use: 'id',
    iat: now,
    exp: now + 3600,
    auth_time: now,
  })
    .setProtectedHeader({
      alg: 'RS256',
      kid: 'mock-key-id',
    })
    .sign(privateKey);

  return token;
}

/** Pre-defined demo users for the example UI */
export const DEMO_USERS: MockCognitoUser[] = [
  {
    sub: 'demo-cognito-sub-001',
    email: 'alice@example.com',
    emailVerified: true,
    username: 'alice',
    name: 'Alice Demo',
  },
  {
    sub: 'demo-cognito-sub-002',
    email: 'bob@example.com',
    emailVerified: true,
    username: 'bob',
    name: 'Bob Demo',
  },
];
