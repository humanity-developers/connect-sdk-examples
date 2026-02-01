/**
 * Humanity Protocol Scopes, Presets, and Query Engine
 * 
 * Reference file containing all valid scopes, presets, and custom queries
 * available in the Humanity Protocol SDK.
 */

// ============================================================================
// OAuth Scopes
// ============================================================================

export const ALL_SCOPES = [
  // Category-level read scopes
  'identity:read',
  'kyc:read',
  'financial:read',
  
  // Identity field-level scopes (high sensitivity)
  'identity:date_of_birth',
  'identity:address_postal_code',
  'identity:address_full',
  'identity:legal_name',
  
  // KYC field-level scopes (high/critical sensitivity)
  'kyc:document_number',
  
  // Financial field-level scopes (high sensitivity)
  'financial:bank_balance',
  'financial:loan_balance',
  'financial:net_worth',
  
  // Profile/OpenID scopes
  'openid',
  'profile.full',
  'data.read',
  
] as const;

export type Scope = (typeof ALL_SCOPES)[number];

// ============================================================================
// Social Account Presets (Built-in)
// ============================================================================

/**
 * All available social account presets.
 * These can be verified in a single batch request.
 */
export const SOCIAL_PRESETS = [
  'google_connected',
  'linkedin_connected',
  'twitter_connected',
  'discord_connected',
  'github_connected',
  'telegram_connected',
] as const;

export type SocialPreset = (typeof SOCIAL_PRESETS)[number];

/**
 * Map from preset name to display-friendly provider name
 */
export const SOCIAL_PRESET_TO_PROVIDER: Record<SocialPreset, string> = {
  'google_connected': 'google',
  'linkedin_connected': 'linkedin',
  'twitter_connected': 'twitter',
  'discord_connected': 'discord',
  'github_connected': 'github',
  'telegram_connected': 'telegram',
};

// ============================================================================
// Query Engine Types
// ============================================================================

export type PredicateOperator =
  | '=='
  | '!='
  | '>'
  | '>='
  | '<'
  | '<='
  | 'in'
  | 'notIn'
  | 'contains'
  | 'isDefined'
  | 'startsWith'
  | 'matchRegex';

export interface PredicateCheck {
  check: {
    claim: string;
    operator: PredicateOperator;
    value?: unknown;
  };
}

export interface PredicatePolicy {
  allOf?: (PredicateCheck | PredicateQuery)[];
  anyOf?: (PredicateCheck | PredicateQuery)[];
  not?: PredicateCheck | PredicateQuery;
}

export type PredicateQuery =
  | PredicateCheck
  | { policy: PredicatePolicy };

// ============================================================================
// Hotel Membership Queries
// ============================================================================

/**
 * Check if user has ANY hotel loyalty membership.
 * 
 * Hotels included:
 * - Marriott Bonvoy
 * - Hilton Honors
 * - Wyndham Rewards
 * - Radisson Rewards
 * - Shangri-La Circle
 * - Taj InnerCircle
 * - MGM Rewards
 * - Caesars Rewards
 * - Wynn Rewards
 * - Accor Live Limitless
 */
export const HOTEL_MEMBERSHIP_QUERY: PredicateQuery = {
  policy: {
    anyOf: [
      { check: { claim: 'membership.marriott', operator: 'isDefined' } },
      { check: { claim: 'membership.hilton', operator: 'isDefined' } },
      { check: { claim: 'membership.wyndham', operator: 'isDefined' } },
      { check: { claim: 'membership.radisson', operator: 'isDefined' } },
      { check: { claim: 'membership.shangri_la', operator: 'isDefined' } },
      { check: { claim: 'membership.taj_hotels', operator: 'isDefined' } },
      { check: { claim: 'membership.mgm_resorts', operator: 'isDefined' } },
      { check: { claim: 'membership.caesars', operator: 'isDefined' } },
      { check: { claim: 'membership.wynn_resorts', operator: 'isDefined' } },
      { check: { claim: 'membership.accor', operator: 'isDefined' } },
    ],
  },
};

/**
 * Check for casino/resort membership (MGM, Caesars, Wynn).
 */
export const CASINO_MEMBERSHIP_QUERY: PredicateQuery = {
  policy: {
    anyOf: [
      { check: { claim: 'membership.mgm_resorts', operator: 'isDefined' } },
      { check: { claim: 'membership.caesars', operator: 'isDefined' } },
      { check: { claim: 'membership.wynn_resorts', operator: 'isDefined' } },
    ],
  },
};

// ============================================================================
// Airline Membership Queries
// ============================================================================

/**
 * Check if user has ANY airline loyalty membership.
 * 
 * Airlines included:
 * - Delta SkyMiles
 * - Emirates Skywards
 * - AAdvantage (American Airlines)
 * - KrisFlyer (Singapore Airlines)
 * - Asia Miles (Cathay Pacific)
 * - SKYPASS (Korean Air)
 * - Etihad Guest
 * - Velocity Frequent Flyer (Virgin Australia)
 * - Royal Orchid Plus (Thai Airways)
 * - TrueBlue (JetBlue)
 * - Frontier Miles
 * - Free Spirit (Spirit Airlines)
 * - Miles & More (Lufthansa)
 * - Miles & Smiles (Turkish Airlines)
 * - Ryanair Membership
 */
