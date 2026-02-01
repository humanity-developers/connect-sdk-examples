'use client';

import { useEffect, useState, useContext } from 'react';
import { resolveApiPath } from '@/lib/paths';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { DevContext } from '@/components/DevContext';
import { ExplainButton } from '@/components/ExplainButton';
import { CodeBlock } from '@/components/CodeBlock';
import { type DerivedLabel } from '@/lib/derived-labels';
import { Code, Zap, User, Database, Check, X, Plane, Building2, Mail, Wallet, Tag, Filter } from 'lucide-react';

// API log category type (duplicated from database.ts to avoid server-side imports)
type ApiLogCategory = 'oauth' | 'presets' | 'query_engine' | 'app_logic';
type LogCategory = ApiLogCategory | 'all';

interface ApiLog {
  id: string;
  endpoint: string;
  method: string;
  request: object;
  response: object;
  statusCode: number;
  duration: number;
  timestamp: string;
  category?: ApiLogCategory;
}

interface UserInfo {
  linkedSocials: Array<{
    provider: string;
    connected: boolean;
    username?: string;
  }>;
  presets: Array<{
    name: string;
    value: boolean | string | number;
    status: string;
  }>;
  travelProfile?: {
    hasHotelMembership: boolean;
    hasAirlineMembership: boolean;
    isFrequentTraveler: boolean;
  };
  email?: string;
  evmAddress?: string;
}

interface DevPanelProps {
  user?: UserInfo | null;
  derivedLabels?: DerivedLabel[];
}

// Category colors for API log badges
const CATEGORY_COLORS: Record<ApiLogCategory, string> = {
  oauth: 'bg-[rgba(59,130,246,0.1)] text-[#3b82f6] border-[rgba(59,130,246,0.2)]',
  presets: 'bg-[rgba(143,255,0,0.1)] text-humanity-lime border-[rgba(143,255,0,0.2)]',
  query_engine: 'bg-[rgba(168,85,247,0.1)] text-[#a855f7] border-[rgba(168,85,247,0.2)]',
  app_logic: 'bg-[rgba(251,146,60,0.1)] text-[#fb923c] border-[rgba(251,146,60,0.2)]',
};

const CATEGORY_LABELS: Record<ApiLogCategory, string> = {
  oauth: 'OAuth',
  presets: 'Presets',
  query_engine: 'Query Engine',
  app_logic: 'App Logic',
};

// Code snippets for documentation
const CODE_SNIPPETS = {
  socialPresets: `// Verify social connections with presets
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

// Access results
const google = result.results.find(
  r => r.presetName === 'google_connected'
);
console.log(google?.value); // true | false`,

  queryEngine: `// Query Engine: Check hotel membership
const hotelQuery = {
  policy: {
    anyOf: [
      { 
        check: { 
          claim: 'membership.marriott', 
          operator: 'isDefined' 
        } 
      },
      { 
        check: { 
          claim: 'membership.hilton', 
          operator: 'isDefined' 
        } 
      },
      // ... more chains
    ],
  },
};

const result = await sdk.evaluatePredicateQuery({
  accessToken,
  query: hotelQuery,
});

console.log(result.passed); // boolean`,

  frequentTraveler: `// Combined: Hotel AND Airline
const frequentTravelerQuery = {
  policy: {
    allOf: [
      hotelMembershipQuery,
      airlineMembershipQuery,
    ],
  },
};

const result = await sdk.evaluatePredicateQuery({
  accessToken,
  query: frequentTravelerQuery,
});

// true only if BOTH conditions pass
console.log(result.passed);`,
};

