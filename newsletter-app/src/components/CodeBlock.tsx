'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CodeBlockProps {
  code: string;
  language?: string;
  theme?: string;
  showCopy?: boolean;
  className?: string;
}

interface FullCodeBlockProps {
  sdkCode: string;
  curlCommand: string;
  apiEndpoint?: string;
  description?: string;
  docsLink?: string;
}

// Simple single-language code block
export function CodeBlock({
  code,
  language = 'typescript',
  theme = 'github-dark',
  showCopy = true,
  className = '',
}: CodeBlockProps) {
  const [html, setHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function highlight() {
      try {
        const { codeToHtml } = await import('shiki');
        const highlighted = await codeToHtml(code, {
          lang: language as any,
          theme: theme as any,
        });
        if (mounted) {
          setHtml(highlighted);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Shiki highlighting error:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    highlight();

    return () => {
      mounted = false;
    };
  }, [code, language, theme]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  if (isLoading) {
    return (
      <div className={`relative ${className}`}>
        <pre className="bg-[#0a0a0a] p-4 rounded-xl text-sm overflow-x-auto border border-[rgba(255,255,255,0.06)]">
          <code className="text-[rgba(255,255,255,0.5)] font-mono">{code}</code>
        </pre>
      </div>
    );
  }

  return (
    <div className={`relative group ${className}`}>
      <div
        className="shiki-container overflow-x-auto rounded-xl border border-[rgba(255,255,255,0.06)] [&>pre]:!p-4 [&>pre]:!m-0 [&>pre]:!rounded-xl [&>pre]:text-sm [&>pre]:!bg-[#0a0a0a]"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {showCopy && (
        <Button
          variant="secondary"
          size="sm"
          className="absolute top-2 right-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity h-7"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 mr-1 text-humanity-lime" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </>
          )}
        </Button>
      )}
    </div>
  );
}

// Full code block with SDK/cURL tabs
export function FullCodeBlock({
  sdkCode,
  curlCommand,
  apiEndpoint,
  description,
  docsLink,
}: FullCodeBlockProps) {
  const [activeTab, setActiveTab] = useState('sdk');
  const [sdkHtml, setSdkHtml] = useState<string>('');
  const [curlHtml, setCurlHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function highlightBoth() {
      try {
        const { codeToHtml } = await import('shiki');
        const [sdk, curl] = await Promise.all([
          codeToHtml(sdkCode, {
            lang: 'typescript',
            theme: 'github-dark',
          }),
          codeToHtml(curlCommand, {
            lang: 'bash',
            theme: 'github-dark',
          }),
        ]);

        if (mounted) {
          setSdkHtml(sdk);
          setCurlHtml(curl);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Shiki highlighting error:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    highlightBoth();

    return () => {
      mounted = false;
    };
  }, [sdkCode, curlCommand]);

  const handleCopy = useCallback(
    (text: string) => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    },
    []
  );

  const currentCode = activeTab === 'sdk' ? sdkCode : curlCommand;

  return (
    <div className="border border-[rgba(255,255,255,0.08)] rounded-xl overflow-hidden bg-[#0a0a0a]">
      {/* Header */}
      {(description || apiEndpoint || docsLink) && (
        <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(17,17,17,0.5)]">
          {description && (
            <p className="text-xs text-[rgba(255,255,255,0.5)] mb-2">{description}</p>
          )}
          <div className="flex items-center gap-3 text-xs">
            {apiEndpoint && (
              <code className="bg-[rgba(143,255,0,0.1)] px-2 py-0.5 rounded-md text-humanity-lime font-mono border border-[rgba(143,255,0,0.2)]">
                {apiEndpoint}
              </code>
            )}
            {docsLink && (
              <a
                href={docsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-humanity-lime hover:text-humanity-lime-hover flex items-center gap-1 transition-colors"
              >
                Docs <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between px-4 py-2 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(17,17,17,0.5)]">
          <TabsList className="h-7 p-0 bg-transparent">
            <TabsTrigger
              value="sdk"
              className="h-7 text-xs px-3 data-[state=active]:bg-[rgba(143,255,0,0.1)] data-[state=active]:text-humanity-lime data-[state=active]:border-none rounded-md"
            >
              SDK
            </TabsTrigger>
            <TabsTrigger
              value="curl"
              className="h-7 text-xs px-3 data-[state=active]:bg-[rgba(143,255,0,0.1)] data-[state=active]:text-humanity-lime data-[state=active]:border-none rounded-md"
            >
              cURL
            </TabsTrigger>
          </TabsList>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-[rgba(255,255,255,0.5)] hover:text-white"
            onClick={() => handleCopy(currentCode)}
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 mr-1 text-humanity-lime" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </>
            )}
          </Button>
        </div>

        <TabsContent value="sdk" className="m-0">
          {isLoading ? (
            <pre className="p-4 text-sm overflow-x-auto max-h-[300px]">
              <code className="text-[rgba(255,255,255,0.5)] font-mono">{sdkCode}</code>
            </pre>
          ) : (
            <div
              className="shiki-container overflow-x-auto max-h-[300px] [&>pre]:!p-4 [&>pre]:!m-0 [&>pre]:text-sm [&>pre]:!bg-transparent"
              dangerouslySetInnerHTML={{ __html: sdkHtml }}
            />
          )}
        </TabsContent>

        <TabsContent value="curl" className="m-0">
          {isLoading ? (
            <pre className="p-4 text-sm overflow-x-auto max-h-[300px]">
              <code className="text-[rgba(255,255,255,0.5)] font-mono">{curlCommand}</code>
            </pre>
          ) : (
            <div
              className="shiki-container overflow-x-auto max-h-[300px] [&>pre]:!p-4 [&>pre]:!m-0 [&>pre]:text-sm [&>pre]:!bg-transparent"
              dangerouslySetInnerHTML={{ __html: curlHtml }}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
