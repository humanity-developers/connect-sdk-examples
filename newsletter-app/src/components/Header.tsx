'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExplainButton } from '@/components/ExplainButton';
import { GitBranch } from 'lucide-react';
import { resolvePath, resolveApiPath } from '@/lib/paths';

interface HeaderProps {
  isAuthenticated?: boolean;
  email?: string;
  evmAddress?: string;
  linkedSocials?: string[];
}

/**
 * Crop an EVM address to show first 6 and last 4 characters.
 */
function cropAddress(address: string): string {
  if (address.length <= 13) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Get display name with fallback logic.
 */
function getDisplayName(email?: string, evmAddress?: string): string {
  if (email) return email;
  if (evmAddress) return cropAddress(evmAddress);
  return 'Anonymous';
}

export function Header({ isAuthenticated, email, evmAddress, linkedSocials = [] }: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch(resolveApiPath('/api/auth/logout'), { method: 'POST' });
    router.push(resolvePath('/'));
    router.refresh();
  };

  const displayName = getDisplayName(email, evmAddress);
  const isAddress = !email && evmAddress;

  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(255,255,255,0.08)] bg-[rgba(5,5,5,0.8)] backdrop-blur-xl">
      <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <Link href={resolvePath('/')} className="flex items-center gap-3 group">
          <Image
            src="/favicon.svg"
            alt="Humanity Protocol"
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <div className="hidden sm:flex items-center gap-2">
            <span className="font-semibold text-lg text-white">Newsletter</span>
            <Badge variant="live" className="text-[10px] gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-humanity-lime animate-pulse" />
              Demo
            </Badge>
          </div>
        </Link>

        {/* Status & Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Flow Explainer Link */}
              <Link href={resolvePath('/flow')}>
                <Button variant="ghost" size="sm" className="gap-2 hidden sm:flex text-[rgba(255,255,255,0.65)] hover:text-white">
                  <GitBranch className="w-4 h-4" />
                  How it Works
                </Button>
              </Link>
              
              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="text-right hidden sm:block">
                    <p className={`text-sm font-medium text-white ${isAddress ? 'font-mono' : ''}`}>
                      {displayName}
                    </p>
                    <p className="text-xs text-[rgba(255,255,255,0.4)]">
                      {linkedSocials.length} social{linkedSocials.length !== 1 ? 's' : ''} linked
                    </p>
                  </div>
                  <ExplainButton item="user_profile" />
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <Badge variant="outline" className="text-[rgba(255,255,255,0.65)]">Not Connected</Badge>
          )}
        </div>
      </div>
    </header>
  );
}
