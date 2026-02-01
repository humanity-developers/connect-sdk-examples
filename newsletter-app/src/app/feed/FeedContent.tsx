'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Header } from '@/components/Header';
import { DevPanel } from '@/components/DevPanel';
import { NewsCard } from '@/components/NewsCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { DevProvider, useDevContext } from '@/components/DevContext';
import { ExplainButton } from '@/components/ExplainButton';
import { CodeDrawer } from '@/components/CodeDrawer';
import { SignalControls, buildSignalsFromSession, type Signal } from '@/components/SignalControls';
import { getDerivedLabels } from '@/lib/derived-labels';
import { resolveApiPath } from '@/lib/paths';
import { RefreshCw, ChevronLeft, ChevronRight, Sparkles, Loader2, PanelRightOpen, PanelRightClose } from 'lucide-react';

interface SessionData {
  userId: string;
  humanityUserId: string;
  email?: string;
  evmAddress?: string;
  linkedSocials: string[];
  presets: string[];
}

interface UserData {
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

interface Article {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  source: string;
  publishedAt: string;
  category: string;
  tags: string[];
  recommendationReason?: string | null;
}

interface FeedContentProps {
  session: SessionData;
  user: UserData | null;
}

export function FeedContent({ session, user }: FeedContentProps) {
  return (
    <DevProvider>
      <FeedContentInner session={session} user={user} />
      <CodeDrawer />
    </DevProvider>
  );
}

function FeedContentInner({ session, user }: FeedContentProps) {
  const { isDevPanelOpen, setDevPanelOpen } = useDevContext();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    skip: 0,
    hasMore: false,
  });

  const initialSignals = useMemo(() => {
    return buildSignalsFromSession(session.linkedSocials, session.presets);
  }, [session.linkedSocials, session.presets]);

  const [signals, setSignals] = useState<Signal[]>(initialSignals);

  const activeSignalIds = useMemo(() => {
    return signals.filter(s => s.enabled).map(s => s.id);
  }, [signals]);

  const derivedLabels = useMemo(() => {
    const activeSocials = signals.filter(s => s.type === 'social' && s.enabled).map(s => s.id);
    const activePresets = signals.filter(s => s.type === 'preset' && s.enabled).map(s => s.id);
    const socialPresets = session.presets.filter(p => 
      p.endsWith('_connected') && activeSocials.includes(p.replace('_connected', ''))
    );
    return getDerivedLabels(activeSocials, [...activePresets, ...socialPresets]);
  }, [signals, session.presets]);

  const getArticleDerivedLabel = (articleCategory: string): string | null => {
    const matchingLabel = derivedLabels.find(label => label.category === articleCategory);
    return matchingLabel?.label || null;
  };

  const fetchFeed = useCallback(async (skip = 0) => {
    setIsLoading(true);
    try {
      const signalsParam = activeSignalIds.length > 0 
        ? `&signals=${activeSignalIds.join(',')}`
        : '';
      const response = await fetch(resolveApiPath(`/api/feed?limit=20&skip=${skip}${signalsParam}`));
      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch feed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeSignalIds]);

  useEffect(() => {
    fetchFeed();
  }, []);

  useEffect(() => {
    fetchFeed(0);
  }, [activeSignalIds.join(',')]);

  const handleSignalToggle = (signalId: string) => {
    setSignals(prev => prev.map(s => 
      s.id === signalId ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const handleRefresh = () => {
    fetchFeed(0);
  };

  const handleNextPage = () => {
    if (pagination.hasMore) {
      fetchFeed(pagination.skip + pagination.limit);
    }
  };

  const handlePrevPage = () => {
    if (pagination.skip > 0) {
      fetchFeed(Math.max(0, pagination.skip - pagination.limit));
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        isAuthenticated
        email={session.email}
        evmAddress={session.evmAddress}
        linkedSocials={session.linkedSocials}
      />

      <div className="flex-1 flex">
        {/* Main Content */}
        <main className={`flex-1 ${isDevPanelOpen ? 'lg:mr-[480px]' : ''} transition-all duration-300`}>
          {/* Toolbar */}
          <div className="border-b border-[rgba(255,255,255,0.08)] bg-[rgba(17,17,17,0.5)]">
            <div className="max-w-6xl mx-auto px-6 py-3">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[rgba(143,255,0,0.1)] flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-humanity-lime" />
                  </div>
                  <span className="text-sm font-medium text-white">Your Feed</span>
                  <ExplainButton item="recommendation" />
                </div>
                
                <Separator orientation="vertical" className="h-5 hidden sm:block bg-[rgba(255,255,255,0.08)]" />
                
                <div className="flex-1">
                  <SignalControls signals={signals} onToggle={handleSignalToggle} />
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isLoading} className="text-[rgba(255,255,255,0.65)] hover:text-white">
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline ml-2">Refresh</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDevPanelOpen(!isDevPanelOpen)}
                    className="hidden lg:flex gap-2"
                  >
                    {isDevPanelOpen ? (
                      <>
                        <PanelRightClose className="w-4 h-4" />
                        Hide Panel
                      </>
                    ) : (
                      <>
                        <PanelRightOpen className="w-4 h-4" />
                        Dev Panel
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Feed Content */}
          <ScrollArea className="h-[calc(100vh-140px)]">
            <div className="max-w-6xl mx-auto px-6 py-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-6 h-6 animate-spin text-humanity-lime" />
                </div>
              ) : articles.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-[rgba(255,255,255,0.5)] mb-4">
                    No articles yet. The feed is being populated.
                  </p>
                  <Button variant="outline" onClick={handleRefresh}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Check Again
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {articles.map((article, index) => (
                      <NewsCard 
                        key={article.id} 
                        article={article} 
                        derivedLabel={getArticleDerivedLabel(article.category)}
                        index={index} 
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-10 pt-6 border-t border-[rgba(255,255,255,0.08)]">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevPage}
                      disabled={pagination.skip === 0}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                    
                    <span className="text-sm text-[rgba(255,255,255,0.4)]">
                      {pagination.skip + 1} - {Math.min(pagination.skip + pagination.limit, pagination.total)} of {pagination.total}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={!pagination.hasMore}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </main>

        {/* Dev Panel */}
        {isDevPanelOpen && (
          <aside className="hidden lg:block fixed right-0 top-[57px] bottom-0 w-[480px] border-l border-[rgba(255,255,255,0.08)] bg-[rgba(5,5,5,0.95)] backdrop-blur-xl">
            <DevPanel user={user} derivedLabels={derivedLabels} />
          </aside>
        )}
      </div>
    </div>
  );
}
