'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight, X, Sparkles } from 'lucide-react';
import { resolvePath } from '@/lib/paths';

export function StickyFooterCTA() {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  // Don't show on the use-cases page itself
  const isUseCasesPage = pathname === '/use-cases' || pathname.endsWith('/use-cases');

  // Show after a small delay for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isDismissed || isUseCasesPage || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-500">
      <div className="bg-gradient-to-r from-humanity-lime/95 via-humanity-lime to-humanity-lime/95 border-t border-humanity-lime/20 shadow-[0_-8px_32px_rgba(143,255,0,0.2)]">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Message */}
            <div className="flex items-center gap-3 flex-1">
              <div className="hidden sm:flex w-8 h-8 rounded-full bg-black/10 items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-black" />
              </div>
              <p className="text-black text-sm sm:text-base font-medium">
                This is just 1 of 30+ use cases you can build with the SDK
              </p>
            </div>

            {/* CTA */}
            <div className="flex items-center gap-2">
              <Link href={resolvePath('/use-cases')}>
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-2 bg-black text-white hover:bg-black/90 border-none font-semibold shadow-md rounded-lg"
                >
                  Explore more
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              
              {/* Dismiss button */}
              <button
                onClick={() => setIsDismissed(true)}
                className="p-1.5 rounded-full hover:bg-black/10 transition-colors text-black/60 hover:text-black"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
