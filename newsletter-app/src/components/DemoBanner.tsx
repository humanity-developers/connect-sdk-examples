'use client';

import { Badge } from '@/components/ui/badge';
import { FlaskConical } from 'lucide-react';

export function DemoBanner() {
  return (
    <div className="bg-[rgba(17,17,17,0.6)] border-b border-[rgba(255,255,255,0.06)] backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-3">
        <Badge variant="secondary" className="gap-1.5 font-medium text-[10px]">
          <FlaskConical className="w-3 h-3" />
          Example App
        </Badge>
        <p className="text-xs text-[rgba(255,255,255,0.5)]">
          This demo shows how to use the{' '}
          <span className="text-humanity-lime font-medium">
            Humanity Protocol SDK
          </span>
        </p>
      </div>
    </div>
  );
}
