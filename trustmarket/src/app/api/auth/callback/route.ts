import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getHumanitySDK, verifyAuthState } from '@/lib/humanity';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle OAuth errors
  if (error) {
    const errorDescription = searchParams.get('error_description') || 'Unknown error';
    return NextResponse.redirect(
      new URL(`/result?status=error&message=${encodeURIComponent(errorDescription)}`, request.url)
    );
  }

  // Verify we have required parameters
  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/result?status=error&message=Missing+authorization+parameters', request.url)
    );
  }

  // Get stored values from cookies
  const cookieStore = await cookies();
  const storedState = cookieStore.get('humanity_state')?.value;
  const codeVerifier = cookieStore.get('humanity_code_verifier')?.value;

  // Verify state matches to prevent CSRF
  if (!verifyAuthState(storedState || '', state)) {
    return NextResponse.redirect(
      new URL('/result?status=error&message=Invalid+state+parameter', request.url)
    );
  }

  if (!codeVerifier) {
    return NextResponse.redirect(
      new URL('/result?status=error&message=Session+expired', request.url)
    );
  }

  try {
    const sdk = getHumanitySDK();

    // Exchange authorization code for tokens
    const tokenResult = await sdk.exchangeCodeForToken({
      code,
      codeVerifier,
    });

    // Verify the user is a real human
    const isHumanResult = await sdk.verifyPreset({
      accessToken: tokenResult.accessToken,
      preset: 'is_human',
    });

    // Verify palm verification status
    const palmResult = await sdk.verifyPreset({
      accessToken: tokenResult.accessToken,
      preset: 'palm_verified',
    });

    // Clear OAuth cookies
    cookieStore.delete('humanity_state');
    cookieStore.delete('humanity_code_verifier');
    cookieStore.delete('humanity_nonce');

    // Check if user passed both verifications
    // PresetCheckResult.value is the boolean verification result
    const isVerified = isHumanResult.value && palmResult.value;

    if (isVerified) {
      // Store verification status (in production, save to database)
      cookieStore.set('seller_verified', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 86400 * 30, // 30 days
      });

      return NextResponse.redirect(new URL('/result?status=success', request.url));
    } else {
      const reasons: string[] = [];
      if (!isHumanResult.value) reasons.push('human verification incomplete');
      if (!palmResult.value) reasons.push('palm verification incomplete');

      return NextResponse.redirect(
        new URL(`/result?status=incomplete&reasons=${encodeURIComponent(reasons.join(', '))}`, request.url)
      );
    }
  } catch (err) {
    console.error('Verification error:', err);
    const message = err instanceof Error ? err.message : 'Verification failed';
    return NextResponse.redirect(
      new URL(`/result?status=error&message=${encodeURIComponent(message)}`, request.url)
    );
  }
}
