import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getHumanitySDK, generateAuthState, generateAuthNonce } from '@/lib/humanity';

export async function GET() {
  const sdk = getHumanitySDK();
  const state = generateAuthState();
  const nonce = generateAuthNonce();

  // Build the authorization URL requesting human verification
  // Scopes use the format 'category:field' from DataScope enum
  const { url, codeVerifier } = sdk.buildAuthUrl({
    scopes: ['identity:read'],
    state,
    nonce,
  });

  // Store state and code verifier in secure cookies
  const cookieStore = await cookies();
  cookieStore.set('humanity_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
  });
  cookieStore.set('humanity_code_verifier', codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
  });
  cookieStore.set('humanity_nonce', nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
  });

  // Redirect to Humanity for verification
  return NextResponse.redirect(url);
}
