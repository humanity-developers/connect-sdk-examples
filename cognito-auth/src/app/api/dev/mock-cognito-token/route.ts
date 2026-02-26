/**
 * POST /api/dev/mock-cognito-token
 *
 * DEVELOPMENT ONLY — disabled in production (NODE_ENV=production).
 *
 * Generates a locally-signed mock Cognito id_token for UI testing.
 * The token has the correct structure and claims but is signed with an
 * ephemeral key pair, so it will fail Cognito JWKS verification on the HP API.
 *
 * Replace calls to this endpoint with real Cognito auth in production:
 *   import { fetchAuthSession } from 'aws-amplify/auth';
 *   const { tokens } = await fetchAuthSession();
 *   const cognitoToken = tokens?.idToken?.toString();
 */

import { NextResponse } from 'next/server';
import { generateMockCognitoToken, DEMO_USERS } from '@/lib/cognito-mock';
import { getConfig } from '@/lib/config';

export const runtime = 'nodejs';

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'not_available', error_description: 'Mock tokens are not available in production.' },
      { status: 404 },
    );
  }

  const config = getConfig();
  const user = DEMO_USERS[0]; // Use the first demo user

  const cognitoToken = await generateMockCognitoToken(
    user,
    config.cognito.userPoolId || 'us-east-1_MOCK',
    config.cognito.clientId || 'mock-client-id',
  );

  return NextResponse.json({
    cognitoToken,
    user: {
      sub: user.sub,
      email: user.email,
      name: user.name,
    },
    warning:
      'This is a mock token. It will fail HP JWKS verification. Use a real Cognito token for end-to-end testing.',
  });
}
