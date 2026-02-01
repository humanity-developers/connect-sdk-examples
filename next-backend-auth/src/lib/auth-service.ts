/**
 * Backend Authentication Service
 * 
 * This service demonstrates how to:
 * 1. Validate Humanity Protocol access tokens
 * 2. Issue your own application JWT tokens
 * 3. Verify your custom JWT tokens for protected routes
 * 
 * ARCHITECTURE OVERVIEW:
 * 
 * ┌─────────────┐     ┌─────────────────┐     ┌─────────────────┐
 * │   Frontend  │────▶│  Your Backend   │────▶│ Humanity Proto  │
 * │             │     │                 │     │      API        │
 * └─────────────┘     └─────────────────┘     └─────────────────┘
 *       │                     │                       │
 *       │  1. OAuth Flow      │  2. Validate Token    │
 *       │     (PKCE)          │     + Verify Presets  │
 *       │                     │                       │
 *       │  4. Use App JWT     │  3. Issue App JWT     │
 *       │     for API calls   │     with user claims  │
 *       ▼                     ▼                       ▼
 * 
 * This pattern allows you to:
 * - Control your own session management
 * - Add custom claims to your JWT (roles, permissions, etc.)
 * - Cache user verification status
 * - Implement your own token refresh strategy
 */

import * as jose from 'jose';
import { getConfig } from './config';
import { getHumanitySdk, type TokenResult, type ClientUserTokenResult } from './humanity-sdk';

/**
 * User information extracted from Humanity Protocol verification.
 */
export interface HumanityUser {
  /** The user's unique ID in Humanity Protocol */
  humanityUserId: string;
  /** App-scoped user ID (unique per application) */
  appScopedUserId: string;
  /** The authorization ID for this OAuth session */
  authorizationId: string;
  /** Scopes granted by the user */
  grantedScopes: string[];
  /** Verified preset results */
  verifiedPresets: VerifiedPreset[];
}

export interface VerifiedPreset {
  preset: string;
  status: string;
  scope: string;
  expiresAt?: string;
}

/**
 * Your application's JWT payload.
 * Customize this to include any claims your app needs.
 */
export interface AppJwtPayload {
  /** Subject - the user ID in your system */
  sub: string;
  /** Issuer - your application */
  iss: string;
  /** Audience - who this token is for */
  aud: string;
  /** Issued at timestamp */
  iat: number;
  /** Expiration timestamp */
  exp: number;
  /** Humanity Protocol user ID */
  humanityUserId: string;
  /** App-scoped user ID from Humanity */
  appScopedUserId: string;
  /** Authorization ID for this session */
  authorizationId: string;
  /** Granted scopes from Humanity */
  scopes: string[];
  /** Verified humanity presets */
  presets: string[];
  /** Whether the user is verified as human */
  isHuman: boolean;
  /** Custom claims - add your own! */
  customClaims?: Record<string, unknown>;
}

/**
 * Result from validating a Humanity Protocol token.
 */
export interface ValidationResult {
  valid: boolean;
  user?: HumanityUser;
  error?: string;
}

/**
 * Result from issuing an application JWT.
 */
export interface AppTokenResult {
  token: string;
  expiresAt: Date;
  payload: AppJwtPayload;
}

/**
 * Backend Authentication Service
 * 
 * Use this service to:
 * 1. Validate incoming Humanity Protocol tokens
 * 2. Issue your own application JWTs
 * 3. Verify your JWTs on protected routes
 */
export class AuthService {
  private readonly config = getConfig();
  private readonly sdk = getHumanitySdk();
  private readonly jwtSecret: Uint8Array;

  constructor() {
    this.jwtSecret = new TextEncoder().encode(this.config.jwt.secret);
  }

