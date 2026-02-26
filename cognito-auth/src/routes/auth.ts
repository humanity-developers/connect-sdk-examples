/**
 * /auth/* — Cognito login/callback routes
 *
 * GET  /auth/login      → Redirect to Cognito Hosted UI
 * GET  /auth/callback   → Handle Cognito callback, exchange code for tokens,
 *                         attempt JWT bearer exchange for HP tokens
 * GET  /auth/logout     → Clear session, redirect to login
 */

import { Router, type Request, type Response } from 'express';
import { CognitoService } from '../services/cognito';
import { HumanityService, ConsentRequiredError } from '../services/humanity';
import {
  saveCognitoTokens,
  saveHumanityTokens,
  clearSession,
} from '../services/session';
import { getConfig } from '../config';

export function createAuthRouter(
  cognito: CognitoService,
  humanity: HumanityService,
): Router {
  const router = Router();

  /**
   * GET /auth/login
   * Redirect the user to the Cognito Hosted UI login page.
   */
  router.get('/login', (_req: Request, res: Response) => {
    const loginUrl = cognito.buildLoginUrl();
    res.redirect(loginUrl);
  });

  /**
   * GET /auth/callback
   *
   * Cognito redirects here after a successful login with ?code=...
   *
   * Steps:
   *   1. Exchange the Cognito code for Cognito tokens (id_token, access_token)
   *   2. Try to exchange the Cognito id_token for a Humanity access token
   *   3a. Success → save HP tokens, redirect to /dashboard
   *   3b. ConsentRequiredError → save Cognito tokens, redirect to /consent
   *       (the user hasn't granted HP access yet — send them through the consent flow)
   */
  router.get('/callback', async (req: Request, res: Response) => {
    const { code, error, error_description } = req.query as Record<string, string>;

    if (error) {
      const msg = error_description || error;
      return res.redirect(`/?error=${encodeURIComponent(msg)}`);
    }

    if (!code) {
      return res.redirect('/?error=missing_code');
    }

    try {
      // Step 1: Exchange Cognito authorization code for Cognito tokens
      const cognitoTokens = await cognito.exchangeCode(code);
      saveCognitoTokens(req, cognitoTokens);

      // Step 2: Try to exchange the Cognito id_token for a Humanity access token.
      //
      // This works immediately if:
      //   • The user has previously completed the HP consent flow for this app
      //   • The HP application has cognitoRegion/userPoolId/clientId configured
      try {
        const humanityTokens = await humanity.exchangeCognitoToken(cognitoTokens.id_token);
        saveHumanityTokens(req, humanityTokens);

        // Both Cognito and HP tokens acquired — go straight to dashboard
        return res.redirect('/dashboard');
      } catch (err) {
        if (err instanceof ConsentRequiredError) {
          // User hasn't granted HP access yet — redirect to consent flow.
          // Cognito tokens are already saved in the session.
          console.log('[auth/callback] Consent required — redirecting to /consent');
          return res.redirect('/consent');
        }

        // JWT validation failed (expired token, wrong pool, audience mismatch, etc.)
        console.error('[auth/callback] HP token exchange failed:', (err as Error).message);
        return res.redirect(`/?error=${encodeURIComponent((err as Error).message)}`);
      }
    } catch (err) {
      console.error('[auth/callback] Cognito code exchange failed:', err);
      return res.redirect(`/?error=cognito_exchange_failed`);
    }
  });

  /**
   * GET /auth/logout
   * Destroy the session and redirect to the login page.
   */
  router.get('/logout', async (req: Request, res: Response) => {
    await clearSession(req);

    const config = getConfig();
    // Optionally also log out from Cognito Hosted UI:
    // const logoutUrl = `https://${config.cognito.domain}/logout?client_id=${config.cognito.clientId}&logout_uri=${encodeURIComponent('http://localhost:' + config.port)}`;
    // return res.redirect(logoutUrl);

    res.redirect('/');
  });

  return router;
}
