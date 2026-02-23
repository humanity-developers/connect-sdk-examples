'use client'

import Link from 'next/link'
import { resolvePath } from '@/lib/paths'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { UseCaseCard, UseCaseData } from '@/components/UseCaseCard'
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Globe,
  Banknote,
  Vote,
  Gift,
  Sparkles,
  Plane,
  Building2,
  Coins,
  ChevronDown,
  ChevronUp,
  Zap,
  Code,
} from 'lucide-react'
import { useState } from 'react'
import { CodeBlock } from '@/components/CodeBlock'

// Use case definitions with code examples
const USE_CASES: UseCaseData[] = [
  {
    id: 'age-gated',
    title: 'Age-Gated Content',
    description:
      'Verify users are 18+ or 21+ without collecting their date of birth. Perfect for gaming, streaming, gambling, and adult content platforms.',
    icon: ShieldCheck,
    category: 'Compliance',
    presets: ['is_18_plus', 'is_21_plus'],
    sdkCode: `import { HumanitySDK } from '@humanity-org/connect-sdk';

const sdk = new HumanitySDK({
  clientId: process.env.HUMANITY_CLIENT_ID,
  redirectUri: process.env.HUMANITY_REDIRECT_URI,
});

// Verify user is 21+ for gambling/alcohol content
const ageResult = await sdk.verifyPreset({
  preset: 'is_21_plus',
  accessToken,
});

if (ageResult.value === true) {
  // User is verified 21+, grant access
  grantAccess();
} else {
  // User is under 21 or not verified
  showAgeRestrictionMessage();
}

// For 18+ content, use 'is_18_plus' preset
const adultResult = await sdk.verifyPreset({
  preset: 'is_18_plus',
  accessToken,
});`,
    curlCommand: `# Verify user is 21+
curl -X POST "https://api.humanity.org/presets/single" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "preset": "is_21_plus"
  }'

# Response:
# {
#   "preset": "is_21_plus",
#   "value": true,
#   "status": "valid",
#   "expires_at": "2025-01-15T00:00:00Z"
# }`,
  },
  {
    id: 'geo-targeting',
    title: 'Geo-Targeting',
    description:
      'Customize experiences by country of residence. Essential for fintechs with limited compliance, regional content licensing, and localized offerings.',
    icon: Globe,
    category: 'Compliance',
    presets: ['country_of_residence'],
    sdkCode: `import { HumanitySDK } from '@humanity-org/connect-sdk';

const sdk = new HumanitySDK({
  clientId: process.env.HUMANITY_CLIENT_ID,
  redirectUri: process.env.HUMANITY_REDIRECT_URI,
});

// Get user's verified country of residence
const countryResult = await sdk.verifyPreset({
  preset: 'country_of_residence',
  accessToken,
});

const userCountry = countryResult.value; // e.g., "US", "DE", "JP"

// Check if user is in allowed regions
const ALLOWED_COUNTRIES = ['US', 'CA', 'GB', 'DE', 'FR'];
if (ALLOWED_COUNTRIES.includes(userCountry)) {
  // User in supported region
  showFullFeatures();
} else {
  // User in unsupported region
  showLimitedFeatures();
}

// Use Query Engine for complex geo rules
const euQuery = {
  policy: {
    check: {
      claim: 'identity.country_of_residence',
      operator: 'in',
      value: ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'PT'],
    },
  },
};`,
    curlCommand: `# Get user's verified country of residence
curl -X POST "https://api.humanity.org/presets/single" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "preset": "country_of_residence"
  }'

# Response:
# {
#   "preset": "country_of_residence",
#   "value": "US",
#   "status": "valid"
# }

# Check if user is in EU using Query Engine
curl -X POST "https://api.humanity.org/query/evaluate" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": {
      "check": {
        "claim": "identity.country_of_residence",
        "operator": "in",
        "value": ["DE", "FR", "IT", "ES", "NL"]
      }
    }
  }'`,
  },
  {
    id: 'investor-profile',
    title: 'Investor Profile Check',
    description:
      'Verify net worth thresholds and KYC status for accredited investor checks. Perfect for RWA platforms and security token offerings.',
    icon: Banknote,
    category: 'Financial',
    presets: ['is_accredited_investor', 'kyc_passed', 'net_worth_above_100k'],
    sdkCode: `import { HumanitySDK } from '@humanity-org/connect-sdk';

const sdk = new HumanitySDK({
  clientId: process.env.HUMANITY_CLIENT_ID,
  redirectUri: process.env.HUMANITY_REDIRECT_URI,
});

// Batch verify investor qualifications
const investorChecks = await sdk.verifyPresets({
  accessToken,
  presets: [
    'is_accredited_investor',
    'kyc_passed',
  ],
});

const isAccredited = investorChecks.results.find(
  r => r.presetName === 'is_accredited_investor'
)?.value;

const kycPassed = investorChecks.results.find(
  r => r.presetName === 'kyc_passed'
)?.value;

if (isAccredited && kycPassed) {
  // User qualifies for security token purchase
  showSecurityTokenOffering();
} else if (kycPassed) {
  // User has KYC but not accredited
  showRetailOfferings();
} else {
  // User needs to complete KYC
  redirectToKycFlow();
}

// Check for qualified purchaser status (higher threshold)
const qpResult = await sdk.verifyPreset({
  preset: 'is_qualified_purchaser',
  accessToken,
});`,
    curlCommand: `# Batch verify investor qualifications
curl -X POST "https://api.humanity.org/presets/batch" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "presets": [
      "is_accredited_investor",
      "kyc_passed"
    ]
  }'

# Response:
# {
#   "results": [
#     { "presetName": "is_accredited_investor", "value": true, "status": "valid" },
#     { "presetName": "kyc_passed", "value": true, "status": "valid" }
#   ]
# }

# Check for qualified purchaser (higher threshold)
curl -X POST "https://api.humanity.org/presets/single" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "preset": "is_qualified_purchaser"
  }'`,
  },
  {
    id: 'one-person-one-vote',
    title: 'One-Person-One-Vote',
    description:
      'Ensure fair governance with sybil-resistant voting. Verify unique human identity and optionally filter by nationality for jurisdiction-specific governance.',
    icon: Vote,
    category: 'Governance',
    presets: ['is_human', 'nationality'],
    sdkCode: `import { HumanitySDK } from '@humanity-org/connect-sdk';

const sdk = new HumanitySDK({
  clientId: process.env.HUMANITY_CLIENT_ID,
  redirectUri: process.env.HUMANITY_REDIRECT_URI,
});

// Verify user is a unique human (palm verified)
const humanResult = await sdk.verifyPreset({
  preset: 'is_human',
  accessToken,
});

if (!humanResult.value) {
  throw new Error('Human verification required to vote');
}

// Get user's Humanity ID for deduplication
const userInfo = await sdk.getUserInfo({ accessToken });
const humanityId = userInfo.humanityUserId;

// Check if this human has already voted
const hasVoted = await checkVoteRecord(proposalId, humanityId);
if (hasVoted) {
  throw new Error('You have already voted on this proposal');
}

// Optional: Filter by nationality for jurisdiction
const nationalityResult = await sdk.verifyPreset({
  preset: 'nationality',
  accessToken,
});

if (nationalityResult.value === 'US') {
  // US citizen, eligible for US-specific governance
  await recordVote(proposalId, humanityId, voteChoice);
}`,
    curlCommand: `# Verify user is a unique human
curl -X POST "https://api.humanity.org/presets/single" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "preset": "is_human"
  }'

# Response:
# {
#   "preset": "is_human",
#   "value": true,
#   "status": "valid"
# }

# Get user's nationality for jurisdiction filtering
curl -X POST "https://api.humanity.org/presets/single" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "preset": "nationality"
  }'

# Get user info with unique Humanity ID
curl -X GET "https://api.humanity.org/userinfo" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Response includes humanityUserId for deduplication`,
  },
  {
    id: 'loyalty-programs',
    title: 'Loyalty Program Access',
    description:
      'Instant access to 25+ loyalty programs from airlines (Delta, Emirates), hotels (Marriott, Hilton), and casinos (MGM, Caesars). No BD calls required.',
    icon: Gift,
    category: 'Partnership',
    presets: ['Query Engine'],
    sdkCode: `import { HumanitySDK } from '@humanity-org/connect-sdk';

const sdk = new HumanitySDK({
  clientId: process.env.HUMANITY_CLIENT_ID,
  redirectUri: process.env.HUMANITY_REDIRECT_URI,
});

// Check for ANY airline membership (Delta, Emirates, etc.)
const airlineQuery = {
  policy: {
    anyOf: [
      { check: { claim: 'membership.delta', operator: 'isDefined' } },
      { check: { claim: 'membership.emirates', operator: 'isDefined' } },
      { check: { claim: 'membership.american_airlines', operator: 'isDefined' } },
      { check: { claim: 'membership.singapore_airlines', operator: 'isDefined' } },
      { check: { claim: 'membership.lufthansa', operator: 'isDefined' } },
    ],
  },
};

const airlineResult = await sdk.evaluatePredicateQuery({
  accessToken,
  query: airlineQuery,
});

// Check for hotel loyalty (Marriott, Hilton, etc.)
const hotelQuery = {
  policy: {
    anyOf: [
      { check: { claim: 'membership.marriott', operator: 'isDefined' } },
      { check: { claim: 'membership.hilton', operator: 'isDefined' } },
      { check: { claim: 'membership.mgm_resorts', operator: 'isDefined' } },
      { check: { claim: 'membership.caesars', operator: 'isDefined' } },
    ],
  },
};

// Frequent traveler = has BOTH airline AND hotel membership
const frequentTravelerQuery = {
  policy: {
    allOf: [airlineQuery, hotelQuery],
  },
};

const isFT = await sdk.evaluatePredicateQuery({
  accessToken,
  query: frequentTravelerQuery,
});

if (isFT.passed) {
  // Unlock exclusive travel perks
  showFrequentTravelerBenefits();
}`,
    curlCommand: `# Check for any airline loyalty membership
curl -X POST "https://api.humanity.org/query/evaluate" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": {
      "policy": {
        "anyOf": [
          { "check": { "claim": "membership.delta", "operator": "isDefined" } },
          { "check": { "claim": "membership.emirates", "operator": "isDefined" } },
          { "check": { "claim": "membership.marriott", "operator": "isDefined" } }
        ]
      }
    }
  }'

# Response:
# {
#   "passed": true,
#   "matchedClaims": ["membership.delta"]
# }

# Check for frequent traveler (hotel AND airline)
curl -X POST "https://api.humanity.org/query/evaluate" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": {
      "policy": {
        "allOf": [
          { "policy": { "anyOf": [
            { "check": { "claim": "membership.marriott", "operator": "isDefined" } },
            { "check": { "claim": "membership.hilton", "operator": "isDefined" } }
          ]}},
          { "policy": { "anyOf": [
            { "check": { "claim": "membership.delta", "operator": "isDefined" } },
            { "check": { "claim": "membership.emirates", "operator": "isDefined" } }
          ]}}
        ]
      }
    }
  }'`,
  },
]

