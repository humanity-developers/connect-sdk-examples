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
      new URL(`/result?status=error&message=${encodeURIComponent(errorDescription)}`, request.url),
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/result?status=error&message=Missing+authorization+parameters', request.url),
    );
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get('humanity_state')?.value;
  const codeVerifier = cookieStore.get('humanity_code_verifier')?.value;
  const loanAmount = cookieStore.get('loan_amount')?.value || '10000';

  if (!verifyAuthState(storedState || '', state)) {
    return NextResponse.redirect(
      new URL('/result?status=error&message=Invalid+state+parameter', request.url),
    );
  }

  if (!codeVerifier) {
    return NextResponse.redirect(
      new URL('/result?status=error&message=Session+expired', request.url),
    );
  }

  try {
    const sdk = getHumanitySDK();

    // Exchange authorization code for tokens
    const tokenResult = await sdk.exchangeCodeForToken({
      code,
      codeVerifier,
    });

    // Use the query engine to check if user meets net worth requirement
    // We don't need to see the actual value - just whether they meet the threshold
    const minNetWorth = parseInt(process.env.MIN_NET_WORTH_FOR_LOAN || '50000', 10);

    const eligibilityResult = await sdk.evaluatePredicateQuery({
      accessToken: tokenResult.accessToken,
      query: {
        check: {
          claim: 'financial.net_worth',
          operator: '>=',
          value: minNetWorth,
        },
      },
    });

    // Clear OAuth cookies
    cookieStore.delete('humanity_state');
    cookieStore.delete('humanity_code_verifier');
    cookieStore.delete('humanity_nonce');
    cookieStore.delete('loan_amount');

    if (eligibilityResult.passed) {
      return NextResponse.redirect(
        new URL(`/result?status=qualified&amount=${loanAmount}`, request.url),
      );
    } else {
      return NextResponse.redirect(
        new URL(`/result?status=not_qualified&amount=${loanAmount}`, request.url),
      );
    }
  } catch (err) {
    console.error('Eligibility check error:', err);
    const message = err instanceof Error ? err.message : 'Eligibility check failed';
    return NextResponse.redirect(
      new URL(`/result?status=error&message=${encodeURIComponent(message)}`, request.url),
    );
  }
}
