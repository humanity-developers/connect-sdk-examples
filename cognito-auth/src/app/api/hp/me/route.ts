/**
 * GET /api/hp/me
 * Returns Humanity session metadata without making an HP API call.
 * Used by the dashboard to show token info.
 */

import { NextResponse } from 'next/server';
import { getHumanityTokens, getCognitoTokens } from '@/services/session';

export const runtime = 'nodejs';

export async function GET() {
  const hp = await getHumanityTokens();
  const cog = await getCognitoTokens();

  if (!cog) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }
  if (!hp) {
    return NextResponse.json({ error: 'consent_required' }, { status: 403 });
  }

  return NextResponse.json({
    humanity: {
      app_scoped_user_id: hp.app_scoped_user_id,
      authorization_id: hp.authorization_id,
      granted_scopes: hp.granted_scopes,
      expires_in: hp.expires_in,
      issued_at: hp.issued_at,
    },
  });
}
