'use client';

import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CodeBlock } from '@/components/CodeBlock';
import Link from 'next/link';
import { resolvePath } from '@/lib/paths';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ArrowRight, 
  ArrowLeft,
  Lock,
  Key,
  User,
  Database,
  Zap,
  Check,
  Server,
  Globe,
  Shield,
  Plane,
  Building2,
  Newspaper,
  Code,
  ChevronRight,
  X,
  HelpCircle,
  Sparkles,
  Copy,
  Terminal
} from 'lucide-react';

// Generate curl command from step data
function generateCurlCommand(step: FlowStep): string {
  if (!step.endpoint) {
    return '# No API endpoint for this step';
  }
  
  const baseUrl = 'https://api.humanity.org';
  const method = step.method || 'GET';
  
  let curl = `curl -X ${method} "${baseUrl}${step.endpoint}"`;
  
  // Add headers
  curl += ` \\\n  -H "Content-Type: application/json"`;
  curl += ` \\\n  -H "Authorization: Bearer $ACCESS_TOKEN"`;
  
  // Add request body for POST requests
  if (step.request && method === 'POST') {
    const body = JSON.stringify(step.request, null, 2)
      .split('\n')
      .map((line, i) => i === 0 ? line : '     ' + line)
      .join('\n');
    curl += ` \\\n  -d '${body}'`;
  }
  
  return curl;
}

// Flow step definitions
interface FlowStep {
  id: string;
  phase: 'oauth' | 'presets' | 'query_engine' | 'app_logic';
  title: string;
  description: string;
  useCases?: string[];  // Examples of how this can be used in other apps
  actor: 'user' | 'app' | 'humanity';
  endpoint?: string;
  method?: string;
  request?: object;
  response?: object;
  code?: string;
}

