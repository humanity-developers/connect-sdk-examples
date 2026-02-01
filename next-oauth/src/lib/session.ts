import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';
import { deflateSync, inflateSync } from 'node:zlib';
import { createSdk } from './sdk';

const SESSION_COOKIE = 'hp_oauth_session';
const TOKEN_COOKIE = 'hp_oauth_tokens';
const COOKIE_MAX_AGE = 15 * 60; // 15 minutes

export type OAuthSession = {
  clientId: string;
  redirectUri: string;
  baseUrl: string;
  scopes: string[];
  codeVerifier: string;
  state: string;
  nonce: string;
  createdAt: number;
};

export type TokenSession = {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  authorizationId: string;
  grantedScopes: string[];
  baseUrl: string;
  clientId: string;
  redirectUri: string;
  idToken?: string;
};

export function saveOAuthSession(session: OAuthSession): void {
  cookies().set({
    name: SESSION_COOKIE,
    value: encode(session),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });
}

export function readOAuthSession(): OAuthSession | null {
  const raw = cookies().get(SESSION_COOKIE)?.value;
  return raw ? decode<OAuthSession>(raw) : null;
}

export function deleteOAuthSession(target?: NextResponse): void {
  if (target) {
    target.cookies.set(SESSION_COOKIE, '', { path: '/', maxAge: 0 });
  } else {
    cookies().set(SESSION_COOKIE, '', { path: '/', maxAge: 0 });
  }
}

export function saveTokenSession(session: TokenSession, target?: NextResponse): void {
  const writer = target ? target.cookies : cookies();
  writer.set({
    name: TOKEN_COOKIE,
    value: encode(session),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24,
  });
}

export function readTokenSession(): TokenSession | null {
  const raw = cookies().get(TOKEN_COOKIE)?.value;
  return raw ? decode<TokenSession>(raw) : null;
}

export function deleteTokenSession(target?: NextResponse): void {
  const writer = target ? target.cookies : cookies();
  writer.set(TOKEN_COOKIE, '', { path: '/', maxAge: 0 });
}

const TOKEN_REFRESH_THRESHOLD_MS = 60 * 1000;

export async function ensureFreshTokenSession(): Promise<TokenSession | null> {
  const session = readTokenSession();
  if (!session) return null;
  const timeRemaining = session.expiresAt - Date.now();
  if (timeRemaining > TOKEN_REFRESH_THRESHOLD_MS) {
    return session;
  }

  const refreshed = await refreshAccessToken(session);
  if (!refreshed) {
    deleteTokenSession();
    return null;
  }
  saveTokenSession(refreshed);
  return refreshed;
}

async function refreshAccessToken(session: TokenSession): Promise<TokenSession | null> {
  if (!session.refreshToken) {
    return null;
  }
  const sdk = createSdk({
    clientId: session.clientId,
    redirectUri: session.redirectUri,
    baseUrl: session.baseUrl,
  });
  try {
    const token = await sdk.refreshAccessToken(session.refreshToken);
    return {
      ...session,
      accessToken: token.accessToken,
      refreshToken: token.refreshToken ?? session.refreshToken,
      expiresAt: Date.now() + token.expiresIn * 1000,
      grantedScopes: token.grantedScopes,
      idToken: token.idToken ?? session.idToken,
    };
  } catch (error) {
    console.error('[oauth] refresh_token_error', error);
    return null;
  }
}

function encode(value: unknown): string {
  const json = Buffer.from(JSON.stringify(value), 'utf-8');
  const compressed = deflateSync(json, { level: 9 });
  return compressed.toString('base64url');
}

function decode<T>(value: string): T | null {
  try {
    const buffer = Buffer.from(value, 'base64url');
    const inflated = tryInflate(buffer);
    return JSON.parse(inflated.toString('utf-8')) as T;
  } catch {
    return null;
  }
}

function tryInflate(buffer: Buffer): Buffer {
  try {
    return inflateSync(buffer);
  } catch {
    // Legacy cookies were stored as plain JSON -> base64url
    return buffer;
  }
}

