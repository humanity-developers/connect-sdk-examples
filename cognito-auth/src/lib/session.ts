/**
 * Lightweight cookie-based session using the jose library.
 *
 * Stores:
 * - The Humanity access token (short-lived; backend only — never sent to the browser)
 * - The Humanity refresh token
 * - User metadata from the token exchange
 *
 * In production, store tokens server-side (Redis, DB) and keep only a session ID
 * in the cookie. Encrypting the entire token in a cookie is acceptable for demos.
 */

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { getConfig } from './config';

export interface HumanitySession {
  /** Humanity OAuth access token */
  accessToken: string;
  /** Humanity OAuth refresh token (if issued) */
  refreshToken?: string;
  /** Token expiry as Unix timestamp */
  expiresAt: number;
  /** App-scoped user ID from the HP token exchange */
  appScopedUserId: string;
  /** Authorization ID */
  authorizationId: string;
  /** Scopes granted */
  grantedScopes: string[];
}

const COOKIE_NAME = 'hp_cognito_session';
const COOKIE_MAX_AGE = 60 * 60; // 1 hour

function getSecretKey(): Uint8Array {
  const secret = getConfig().sessionSecret;
  return new TextEncoder().encode(secret);
}

/**
 * Save a Humanity session as a signed, encrypted cookie.
 * Call on the server (Route Handler or Server Action).
 */
export async function saveSession(session: HumanitySession): Promise<void> {
  const token = await new SignJWT({ session })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

/**
 * Read and verify the Humanity session cookie.
 * Returns null if missing, expired, or invalid.
 */
export async function readSession(): Promise<HumanitySession | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(COOKIE_NAME);
    if (!cookie?.value) return null;

    const { payload } = await jwtVerify(cookie.value, getSecretKey());
    const session = (payload as { session?: HumanitySession }).session;
    if (!session?.accessToken) return null;

    // Check if the access token has expired
    if (Date.now() / 1000 > session.expiresAt) return null;

    return session;
  } catch {
    return null;
  }
}

/**
 * Delete the session cookie.
 */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
