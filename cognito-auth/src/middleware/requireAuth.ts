/**
 * requireAuth middleware
 *
 * Ensures the user has valid Cognito AND Humanity tokens before proceeding.
 * Redirects to the appropriate step if tokens are missing.
 */

import type { Request, Response, NextFunction } from 'express';
import { getCognitoTokens, getHumanityTokens } from '../services/session';

/**
 * Require a valid Cognito session (user is logged in via Cognito).
 * Redirects to /auth/login if no Cognito tokens are present.
 */
export function requireCognito(req: Request, res: Response, next: NextFunction): void {
  if (!getCognitoTokens(req)) {
    res.redirect('/auth/login');
    return;
  }
  next();
}

/**
 * Require both a valid Cognito session AND a Humanity access token.
 * - No Cognito tokens → redirect to /auth/login
 * - No Humanity tokens → redirect to /consent (user needs to grant HP access)
 */
export function requireHumanity(req: Request, res: Response, next: NextFunction): void {
  if (!getCognitoTokens(req)) {
    res.redirect('/auth/login');
    return;
  }
  if (!getHumanityTokens(req)) {
    res.redirect('/consent');
    return;
  }
  next();
}