export function DevPanel({ user, derivedLabels = [] }: DevPanelProps) {
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<LogCategory>('all');
  const context = useContext(DevContext);
  const explainedItem = context?.explainedItem;

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await fetch(resolveApiPath('/api/dev/logs'));
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter logs by category
  const filteredLogs = categoryFilter === 'all' 
    ? logs 
    : logs.filter(log => log.category === categoryFilter);

  // Default travel profile if not provided
  const travelProfile = user?.travelProfile ?? {
    hasHotelMembership: false,
    hasAirlineMembership: false,
    isFrequentTraveler: false,
  };

  // Highlight classes based on what's being explained
  const getSectionHighlight = (section: 'social' | 'travel' | 'user') => {
    if (section === 'social' && explainedItem === 'social_connections') {
      return 'ring-2 ring-humanity-lime ring-offset-2 ring-offset-[#050505]';
    }
    if (section === 'travel' && explainedItem === 'travel_profile') {
      return 'ring-2 ring-humanity-lime ring-offset-2 ring-offset-[#050505]';
    }
    if (section === 'user' && explainedItem === 'user_profile') {
      return 'ring-2 ring-humanity-lime ring-offset-2 ring-offset-[#050505]';
    }
    return '';
  };

  return (
    <div className="h-full flex flex-col dev-panel">
      {/* Header */}
      <div className="border-b border-[rgba(255,255,255,0.08)] p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[rgba(143,255,0,0.1)] flex items-center justify-center">
            <Code className="w-4 h-4 text-humanity-lime" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Dev Console</h2>
            <p className="text-[10px] text-[rgba(255,255,255,0.4)] uppercase tracking-wider">
              Live API Responses & Code Examples
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="logs" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start px-4 border-b border-[rgba(255,255,255,0.08)] bg-transparent rounded-none h-auto py-0">
          <TabsTrigger value="logs" className="gap-2 data-[state=active]:bg-transparent data-[state=active]:text-humanity-lime data-[state=active]:border-b-2 data-[state=active]:border-humanity-lime rounded-none py-3 px-4">
            <Zap className="w-3 h-3" />
            API Logs
          </TabsTrigger>
          <TabsTrigger value="user" className="gap-2 data-[state=active]:bg-transparent data-[state=active]:text-humanity-lime data-[state=active]:border-b-2 data-[state=active]:border-humanity-lime rounded-none py-3 px-4">
            <User className="w-3 h-3" />
            User Data
          </TabsTrigger>
          <TabsTrigger value="code" className="gap-2 data-[state=active]:bg-transparent data-[state=active]:text-humanity-lime data-[state=active]:border-b-2 data-[state=active]:border-humanity-lime rounded-none py-3 px-4">
            <Code className="w-3 h-3" />
            Code
          </TabsTrigger>
        </TabsList>

        {/* API Logs Tab */}
        <TabsContent value="logs" className="flex-1 m-0">
          {/* Category Filter */}
          <div className="px-4 py-2 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(17,17,17,0.5)]">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-3 h-3 text-[rgba(255,255,255,0.4)]" />
              <span className="text-[10px] text-[rgba(255,255,255,0.4)] uppercase tracking-wider">Filter:</span>
              <Badge
                variant={categoryFilter === 'all' ? 'default' : 'outline'}
                className="text-[10px] cursor-pointer hover:bg-[rgba(255,255,255,0.1)]"
                onClick={() => setCategoryFilter('all')}
              >
                All
              </Badge>
              {(Object.keys(CATEGORY_LABELS) as ApiLogCategory[]).map((cat) => (
                <Badge
                  key={cat}
                  variant="outline"
                  className={`text-[10px] cursor-pointer transition-all ${
                    categoryFilter === cat 
                      ? CATEGORY_COLORS[cat] 
                      : 'hover:bg-[rgba(255,255,255,0.05)]'
                  }`}
                  onClick={() => setCategoryFilter(cat)}
                >
                  {CATEGORY_LABELS[cat]}
                </Badge>
              ))}
            </div>
          </div>
          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="p-4 space-y-3">
              {isLoading ? (
                <div className="text-center py-8 text-[rgba(255,255,255,0.5)]">
                  <span className="loading-dots">Loading logs</span>
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="text-center py-8 text-[rgba(255,255,255,0.5)]">
                  <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No API calls yet</p>
                  <p className="text-xs text-[rgba(255,255,255,0.4)]">
                    {categoryFilter !== 'all' 
                      ? `No ${CATEGORY_LABELS[categoryFilter]} logs found` 
                      : 'Interact with the app to see logs'}
                  </p>
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <LogEntry key={log.id} log={log} />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* User Data Tab */}
        <TabsContent value="user" className="flex-1 m-0">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="p-4 space-y-4">
              {user ? (
                <>
                  {/* Simple Checks: Social Presets */}
                  <div className={`p-4 rounded-xl bg-[rgba(17,17,17,0.5)] border border-[rgba(255,255,255,0.06)] transition-all duration-300 ${getSectionHighlight('social')}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="social" className="text-[10px]">
                          Simple Check
                        </Badge>
                        <span className="text-xs text-[rgba(255,255,255,0.4)]">via Presets</span>
                      </div>
                      <ExplainButton item="social_connections" />
                    </div>
                    <h3 className="text-xs uppercase tracking-wider text-[rgba(255,255,255,0.4)] mb-3">
                      Social Connections
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {user.linkedSocials.map((social) => (
                        <div
                          key={social.provider}
                          className={`flex items-center justify-between p-2.5 rounded-lg border ${
                            social.connected 
                              ? 'border-[rgba(143,255,0,0.2)] bg-[rgba(143,255,0,0.05)]' 
                              : 'border-[rgba(255,255,255,0.06)] bg-[rgba(17,17,17,0.5)]'
                          }`}
                        >
                          <span className="capitalize text-sm font-medium text-white">
                            {social.provider}
                          </span>
                          {social.connected ? (
                            <Check className="w-4 h-4 text-humanity-lime" />
                          ) : (
                            <X className="w-4 h-4 text-[rgba(255,255,255,0.3)]" />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 p-2 bg-[#0a0a0a] rounded-lg border border-[rgba(255,255,255,0.06)] overflow-x-auto">
                      <code className="text-[10px] text-[rgba(255,255,255,0.5)] font-mono whitespace-nowrap block">
                        sdk.verifyPresets({'{'} presets: [...] {'}'})
                      </code>
                    </div>
                  </div>

                  <Separator className="bg-[rgba(255,255,255,0.06)]" />

                  {/* Simple Check: Email Preset */}
                  <div className={`p-4 rounded-xl bg-[rgba(17,17,17,0.5)] border border-[rgba(255,255,255,0.06)] transition-all duration-300 ${getSectionHighlight('user')}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="success" className="text-[10px]">
                          Simple Check
                        </Badge>
                        <span className="text-xs text-[rgba(255,255,255,0.4)]">Single Preset</span>
                      </div>
                      <ExplainButton item="user_profile" />
                    </div>
                    <h3 className="text-xs uppercase tracking-wider text-[rgba(255,255,255,0.4)] mb-3">
                      User Identity
                    </h3>
                    <div className="space-y-2">
                      {/* Email */}
                      <div className={`flex items-center justify-between p-3 rounded-lg border ${
                        user?.email 
                          ? 'border-[rgba(143,255,0,0.2)] bg-[rgba(143,255,0,0.05)]' 
                          : 'border-[rgba(255,255,255,0.06)] bg-[rgba(17,17,17,0.5)]'
                      }`}>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-[rgba(255,255,255,0.4)]" />
                          <div>
                            <span className="text-sm font-medium text-white">Email</span>
                            <p className="text-[10px] text-[rgba(255,255,255,0.4)] font-mono">
                              {user?.email || 'Not available'}
                            </p>
                          </div>
                        </div>
                        <Badge variant={user?.email ? 'success' : 'secondary'}>
                          {user?.email ? 'verified' : 'none'}
                        </Badge>
                      </div>

                      {/* Wallet Address */}
                      <div className={`flex items-center justify-between p-3 rounded-lg border ${
                        user?.evmAddress 
                          ? 'border-[rgba(143,255,0,0.2)] bg-[rgba(143,255,0,0.05)]' 
                          : 'border-[rgba(255,255,255,0.06)] bg-[rgba(17,17,17,0.5)]'
                      }`}>
                        <div className="flex items-center gap-2">
                          <Wallet className="w-4 h-4 text-[rgba(255,255,255,0.4)]" />
                          <div>
                            <span className="text-sm font-medium text-white">Wallet</span>
                            <p className="text-[10px] text-[rgba(255,255,255,0.4)] font-mono">
                              {user?.evmAddress 
                                ? `${user.evmAddress.slice(0, 6)}...${user.evmAddress.slice(-4)}`
                                : 'Not available'}
                            </p>
                          </div>
                        </div>
                        <Badge variant={user?.evmAddress ? 'success' : 'secondary'}>
                          {user?.evmAddress ? 'verified' : 'none'}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-3 p-2 bg-[#0a0a0a] rounded-lg border border-[rgba(255,255,255,0.06)] overflow-x-auto">
                      <code className="text-[10px] text-[rgba(255,255,255,0.5)] font-mono whitespace-nowrap block">
                        sdk.verifyPreset({'{'} preset: 'email' {'}'})
                      </code>
                    </div>
                  </div>

                  <Separator className="bg-[rgba(255,255,255,0.06)]" />

                  {/* Complex Queries: Travel Profile */}
                  <div className={`p-4 rounded-xl bg-[rgba(17,17,17,0.5)] border border-[rgba(255,255,255,0.06)] transition-all duration-300 ${getSectionHighlight('travel')}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="preset" className="text-[10px]">
                          Query Engine
                        </Badge>
                        <span className="text-xs text-[rgba(255,255,255,0.4)]">Complex Logic</span>
                      </div>
                      <ExplainButton item="travel_profile" />
                    </div>
                    <h3 className="text-xs uppercase tracking-wider text-[rgba(255,255,255,0.4)] mb-3">
                      Travel Profile
                    </h3>
                    <div className="space-y-2">
                      {/* Hotel Membership */}
                      <div className={`flex items-center justify-between p-3 rounded-lg border ${
                        travelProfile.hasHotelMembership 
                          ? 'border-[rgba(143,255,0,0.2)] bg-[rgba(143,255,0,0.05)]' 
                          : 'border-[rgba(255,255,255,0.06)] bg-[rgba(17,17,17,0.5)]'
                      }`}>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[rgba(255,255,255,0.4)]" />
                          <div>
                            <span className="text-sm font-medium text-white">Hotel Membership</span>
                            <p className="text-[10px] text-[rgba(255,255,255,0.4)]">
                              anyOf: Marriott, Hilton, Accor...
                            </p>
                          </div>
                        </div>
                        <Badge variant={travelProfile.hasHotelMembership ? 'success' : 'secondary'}>
                          {travelProfile.hasHotelMembership ? 'true' : 'false'}
                        </Badge>
                      </div>

                      {/* Airline Membership */}
                      <div className={`flex items-center justify-between p-3 rounded-lg border ${
                        travelProfile.hasAirlineMembership 
                          ? 'border-[rgba(143,255,0,0.2)] bg-[rgba(143,255,0,0.05)]' 
                          : 'border-[rgba(255,255,255,0.06)] bg-[rgba(17,17,17,0.5)]'
                      }`}>
                        <div className="flex items-center gap-2">
                          <Plane className="w-4 h-4 text-[rgba(255,255,255,0.4)]" />
                          <div>
                            <span className="text-sm font-medium text-white">Airline Membership</span>
                            <p className="text-[10px] text-[rgba(255,255,255,0.4)]">
                              anyOf: Delta, Emirates, United...
                            </p>
                          </div>
                        </div>
                        <Badge variant={travelProfile.hasAirlineMembership ? 'success' : 'secondary'}>
                          {travelProfile.hasAirlineMembership ? 'true' : 'false'}
                        </Badge>
                      </div>

                      {/* Frequent Traveler (Combined) */}
                      <div className={`flex items-center justify-between p-3 rounded-xl border-2 ${
                        travelProfile.isFrequentTraveler 
                          ? 'border-humanity-lime bg-[rgba(143,255,0,0.1)]' 
                          : 'border-[rgba(255,255,255,0.1)] bg-[rgba(17,17,17,0.5)]'
                      }`}>
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-1">
                            <Building2 className="w-4 h-4 text-[rgba(255,255,255,0.4)]" />
                            <Plane className="w-4 h-4 text-[rgba(255,255,255,0.4)]" />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-white">Frequent Traveler</span>
                            <p className="text-[10px] text-[rgba(255,255,255,0.4)]">
                              allOf: Hotel AND Airline
                            </p>
                          </div>
                        </div>
                        <Badge variant={travelProfile.isFrequentTraveler ? 'success' : 'secondary'}>
                          {travelProfile.isFrequentTraveler ? 'true' : 'false'}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-3 p-2 bg-[#0a0a0a] rounded-lg border border-[rgba(255,255,255,0.06)] overflow-x-auto">
                      <code className="text-[10px] text-[rgba(255,255,255,0.5)] font-mono whitespace-nowrap block">
                        sdk.evaluatePredicateQuery({'{'} query {'}'})
                      </code>
                    </div>
                  </div>

                  <Separator className="bg-[rgba(255,255,255,0.06)]" />

                  {/* Derived Signals Section */}
                  <div className="p-4 rounded-xl bg-[rgba(17,17,17,0.5)] border border-[rgba(255,255,255,0.06)]">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="success" className="text-[10px]">
                          Derived
                        </Badge>
                        <span className="text-xs text-[rgba(255,255,255,0.4)]">Feed Labels</span>
                      </div>
                      <ExplainButton item="recommendation" />
                    </div>
                    <h3 className="text-xs uppercase tracking-wider text-[rgba(255,255,255,0.4)] mb-2">
                      Derived Labels
                    </h3>
                    <p className="text-[10px] text-[rgba(255,255,255,0.4)] mb-3">
                      These labels are derived from your signals and appear on matching articles in the feed.
                    </p>
                    {derivedLabels.length > 0 ? (
                      <div className="space-y-2">
                        {derivedLabels.map((label) => (
                          <div
                            key={label.id}
                            className="flex items-center justify-between p-3 rounded-lg border border-[rgba(143,255,0,0.2)] bg-[rgba(143,255,0,0.05)]"
                          >
                            <div className="flex items-center gap-2">
                              <Tag className="w-4 h-4 text-humanity-lime" />
                              <div>
                                <span className="text-sm font-medium text-white">{label.label}</span>
                                <p className="text-[10px] text-[rgba(255,255,255,0.4)]">
                                  Category: {label.category}
                                </p>
                              </div>
                            </div>
                            <Badge variant="success" className="text-[10px]">
                              {label.signal}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-lg border border-[rgba(255,255,255,0.06)] text-center bg-[rgba(17,17,17,0.5)]">
                        <Tag className="w-6 h-6 mx-auto mb-1 text-[rgba(255,255,255,0.2)]" />
                        <p className="text-[10px] text-[rgba(255,255,255,0.4)]">
                          No derived labels yet. Connect more socials or presets.
                        </p>
                      </div>
                    )}
                    <div className="mt-3 p-2 bg-[#0a0a0a] rounded-lg border border-[rgba(255,255,255,0.06)] overflow-x-auto">
                      <code className="text-[10px] text-[rgba(255,255,255,0.5)] font-mono whitespace-nowrap block">
                        getDerivedLabels(socials, presets)
                      </code>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-[rgba(255,255,255,0.5)]">
                  <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Not authenticated</p>
                  <p className="text-xs text-[rgba(255,255,255,0.4)]">Log in to see user data</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Code Examples Tab */}
        <TabsContent value="code" className="flex-1 m-0">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="p-4 space-y-6">
              {/* Simple Checks */}
              <div className="p-4 rounded-xl bg-[rgba(17,17,17,0.5)] border border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="social" className="text-[10px]">
                    Simple Check
                  </Badge>
                  <span className="text-xs font-medium text-white">Social Presets</span>
                </div>
                <p className="text-xs text-[rgba(255,255,255,0.5)] mb-3">
                  Use presets for simple boolean checks. Each social has a dedicated preset.
                </p>
                <CodeBlock code={CODE_SNIPPETS.socialPresets} language="typescript" />
              </div>

              <Separator className="bg-[rgba(255,255,255,0.06)]" />

              {/* Query Engine */}
              <div className="p-4 rounded-xl bg-[rgba(17,17,17,0.5)] border border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="preset" className="text-[10px]">
                    Query Engine
                  </Badge>
                  <span className="text-xs font-medium text-white">Complex Logic</span>
                </div>
                <p className="text-xs text-[rgba(255,255,255,0.5)] mb-3">
                  Use the Query Engine for complex conditions with anyOf, allOf operators.
                </p>
                <CodeBlock code={CODE_SNIPPETS.queryEngine} language="typescript" />
              </div>

              <Separator className="bg-[rgba(255,255,255,0.06)]" />

              {/* Combined Queries */}
              <div className="p-4 rounded-xl bg-[rgba(17,17,17,0.5)] border border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="warning" className="text-[10px]">
                    Combined
                  </Badge>
                  <span className="text-xs font-medium text-white">Nested Queries</span>
                </div>
                <p className="text-xs text-[rgba(255,255,255,0.5)] mb-3">
                  Combine queries with allOf to require multiple conditions.
                </p>
                <CodeBlock code={CODE_SNIPPETS.frequentTraveler} language="typescript" />
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LogEntry({ log }: { log: ApiLog }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-humanity-lime';
    if (status >= 400) return 'text-[#ff4757]';
    return 'text-[#ffb800]';
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-[rgba(59,130,246,0.1)] text-[#3b82f6] border-[rgba(59,130,246,0.2)]';
      case 'POST':
        return 'bg-[rgba(143,255,0,0.1)] text-humanity-lime border-[rgba(143,255,0,0.2)]';
      case 'PUT':
        return 'bg-[rgba(255,184,0,0.1)] text-[#ffb800] border-[rgba(255,184,0,0.2)]';
      case 'DELETE':
        return 'bg-[rgba(255,71,87,0.1)] text-[#ff4757] border-[rgba(255,71,87,0.2)]';
      default:
        return 'bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.5)] border-[rgba(255,255,255,0.1)]';
    }
  };

  return (
    <div
      className="rounded-lg border border-[rgba(255,255,255,0.06)] cursor-pointer hover:border-[rgba(255,255,255,0.12)] transition-colors bg-[rgba(17,17,17,0.5)]"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="p-3 space-y-2">
        {/* Category badge row */}
        {log.category && (
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={`${CATEGORY_COLORS[log.category]} text-[9px] px-1.5 py-0`}
            >
              {CATEGORY_LABELS[log.category]}
            </Badge>
          </div>
        )}
        {/* Main log info row */}
        <div className="flex items-center gap-3">
          <Badge className={`${getMethodColor(log.method)} font-mono text-[10px]`}>
            {log.method}
          </Badge>
          <span className="font-mono text-sm flex-1 truncate text-white">{log.endpoint}</span>
          <span className={`font-mono text-sm ${getStatusColor(log.statusCode)}`}>
            {log.statusCode}
          </span>
          <span className="text-xs text-[rgba(255,255,255,0.4)]">{log.duration}ms</span>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-[rgba(255,255,255,0.06)] p-3 space-y-3">
          <div>
            <h4 className="text-[10px] uppercase tracking-wider text-[rgba(255,255,255,0.4)] mb-1">
              Request
            </h4>
            <pre className="text-xs bg-[#0a0a0a] p-3 rounded-lg overflow-x-auto border border-[rgba(255,255,255,0.06)]">
              {JSON.stringify(log.request, null, 2)}
            </pre>
          </div>
          <div>
            <h4 className="text-[10px] uppercase tracking-wider text-[rgba(255,255,255,0.4)] mb-1">
              Response
            </h4>
            <pre className="text-xs bg-[#0a0a0a] p-3 rounded-lg overflow-x-auto border border-[rgba(255,255,255,0.06)]">
              {JSON.stringify(log.response, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
