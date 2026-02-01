'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatTimeAgo } from '@/lib/utils';
import { ExternalLink, Sparkles, Newspaper, Zap } from 'lucide-react';

interface NewsCardProps {
  article: {
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
  };
  derivedLabel?: string | null;
  index: number;
}

export function NewsCard({ article, derivedLabel, index }: NewsCardProps) {
  const [imageError, setImageError] = useState(false);
  const hasImage = article.imageUrl && !imageError;

  return (
    <Card
      className="group overflow-hidden animate-slide-up"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {/* Image or Fallback */}
        <div className="relative h-36 overflow-hidden border-b border-[rgba(255,255,255,0.06)] bg-[#0a0a0a]">
          {hasImage ? (
            <img
              src={article.imageUrl}
              alt=""
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Newspaper className="w-8 h-8 text-[rgba(255,255,255,0.15)]" />
            </div>
          )}
          {derivedLabel && (
            <div className="absolute top-3 right-3">
              <Badge variant="default" className="gap-1 text-[10px] shadow-md">
                <Zap className="w-3 h-3" />
                {derivedLabel}
              </Badge>
            </div>
          )}
        </div>

        <div className="p-5">
          {article.recommendationReason && (
            <div className="flex items-center gap-1.5 mb-3">
              <div className="w-5 h-5 rounded-full bg-[rgba(143,255,0,0.1)] flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-humanity-lime" />
              </div>
              <span className="text-[11px] font-medium text-humanity-lime">
                {article.recommendationReason}
              </span>
            </div>
          )}

          <h3 className="font-semibold leading-snug mb-2 text-white group-hover:text-humanity-lime transition-colors duration-200 line-clamp-2">
            {article.title}
          </h3>

          <p className="text-[rgba(255,255,255,0.5)] text-sm line-clamp-2 mb-4">
            {article.description}
          </p>

          <div className="flex items-center justify-between text-xs text-[rgba(255,255,255,0.4)]">
            <div className="flex items-center gap-2">
              <span className="font-medium text-[rgba(255,255,255,0.6)]">{article.source}</span>
              <span>·</span>
              <span>{formatTimeAgo(article.publishedAt)}</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 group-hover:text-humanity-lime transition-colors" />
          </div>

          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)]">
              {article.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0.5">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </a>
    </Card>
  );
}
