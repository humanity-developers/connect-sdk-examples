/**
 * GET /api/hp/userinfo
 * Proxy to HP GET /userinfo using the server-stored access token.
 * The browser never sees the raw HP access token.
 */

import { NextResponse } from 'next/server';
import { getHumanityTokens, getCognitoTokens } from '@/services/session';
import { createHumanityService } from '@/services/humanity';

export const runtime = 'nodejs';

export async function GET() {
  if (!await getCognitoTokens()) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }
  const hp = await getHumanityTokens();
  if (!hp) {
    return NextResponse.json({ error: 'consent_required' }, { status: 403 });
  }

  try {
    const humanity = createHumanityService();
    const userInfo = await humanity.getUserInfo(hp.access_token);
    return NextResponse.json(userInfo);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
