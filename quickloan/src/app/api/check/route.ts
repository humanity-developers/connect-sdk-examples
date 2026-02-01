import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getHumanitySDK, generateAuthState, generateAuthNonce } from '@/lib/humanity';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const amount = searchParams.get('amount') || '10000';

  const sdk = getHumanitySDK();
  const state = generateAuthState();
  const nonce = generateAuthNonce();

  // Build the authorization URL requesting financial data access
  // Scopes use the format 'category:field' from DataScope enum
  const { url, codeVerifier } = sdk.buildAuthUrl({
    scopes: ['financial:net_worth', 'financial:bank_balance'],
    state,
    nonce,
  });

  // Store state, code verifier, and loan amount in secure cookies
  const cookieStore = await cookies();
  cookieStore.set('humanity_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
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
  cookieStore.set('loan_amount', amount, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
  });

  // Redirect to Humanity for financial data authorization
  return NextResponse.redirect(url);
}
