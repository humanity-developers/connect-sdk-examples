/**
 * Session helpers — thin wrappers around express-session.
 *
 * In production, use a persistent session store (Redis, database) instead of
 * the default in-memory store, which doesn't survive restarts and doesn't scale
 * across multiple server instances.
 *
 * Example with connect-redis:
 *   import RedisStore from 'connect-redis';
 *   import { createClient } from 'redis';
 *   const client = createClient();
 *   app.use(session({ store: new RedisStore({ client }), ... }));
 */

import type { Request } from 'express';
import type { CognitoTokens, HumanityTokenResponse } from '../types';

export function saveCognitoTokens(req: Request, tokens: CognitoTokens): void {
  req.session.cognito = tokens;
}

export function getCognitoTokens(req: Request): CognitoTokens | undefined {
  return req.session.cognito;
}

export function saveHumanityTokens(req: Request, tokens: HumanityTokenResponse): void {
  req.session.humanity = tokens;
}

export function getHumanityTokens(req: Request): HumanityTokenResponse | undefined {
  return req.session.humanity;
}

export function savePkceCodeVerifier(req: Request, codeVerifier: string): void {
  req.session.pkceCodeVerifier = codeVerifier;
}

export function consumePkceCodeVerifier(req: Request): string | undefined {
  const verifier = req.session.pkceCodeVerifier;
  delete req.session.pkceCodeVerifier;
  return verifier;
}

export function clearSession(req: Request): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.destroy((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}