// Comprehensive loyalty programs by category
const LOYALTY_CATEGORIES = [
  {
    id: 'airlines',
    name: 'Airlines',
    icon: Plane,
    description: '15 airline loyalty programs',
    programs: [
      'Delta SkyMiles',
      'Emirates Skywards',
      'American Airlines AAdvantage',
      'Singapore Airlines KrisFlyer',
      'Cathay Pacific Asia Miles',
      'Korean Air SKYPASS',
      'Etihad Guest',
      'Virgin Australia Velocity',
      'Thai Airways Royal Orchid Plus',
      'JetBlue TrueBlue',
      'Frontier Miles',
      'Spirit Free Spirit',
      'Lufthansa Miles & More',
      'Turkish Airlines Miles & Smiles',
      'Ryanair',
    ],
    initialShow: 5,
  },
  {
    id: 'hotels',
    name: 'Hotels',
    icon: Building2,
    description: '10 hotel loyalty programs',
    programs: [
      'Marriott Bonvoy',
      'Hilton Honors',
      'Wyndham Rewards',
      'Radisson Rewards',
      'Shangri-La Circle',
      'Taj InnerCircle',
      'Accor Live Limitless',
      'IHG One Rewards',
      'Hyatt World of Hyatt',
      'Choice Privileges',
    ],
    initialShow: 5,
  },
  {
    id: 'casinos',
    name: 'Casinos & Resorts',
    icon: Coins,
    description: '3 casino rewards programs',
    programs: ['MGM Rewards', 'Caesars Rewards', 'Wynn Rewards'],
    initialShow: 3,
  },
  {
    id: 'exchanges',
    name: 'Crypto Exchanges',
    icon: Coins,
    description: '2 exchange platforms',
    programs: ['Binance', 'OKX'],
    initialShow: 2,
  },
]

