/**
 * /api/* — Protected routes that require both Cognito and Humanity tokens
 *
 * GET  /api/me           → Returns session info (no HP API call)
 * GET  /api/userinfo     → Fetches HP user profile (GET /userinfo)
 * GET  /api/presets      → Verifies HP presets (?presets=isHuman,ageOver18)
 */

import { Router, type Request, type Response } from 'express';
import { HumanityService } from '../services/humanity';
import { requireHumanity } from '../middleware/requireAuth';
import { getCognitoTokens, getHumanityTokens } from '../services/session';

export function createApiRouter(humanity: HumanityService): Router {
  const router = Router();

  // All /api/* routes require Cognito + Humanity tokens
  router.use(requireHumanity);

  /**
   * GET /api/me
   * Returns session metadata without making an HP API call.
   */
  router.get('/me', (req: Request, res: Response) => {
    const hp = getHumanityTokens(req)!;
    const cognito = getCognitoTokens(req)!;

    res.json({
      cognito: {
        expires_in: cognito.expires_in,
        token_type: cognito.token_type,
      },
      humanity: {
        app_scoped_user_id: hp.app_scoped_user_id,
        authorization_id: hp.authorization_id,
        granted_scopes: hp.granted_scopes,
        expires_in: hp.expires_in,
        issued_at: hp.issued_at,
      },
    });
  });

  /**
   * GET /api/userinfo
   * Fetch the user's HP profile.
   * Calls: GET /userinfo
   */
  router.get('/userinfo', async (req: Request, res: Response) => {
    const hp = getHumanityTokens(req)!;

    try {
      const userInfo = await humanity.getUserInfo(hp.access_token);
      res.json(userInfo);
    } catch (err) {
      console.error('[api/userinfo] Error:', err);
      res.status(500).json({ error: (err as Error).message });
    }
  });

  /**
   * GET /api/presets?presets=isHuman,ageOver18
   * Verify one or more HP presets.
   * Calls: GET /v2/presets/:presetName for each preset
   */
  router.get('/presets', async (req: Request, res: Response) => {
    const hp = getHumanityTokens(req)!;
    const presetsParam = req.query.presets as string;

    if (!presetsParam) {
      return res.status(400).json({ error: 'Provide ?presets=isHuman,ageOver18' });
    }

    const presets = presetsParam.split(',').map((p) => p.trim());
    const results: Record<string, unknown> = {};

    // Fetch presets in parallel
    await Promise.allSettled(
      presets.map(async (preset) => {
        try {
          results[preset] = await humanity.verifyPreset(hp.access_token, preset);
        } catch (err) {
          results[preset] = { error: (err as Error).message };
        }
      }),
    );

    res.json({ results });
  });

  return router;
}
