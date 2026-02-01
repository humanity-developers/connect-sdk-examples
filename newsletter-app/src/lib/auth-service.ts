/**
 * Authentication Service
 * 
 * Handles Humanity Protocol token validation and user profile extraction.
 * Uses social presets and query engine for personalization.
 */

import * as jose from 'jose';
import { getConfig } from './config';
import { getHumanitySdk } from './humanity-sdk';
import {
  SOCIAL_PRESETS,
  SOCIAL_PRESET_TO_PROVIDER,
  HOTEL_MEMBERSHIP_QUERY,
  AIRLINE_MEMBERSHIP_QUERY,
  type SocialPreset,
  type PredicateQuery,
} from './constants';
import {
  upsertUser,
  type UserDocument,
  type SocialAccount,
  type UserPreset,
} from './database';

export interface ExtractedUserData {
  humanityUserId: string;
  appScopedUserId: string;
  email?: string;
  evmAddress?: string;
  linkedSocials: SocialAccount[];
  presets: UserPreset[];
  travelProfile: TravelProfile;
  rawEvidence: Record<string, unknown>;
}

export interface TravelProfile {
  hasHotelMembership: boolean;
  hasAirlineMembership: boolean;
  isFrequentTraveler: boolean;
}

export interface AppJwtPayload {
  sub: string;
  iss: string;
  aud: string;
  iat: number;
  exp: number;
  humanityUserId: string;
  appScopedUserId: string;
  email?: string;
  evmAddress?: string;
  linkedSocials: string[];
  presets: string[];
  isFrequentTraveler: boolean;
}

export interface AppTokenResult {
  token: string;
  expiresAt: Date;
  payload: AppJwtPayload;
}

export class AuthService {
  private readonly config = getConfig();
  private readonly sdk = getHumanitySdk();
  private readonly jwtSecret: Uint8Array;

  constructor() {
    this.jwtSecret = new TextEncoder().encode(this.config.jwt.secret);
  }

  /**
   * Extract user data from Humanity token.
   * Gets social accounts via presets and travel profile via query engine.
   */
  async extractUserData(humanityAccessToken: string): Promise<ExtractedUserData> {
    const tokenPayload = this.decodeJwt(humanityAccessToken);

    // Fetch email preset for user email
    const userProfile = await this.fetchEmailPreset(humanityAccessToken);

    // Verify social account presets in batch
    const linkedSocials = await this.verifySocialAccounts(humanityAccessToken);

    // Check travel profile using query engine
    const travelProfile = await this.checkTravelProfile(humanityAccessToken);

    // Build presets list from social connections and travel
    const presets = this.buildPresetsList(linkedSocials, travelProfile);

    return {
      humanityUserId: tokenPayload?.sub as string || userProfile.humanityId || '',
      appScopedUserId: tokenPayload?.app_scoped_user_id as string || tokenPayload?.sub as string || '',
      email: userProfile.email || tokenPayload?.email as string | undefined,
      evmAddress: userProfile.evmAddress,
      linkedSocials,
      presets,
      travelProfile,
      rawEvidence: { ...tokenPayload, ...userProfile.evidence },
    };
  }

  /**
   * Fetch email preset for user email.
   * The email preset returns the user's verified email address.
   */
  private async fetchEmailPreset(accessToken: string): Promise<{
    email?: string;
    evmAddress?: string;
    humanityId?: string;
    evidence: Record<string, unknown>;
  }> {
    try {
      // Verify the email preset
      const result = await this.sdk.verifyPreset({
        preset: 'email',
        accessToken,
      });

      // The email preset returns the email as the value
      const email = typeof result.value === 'string' 
        ? result.value 
        : this.toNullableString(result.evidence?.email);

      // Also try to get wallet address from evidence if available
      const evidence = result.evidence || {};
      const walletAddress = this.toNullableString(evidence.wallet_address);
      const humanityId = this.toNullableString(evidence.humanity_id);

      return {
        email: email || undefined,
        evmAddress: walletAddress || undefined,
        humanityId: humanityId || undefined,
        evidence: evidence as Record<string, unknown>,
      };
    } catch {
      return { evidence: {} };
    }
  }

  /**
   * Convert value to nullable string, trimming whitespace.
   */
  private toNullableString(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }

  /**
   * Verify all social account presets in a single batch request.
   */
  private async verifySocialAccounts(accessToken: string): Promise<SocialAccount[]> {
    const socials: SocialAccount[] = [];
    const now = new Date();

    try {
      const batchResult = await this.sdk.verifyPresets({
        accessToken,
        presets: [...SOCIAL_PRESETS],
      });


      for (const preset of SOCIAL_PRESETS) {
        // SDK returns presetName in snake_case (matches our constants)
        // and preset in camelCase - we match on presetName
        const result = batchResult.results?.find(
          (r: any) => r.presetName === preset || r.preset === preset
        );
        const isConnected = result?.value === true;
        const provider = SOCIAL_PRESET_TO_PROVIDER[preset];

        socials.push({
          provider: provider as SocialAccount['provider'],
          connected: isConnected,
          username: undefined,
          connectedAt: isConnected ? now : undefined,
        });
      }
    } catch {
      // Return empty socials on error
      for (const preset of SOCIAL_PRESETS) {
        const provider = SOCIAL_PRESET_TO_PROVIDER[preset];
        socials.push({
          provider: provider as SocialAccount['provider'],
          connected: false,
          username: undefined,
          connectedAt: undefined,
        });
      }
    }

    return socials;
  }

