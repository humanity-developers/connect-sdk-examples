/**
 * Session Management using HTTP-only cookies.
 */

import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';
import { deflateSync, inflateSync } from 'node:zlib';

const OAUTH_SESSION_COOKIE = 'hp_oauth_session';
const APP_SESSION_COOKIE = 'hp_newsletter_session';

const OAUTH_SESSION_MAX_AGE = 15 * 60; // 15 minutes
const APP_SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours

export interface OAuthSession {
  clientId: string;
  redirectUri: string;
  baseUrl: string;
  scopes: string[];
  codeVerifier: string;
  state: string;
  nonce: string;
  createdAt: number;
}

export interface AppSession {
  appToken: string;
  expiresAt: number;
  userId: string;
  humanityUserId: string;
  email?: string;
  evmAddress?: string;
  linkedSocials: string[];
  presets: string[];
  isFrequentTraveler?: boolean;
}

// OAuth Session
export function saveOAuthSession(session: OAuthSession, request?: Request): void {
  const cookieOptions: any = {
    name: OAUTH_SESSION_COOKIE,
    value: encode(session),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: OAUTH_SESSION_MAX_AGE,
  };

  // For Next.js rewrites, don't set domain restrictions to allow cross-domain cookie sharing
  // This allows cookies set at the proxy domain to be accessible by the backend domain

  cookies().set(cookieOptions);
}

export function readOAuthSession(request?: Request): OAuthSession | null {
  // Try reading from Next.js cookies first
  const raw = cookies().get(OAUTH_SESSION_COOKIE)?.value;

  // If no cookie found via Next.js cookies(), try manual parsing from request headers
  // This helps with Next.js rewrites where cookie domain might not match
  if (!raw && request) {
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      const cookieMatch = cookieHeader.match(new RegExp(`${OAUTH_SESSION_COOKIE}=([^;]+)`));
      if (cookieMatch) {
        const cookieValue = cookieMatch[1];
        console.log('DEBUG - Found OAuth session cookie in headers:', {
          cookieName: OAUTH_SESSION_COOKIE,
          hasValue: !!cookieValue,
          valueLength: cookieValue.length
        });
        return decode<OAuthSession>(cookieValue);
      }
    }
  }

  return raw ? decode<OAuthSession>(raw) : null;
}

export function deleteOAuthSession(target?: NextResponse): void {
  const deleteOptions = {
    name: OAUTH_SESSION_COOKIE,
    value: '',
    path: '/',
    maxAge: 0,
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production'
  };

  if (target) {
    target.cookies.set(deleteOptions);
  } else {
    cookies().set(deleteOptions);
  }
}

// App Session
export function saveAppSession(session: AppSession, target?: NextResponse): void {
  const writer = target ? target.cookies : cookies();
  writer.set({
    name: APP_SESSION_COOKIE,
    value: encode(session),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: APP_SESSION_MAX_AGE,
  });
}

export function readAppSession(): AppSession | null {
  const raw = cookies().get(APP_SESSION_COOKIE)?.value;
  return raw ? decode<AppSession>(raw) : null;
}

export function deleteAppSession(target?: NextResponse): void {
  const writer = target ? target.cookies : cookies();
  writer.set(APP_SESSION_COOKIE, '', { path: '/', maxAge: 0 });
}

export function isSessionValid(): boolean {
  const session = readAppSession();
  if (!session) return false;
  return session.expiresAt > Date.now();
}

// Encoding utilities
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
    return buffer;
  }
}