export const AIRLINE_MEMBERSHIP_QUERY: PredicateQuery = {
  policy: {
    anyOf: [
      { check: { claim: 'membership.delta', operator: 'isDefined' } },
      { check: { claim: 'membership.emirates', operator: 'isDefined' } },
      { check: { claim: 'membership.american_airlines', operator: 'isDefined' } },
      { check: { claim: 'membership.singapore_airlines', operator: 'isDefined' } },
      { check: { claim: 'membership.cathay_pacific', operator: 'isDefined' } },
      { check: { claim: 'membership.korean_air', operator: 'isDefined' } },
      { check: { claim: 'membership.etihad', operator: 'isDefined' } },
      { check: { claim: 'membership.virgin_australia', operator: 'isDefined' } },
      { check: { claim: 'membership.thai_airways', operator: 'isDefined' } },
      { check: { claim: 'membership.jetblue', operator: 'isDefined' } },
      { check: { claim: 'membership.frontier_airlines', operator: 'isDefined' } },
      { check: { claim: 'membership.spirit_airlines', operator: 'isDefined' } },
      { check: { claim: 'membership.lufthansa', operator: 'isDefined' } },
      { check: { claim: 'membership.turkish_airlines', operator: 'isDefined' } },
      { check: { claim: 'membership.ryanair', operator: 'isDefined' } },
    ],
  },
};

/**
 * Check for premium airline memberships (Gulf carriers + Singapore).
 */
export const PREMIUM_AIRLINE_QUERY: PredicateQuery = {
  policy: {
    anyOf: [
      { check: { claim: 'membership.emirates', operator: 'isDefined' } },
      { check: { claim: 'membership.etihad', operator: 'isDefined' } },
      { check: { claim: 'membership.singapore_airlines', operator: 'isDefined' } },
      { check: { claim: 'membership.cathay_pacific', operator: 'isDefined' } },
    ],
  },
};

/**
 * Check for US airline memberships.
 */
export const US_AIRLINE_QUERY: PredicateQuery = {
  policy: {
    anyOf: [
      { check: { claim: 'membership.delta', operator: 'isDefined' } },
      { check: { claim: 'membership.american_airlines', operator: 'isDefined' } },
      { check: { claim: 'membership.jetblue', operator: 'isDefined' } },
      { check: { claim: 'membership.frontier_airlines', operator: 'isDefined' } },
      { check: { claim: 'membership.spirit_airlines', operator: 'isDefined' } },
    ],
  },
};

/**
 * Check for European airline memberships.
 */
export const EU_AIRLINE_QUERY: PredicateQuery = {
  policy: {
    anyOf: [
      { check: { claim: 'membership.lufthansa', operator: 'isDefined' } },
      { check: { claim: 'membership.turkish_airlines', operator: 'isDefined' } },
      { check: { claim: 'membership.ryanair', operator: 'isDefined' } },
    ],
  },
};

/**
 * Check for Asian airline memberships.
 */
export const ASIA_AIRLINE_QUERY: PredicateQuery = {
  policy: {
    anyOf: [
      { check: { claim: 'membership.singapore_airlines', operator: 'isDefined' } },
      { check: { claim: 'membership.cathay_pacific', operator: 'isDefined' } },
      { check: { claim: 'membership.korean_air', operator: 'isDefined' } },
      { check: { claim: 'membership.thai_airways', operator: 'isDefined' } },
    ],
  },
};

// ============================================================================
// Combined Travel Queries
// ============================================================================

/**
 * Frequent Traveler: Has BOTH hotel AND airline membership.
 */
export const FREQUENT_TRAVELER_QUERY: PredicateQuery = {
  policy: {
    allOf: [HOTEL_MEMBERSHIP_QUERY, AIRLINE_MEMBERSHIP_QUERY],
  },
};

/**
 * Premium Traveler: Has premium airline AND luxury hotel membership.
 */
export const PREMIUM_TRAVELER_QUERY: PredicateQuery = {
  policy: {
    allOf: [
      // Premium airlines
      {
        policy: {
          anyOf: [
            { check: { claim: 'membership.emirates', operator: 'isDefined' } },
            { check: { claim: 'membership.etihad', operator: 'isDefined' } },
            { check: { claim: 'membership.singapore_airlines', operator: 'isDefined' } },
          ],
        },
      },
      // Luxury hotels
      {
        policy: {
          anyOf: [
            { check: { claim: 'membership.marriott', operator: 'isDefined' } },
            { check: { claim: 'membership.hilton', operator: 'isDefined' } },
            { check: { claim: 'membership.shangri_la', operator: 'isDefined' } },
          ],
        },
      },
    ],
  },
};

/**
 * Has any travel membership (hotel OR airline).
 */
export const ANY_TRAVEL_MEMBERSHIP_QUERY: PredicateQuery = {
  policy: {
    anyOf: [HOTEL_MEMBERSHIP_QUERY, AIRLINE_MEMBERSHIP_QUERY],
  },
};

// ============================================================================
// App Configuration
// ============================================================================

/**
 * Scopes requested during OAuth flow.
 */
export const AUTH_SCOPES = [
  'openid',
  'profile.full',
  'data.read',
  'identity:read',
] as const;

/**
 * URL to redirect users who need to connect social accounts.
 */
export const HUMANITY_APP_URL = process.env.NEXT_PUBLIC_HUMANITY_APP_URL || 'https://app.humanity.org';
export const HUMANITY_DOCS_URL = process.env.NEXT_PUBLIC_HUMANITY_DOCS_URL || 'https://docs.humanity.org';
export const SOCIAL_CONNECTIONS_URL = `${HUMANITY_APP_URL}/social-connections`;

