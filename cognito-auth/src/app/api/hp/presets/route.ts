/**
 * GET /api/hp/presets?presets=isHuman,ageOver18
 *
 * Verify one or more HP presets for the current user.
 * Reads the HP access token from the session cookie — token never reaches the browser.
 *
 * Query params:
 *   presets  comma-separated preset keys (default: isHuman)
 */

import { NextResponse, type NextRequest } from 'next/server';
import { getHumanityTokens, getCognitoTokens } from '@/services/session';
import { createHumanityService } from '@/services/humanity';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  if (!await getCognitoTokens()) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }
  const hp = await getHumanityTokens();
  if (!hp) {
    return NextResponse.json({ error: 'consent_required' }, { status: 403 });
  }

  const presetsParam = new URL(request.url).searchParams.get('presets') ?? 'isHuman';
  const presets = presetsParam.split(',').map((p) => p.trim()).filter(Boolean);

  const humanity = createHumanityService();
  const results: Record<string, unknown> = {};

  await Promise.allSettled(
    presets.map(async (preset) => {
      try {
        results[preset] = await humanity.verifyPreset(hp.access_token, preset);
      } catch (err) {
        results[preset] = { error: (err as Error).message };
      }
    }),
  );

  return NextResponse.json({ results });
}
