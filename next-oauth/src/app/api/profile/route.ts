import { NextResponse } from 'next/server';
import { fetchHumanityProfile } from '@/lib/profile';
import { ensureFreshTokenSession } from '@/lib/session';

export const runtime = 'nodejs';

export async function GET() {
  const token = await ensureFreshTokenSession();
  if (!token) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    const profile = await fetchHumanityProfile(token);
    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to fetch profile' },
      { status: 502 },
    );
  }
}

