import { NextResponse } from 'next/server';
import { deleteOAuthSession, deleteTokenSession, readTokenSession } from '@/lib/session';

export const runtime = 'nodejs';

export async function GET() {
  const token = readTokenSession();
  if (!token) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }
  return NextResponse.json(token);
}

export async function DELETE() {
  const response = NextResponse.json({ cleared: true });
  deleteOAuthSession(response);
  deleteTokenSession(response);
  return response;
}

