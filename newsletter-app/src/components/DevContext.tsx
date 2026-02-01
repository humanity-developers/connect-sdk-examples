'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export type ExplainableItem = 
  | 'user_profile'      // email from email preset
  | 'social_connections' // social presets (google_connected, etc.)
  | 'travel_profile'    // query engine (hotel/airline membership)
  | 'recommendation'    // feed personalization
  | null;

interface DevContextType {
  isDevPanelOpen: boolean;
  setDevPanelOpen: (open: boolean) => void;
  explainedItem: ExplainableItem;
  setExplainedItem: (item: ExplainableItem) => void;
  showCodeDrawer: boolean;
  setShowCodeDrawer: (show: boolean) => void;
}

export const DevContext = createContext<DevContextType | undefined>(undefined);

export function DevProvider({ children }: { children: ReactNode }) {
  const [isDevPanelOpen, setDevPanelOpen] = useState(true);
  const [explainedItem, setExplainedItem] = useState<ExplainableItem>(null);
  const [showCodeDrawer, setShowCodeDrawer] = useState(false);

  return (
    <DevContext.Provider
      value={{
        isDevPanelOpen,
        setDevPanelOpen,
        explainedItem,
        setExplainedItem,
        showCodeDrawer,
        setShowCodeDrawer,
      }}
    >
      {children}
    </DevContext.Provider>
  );
}

export function useDevContext() {
  const context = useContext(DevContext);
  if (!context) {
    throw new Error('useDevContext must be used within a DevProvider');
  }
  return context;
}

// Code snippets and cURL commands for each explainable item
export const EXPLAIN_DATA: Record<Exclude<ExplainableItem, null>, {
  title: string;
  description: string;
  sdkCode: string;
  curlCommand: string;
  apiEndpoint: string;
}> = {
  user_profile: {
    title: 'User Email (email preset)',
    description: 'Fetches the user\'s verified email address using the email preset. The email is returned as the preset value.',
    apiEndpoint: 'POST /presets/single',
    sdkCode: `import { HumanitySDK } from '@humanity-org/connect-sdk';

const sdk = new HumanitySDK({
  clientId: process.env.HUMANITY_CLIENT_ID,
  redirectUri: process.env.HUMANITY_REDIRECT_URI,
});

// Verify the email preset
const result = await sdk.verifyPreset(
  'email',
  accessToken
);

// The email is returned as the value
const email = result.value;
console.log('User email:', email);

// You can also verify wallet_address preset
const walletResult = await sdk.verifyPreset(
  'wallet_address',
  accessToken
);
console.log('Wallet:', walletResult.value);`,
    curlCommand: `curl -X POST "https://api.humanity.org/presets/single" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "preset": "email"
  }'`,
  },
  social_connections: {
    title: 'Social Connections (batch presets)',
    description: 'Verifies which social accounts are linked to the user\'s Humanity profile. Each social has a dedicated preset that returns true/false.',
    apiEndpoint: 'POST /presets/batch',
    sdkCode: `import { HumanitySDK } from '@humanity-org/connect-sdk';

const sdk = new HumanitySDK({
  clientId: process.env.HUMANITY_CLIENT_ID,
  redirectUri: process.env.HUMANITY_REDIRECT_URI,
});

// Verify all social presets in a single batch
const result = await sdk.verifyPresets({
  accessToken,
  presets: [
    'google_connected',
    'linkedin_connected',
    'twitter_connected',
    'discord_connected',
    'github_connected',
    'telegram_connected',
  ],
});

// Check which socials are connected
for (const r of result.results) {
  console.log(\`\${r.presetName}: \${r.value}\`);
  // google_connected: true
  // linkedin_connected: true
  // twitter_connected: false
  // ...
}`,
    curlCommand: `curl -X POST "https://api.humanity.org/presets/batch" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "presets": [
      "google_connected",
      "linkedin_connected", 
      "twitter_connected",
      "discord_connected",
      "github_connected",
      "telegram_connected"
    ]
  }'`,
  },
  travel_profile: {
    title: 'Travel Profile (Query Engine)',
    description: 'Uses the Query Engine to evaluate complex conditions. Checks if user has hotel/airline memberships using anyOf/allOf operators.',
    apiEndpoint: 'POST /query/evaluate',
    sdkCode: `import { HumanitySDK } from '@humanity-org/connect-sdk';

const sdk = new HumanitySDK({
  clientId: process.env.HUMANITY_CLIENT_ID,
  redirectUri: process.env.HUMANITY_REDIRECT_URI,
});

// Define a query: has ANY hotel membership
const hotelQuery = {
  policy: {
    anyOf: [
      { check: { claim: 'membership.marriott', operator: 'isDefined' } },
      { check: { claim: 'membership.hilton', operator: 'isDefined' } },
      { check: { claim: 'membership.accor', operator: 'isDefined' } },
    ],
  },
};

// Evaluate the query
const result = await sdk.evaluatePredicateQuery({
  accessToken,
  query: hotelQuery,
});

console.log(result.passed); // true if has any hotel membership

// Combine with allOf for "frequent traveler"
const frequentTravelerQuery = {
  policy: {
    allOf: [hotelQuery, airlineQuery],
  },
};`,
    curlCommand: `curl -X POST "https://api.humanity.org/query/evaluate" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": {
      "policy": {
        "anyOf": [
          { "check": { "claim": "membership.marriott", "operator": "isDefined" } },
          { "check": { "claim": "membership.hilton", "operator": "isDefined" } }
        ]
      }
    }
  }'`,
  },
  recommendation: {
    title: 'Feed Personalization',
    description: 'Maps social connections and presets to content categories. Uses the verified data to filter and rank news articles.',
    apiEndpoint: 'Internal Logic',
    sdkCode: `// After getting social connections and presets...

// Map socials to content categories
const categorySignals = {
  linkedin: ['professional', 'career', 'business'],
  discord: ['community', 'gaming', 'esports'],
  twitter: ['trending', 'social', 'viral'],
  github: ['tech', 'opensource', 'development'],
};

// Map presets to categories
const presetSignals = {
  is_frequent_traveler: ['travel', 'events', 'conferences'],
  has_hotel_membership: ['travel', 'hospitality'],
  has_airline_membership: ['travel', 'aviation'],
};

// Build user's content profile
const userCategories = new Set<string>();

for (const social of connectedSocials) {
  const cats = categorySignals[social.provider];
  cats?.forEach(c => userCategories.add(c));
}

for (const preset of activePresets) {
  const cats = presetSignals[preset.name];
  cats?.forEach(c => userCategories.add(c));
}

// Fetch and rank articles
const articles = await getArticlesByCategories([...userCategories]);`,
    curlCommand: `# This is internal application logic, not an API call.
# The feed is built by:
# 1. Fetching social connections (see social_connections)
# 2. Checking travel presets (see travel_profile)
# 3. Mapping to content categories
# 4. Querying the news database`,
  },
};

