'use client';

import { Badge } from '@/components/ui/badge';
import { Check, X, Sliders } from 'lucide-react';

export interface Signal {
  id: string;
  label: string;
  enabled: boolean;
  type: 'social' | 'preset';
}

interface SignalControlsProps {
  signals: Signal[];
  onToggle: (signalId: string) => void;
  className?: string;
}

/**
 * SignalControls component allows users to toggle signals on/off
 * to see how their feed changes - demonstrating transparent personalization.
 */
export function SignalControls({ signals, onToggle, className = '' }: SignalControlsProps) {
  const enabledCount = signals.filter(s => s.enabled).length;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Header with toggle info */}
      <div className="flex items-center gap-2">
        <Sliders className="w-3 h-3 text-[rgba(255,255,255,0.4)]" />
        <span className="text-[10px] text-[rgba(255,255,255,0.4)] uppercase tracking-wider">
          Active Signals ({enabledCount}/{signals.length})
        </span>
      </div>
      
      {/* Signal toggles */}
      <div className="flex flex-wrap gap-1.5">
        {signals.map((signal) => (
          <Badge
            key={signal.id}
            variant={signal.enabled ? 'success' : 'outline'}
            className={`
              cursor-pointer transition-all duration-200 gap-1 text-xs
              ${signal.enabled 
                ? 'hover:bg-[rgba(143,255,0,0.2)]' 
                : 'opacity-60 hover:opacity-100 hover:bg-[rgba(255,255,255,0.05)]'
              }
            `}
            onClick={() => onToggle(signal.id)}
          >
            {signal.enabled ? (
              <Check className="w-3 h-3" />
            ) : (
              <X className="w-3 h-3" />
            )}
            {signal.label}
          </Badge>
        ))}
      </div>
      
      {/* Help text */}
      <p className="text-[10px] text-[rgba(255,255,255,0.4)]">
        Toggle signals to see how your feed changes. This demonstrates transparent personalization.
      </p>
    </div>
  );
}

/**
 * Helper to build Signal[] from session data
 */
export function buildSignalsFromSession(
  linkedSocials: string[],
  presets: string[]
): Signal[] {
  const signals: Signal[] = [];

  // Social signals
  const socialLabels: Record<string, string> = {
    google: 'Google',
    linkedin: 'LinkedIn',
    twitter: 'Twitter/X',
    discord: 'Discord',
    github: 'GitHub',
    telegram: 'Telegram',
  };

  for (const social of linkedSocials) {
    signals.push({
      id: social,
      label: socialLabels[social] || social,
      enabled: true,
      type: 'social',
    });
  }

  // Preset signals
  const presetLabels: Record<string, string> = {
    google_connected: 'Google',
    linkedin_connected: 'LinkedIn',
    twitter_connected: 'Twitter/X',
    discord_connected: 'Discord',
    github_connected: 'GitHub',
    telegram_connected: 'Telegram',
    is_frequent_traveler: 'Frequent Traveler',
    has_hotel_membership: 'Hotel Member',
    has_airline_membership: 'Airline Member',
  };

  for (const preset of presets) {
    // Skip social connection presets if we already have them as socials
    if (preset.endsWith('_connected')) continue;
    
    signals.push({
      id: preset,
      label: presetLabels[preset] || preset.replace(/_/g, ' '),
      enabled: true,
      type: 'preset',
    });
  }

  return signals;
}
