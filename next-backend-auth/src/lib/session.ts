/**
 * Session Management
 * 
 * This module handles storing OAuth flow state and application sessions
 * using HTTP-only cookies for security.
 */

import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';
import { deflateSync, inflateSync } from 'node:zlib';

// Cookie names
const OAUTH_SESSION_COOKIE = 'hp_oauth_session';
const APP_SESSION_COOKIE = 'hp_app_session';

// Cookie settings
const OAUTH_SESSION_MAX_AGE = 15 * 60; // 15 minutes (for OAuth flow)
const APP_SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours

/**
 * OAuth flow session state.
 * Stored temporarily during the OAuth authorization process.
 */
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

/**
 * Application session after successful authentication.
 * Contains your app's JWT and user information.
 */
export interface AppSession {
  /** Your application's JWT token */
  appToken: string;
  /** When the app token expires */
  expiresAt: number;
  /** User's app-scoped ID */
  userId: string;
  /** Whether the user is verified as human */
  isHuman: boolean;
  /** Verified presets */
  presets: string[];
  /** Granted scopes */
  scopes: string[];
  /** Authorization ID from Humanity */
  authorizationId: string;
}

// ============================================================================
// OAuth Session (temporary, during OAuth flow)
// ============================================================================

export function saveOAuthSession(session: OAuthSession): void {
  cookies().set({
    name: OAUTH_SESSION_COOKIE,
    value: encode(session),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: OAUTH_SESSION_MAX_AGE,
  });
}

export function readOAuthSession(): OAuthSession | null {
  const raw = cookies().get(OAUTH_SESSION_COOKIE)?.value;
  return raw ? decode<OAuthSession>(raw) : null;
}

export function deleteOAuthSession(target?: NextResponse): void {
  if (target) {
    target.cookies.set(OAUTH_SESSION_COOKIE, '', { path: '/', maxAge: 0 });
  } else {
    cookies().set(OAUTH_SESSION_COOKIE, '', { path: '/', maxAge: 0 });
  }
}

// ============================================================================
// App Session (persistent, after authentication)
// ============================================================================

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

/**
 * Check if the current app session is valid and not expired.
 */
export function isSessionValid(): boolean {
  const session = readAppSession();
  if (!session) return false;
  return session.expiresAt > Date.now();
}

// ============================================================================
// Encoding utilities
// ============================================================================

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
    // Fallback for uncompressed data
    return buffer;
  }
}

