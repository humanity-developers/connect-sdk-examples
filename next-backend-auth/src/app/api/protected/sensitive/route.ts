/**
 * GET /api/protected/sensitive
 * POST /api/protected/sensitive
 * 
 * Example protected route that requires HUMAN VERIFICATION.
 * Only users who have verified the isHuman preset can access.
 * 
 * Use this pattern for:
 * - Voting systems
 * - Financial transactions
 * - Content that should only be accessed by verified humans
 * - Anti-bot protection
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireHuman } from '@/lib/auth-middleware';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = requireHuman(async (_request, { user }) => {
  return NextResponse.json({
    message: 'Welcome, verified human!',
    sensitiveData: {
      userId: user.appScopedUserId,
      humanityVerified: true,
      verifiedPresets: user.presets,
      accessGrantedAt: new Date().toISOString(),
    },
  });
});

export const POST = requireHuman(async (request: NextRequest, { user }) => {
  const body = await request.json().catch(() => ({}));

  // Example: Process a vote that requires human verification
  return NextResponse.json({
    success: true,
    message: 'Action processed successfully',
    action: {
      type: 'sensitive_action',
      performedBy: user.appScopedUserId,
      isVerifiedHuman: true,
      data: body,
      timestamp: new Date().toISOString(),
    },
  });
});