const FLOW_STEPS: FlowStep[] = [
  // OAuth Phase
  {
    id: 'oauth-1',
    phase: 'oauth',
    title: 'User clicks "Sign in with Humanity"',
    description: 'The authentication flow begins when the user initiates login.',
    actor: 'user',
  },
  {
    id: 'oauth-2',
    phase: 'oauth',
    title: 'App generates PKCE challenge',
    description: 'The app creates a code_verifier and code_challenge for secure OAuth.',
    actor: 'app',
    code: `const { state, codeVerifier, codeChallenge } = 
  HumanitySDK.generatePKCE();

// Store in session cookie
saveOAuthSession({ state, codeVerifier });`,
  },
  {
    id: 'oauth-3',
    phase: 'oauth',
    title: 'Redirect to Humanity Protocol',
    description: 'User is redirected to Humanity\'s authorization endpoint.',
    actor: 'app',
    endpoint: '/oauth/authorize',
    method: 'GET',
    request: {
      client_id: 'your_client_id',
      redirect_uri: 'https://app.com/callback',
      response_type: 'code',
      scope: 'openid profile.full data.read',
      state: 'random_state',
      code_challenge: 'pkce_challenge',
      code_challenge_method: 'S256',
    },
  },
  {
    id: 'oauth-4',
    phase: 'oauth',
    title: 'User authenticates',
    description: 'User logs in and consents to sharing data with the app.',
    actor: 'humanity',
  },
  {
    id: 'oauth-5',
    phase: 'oauth',
    title: 'Callback with authorization code',
    description: 'Humanity redirects back to app with an authorization code.',
    actor: 'humanity',
    endpoint: '/callback',
    method: 'GET',
    request: {
      code: 'authorization_code',
      state: 'random_state',
    },
  },
  {
    id: 'oauth-6',
    phase: 'oauth',
    title: 'Exchange code for tokens',
    description: 'App exchanges the authorization code for access and ID tokens. The access token enables API calls to Humanity Protocol.',
    useCases: [
      'Any app: Required for all Humanity Protocol integrations',
      'Identity: Prove user identity without passwords',
      'SSO: Single sign-on across Humanity Protocol apps',
      'Privacy: No need to store user passwords',
    ],
    actor: 'app',
    endpoint: '/oauth/token',
    method: 'POST',
    request: {
      grant_type: 'authorization_code',
      code: 'authorization_code',
      code_verifier: 'pkce_verifier',
      client_id: 'your_client_id',
      redirect_uri: 'https://app.com/callback',
    },
    response: {
      access_token: 'eyJhbGciOiJS...',
      token_type: 'Bearer',
      expires_in: 3600,
      id_token: 'eyJhbGciOiJS...',
      scope: 'openid profile.full data.read',
    },
    code: `const tokens = await sdk.exchangeCodeForToken({
  code,
  codeVerifier: session.codeVerifier,
});

// tokens.accessToken is now available`,
  },

  // =========================================================================
  // PRESETS PHASE
  // Simple boolean checks for verified user attributes.
  // Presets are pre-defined queries that return true/false or a value.
  // =========================================================================
  {
    id: 'presets-1',
    phase: 'presets',
    title: 'Verify email preset',
    description: 'Fetch user\'s verified email address using the email preset. Presets are simple, pre-defined checks that return a value or boolean.',
    useCases: [
      'Newsletter apps: Send personalized emails',
      'E-commerce: Order confirmations and receipts',
      'SaaS: Account-based communication',
      'Marketing: Personalized campaigns',
    ],
    actor: 'app',
    endpoint: '/presets/single',
    method: 'POST',
    request: {
      preset: 'email',
    },
    response: {
      preset: 'email',
      value: 'user@example.com',
      status: 'valid',
    },
    code: `// PRESETS: Simple, pre-defined checks
// Returns a value (email) or boolean (connected)

const emailResult = await sdk.verifyPreset({
  preset: 'email',
  accessToken,
});

const email = emailResult.value;
// → "user@example.com"`,
  },
  {
    id: 'presets-2',
    phase: 'presets',
    title: 'Batch verify social presets',
    description: 'Check which social accounts are linked in a single batch request. Each social has a dedicated preset returning true/false.',
    useCases: [
      'Social apps: Show connected platforms',
      'Gaming: Verify Discord/Telegram account ownership',
      'Professional networks: LinkedIn integration',
      'Developer tools: GitHub identity verification',
      'Content platforms: Cross-posting capabilities',
    ],
    actor: 'app',
    endpoint: '/presets/batch',
    method: 'POST',
    request: {
      presets: [
        'google_connected',
        'linkedin_connected',
        'twitter_connected',
        'discord_connected',
        'github_connected',
        'telegram_connected',
      ],
    },
    response: {
      results: [
        { presetName: 'google_connected', value: true },
        { presetName: 'linkedin_connected', value: true },
        { presetName: 'twitter_connected', value: false },
        { presetName: 'discord_connected', value: true },
        { presetName: 'github_connected', value: true },
        { presetName: 'telegram_connected', value: false },
      ],
    },
    code: `// BATCH PRESETS: Multiple checks in one request
// Efficient for checking many simple conditions

const socials = await sdk.verifyPresets({
  accessToken,
  presets: [
    'google_connected',    // → true/false
    'linkedin_connected',  // → true/false
    'twitter_connected',   // → true/false
    'discord_connected',   // → true/false
    'github_connected',    // → true/false
    'telegram_connected',  // → true/false
  ],
});

// Filter to get only connected socials
const connected = socials.results
  .filter(r => r.value === true)
  .map(r => r.presetName);`,
  },

  // =========================================================================
  // QUERY ENGINE PHASE
  // Complex conditional logic with anyOf, allOf, comparisons.
  // Build custom policies beyond simple presets.
  // =========================================================================
  {
    id: 'query-1',
    phase: 'query_engine',
    title: 'Query Engine: Hotel membership',
    description: 'Use the Query Engine to check if user has ANY hotel loyalty membership. Unlike presets, Query Engine supports complex logic with anyOf/allOf operators.',
    useCases: [
      'Travel apps: Unlock premium features for loyalty members',
      'Booking platforms: Show exclusive rates',
      'Credit cards: Verify travel benefits eligibility',
      'Insurance: Travel insurance personalization',
    ],
    actor: 'app',
    endpoint: '/query/evaluate',
    method: 'POST',
    request: {
      query: {
        policy: {
          anyOf: [
            { check: { claim: 'membership.marriott', operator: 'isDefined' } },
            { check: { claim: 'membership.hilton', operator: 'isDefined' } },
            { check: { claim: 'membership.accor', operator: 'isDefined' } },
          ],
        },
      },
    },
    response: {
      passed: true,
      matchedClaims: ['membership.marriott'],
    },
    code: `// QUERY ENGINE: Complex conditional logic
// anyOf = OR operator (any condition must pass)
// allOf = AND operator (all conditions must pass)

const hotelQuery = {
  policy: {
    anyOf: [  // User has ANY of these
      { check: { claim: 'membership.marriott', operator: 'isDefined' } },
      { check: { claim: 'membership.hilton', operator: 'isDefined' } },
      { check: { claim: 'membership.accor', operator: 'isDefined' } },
      { check: { claim: 'membership.ihg', operator: 'isDefined' } },
    ],
  },
};

const result = await sdk.evaluatePredicateQuery({
  accessToken,
  query: hotelQuery,
});

// Returns { passed: true/false, matchedClaims: [...] }
const hasHotelMembership = result.passed;`,
  },
  {
    id: 'query-2',
    phase: 'query_engine',
    title: 'Query Engine: Airline membership',
    description: 'Check if user has ANY airline loyalty membership. The Query Engine evaluates complex policies without exposing raw claim data.',
    useCases: [
      'Airlines: Partner benefits and upgrades',
      'Travel agencies: Personalized flight recommendations',
      'Airport lounges: Access verification',
      'Expense apps: Business travel categorization',
    ],
    actor: 'app',
    endpoint: '/query/evaluate',
    method: 'POST',
    request: {
      query: {
        policy: {
          anyOf: [
            { check: { claim: 'membership.delta', operator: 'isDefined' } },
            { check: { claim: 'membership.emirates', operator: 'isDefined' } },
            { check: { claim: 'membership.united', operator: 'isDefined' } },
          ],
        },
      },
    },
    response: {
      passed: true,
      matchedClaims: ['membership.delta'],
    },
    code: `// Another anyOf query for airline memberships
const airlineQuery = {
  policy: {
    anyOf: [
      { check: { claim: 'membership.delta', operator: 'isDefined' } },
      { check: { claim: 'membership.emirates', operator: 'isDefined' } },
      { check: { claim: 'membership.united', operator: 'isDefined' } },
      { check: { claim: 'membership.american', operator: 'isDefined' } },
    ],
  },
};

const result = await sdk.evaluatePredicateQuery({
  accessToken,
  query: airlineQuery,
});

const hasAirlineMembership = result.passed;`,
  },
  {
    id: 'query-3',
    phase: 'query_engine',
    title: 'Combine queries with allOf',
    description: 'Combine multiple queries with allOf to require ALL conditions. This creates a "frequent traveler" profile requiring both hotel AND airline memberships.',
    useCases: [
      'Premium tiers: Combine multiple signals for VIP status',
      'Risk assessment: Multiple verification factors',
      'Loyalty programs: Cross-brand partnerships',
      'Access control: Multi-factor attribute verification',
    ],
    actor: 'app',
    code: `// NESTED QUERIES: Combine with allOf (AND logic)
// Frequent traveler = Hotel AND Airline memberships

const frequentTravelerQuery = {
  policy: {
    allOf: [  // ALL conditions must pass
      {
        policy: {
          anyOf: [  // Has ANY hotel membership
            { check: { claim: 'membership.marriott', operator: 'isDefined' } },
            { check: { claim: 'membership.hilton', operator: 'isDefined' } },
          ],
        },
      },
      {
        policy: {
          anyOf: [  // AND has ANY airline membership
            { check: { claim: 'membership.delta', operator: 'isDefined' } },
            { check: { claim: 'membership.emirates', operator: 'isDefined' } },
          ],
        },
      },
    ],
  },
};

// Single query replaces multiple API calls
const result = await sdk.evaluatePredicateQuery({
  accessToken,
  query: frequentTravelerQuery,
});

const isFrequentTraveler = result.passed;`,
  },
  {
    id: 'query-4',
    phase: 'query_engine',
    title: 'Query Engine operators',
    description: 'The Query Engine supports various operators for flexible conditions: isDefined, equals, in, greaterThan, lessThan, contains, matchRegex.',
    useCases: [
      'Age verification: greaterThan for 18+/21+ checks',
      'Geographic restrictions: in for country lists',
      'Tier verification: equals for specific levels',
      'Email domain: matchRegex for @company.com verification',
    ],
    actor: 'app',
    code: `// AVAILABLE OPERATORS:
// isDefined  - Claim exists (any value)
// equals     - Exact match
// in         - Value in array
// greaterThan / lessThan - Numeric comparisons
// contains   - String contains
// matchRegex - Pattern matching

// Example: Premium hotel member (specific tiers)
const premiumMemberQuery = {
  policy: {
    anyOf: [
      {
        check: {
          claim: 'membership.marriott.tier',
          operator: 'in',
          value: ['Platinum', 'Titanium', 'Ambassador'],
        },
      },
      {
        check: {
          claim: 'membership.hilton.tier',
          operator: 'in',
          value: ['Diamond'],
        },
      },
    ],
  },
};

// Example: Age verification
const ageQuery = {
  policy: {
    allOf: [
      { check: { claim: 'identity.age', operator: 'greaterThan', value: 21 } },
    ],
  },
};`,
  },

  // App Logic Phase
  {
    id: 'app-1',
    phase: 'app_logic',
    title: 'Build user profile',
    description: 'Combine all verified data into a user profile. This is where you merge Presets and Query Engine results.',
    useCases: [
      'Personalization: Tailor experience based on verified signals',
      'Access control: Gate features by verified attributes',
      'Onboarding: Pre-fill forms with verified data',
      'Analytics: Segment users by verified attributes',
    ],
    actor: 'app',
    code: `const userProfile = {
  email,
  linkedSocials: connected,
  travelProfile: {
    hasHotelMembership,
    hasAirlineMembership,
    isFrequentTraveler,
  },
};`,
  },
  {
    id: 'app-2',
    phase: 'app_logic',
    title: 'Store user in database',
    description: 'Create or update user record with verified data.',
    actor: 'app',
    code: `await upsertUser({
  humanityUserId: userData.humanityUserId,
  appScopedUserId: userData.appScopedUserId,
  email: userData.email,
  linkedSocials: userData.linkedSocials,
  presets: userData.presets,
});`,
  },
  {
    id: 'app-3',
    phase: 'app_logic',
    title: 'Issue app session token',
    description: 'Create app-specific JWT with user claims for session.',
    actor: 'app',
    code: `const appToken = await authService.issueAppToken(
  user,
  userData.travelProfile
);

// Save session cookie
saveAppSession({
  appToken: appToken.token,
  userId: appToken.payload.appScopedUserId,
  linkedSocials: appToken.payload.linkedSocials,
  presets: appToken.payload.presets,
});`,
  },
  {
    id: 'app-4',
    phase: 'app_logic',
    title: 'Derive content labels',
    description: 'Map signals to content categories for personalization. Transform raw data into user-friendly labels.',
    useCases: [
      'E-commerce: "Member discount eligible"',
      'Travel sites: "Frequent flyer perks unlocked"',
      'Content platforms: "Tech-savvy reader"',
      'Loyalty programs: "Gold tier benefits"',
    ],
    actor: 'app',
    code: `const derivedLabels = getDerivedLabels(
  session.linkedSocials,
  session.presets
);

// Example output:
// [
//   { id: 'tech_enthusiast', label: 'Tech Enthusiast', signal: 'github' },
//   { id: 'professional', label: 'Professional', signal: 'linkedin' },
//   { id: 'travel_friendly', label: 'Travel-friendly', signal: 'travel_presets' },
// ]`,
  },
  {
    id: 'app-5',
    phase: 'app_logic',
    title: 'Query personalized feed',
    description: 'Fetch articles matching user\'s signals.',
    actor: 'app',
    code: `const { articles } = await getNewsForUser(
  user,
  limit,
  skip
);

// Articles are filtered by:
// - User's connected socials
// - Active presets (travel, etc.)
// - General content as fallback`,
  },
  {
    id: 'app-6',
    phase: 'app_logic',
    title: 'Render personalized feed',
    description: 'Display articles with derived labels and recommendations.',
    actor: 'app',
  },
];

