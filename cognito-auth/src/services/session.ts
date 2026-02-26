/**
 * Cookie-based session for Next.js App Router.
 *
 * Uses three httpOnly cookies signed with jose (HS256):
 *   hp_cognito   — Cognito tokens (id_token, access_token, expires_in)
 *   hp_humanity  — Humanity Protocol tokens (access_token, scopes, etc.)
 *   hp_pkce      — PKCE code verifier (short-lived; used between /consent/start
 *                  and /consent/callback)
 *
 * Tokens are signed but NOT encrypted. Do not store sensitive data beyond
 * what's needed for the flow. In production, consider encrypting the payload
 * or storing tokens server-side (Redis/DB) and keeping only a session ID here.
 */

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { CognitoTokens, HumanityTokenResponse } from '@/types';

const COOKIE_COGNITO = 'hp_cognito';
const COOKIE_HUMANITY = 'hp_humanity';
const COOKIE_PKCE = 'hp_pkce';

function getKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET is not set');
  return new TextEncoder().encode(secret);
}

async function sign(payload: Record<string, unknown>, expiresIn = '1h'): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getKey());
}

async function verify<T>(token: string): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(token, getKey());
    return payload as T;
  } catch {
    return null;
  }
}

function cookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: maxAgeSeconds,
    path: '/',
  };
}

// ── Cognito tokens ──────────────────────────────────────────────────────────

export async function saveCognitoTokens(tokens: CognitoTokens): Promise<void> {
  const jwt = await sign({ tokens }, '2h');
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_COGNITO, jwt, cookieOptions(2 * 60 * 60));
}

export async function getCognitoTokens(): Promise<CognitoTokens | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_COGNITO)?.value;
  if (!raw) return null;
  const payload = await verify<{ tokens: CognitoTokens }>(raw);
  return payload?.tokens ?? null;
}

// ── Humanity tokens ─────────────────────────────────────────────────────────

export async function saveHumanityTokens(tokens: HumanityTokenResponse): Promise<void> {
  const ttl = tokens.expires_in || 3600;
  const jwt = await sign({ tokens }, `${ttl}s`);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_HUMANITY, jwt, cookieOptions(ttl));
}

export async function getHumanityTokens(): Promise<HumanityTokenResponse | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_HUMANITY)?.value;
  if (!raw) return null;
  const payload = await verify<{ tokens: HumanityTokenResponse }>(raw);
  return payload?.tokens ?? null;
}

// ── PKCE code verifier ──────────────────────────────────────────────────────

export async function savePkceVerifier(codeVerifier: string): Promise<void> {
  const jwt = await sign({ codeVerifier }, '10m'); // short-lived — only needed during consent
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_PKCE, jwt, cookieOptions(10 * 60));
}

export async function consumePkceVerifier(): Promise<string | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_PKCE)?.value;
  if (!raw) return null;
  cookieStore.delete(COOKIE_PKCE); // single-use
  const payload = await verify<{ codeVerifier: string }>(raw);
  return payload?.codeVerifier ?? null;
}

// ── Clear all ───────────────────────────────────────────────────────────────

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_COGNITO);
  cookieStore.delete(COOKIE_HUMANITY);
  cookieStore.delete(COOKIE_PKCE);
}
