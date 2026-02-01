/**
 * Authentication Middleware
 * 
 * Utilities for protecting API routes with your application's JWT.
 * 
 * Usage in API routes:
 * 
 * ```typescript
 * import { withAuth, requireHuman } from '@/lib/auth-middleware';
 * 
 * // Basic authentication
 * export const GET = withAuth(async (request, { user }) => {
 *   return NextResponse.json({ message: `Hello ${user.appScopedUserId}` });
 * });
 * 
 * // Require human verification
 * export const POST = requireHuman(async (request, { user }) => {
 *   // Only verified humans can access this
 *   return NextResponse.json({ sensitive: 'data' });
 * });
 * ```
 */

import { NextResponse, type NextRequest } from 'next/server';
import { getAuthService, type AppJwtPayload } from './auth-service';
import { readAppSession } from './session';

export interface AuthContext {
  user: AppJwtPayload;
  token: string;
}

export type AuthenticatedHandler = (
  request: NextRequest,
  context: AuthContext,
) => Promise<NextResponse> | NextResponse;

/**
 * Wrap an API route handler to require authentication.
 * The handler will receive the authenticated user in the context.
 */
export function withAuth(handler: AuthenticatedHandler) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authResult = await authenticateRequest(request);

    if (!authResult.authenticated) {
      return NextResponse.json(
        { error: authResult.error || 'unauthorized' },
        { status: 401 },
      );
    }

    return handler(request, {
      user: authResult.user!,
      token: authResult.token!,
    });
  };
}

/**
 * Wrap an API route handler to require authentication AND human verification.
 * Only users who have verified the isHuman preset can access.
 */
export function requireHuman(handler: AuthenticatedHandler) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authResult = await authenticateRequest(request);

    if (!authResult.authenticated) {
      return NextResponse.json(
        { error: authResult.error || 'unauthorized' },
        { status: 401 },
      );
    }
    console.log('authResult.user!.isHuman', authResult);

    if (!authResult.user!.isHuman) {
      return NextResponse.json(
        { 
          error: 'human_verification_required',
          message: 'This endpoint requires human verification. Please complete the isHuman verification process.',
        },
        { status: 403 },
      );
    }

    return handler(request, {
      user: authResult.user!,
      token: authResult.token!,
    });
  };
}

/**
 * Wrap an API route handler to require specific presets.
 * 
 * @param presets - Array of preset names that the user must have verified
 */
export function requirePresets(presets: string[], handler: AuthenticatedHandler) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authResult = await authenticateRequest(request);

    if (!authResult.authenticated) {
      return NextResponse.json(
        { error: authResult.error || 'unauthorized' },
        { status: 401 },
      );
    }

    const userPresets = new Set(authResult.user!.presets);
    const missingPresets = presets.filter((p) => !userPresets.has(p));

    if (missingPresets.length > 0) {
      return NextResponse.json(
        {
          error: 'missing_presets',
          message: `This endpoint requires the following presets to be verified: ${missingPresets.join(', ')}`,
          required: presets,
          missing: missingPresets,
        },
        { status: 403 },
      );
    }

    return handler(request, {
      user: authResult.user!,
      token: authResult.token!,
    });
  };
}

interface AuthResult {
  authenticated: boolean;
  user?: AppJwtPayload;
  token?: string;
  error?: string;
}

/**
 * Authenticate a request using either:
 * 1. Session cookie (for browser requests)
 * 2. Authorization header (for API requests)
 */
async function authenticateRequest(request: NextRequest): Promise<AuthResult> {
  const authService = getAuthService();

  // Try session cookie first
  const session = readAppSession();
  if (session) {
    if (session.expiresAt < Date.now()) {
      return { authenticated: false, error: 'session_expired' };
    }

    const payload = await authService.verifyAppToken(session.appToken);
    if (payload) {
      return { authenticated: true, user: payload, token: session.appToken };
    }
  }

  // Try Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const payload = await authService.verifyAppToken(token);
    if (payload) {
      return { authenticated: true, user: payload, token };
    }
    return { authenticated: false, error: 'invalid_token' };
  }

  return { authenticated: false, error: 'no_credentials' };
}

/**
 * Extract the authenticated user from a request.
 * Returns null if not authenticated.
 * 
 * Useful when you want to handle authentication yourself.
 */
export async function getAuthenticatedUser(
  request: NextRequest,
): Promise<AppJwtPayload | null> {
  const result = await authenticateRequest(request);
  return result.authenticated ? result.user! : null;
}

