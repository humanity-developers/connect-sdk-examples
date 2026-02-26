/**
 * /consent/* — Humanity consent flow routes
 *
 * The consent flow runs only when the user hasn't previously authorized
 * your HP application. After consent, the JWT bearer exchange works
 * automatically on every Cognito login.
 *
 * GET  /consent          → Show the consent prompt page (views/consent.html)
 * GET  /consent/start    → Build HP auth URL and redirect user to HP consent UI
 * GET  /consent/callback → Exchange the HP authorization code for HP tokens,
 *                          then redirect to /dashboard
 */

import { Router, type Request, type Response } from 'express';
import path from 'path';
import { HumanityService } from '../services/humanity';
import { requireCognito } from '../middleware/requireAuth';
import {
  getCognitoTokens,
  saveHumanityTokens,
  savePkceCodeVerifier,
  consumePkceCodeVerifier,
} from '../services/session';

export function createConsentRouter(humanity: HumanityService, scopes: string[]): Router {
  const router = Router();

  /**
   * GET /consent
   * Show the consent prompt — explains what the user is about to grant.
   * Requires an active Cognito session.
   */
  router.get('/', requireCognito, (_req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), 'views', 'consent.html'));
  });

  /**
   * GET /consent/start
   *
   * Build the Humanity OAuth authorization URL (with PKCE) and redirect
   * the user to the HP consent screen.
   *
   * The PKCE code verifier is stored in the session for use at /consent/callback.
   */
  router.get('/start', requireCognito, (req: Request, res: Response) => {
    const { url, codeVerifier } = humanity.buildConsentUrl(scopes);

    // Store the PKCE code verifier — needed to exchange the code at /consent/callback
    savePkceCodeVerifier(req, codeVerifier);

    console.log('[consent/start] Redirecting to HP consent UI');
    res.redirect(url);
  });

  /**
   * GET /consent/callback
   *
   * HP redirects here after the user grants consent with ?code=...
   *
   * Steps:
   *   1. Retrieve the PKCE code verifier from the session
   *   2. Exchange the HP authorization code for HP tokens
   *   3. Save the HP tokens and redirect to /dashboard
   *
   * After this succeeds, all future Cognito logins will automatically get HP
   * tokens via the JWT bearer exchange — no more consent screen.
   */
  router.get('/callback', requireCognito, async (req: Request, res: Response) => {
    const { code, error, error_description } = req.query as Record<string, string>;

    if (error) {
      const msg = error_description || error;
      console.error('[consent/callback] HP authorization error:', msg);
      return res.redirect(`/consent?error=${encodeURIComponent(msg)}`);
    }

    if (!code) {
      return res.redirect('/consent?error=missing_code');
    }

    // Retrieve and consume the PKCE code verifier (single-use)
    const codeVerifier = consumePkceCodeVerifier(req);
    if (!codeVerifier) {
      return res.redirect('/consent?error=session_expired');
    }

    try {
      // Exchange the HP authorization code for HP tokens
      const humanityTokens = await humanity.exchangeConsentCode(code, codeVerifier);
      saveHumanityTokens(req, humanityTokens);

      console.log('[consent/callback] HP consent complete — user authorized');
      console.log('[consent/callback] app_scoped_user_id:', humanityTokens.app_scoped_user_id);

      // From now on, future Cognito logins will auto-exchange to HP tokens
      // via the JWT bearer grant — no consent screen needed.
      res.redirect('/dashboard');
    } catch (err) {
      console.error('[consent/callback] HP code exchange failed:', err);
      res.redirect(`/consent?error=${encodeURIComponent((err as Error).message)}`);
    }
  });

  return router;
}
