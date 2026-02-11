import { createSdk } from './sdk';
import type { TokenSession } from './session';

export type HumanityProfile = {
  preset: string;
  value: boolean;
  status: 'valid' | 'expired' | 'pending' | 'unavailable';
  scope: string;
  evidence: {
    sub: string;
    iss: string;
    aud: string;
    authorization_id: string;
    scopes: string[];
    updated_at: string | null;
    humanity_id: string | null;
    wallet_address: string | null;
    email: string | null;
    email_verified: boolean;
  };
  expiresAt: string | null;
  rateLimit?: {
    limit: number;
    remaining: number;
    reset: number;
  };
};

export async function fetchHumanityProfile(token: TokenSession): Promise<HumanityProfile> {
  const sdk = createSdk({
    clientId: token.clientId,
    redirectUri: token.redirectUri,
    environment: token.environment,
  });

  try {
    // Use the SDK's verifyPreset method with the humanity_user preset
    // This returns the full preset result with OpenID Connect claims as evidence
    const result = await sdk.verifyPreset({
      preset: 'humanity_user',
      accessToken: token.accessToken,
    });

    return {
      preset: result.preset,
      value: result.value,
      status: result.status,
      scope: result.scope,
      evidence: {
        sub: (result.evidence?.sub as string) ?? '',
        iss: (result.evidence?.iss as string) ?? '',
        aud: (result.evidence?.aud as string) ?? '',
        authorization_id: (result.evidence?.authorization_id as string) ?? token.authorizationId,
        scopes: (result.evidence?.scopes as string[]) ?? token.grantedScopes,
        updated_at: (result.evidence?.updated_at as string) ?? null,
        humanity_id: toNullableString(result.evidence?.humanity_id as string),
        wallet_address: toNullableString(result.evidence?.wallet_address as string | null),
        email: toNullableString(result.evidence?.email as string | null),
        email_verified: Boolean(result.evidence?.email_verified),
      },
      expiresAt: result.expiresAt ?? null,
      rateLimit: result.rateLimit ? {
        limit: result.rateLimit.limit ?? 0,
        remaining: result.rateLimit.remaining ?? 0,
        reset: result.rateLimit.reset ?? 0,
      } : undefined,
    };
  } catch (error: any) {
    const reason =
      error?.response?.data?.error_description ??
      error?.response?.data?.message ??
      error?.message ??
      'Failed to fetch humanity_user preset';
    throw new Error(reason);
  }
}

function toNullableString(value?: string | null): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

/**
 * Client-side function to fetch profile directly using stored session
 * This is intended for use in client components
 */
export async function fetchProfileFromSession(): Promise<HumanityProfile> {
  // Read session from cookie on client side
  const response = await fetch('/api/session');
  if (!response.ok) {
    throw new Error('Not authenticated');
  }
  const token = (await response.json()) as TokenSession;
  return fetchHumanityProfile(token);
}