// Component for expandable category
function LoyaltyCategory({
  category,
}: {
  category: (typeof LOYALTY_CATEGORIES)[0]
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const Icon = category.icon
  const visiblePrograms = isExpanded
    ? category.programs
    : category.programs.slice(0, category.initialShow)
  const hasMore = category.programs.length > category.initialShow

  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h4 className="font-semibold text-sm">{category.name}</h4>
          <p className="text-xs text-muted-foreground">
            {category.description}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {visiblePrograms.map((program) => (
          <Badge
            key={program}
            variant="secondary"
            className="text-xs py-1 px-2"
          >
            {program}
          </Badge>
        ))}
        {hasMore && !isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            +{category.programs.length - category.initialShow} more
            <ChevronDown className="w-3 h-3" />
          </button>
        )}
        {hasMore && isExpanded && (
          <button
            onClick={() => setIsExpanded(false)}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            Show less
            <ChevronUp className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  )
}

// Component for collapsible SDK code examples
function LoyaltyCodeExamples() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="mt-8 border-t border-primary/10 pt-6">
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/5 transition-colors"
      >
        <Code className="w-4 h-4 text-primary" />
        <span className="font-medium text-sm">
          {isExpanded ? 'Hide SDK Query Examples' : 'Show SDK Query Examples'}
        </span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="mt-6 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className="text-xs">
              SDK
            </Badge>
            <span className="text-sm text-muted-foreground">
              Query loyalty program memberships with the SDK
            </span>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            {/* Example 1: Check specific membership */}
            <div className="border rounded-lg overflow-hidden bg-background">
              <div className="px-4 py-2 border-b bg-muted/50">
                <p className="text-sm font-medium">
                  Check for Delta SkyMiles membership
                </p>
              </div>
              <CodeBlock
                code={`// Check if user has Delta SkyMiles
const query = {
  check: {
    claim: 'membership.delta',
    operator: 'isDefined'
  }
};

const result = await sdk.evaluatePredicateQuery({
  accessToken,
  query
});

if (result.passed) {
  // User has Delta membership
  unlockFlightPerks();
}`}
                language="typescript"
                showCopy={true}
              />
            </div>

            {/* Example 2: Check ANY hotel membership */}
            <div className="border rounded-lg overflow-hidden bg-background">
              <div className="px-4 py-2 border-b bg-muted/50">
                <p className="text-sm font-medium">
                  Check for any hotel loyalty program
                </p>
              </div>
              <CodeBlock
                code={`// Check for ANY hotel membership
const hotelQuery = {
  policy: {
    anyOf: [
      { check: { claim: 'membership.marriott', operator: 'isDefined' } },
      { check: { claim: 'membership.hilton', operator: 'isDefined' } },
      { check: { claim: 'membership.hyatt', operator: 'isDefined' } },
      { check: { claim: 'membership.ihg', operator: 'isDefined' } },
    ]
  }
};

const result = await sdk.evaluatePredicateQuery({
  accessToken,
  query: hotelQuery
});
// result.passed = true if user has any hotel membership`}
                language="typescript"
                showCopy={true}
              />
            </div>

            {/* Example 3: Frequent traveler (hotel + airline) */}
            <div className="border rounded-lg overflow-hidden bg-background">
              <div className="px-4 py-2 border-b bg-muted/50">
                <p className="text-sm font-medium">
                  Frequent Traveler: hotel AND airline
                </p>
              </div>
              <CodeBlock
                code={`// Frequent Traveler = Hotel AND Airline membership
const frequentTravelerQuery = {
  policy: {
    allOf: [
      // Must have a hotel membership
      { policy: { anyOf: [
        { check: { claim: 'membership.marriott', operator: 'isDefined' } },
        { check: { claim: 'membership.hilton', operator: 'isDefined' } },
      ]}},
      // AND must have an airline membership
      { policy: { anyOf: [
        { check: { claim: 'membership.delta', operator: 'isDefined' } },
        { check: { claim: 'membership.emirates', operator: 'isDefined' } },
      ]}}
    ]
  }
};

// Single API call returns true/false
const isFT = await sdk.evaluatePredicateQuery({
  accessToken, query: frequentTravelerQuery
});`}
                language="typescript"
                showCopy={true}
              />
            </div>

            {/* Example 4: Casino high roller */}
            <div className="border rounded-lg overflow-hidden bg-background">
              <div className="px-4 py-2 border-b bg-muted/50">
                <p className="text-sm font-medium">Casino rewards member</p>
              </div>
              <CodeBlock
                code={`// Check for casino/resort memberships
const casinoQuery = {
  policy: {
    anyOf: [
      { check: { claim: 'membership.mgm_resorts', operator: 'isDefined' } },
      { check: { claim: 'membership.caesars', operator: 'isDefined' } },
      { check: { claim: 'membership.wynn_resorts', operator: 'isDefined' } },
    ]
  }
};

const result = await sdk.evaluatePredicateQuery({
  accessToken,
  query: casinoQuery
});

if (result.passed) {
  // Show exclusive gaming offers
  showCasinoPerks();
}`}
                language="typescript"
                showCopy={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function UseCasesContent() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href={resolvePath('/')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Demo</span>
            </Link>
            <a
              href="http://docs.humanity.org/build-with-humanity/build-with-the-sdk-api/sdk-oauth-scopes-and-presets"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="gap-2">
                Full Preset List
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <Badge variant="outline" className="mb-4 gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            Mini Cookbook
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
            What You Can Build with the Humanity SDK
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-8">
            This demo uses email and social accounts to personalize your feed.
            But that&apos;s just the start.{' '}
            <span className="text-foreground font-medium">
              Humanity has 30+ presets
            </span>{' '}
            covering identity, age, KYC, and financial data.{' '}
            <span className="text-foreground font-medium">
              Instant access to 25+ loyalty programs
            </span>{' '}
            from airlines, hotels, and casinos.{' '}
            <span className="text-primary font-medium">
              No BD calls required.
            </span>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://docs.humanity.org/build-with-humanity-protocol/build-with-the-sdk-api/sdk-quickstart"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="gap-2">
                Start Building
                <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
            <a
              href="http://docs.humanity.org/build-with-humanity/build-with-the-sdk-api/sdk-oauth-scopes-and-presets"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="gap-2">
                View All 30+ Presets
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </section>

        {/* Loyalty Programs Highlight */}
        <section className="mb-16">
          <Card className="p-6 bg-gradient-to-br from-primary/5 via-background to-primary/10 border-primary/20">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Gift className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">
                  30+ Loyalty Programs Pre-Integrated
                </h2>
              </div>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Access user memberships from major airlines, hotels, casinos,
                and exchanges via Reclaim integration.{' '}
                <span className="text-primary font-medium">
                  No BD calls required.
                </span>
              </p>
            </div>

            {/* Value Proposition */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-primary" />
                <span>Instant verification</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-primary" />
                <span>No API keys needed</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-primary" />
                <span>User-consented data</span>
              </div>
            </div>

            {/* Categorized Programs Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {LOYALTY_CATEGORIES.map((category) => (
                <LoyaltyCategory key={category.id} category={category} />
              ))}
            </div>

            {/* SDK Query Examples */}
            <LoyaltyCodeExamples />

            {/* CTA */}
            <div className="mt-8 text-center">
              <a
                href="http://docs.humanity.org/build-with-humanity/build-with-the-sdk-api/sdk-oauth-scopes-and-presets"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="gap-2">
                  View Full Integration Guide
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </a>
            </div>
          </Card>
        </section>

        {/* Use Case Cards */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-2 text-center">Use Cases</h2>
          <p className="text-muted-foreground text-center mb-8">
            Click &quot;View Code&quot; to see SDK examples and cURL commands
          </p>
          <div className="grid gap-6">
            {USE_CASES.map((useCase) => (
              <UseCaseCard key={useCase.id} useCase={useCase} />
            ))}
          </div>
        </section>

        {/* Footer CTA */}
        <section className="text-center border-t pt-12">
          <h2 className="text-xl font-bold mb-4">Ready to Build?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Get started with the Humanity SDK in minutes. Full documentation,
            code examples, and support available.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://docs.humanity.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="gap-2">
                Read the Docs
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
            <a
              href="https://github.com/humanity-developers/connect-sdk-examples"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="gap-2">
                View Examples on GitHub
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </section>
      </main>
    </div>
  )
}
