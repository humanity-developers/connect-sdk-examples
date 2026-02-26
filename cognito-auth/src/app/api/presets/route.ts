/**
 * GET /api/presets?presets=isHuman,ageOver18
 *
 * Verifies one or more HP presets for the currently authenticated user.
 * Reads the HP access token from the session cookie — never exposes it to
 * the browser.
 *
 * Query parameters:
 *   presets  comma-separated list of preset keys to verify
 *
 * Response:
 * {
 *   "results": {
 *     "isHuman": { "verified": true, "preset": "isHuman", "status": "valid" },
 *     "ageOver18": { "verified": false, "preset": "ageOver18", "status": "unavailable" }
 *   }
 * }
 */

import { NextResponse, type NextRequest } from 'next/server';
import { getHumanitySdk, HumanityError } from '@/lib/humanity-sdk';
import { readSession } from '@/lib/session';
import type { DeveloperPresetKey } from '@humanity-org/connect-sdk/dist/adapters/preset-registry';

export const runtime = 'nodejs';

const DEFAULT_PRESETS = ['isHuman'] as const;

export async function GET(request: NextRequest) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json(
      { error: 'unauthenticated', error_description: 'No active Humanity session.' },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const presetsParam = searchParams.get('presets');
  const presets: DeveloperPresetKey[] = presetsParam
    ? (presetsParam.split(',').map((p) => p.trim()) as DeveloperPresetKey[])
    : ([...DEFAULT_PRESETS] as DeveloperPresetKey[]);

  if (presets.length === 0) {
    return NextResponse.json(
      { error: 'invalid_request', error_description: 'At least one preset is required.' },
      { status: 400 },
    );
  }

  try {
    const sdk = getHumanitySdk();

    const batch = await sdk.verifyPresets({
      accessToken: session.accessToken,
      presets,
    });

    // Flatten results into a { presetKey: result } map for easy frontend consumption
    const results: Record<string, { verified: boolean; preset: string; status: string }> = {};
    for (const result of batch.results) {
      results[result.preset] = {
        verified: result.verified,
        preset: result.preset,
        status: result.status,
      };
    }
    for (const err of batch.errors) {
      results[err.preset] = {
        verified: false,
        preset: err.preset,
        status: 'error',
      };
    }

    return NextResponse.json({ results });
  } catch (err) {
    if (err instanceof HumanityError) {
      return NextResponse.json(
        { error: err.code, error_description: err.message },
        { status: err.statusCode ?? 400 },
      );
    }
    console.error('[presets] Unexpected error:', err);
    return NextResponse.json(
      { error: 'server_error', error_description: 'Failed to verify presets.' },
      { status: 500 },
    );
  }
}
