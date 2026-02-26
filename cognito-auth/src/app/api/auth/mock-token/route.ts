/**
 * POST /api/auth/mock-token
 *
 * Development-only endpoint that generates a mock Cognito id_token.
 *
 * ⚠️  Never enable this in production. The HP API will reject this token
 *     because it's signed with an ephemeral key pair, not the real Cognito JWKS.
 *     It exists purely for UI smoke-testing without a real Cognito deployment.
 *
 * In production:
 * - Use AWS Amplify v6: fetchAuthSession().tokens?.idToken?.toString()
 * - Use Cognito Hosted UI PKCE flow
 * - Use the cognito-express library for server-side validation
 */

import { NextResponse } from 'next/server';
import { generateMockCognitoToken, DEMO_USERS } from '@/lib/cognito-mock';

export const runtime = 'nodejs';

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'not_available', error_description: 'Mock tokens are disabled in production.' },
      { status: 403 },
    );
  }

  const user = DEMO_USERS[0];
  const userPoolId = process.env.COGNITO_USER_POOL_ID || 'us-east-1_MOCK';
  const clientId = process.env.COGNITO_CLIENT_ID || 'mock-client-id';

  try {
    const token = await generateMockCognitoToken(user, userPoolId, clientId);
    return NextResponse.json({
      token,
      user: {
        sub: user.sub,
        email: user.email,
        name: user.name,
      },
      warning:
        'This is a locally-signed mock token. The HP API will reject it unless you configure a matching mock JWKS. Use a real Cognito token for end-to-end testing.',
    });
  } catch (err) {
    console.error('[mock-token]', err);
    return NextResponse.json({ error: 'Failed to generate mock token' }, { status: 500 });
  }
}