  /**
   * Check travel profile using query engine.
   */
  private async checkTravelProfile(accessToken: string): Promise<TravelProfile> {
    let hasHotelMembership = false;
    let hasAirlineMembership = false;

    try {
      // Run queries in parallel for better performance
      const [hotelResult, airlineResult] = await Promise.all([
        this.evaluateQuery(accessToken, HOTEL_MEMBERSHIP_QUERY),
        this.evaluateQuery(accessToken, AIRLINE_MEMBERSHIP_QUERY),
      ]);

      hasHotelMembership = hotelResult;
      hasAirlineMembership = airlineResult;
    } catch {
      // Silently fail - travel profile is optional
    }

    return {
      hasHotelMembership,
      hasAirlineMembership,
      isFrequentTraveler: hasHotelMembership && hasAirlineMembership,
    };
  }

  /**
   * Evaluate a predicate query using the SDK.
   */
  private async evaluateQuery(accessToken: string, query: PredicateQuery): Promise<boolean> {
    try {
      const result = await this.sdk.evaluatePredicateQuery({
        accessToken,
        query,
      });
      return result.passed === true;
    } catch {
      return false;
    }
  }

  /**
   * Build presets list from social connections and travel profile.
   */
  private buildPresetsList(socials: SocialAccount[], travel: TravelProfile): UserPreset[] {
    const presets: UserPreset[] = [];
    const now = new Date();

    // Add social connection presets
    for (const social of socials) {
      if (social.connected) {
        presets.push({
          name: `${social.provider}_connected`,
          value: true,
          status: 'valid',
          updatedAt: now,
        });
      }
    }

    // Add travel presets
    if (travel.hasHotelMembership) {
      presets.push({
        name: 'has_hotel_membership',
        value: true,
        status: 'valid',
        updatedAt: now,
      });
    }

    if (travel.hasAirlineMembership) {
      presets.push({
        name: 'has_airline_membership',
        value: true,
        status: 'valid',
        updatedAt: now,
      });
    }

    if (travel.isFrequentTraveler) {
      presets.push({
        name: 'is_frequent_traveler',
        value: true,
        status: 'valid',
        updatedAt: now,
      });
    }

    return presets;
  }

  /**
   * Check if user has at least one social connection.
   * App is gated on this requirement.
   */
  hasAnySocialConnection(socials: SocialAccount[]): boolean {
    return socials.some((s) => s.connected);
  }

  /**
   * Issue application JWT token.
   */
  async issueAppToken(user: UserDocument, travelProfile?: TravelProfile): Promise<AppTokenResult> {
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = now + this.config.jwt.expiresIn;

    const payload: AppJwtPayload = {
      sub: user.appScopedUserId,
      iss: this.config.jwt.issuer,
      aud: this.config.jwt.issuer,
      iat: now,
      exp: expiresAt,
      humanityUserId: user.humanityUserId,
      appScopedUserId: user.appScopedUserId,
      email: user.email,
      evmAddress: user.evmAddress,
      linkedSocials: user.linkedSocials.filter((s) => s.connected).map((s) => s.provider),
      presets: user.presets.filter((p) => p.status === 'valid' && p.value).map((p) => p.name),
      isFrequentTraveler: travelProfile?.isFrequentTraveler ?? false,
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
   * Verify application JWT token.
   */
  async verifyAppToken(token: string): Promise<AppJwtPayload | null> {
    try {
      const { payload } = await jose.jwtVerify(token, this.jwtSecret, {
        issuer: this.config.jwt.issuer,
        audience: this.config.jwt.issuer,
      });

      return payload as unknown as AppJwtPayload;
    } catch {
      return null;
    }
  }

  /**
   * Create or update user in database with extracted data.
   */
  async createOrUpdateUser(userData: ExtractedUserData): Promise<UserDocument> {
    return upsertUser({
      humanityUserId: userData.humanityUserId,
      appScopedUserId: userData.appScopedUserId,
      email: userData.email,
      evmAddress: userData.evmAddress,
      linkedSocials: userData.linkedSocials,
      presets: userData.presets,
      updatedAt: new Date(),
      lastLoginAt: new Date(),
    });
  }

  /**
   * Decode JWT without verification (for extracting claims).
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

export function getAuthService(): AuthService {
  if (!authServiceInstance) {
    authServiceInstance = new AuthService();
  }
  return authServiceInstance;
}