// Phase colors and icons
const PHASE_CONFIG = {
  oauth: {
    color: 'bg-blue-500',
    lightColor: 'bg-blue-500/20',
    textColor: 'text-blue-400',
    borderColor: 'border-blue-500/50',
    icon: Lock,
    label: 'OAuth',
    description: 'Authentication & token exchange',
    longDescription: 'Standard OAuth 2.0 + PKCE flow to authenticate users and obtain access tokens.',
  },
  presets: {
    color: 'bg-green-500',
    lightColor: 'bg-green-500/20',
    textColor: 'text-green-400',
    borderColor: 'border-green-500/50',
    icon: Shield,
    label: 'Presets',
    description: 'Simple boolean checks',
    longDescription: 'Pre-defined queries for common checks. Returns true/false or a single value. Fast and simple.',
  },
  query_engine: {
    color: 'bg-purple-500',
    lightColor: 'bg-purple-500/20',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/50',
    icon: Database,
    label: 'Query Engine',
    description: 'Complex conditional logic',
    longDescription: 'Build custom policies with anyOf/allOf operators. Combine multiple conditions without exposing raw data.',
  },
  app_logic: {
    color: 'bg-orange-500',
    lightColor: 'bg-orange-500/20',
    textColor: 'text-orange-400',
    borderColor: 'border-orange-500/50',
    icon: Zap,
    label: 'App Logic',
    description: 'Process & personalize',
    longDescription: 'Your application logic that uses verified data to personalize the user experience.',
  },
};