  /**
   * Validate a Humanity Protocol access token and extract user information.
   * 
   * This method:
   * 1. Verifies the token is valid by calling the Humanity API
   * 2. Optionally verifies specific presets (e.g., isHuman)
   * 3. Returns structured user information
   * 
   * @param humanityAccessToken - The access token from Humanity Protocol OAuth
   * @param presetsToVerify - Optional array of preset keys to verify (e.g., ['isHuman'])
   */
  async validateHumanityToken(
    humanityAccessToken: string,
    presetsToVerify: string[] = ['isHuman'],
  ): Promise<ValidationResult> {
    try {
      // Verify presets to validate the token and get user information
      const verifiedPresets: VerifiedPreset[] = [];
      
      if (presetsToVerify.length > 0) {
        const batchResult = await this.sdk.verifyPresets(
          presetsToVerify as any,
          humanityAccessToken,
        );

        for (const result of batchResult.results) {
          verifiedPresets.push({
            preset: result.preset,
            status: result.status,
            scope: result.scope,
            expiresAt: result.expiresAt,
          });
        }

        // Log any preset verification errors (but don't fail the whole validation)
        for (const error of batchResult.errors) {
          console.warn(`[auth] Preset verification failed for ${error.preset}:`, error.error);
        }
      }

      // Decode the JWT to extract user information
      // Note: The SDK already validates the token when calling verifyPresets
      const tokenPayload = this.decodeJwt(humanityAccessToken);
      if (!tokenPayload) {
        return { valid: false, error: 'Invalid token format' };
      }

      const user: HumanityUser = {
        humanityUserId: tokenPayload.sub as string,
        appScopedUserId: tokenPayload.app_scoped_user_id as string || tokenPayload.sub as string,
        authorizationId: tokenPayload.authorization_id as string || '',
        grantedScopes: (tokenPayload.scope as string || '').split(' ').filter(Boolean),
        verifiedPresets,
      };

      return { valid: true, user };
    } catch (error) {
      console.error('[auth] Token validation failed:', error);
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Token validation failed',
      };
    }
  }

  /**
   * Issue your application's JWT token.
   * 
   * Call this after validating the Humanity token to create
   * your own session token that your frontend can use.
   * 
   * @param user - The validated Humanity user
   * @param customClaims - Optional custom claims to add to the JWT
   */
  async issueAppToken(
    user: HumanityUser,
    customClaims?: Record<string, unknown>,
  ): Promise<AppTokenResult> {
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = now + this.config.jwt.expiresIn;

    // Check if user has verified isHuman preset
    const isHuman = user.verifiedPresets.some(
      (p) => p.preset === 'isHuman' && p.status === 'valid',
    );

    const payload: AppJwtPayload = {
      sub: user.appScopedUserId, // Use app-scoped ID as the subject
      iss: this.config.jwt.issuer,
      aud: this.config.jwt.issuer,
      iat: now,
      exp: expiresAt,
      humanityUserId: user.humanityUserId,
      appScopedUserId: user.appScopedUserId,
      authorizationId: user.authorizationId,
      scopes: user.grantedScopes,
      presets: user.verifiedPresets.map((p) => p.preset),
      isHuman,
      customClaims,
    };

    const token = await new jose.SignJWT(payload as unknown as jose.JWTPayload)
      .setProtectedHeader({ alg: 'HS256' })
      .sign(this.jwtSecret);

    return {
      token,
      expiresAt: new Date(expiresAt * 1000),
      payload,
    };
  }

  /**
   * Verify your application's JWT token.
   * 
   * Use this in your protected API routes to validate
   * incoming requests.
   * 
   * @param token - Your application's JWT token
   */
  async verifyAppToken(token: string): Promise<AppJwtPayload | null> {
    try {
      const { payload } = await jose.jwtVerify(token, this.jwtSecret, {
        issuer: this.config.jwt.issuer,
        audience: this.config.jwt.issuer,
      });

      return payload as unknown as AppJwtPayload;
    } catch (error) {
      console.error('[auth] App token verification failed:', error);
      return null;
    }
  }

  /**
   * Get a token for a specific user using the client credentials.
   * 
   * This is useful for server-to-server communication where you need
   * to read user data without user interaction.
   * 
   * The user must have already authorized your application.
   * 
   * @param identifier - User identifier (email, userId, or compound format)
   */
  async getTokenForUser(identifier: {
    email?: string;
    userId?: string;
    evmAddress?: string;
  }): Promise<ClientUserTokenResult | null> {
    try {
      const result = await this.sdk.getClientUserToken({
        clientSecret: this.config.humanity.clientSecret,
        email: identifier.email,
        userId: identifier.userId,
        evmAddress: identifier.evmAddress,
      });

      return result;
    } catch (error) {
      console.error('[auth] Failed to get token for user:', error);
      return null;
    }
  }

  /**
   * Decode a JWT without verification (for extracting claims).
   * Note: Always verify tokens before trusting their contents!
   */
  private decodeJwt(token: string): Record<string, unknown> | null {
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      
      const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = payload.padEnd(Math.ceil(payload.length / 4) * 4, '=');
      const decoded = Buffer.from(padded, 'base64').toString('utf-8');
      
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }
}

// Singleton instance
let authServiceInstance: AuthService | null = null;

/**
 * Get the AuthService singleton instance.
 */
export function getAuthService(): AuthService {
  if (!authServiceInstance) {
    authServiceInstance = new AuthService();
  }
  return authServiceInstance;
}

