'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CodeBlock } from '@/components/CodeBlock';
import { ChevronDown, ChevronUp, Code, Terminal, LucideIcon } from 'lucide-react';

export interface UseCaseData {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  presets: string[];
  sdkCode: string;
  curlCommand: string;
  category?: string;
}

interface UseCaseCardProps {
  useCase: UseCaseData;
}

export function UseCaseCard({ useCase }: UseCaseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'sdk' | 'curl'>('sdk');

  const Icon = useCase.icon;

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:border-primary/40">
      {/* Card Header */}
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg">{useCase.title}</h3>
              {useCase.category && (
                <Badge variant="outline" className="text-[10px]">
                  {useCase.category}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              {useCase.description}
            </p>
            
            {/* Preset Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {useCase.presets.map((preset) => (
                <code
                  key={preset}
                  className="text-xs font-mono bg-muted px-2 py-1 rounded border border-foreground/10"
                >
                  {preset}
                </code>
              ))}
            </div>

            {/* View Code Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="gap-2"
            >
              <Code className="w-4 h-4" />
              {isExpanded ? 'Hide Code' : 'View Code'}
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Expandable Code Section */}
      {isExpanded && (
        <div className="border-t bg-muted/30 animate-in slide-in-from-top-2 duration-200">
          {/* Tab Buttons */}
          <div className="flex border-b border-foreground/10">
            <button
              onClick={() => setActiveTab('sdk')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'sdk'
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Code className="w-4 h-4" />
              SDK (TypeScript)
            </button>
            <button
              onClick={() => setActiveTab('curl')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'curl'
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Terminal className="w-4 h-4" />
              cURL
            </button>
          </div>

          {/* Code Content */}
          <div className="p-4">
            {activeTab === 'sdk' ? (
              <CodeBlock
                code={useCase.sdkCode}
                language="typescript"
                showCopy={true}
              />
            ) : (
              <CodeBlock
                code={useCase.curlCommand}
                language="bash"
                showCopy={true}
              />
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

