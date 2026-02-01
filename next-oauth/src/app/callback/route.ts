import type { NextRequest } from 'next/server';
import { handleOauthCallback } from '@/lib/oauth-callback';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  return handleOauthCallback(request);
}

