import { NextResponse, type NextRequest } from 'next/server';
import { readOAuthSession, deleteOAuthSession, saveTokenSession } from './session';
import { createSdk, HumanitySDK } from './sdk';
import { toSdkConfig } from './demo-config';

export async function handleOauthCallback(request: NextRequest) {
  const session = readOAuthSession();
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const callbackState = url.searchParams.get('state');
  const errorParam = url.searchParams.get('error');

  if (errorParam) {
    const response = NextResponse.redirect(new URL(`/?error=${errorParam}`, request.url));
    deleteOAuthSession(response);
    return response;
  }

  if (!session || !code || !callbackState || !HumanitySDK.verifyState(session.state, callbackState)) {
    const response = NextResponse.redirect(new URL('/?error=missing_session', request.url));
    deleteOAuthSession(response);
    return response;
  }

  const sdk = createSdk(toSdkConfig(session));

  try {
    const token = await sdk.exchangeCodeForToken({ code, codeVerifier: session.codeVerifier });
    const requestedOpenId = session.scopes.includes('openid');
    if (requestedOpenId && session.nonce) {
      const payload = decodeJwtPayload(token.idToken);
      if (!payload || !HumanitySDK.verifyNonce(session.nonce, payload.nonce as string | undefined)) {
        const response = NextResponse.redirect(new URL('/?error=nonce_mismatch', request.url));
        deleteOAuthSession(response);
        return response;
      }
    }
    const response = NextResponse.redirect(new URL('/', request.url));
    deleteOAuthSession(response);
    saveTokenSession(
      {
        accessToken: token.accessToken,
        refreshToken: token.refreshToken ?? undefined,
        expiresAt: Date.now() + token.expiresIn * 1000,
        authorizationId: token.authorizationId,
        grantedScopes: token.grantedScopes,
        baseUrl: session.baseUrl,
        clientId: session.clientId,
        redirectUri: session.redirectUri,
        idToken: token.idToken ?? undefined,
      },
      response,
    );
    console.log('token', token);
    console.log('response', response);
    return response;
  } catch (error) {
    console.error('[oauth] exchange_failed', error);
    const response = NextResponse.redirect(new URL('/?error=exchange_failed', request.url));
    response.cookies.set('oauth_error', error instanceof Error ? error.message : 'exchange_failed');
    return response;
  }
}

function decodeJwtPayload(token?: string | null): Record<string, unknown> | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  try {
    const json = Buffer.from(padded, 'base64').toString('utf-8');
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