const ACTOR_CONFIG = {
  user: { icon: User, label: 'User', color: 'text-purple-400' },
  app: { icon: Server, label: 'Newsletter App', color: 'text-humanity-lime' },
  humanity: { icon: Globe, label: 'Humanity Protocol', color: 'text-blue-400' },
};

// Curl copy button component
function CurlCopyButton({ curlCommand }: { curlCommand: string }) {
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [curlCommand]);

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? 'Hide' : 'Preview'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-6 text-xs gap-1"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Terminal className="w-3 h-3" />
              Copy curl
            </>
          )}
        </Button>
      </div>
      {showPreview && (
        <div className="absolute right-0 top-8 z-10 w-[400px] max-w-[90vw]">
          <pre className="text-[10px] bg-black p-3 rounded border border-foreground/20 overflow-x-auto whitespace-pre-wrap text-green-400 shadow-lg">
            {curlCommand}
          </pre>
        </div>
      )}
    </div>
  );
}

export function FlowExplainer() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCode, setShowCode] = useState(true);
  const [showComparison, setShowComparison] = useState(false);

  const step = FLOW_STEPS[currentStep];
  const isPresetsOrQueryPhase = step.phase === 'presets' || step.phase === 'query_engine';
  const phaseConfig = PHASE_CONFIG[step.phase];
  const actorConfig = ACTOR_CONFIG[step.actor];
  const PhaseIcon = phaseConfig.icon;
  const ActorIcon = actorConfig.icon;

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return;
    
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= FLOW_STEPS.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [isPlaying]);

  const handlePrev = () => {
    setIsPlaying(false);
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setIsPlaying(false);
    setCurrentStep((prev) => Math.min(FLOW_STEPS.length - 1, prev + 1));
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const handleStepClick = (index: number) => {
    setIsPlaying(false);
    setCurrentStep(index);
  };

  // Group steps by phase
  const phaseSteps = {
    oauth: FLOW_STEPS.filter((s) => s.phase === 'oauth'),
    presets: FLOW_STEPS.filter((s) => s.phase === 'presets'),
    query_engine: FLOW_STEPS.filter((s) => s.phase === 'query_engine'),
    app_logic: FLOW_STEPS.filter((s) => s.phase === 'app_logic'),
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Auth Flow Explainer</h1>
              <p className="text-sm text-muted-foreground">
                OAuth → Presets → Query Engine → App Logic
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href={resolvePath('/feed')}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Feed
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Phase Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Object.entries(PHASE_CONFIG).map(([phase, config]) => {
            const Icon = config.icon;
            const isActive = step.phase === phase;
            const phaseIndex = Object.keys(PHASE_CONFIG).indexOf(phase);
            const currentPhaseIndex = Object.keys(PHASE_CONFIG).indexOf(step.phase);
            const isCompleted = phaseIndex < currentPhaseIndex;

            return (
              <Card
                key={phase}
                className={`p-4 transition-all duration-300 ${
                  isActive
                    ? `${config.borderColor} border-2 ${config.lightColor}`
                    : isCompleted
                    ? 'border-humanity-lime/30 bg-humanity-lime/5'
                    : 'border-foreground/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isActive ? config.color : isCompleted ? 'bg-humanity-lime' : 'bg-foreground/10'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5 text-black" />
                    ) : (
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
                    )}
                  </div>
                  <div>
                    <h3 className={`font-bold ${isActive ? config.textColor : ''}`}>
                      {config.label}
                    </h3>
                    <p className="text-xs text-muted-foreground">{config.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Flow Arrows */}
        <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
          <div className="flex items-center gap-1 text-blue-400">
            <Lock className="w-4 h-4" />
            <span className="text-xs font-medium">OAuth</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <div className="flex items-center gap-1 text-green-400">
            <Shield className="w-4 h-4" />
            <span className="text-xs font-medium">Presets</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <div className="flex items-center gap-1 text-purple-400">
            <Database className="w-4 h-4" />
            <span className="text-xs font-medium">Query Engine</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <div className="flex items-center gap-1 text-orange-400">
            <Zap className="w-4 h-4" />
            <span className="text-xs font-medium">App Logic</span>
          </div>
        </div>

        {/* Comparison Popup Button - Only shows on Presets/Query Engine phases */}
        {isPresetsOrQueryPhase && (
          <div className="flex justify-center mb-6">
            <Button
              onClick={() => setShowComparison(true)}
              className="bg-gradient-to-r from-green-500 to-purple-500 text-white hover:from-green-600 hover:to-purple-600 animate-pulse hover:animate-none gap-2 shadow-lg shadow-purple-500/25"
            >
              <Sparkles className="w-4 h-4" />
              Compare: Presets vs Query Engine
              <HelpCircle className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Presets vs Query Engine Comparison Modal */}
        {showComparison && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowComparison(false)}
            />
            
            {/* Modal Content */}
            <Card className="relative z-10 p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-gradient-to-r from-green-500/10 via-background to-purple-500/10 border-2 border-foreground/20 animate-in fade-in zoom-in-95 duration-200">
              {/* Close Button */}
              <button
                onClick={() => setShowComparison(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-foreground/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-bold text-center mb-6 text-xl">Presets vs Query Engine: When to Use Each</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Presets Column */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-green-400">Presets</h4>
                      <p className="text-xs text-muted-foreground">Simple, pre-defined checks</p>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Single value returns</span>
                        <p className="text-xs text-muted-foreground">email → &quot;user@example.com&quot;</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Boolean checks</span>
                        <p className="text-xs text-muted-foreground">google_connected → true/false</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Batch support</span>
                        <p className="text-xs text-muted-foreground">Check multiple presets in one call</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Fastest execution</span>
                        <p className="text-xs text-muted-foreground">Simple lookups, minimal overhead</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded border border-green-500/20 mt-4">
                    <code className="text-xs text-green-400">
                      sdk.verifyPreset({`{ preset: 'email' }`})
                    </code>
                  </div>
                </div>

                {/* Query Engine Column */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                      <Database className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-purple-400">Query Engine</h4>
                      <p className="text-xs text-muted-foreground">Complex conditional logic</p>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">anyOf (OR logic)</span>
                        <p className="text-xs text-muted-foreground">Has Marriott OR Hilton OR Accor</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">allOf (AND logic)</span>
                        <p className="text-xs text-muted-foreground">Has hotel AND airline membership</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Rich operators</span>
                        <p className="text-xs text-muted-foreground">equals, in, greaterThan, matchRegex...</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium">Privacy preserving</span>
                        <p className="text-xs text-muted-foreground">Returns passed/failed, not raw data</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-purple-500/10 rounded border border-purple-500/20 mt-4">
                    <code className="text-xs text-purple-400">
                      sdk.evaluatePredicateQuery({`{ query: { policy: { anyOf: [...] } } }`})
                    </code>
                  </div>
                </div>
              </div>

              {/* Close hint */}
              <p className="text-center text-xs text-muted-foreground mt-6">
                Click outside or press X to close
              </p>
            </Card>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Timeline */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Flow Timeline
              </h3>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-1">
                  {Object.entries(phaseSteps).map(([phase, steps]) => (
                    <div key={phase} className="mb-4">
                      <div
                        className={`text-xs font-bold uppercase tracking-wider mb-2 ${
                          PHASE_CONFIG[phase as keyof typeof PHASE_CONFIG].textColor
                        }`}
                      >
                        {PHASE_CONFIG[phase as keyof typeof PHASE_CONFIG].label}
                      </div>
                      {steps.map((s, idx) => {
                        const globalIndex = FLOW_STEPS.indexOf(s);
                        const isActive = globalIndex === currentStep;
                        const isCompleted = globalIndex < currentStep;
                        const config = PHASE_CONFIG[s.phase];

                        return (
                          <button
                            key={s.id}
                            onClick={() => handleStepClick(globalIndex)}
                            className={`w-full text-left p-2 rounded transition-all ${
                              isActive
                                ? `${config.lightColor} ${config.borderColor} border`
                                : isCompleted
                                ? 'bg-foreground/5'
                                : 'hover:bg-foreground/5'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                  isActive
                                    ? config.color + ' text-white'
                                    : isCompleted
                                    ? 'bg-humanity-lime text-black'
                                    : 'bg-foreground/10 text-muted-foreground'
                                }`}
                              >
                                {isCompleted ? <Check className="w-3 h-3" /> : globalIndex + 1}
                              </div>
                              <span
                                className={`text-xs ${
                                  isActive ? 'font-medium' : 'text-muted-foreground'
                                }`}
                              >
                                {s.title}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </div>

          {/* Current Step Detail */}
          <div className="lg:col-span-2">
            <Card className={`p-6 ${phaseConfig.borderColor} border-2`}>
              {/* Step Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={`${phaseConfig.lightColor} ${phaseConfig.textColor} border ${phaseConfig.borderColor}`}>
                      {phaseConfig.label}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <ActorIcon className={`w-3 h-3 ${actorConfig.color}`} />
                      {actorConfig.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Step {currentStep + 1} of {FLOW_STEPS.length}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold">{step.title}</h2>
                  <p className="text-muted-foreground mt-1">{step.description}</p>
                </div>
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center ${phaseConfig.color} animate-pulse`}
                >
                  <PhaseIcon className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* API Endpoint */}
              {step.endpoint && (
                <div className="mb-4 p-3 bg-black/30 rounded border border-foreground/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      className={
                        step.method === 'GET'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-green-500/20 text-green-400'
                      }
                    >
                      {step.method}
                    </Badge>
                    <code className="text-sm font-mono">{step.endpoint}</code>
                  </div>
                </div>
              )}

              {/* Request/Response */}
              {(step.request || step.response) && (
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  {step.request && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                        Request
                      </h4>
                      <pre className="text-xs bg-black/30 p-3 rounded overflow-x-auto border border-foreground/10">
                        {JSON.stringify(step.request, null, 2)}
                      </pre>
                    </div>
                  )}
                  {step.response && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                        Response
                      </h4>
                      <pre className="text-xs bg-black/30 p-3 rounded overflow-x-auto border border-foreground/10">
                        {JSON.stringify(step.response, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* Code Example with Syntax Highlighting */}
              {step.code && showCode && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Code className="w-3 h-3" />
                      SDK Code
                    </h4>
                  </div>
                  <CodeBlock code={step.code} language="typescript" showCopy={true} />
                  
                  {/* Curl Alternative */}
                  {step.endpoint && (
                    <div className="mt-3 p-3 bg-foreground/5 rounded-lg border border-foreground/10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Terminal className="w-3 h-3" />
                          <span>Not using JS/TS or the SDK? Copy the curl command:</span>
                        </div>
                        <CurlCopyButton curlCommand={generateCurlCommand(step)} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Use Cases */}
              {step.useCases && step.useCases.length > 0 && (
                <div className="mb-4 p-4 bg-gradient-to-r from-purple-500/10 to-transparent rounded-lg border border-purple-500/20">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-3 flex items-center gap-2">
                    <Zap className="w-3 h-3" />
                    Use Cases Beyond This App
                  </h4>
                  <div className="grid md:grid-cols-2 gap-2">
                    {step.useCases.map((useCase, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <ChevronRight className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                        <span>{useCase}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-foreground/10">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleNext}
                    disabled={currentStep === FLOW_STEPS.length - 1}
                    className="bg-humanity-lime text-black hover:bg-humanity-lime/90"
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Visual Flow Diagram */}
            <Card className="p-6 mt-4 overflow-hidden">
              <h3 className="font-bold mb-4">Visual Flow</h3>
              <div className="flex items-center justify-between gap-2 overflow-x-auto pb-4 px-4 py-2">
                {FLOW_STEPS.map((s, idx) => {
                  const config = PHASE_CONFIG[s.phase];
                  const isActive = idx === currentStep;
                  const isCompleted = idx < currentStep;
                  const ActorIconComp = ACTOR_CONFIG[s.actor].icon;

                  return (
                    <div key={s.id} className="flex items-center shrink-0">
                      <button
                        onClick={() => handleStepClick(idx)}
                        className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isActive
                            ? `${config.color} ring-4 ring-offset-2 ring-offset-background ${config.borderColor.replace('border', 'ring')}`
                            : isCompleted
                            ? 'bg-humanity-lime'
                            : 'bg-foreground/10 hover:bg-foreground/20'
                        }`}
                        title={s.title}
                      >
                        {isCompleted ? (
                          <Check className="w-4 h-4 text-black" />
                        ) : (
                          <ActorIconComp
                            className={`w-4 h-4 ${isActive ? 'text-white' : 'text-muted-foreground'}`}
                          />
                        )}
                      </button>
                      {idx < FLOW_STEPS.length - 1 && (
                        <div
                          className={`w-4 h-0.5 ${
                            isCompleted ? 'bg-humanity-lime' : 'bg-foreground/10'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

