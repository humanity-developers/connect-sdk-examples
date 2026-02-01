'use client';

import { useState, useEffect } from 'react';
import { X, Copy, Check, Terminal, Code, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDevContext, EXPLAIN_DATA, ExplainableItem } from './DevContext';

export function CodeDrawer() {
  const { showCodeDrawer, setShowCodeDrawer, explainedItem, setExplainedItem } = useDevContext();
  const [copiedSdk, setCopiedSdk] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [activeTab, setActiveTab] = useState<'sdk' | 'curl'>('sdk');
  const [sdkHtml, setSdkHtml] = useState<string>('');
  const [curlHtml, setCurlHtml] = useState<string>('');
  const [isHighlighting, setIsHighlighting] = useState(true);

  const data = explainedItem ? EXPLAIN_DATA[explainedItem] : null;

  // Highlight code when explainedItem changes
  useEffect(() => {
    if (!data) return;

    let mounted = true;
    setIsHighlighting(true);

    async function highlightCode() {
      try {
        const { codeToHtml } = await import('shiki');
        const [sdk, curl] = await Promise.all([
          codeToHtml(data!.sdkCode, { lang: 'typescript', theme: 'github-dark' }),
          codeToHtml(data!.curlCommand, { lang: 'bash', theme: 'github-dark' }),
        ]);

        if (mounted) {
          setSdkHtml(sdk);
          setCurlHtml(curl);
          setIsHighlighting(false);
        }
      } catch (error) {
        console.error('Shiki highlighting error:', error);
        if (mounted) {
          setIsHighlighting(false);
        }
      }
    }

    highlightCode();

    return () => {
      mounted = false;
    };
  }, [data]);

  if (!showCodeDrawer || !explainedItem || !data) return null;

  const handleClose = () => {
    setShowCodeDrawer(false);
    setExplainedItem(null);
  };

  const copyToClipboard = async (text: string, type: 'sdk' | 'curl') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'sdk') {
        setCopiedSdk(true);
        setTimeout(() => setCopiedSdk(false), 2000);
      } else {
        setCopiedCurl(true);
        setTimeout(() => setCopiedCurl(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Drawer */}
      <div className="relative z-50 w-full max-w-3xl max-h-[85vh] bg-background border-2 border-foreground/20 shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-foreground/20">
          <div>
            <h2 className="font-display text-lg">{data.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-[10px] font-mono">
                {data.apiEndpoint}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Description */}
        <div className="px-4 py-3 bg-foreground/5 border-b border-foreground/10">
          <p className="text-sm text-muted-foreground">{data.description}</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-foreground/10">
          <button
            onClick={() => setActiveTab('sdk')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'sdk'
                ? 'text-humanity-lime border-b-2 border-humanity-lime bg-humanity-lime/5'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Code className="w-4 h-4" />
            SDK Code
          </button>
          <button
            onClick={() => setActiveTab('curl')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'curl'
                ? 'text-humanity-lime border-b-2 border-humanity-lime bg-humanity-lime/5'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Terminal className="w-4 h-4" />
            cURL
          </button>
        </div>

        {/* Code Content */}
        <ScrollArea className="h-[400px]">
          <div className="p-4">
            {activeTab === 'sdk' ? (
              <div className="relative">
                <div className="absolute top-2 right-2 z-10 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(data.sdkCode, 'sdk')}
                    className="h-7 text-xs bg-background/80 backdrop-blur-sm"
                  >
                    {copiedSdk ? (
                      <>
                        <Check className="w-3 h-3 mr-1 text-humanity-lime" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                {isHighlighting ? (
                  <pre className="text-[12px] bg-[#0d1117] p-4 pt-10 overflow-x-auto border border-foreground/10 leading-relaxed rounded-md">
                    <code className="text-gray-300">{data.sdkCode}</code>
                  </pre>
                ) : (
                  <div
                    className="shiki-container overflow-x-auto rounded-md border border-foreground/10 [&>pre]:!p-4 [&>pre]:!pt-10 [&>pre]:!m-0 [&>pre]:text-[12px] [&>pre]:!bg-[#0d1117] [&>pre]:leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: sdkHtml }}
                  />
                )}
              </div>
            ) : (
              <div className="relative">
                <div className="absolute top-2 right-2 z-10 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(data.curlCommand, 'curl')}
                    className="h-7 text-xs bg-background/80 backdrop-blur-sm"
                  >
                    {copiedCurl ? (
                      <>
                        <Check className="w-3 h-3 mr-1 text-humanity-lime" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy cURL
                      </>
                    )}
                  </Button>
                </div>
                {isHighlighting ? (
                  <pre className="text-[12px] bg-[#0d1117] p-4 pt-10 overflow-x-auto border border-foreground/10 leading-relaxed font-mono rounded-md">
                    <code className="text-gray-300">{data.curlCommand}</code>
                  </pre>
                ) : (
                  <div
                    className="shiki-container overflow-x-auto rounded-md border border-foreground/10 [&>pre]:!p-4 [&>pre]:!pt-10 [&>pre]:!m-0 [&>pre]:text-[12px] [&>pre]:!bg-[#0d1117] [&>pre]:leading-relaxed [&>pre]:font-mono"
                    dangerouslySetInnerHTML={{ __html: curlHtml }}
                  />
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-foreground/10 bg-foreground/5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              See the Dev Console for live API responses
            </p>
            <a
              href={process.env.NEXT_PUBLIC_HUMANITY_DOCS_URL || 'https://docs.humanity.org'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-humanity-lime hover:underline"
            >
              Full Documentation
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

