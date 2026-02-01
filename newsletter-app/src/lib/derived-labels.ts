/**
 * Derived Labels Utility
 * 
 * Client-safe functions for computing derived labels from user signals.
 * This file is safe to import in client components.
 */

export type NewsCategory = 
  | 'professional'
  | 'community'
  | 'social'
  | 'tech'
  | 'travel'
  | 'general';

/**
 * Derived label interface for user-friendly signal display
 */
export interface DerivedLabel {
  id: string;
  label: string;
  signal: string;
  category: NewsCategory | 'multiple';
}

/**
 * Derive user-friendly labels from signal combinations.
 * These labels help users understand how their signals affect content.
 */
export function getDerivedLabels(userSocials: string[], userPresets: string[]): DerivedLabel[] {
  const labels: DerivedLabel[] = [];
  
  // Travel-friendly: has any travel preset
  if (userPresets.includes('is_frequent_traveler') || 
      userPresets.includes('has_hotel_membership') || 
      userPresets.includes('has_airline_membership')) {
    labels.push({ 
      id: 'travel_friendly', 
      label: 'Travel-friendly', 
      signal: 'travel_presets',
      category: 'travel'
    });
  }
  
  // Tech Enthusiast: github connected
  if (userSocials.includes('github')) {
    labels.push({ 
      id: 'tech_enthusiast', 
      label: 'Tech Enthusiast', 
      signal: 'github',
      category: 'tech'
    });
  }
  
  // Professional: linkedin connected  
  if (userSocials.includes('linkedin')) {
    labels.push({ 
      id: 'professional', 
      label: 'Professional', 
      signal: 'linkedin',
      category: 'professional'
    });
  }
  
  // Community Member: discord or telegram
  if (userSocials.includes('discord') || userSocials.includes('telegram')) {
    labels.push({ 
      id: 'community_member', 
      label: 'Community Member', 
      signal: userSocials.includes('discord') ? 'discord' : 'telegram',
      category: 'community'
    });
  }

  // Social Butterfly: twitter connected
  if (userSocials.includes('twitter')) {
    labels.push({ 
      id: 'social_butterfly', 
      label: 'Trend Watcher', 
      signal: 'twitter',
      category: 'social'
    });
  }
  
  return labels;
}

/**
 * Get the derived label for an article based on user's derived labels.
 */
export function getArticleDerivedLabel(
  articleCategory: string,
  derivedLabels: DerivedLabel[]
): string | null {
  // Find a derived label that matches the article's category
  const matchingLabel = derivedLabels.find(label => label.category === articleCategory);
  return matchingLabel?.label || null;
}



