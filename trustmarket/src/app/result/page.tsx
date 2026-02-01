'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

// Verification factors - 3 core checks via Humanity Protocol SDK
const verificationFactors = [
  {
    id: 'is_human',
    name: 'Human Verified',
    icon: '👤',
    desc: 'sdk.verifyPreset({ preset: "is_human" })',
  },
  {
    id: 'palm_verified',
    name: 'Palm Biometric',
    icon: '✋',
    desc: 'sdk.verifyPreset({ preset: "palm_verified" })',
  },
  {
    id: 'kyc_check',
    name: 'Identity Check',
    icon: '🪪',
    desc: 'sdk.verifyPreset({ preset: "kyc_verified" })',
  },
];

// Features unlocked at each verification level
const featureTiers = [
  {
    level: 1,
    name: 'Basic',
    color: '#FF9500',
    features: [
      { name: 'Browse marketplace', icon: '🔍', enabled: true },
      { name: 'Save favorites', icon: '❤️', enabled: true },
      { name: 'Contact verified sellers', icon: '💬', enabled: true },
    ],
  },
  {
    level: 2,
    name: 'Verified',
    color: '#FFBD2E',
    features: [
      { name: 'Create up to 5 listings', icon: '📦', enabled: true },
      { name: 'Verified seller badge', icon: '✓', enabled: true },
      { name: 'Priority in search results', icon: '📈', enabled: true },
    ],
  },
  {
    level: 3,
    name: 'Trusted',
    color: '#6DFB3F',
    features: [
      { name: 'Unlimited listings', icon: '∞', enabled: true },
      { name: 'Featured seller placement', icon: '⭐', enabled: true },
      { name: 'Instant payouts', icon: '💸', enabled: true },
      { name: 'Priority support', icon: '🎯', enabled: true },
    ],
  },
];

// Sample marketplace items
const marketplaceItems = [
  { id: 1, title: 'Vintage Camera', price: 299, seller: 'Alex K.', verified: true, image: '📷' },
  {
    id: 2,
    title: 'Mechanical Keyboard',
    price: 159,
    seller: 'Sarah M.',
    verified: true,
    image: '⌨️',
  },
  { id: 3, title: 'Designer Watch', price: 450, seller: 'Mike R.', verified: true, image: '⌚' },
  { id: 4, title: 'Vinyl Records', price: 89, seller: 'Emma L.', verified: false, image: '💿' },
  { id: 5, title: 'Leather Bag', price: 175, seller: 'Chris P.', verified: true, image: '👜' },
  { id: 6, title: 'Gaming Console', price: 220, seller: 'Jordan T.', verified: true, image: '🎮' },
];

function getTrustLevel(factorsPassed: number) {
  if (factorsPassed >= 3) return { label: 'Trusted', color: '#6DFB3F', level: 3 };
  if (factorsPassed >= 2) return { label: 'Verified', color: '#FFBD2E', level: 2 };
  if (factorsPassed >= 1) return { label: 'Basic', color: '#FF9500', level: 1 };
  return { label: 'Unverified', color: '#959898', level: 0 };
}

function TrustBadge({ level, label, color }: { level: number; label: string; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ backgroundColor: `${color}20` }}
      >
        {level >= 2 ? (
          <svg
            className="w-8 h-8"
            style={{ color }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        ) : level === 1 ? (
          <svg
            className="w-8 h-8"
            style={{ color }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        ) : (
          <svg
            className="w-8 h-8"
            style={{ color }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
      </div>
      <div>
        <div
          className="px-3 py-1 rounded-full text-xs font-semibold inline-block mb-1"
          style={{ backgroundColor: color, color: '#020303' }}
        >
          {label}
        </div>
        <div className="flex gap-1">
          {[1, 2, 3].map((l) => (
            <div
              key={l}
              className="w-2 h-2 rounded-full transition-colors"
              style={{ backgroundColor: l <= level ? color : '#1C1D1D' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// New Listing Modal
function NewListingModal({
  isOpen,
  onClose,
  onSubmit,
  maxListings,
  currentCount,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (listing: { title: string; price: number; image: string }) => void;
  maxListings: number;
  currentCount: number;
}) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('📦');

  const emojis = ['📦', '📷', '⌨️', '⌚', '👜', '🎮', '🎧', '💿', '🏺', '🖼️'];

  if (!isOpen) return null;

  const canCreate = currentCount < maxListings;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0E1110] rounded-2xl p-6 w-full max-w-md border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Create New Listing</h3>
          <button onClick={onClose} className="text-[#959898] hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {!canCreate ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🔒</div>
            <p className="text-[#959898] mb-4">
              You&apos;ve reached your listing limit ({maxListings} listings).
              <br />
              Complete more verifications for unlimited listings.
            </p>
            <button
              onClick={onClose}
              className="bg-[#6DFB3F] text-[#020303] px-6 py-2 rounded-lg font-medium"
            >
              Got it
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#959898] block mb-2">Item Icon</label>
                <div className="flex flex-wrap gap-2">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                        selectedEmoji === emoji
                          ? 'bg-[#6DFB3F]/20 border-2 border-[#6DFB3F]'
                          : 'bg-[#151918] border border-white/10 hover:border-white/30'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-[#959898] block mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What are you selling?"
                  className="w-full bg-[#151918] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-[#959898]/50 focus:outline-none focus:border-[#6DFB3F]/50"
                />
              </div>

              <div>
                <label className="text-sm text-[#959898] block mb-2">Price ($)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                  className="w-full bg-[#151918] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-[#959898]/50 focus:outline-none focus:border-[#6DFB3F]/50"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 bg-[#1C1D1D] text-white py-3 rounded-xl font-medium border border-white/10 hover:bg-[#252626] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (title && price) {
                    onSubmit({ title, price: Number(price), image: selectedEmoji });
                    setTitle('');
                    setPrice('');
                    setSelectedEmoji('📦');
                    onClose();
                  }
                }}
                disabled={!title || !price}
                className="flex-1 bg-[#6DFB3F] text-[#020303] py-3 rounded-xl font-semibold hover:bg-[#5de032] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Listing
              </button>
            </div>

            <p className="text-xs text-[#959898] text-center mt-4">
              {currentCount}/{maxListings} listings used
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResultPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status') || 'unknown';
  const message = searchParams.get('message');
  const reasons = searchParams.get('reasons')?.split(',') || [];

  const [activeTab, setActiveTab] = useState<'overview' | 'browse' | 'favorites' | 'listings'>(
    'overview',
  );
  const [favorites, setFavorites] = useState<number[]>([]);
  const [myListings, setMyListings] = useState<
    { id: number; title: string; price: number; image: string }[]
  >([]);
  const [showNewListingModal, setShowNewListingModal] = useState(false);

  // Simulated verification results based on status
  const factorResults =
    status === 'success'
      ? [
          { ...verificationFactors[0], passed: true },
          { ...verificationFactors[1], passed: true },
          { ...verificationFactors[2], passed: true },
        ]
      : status === 'incomplete'
        ? [
            { ...verificationFactors[0], passed: true },
            { ...verificationFactors[1], passed: !reasons.includes('palm_verified') },
            { ...verificationFactors[2], passed: false },
          ]
        : verificationFactors.map((f) => ({ ...f, passed: false }));

  const passedCount = factorResults.filter((f) => f.passed).length;
  const trustLevel = getTrustLevel(passedCount);
  const currentTier = featureTiers.find((t) => t.level === trustLevel.level);
  const nextTier = featureTiers.find((t) => t.level === trustLevel.level + 1);

  // Calculate max listings based on level
  const maxListings = passedCount >= 3 ? Infinity : passedCount >= 2 ? 5 : 0;

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  };

  const addListing = (listing: { title: string; price: number; image: string }) => {
    setMyListings((prev) => [...prev, { ...listing, id: Date.now() }]);
  };

  const removeListing = (id: number) => {
    setMyListings((prev) => prev.filter((l) => l.id !== id));
  };

  // Auto-select appropriate tab based on level
  useEffect(() => {
    if (passedCount === 0) setActiveTab('overview');
  }, [passedCount]);

  return (
    <>
      {/* Header */}
      <header className="border-b border-white/10 px-4 py-4 sticky top-0 bg-[#020303]/95 backdrop-blur z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#6DFB3F] rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-[#020303]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <span className="text-white font-semibold">TrustMarket</span>
            </Link>
          </div>
          <TrustBadge level={trustLevel.level} label={trustLevel.label} color={trustLevel.color} />
        </div>
      </header>

      <main className="min-h-screen">
        <div className="max-w-7xl mx-auto p-4 lg:p-8">
          {/* Desktop Layout */}
          <div className="grid lg:grid-cols-[280px_1fr] gap-6">
            {/* Sidebar */}
            <aside className="lg:sticky lg:top-24 lg:self-start space-y-4">
              {/* Status Card */}
              <div className="bg-[#0E1110] rounded-2xl p-5 border border-white/10">
                <div className="text-center mb-4">
                  <h2 className="text-lg font-semibold text-white mb-1">
                    {passedCount === 3 && 'Full Access Unlocked!'}
                    {passedCount === 2 && 'Seller Access Unlocked!'}
                    {passedCount === 1 && 'Basic Access Unlocked!'}
                    {passedCount === 0 && status === 'error' && 'Verification Failed'}
                    {passedCount === 0 && status !== 'error' && 'Not Verified'}
                  </h2>
                  <p className="text-sm text-[#959898]">{passedCount}/3 verifications complete</p>
                </div>

                {/* Progress */}
                <div className="h-2 bg-[#1C1D1D] rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(passedCount / 3) * 100}%`,
                      backgroundColor: trustLevel.color,
                    }}
                  />
                </div>

                {/* Verification Status */}
                <div className="space-y-2">
                  {factorResults.map((factor) => (
                    <div
                      key={factor.id}
                      className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{factor.icon}</span>
                        <span className="text-sm text-white">{factor.name}</span>
                      </div>
                      {factor.passed ? (
                        <svg
                          className="w-5 h-5 text-[#6DFB3F]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <span className="text-xs text-[#959898]">Pending</span>
                      )}
                    </div>
                  ))}
                </div>

                {passedCount < 3 && (
                  <Link
                    href="/api/verify"
                    className="block w-full mt-4 bg-[#6DFB3F] text-[#020303] py-3 rounded-xl font-semibold text-center text-sm hover:bg-[#5de032] transition-colors"
                  >
                    Continue Verification →
                  </Link>
                )}
              </div>

              {/* Navigation Tabs */}
              <div className="bg-[#0E1110] rounded-2xl p-2 border border-white/10">
                {[
                  { id: 'overview', label: 'Overview', icon: '📊', minLevel: 0 },
                  { id: 'browse', label: 'Browse', icon: '🔍', minLevel: 1 },
                  { id: 'favorites', label: 'Favorites', icon: '❤️', minLevel: 1 },
                  { id: 'listings', label: 'My Listings', icon: '📦', minLevel: 2 },
                ].map((tab) => {
                  const isLocked = passedCount < tab.minLevel;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => !isLocked && setActiveTab(tab.id as typeof activeTab)}
                      disabled={isLocked}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                        activeTab === tab.id
                          ? 'bg-[#6DFB3F]/10 text-[#6DFB3F]'
                          : isLocked
                            ? 'text-[#959898]/50 cursor-not-allowed'
                            : 'text-[#959898] hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span className={isLocked ? 'opacity-50' : ''}>{tab.icon}</span>
                      <span className="text-sm font-medium">{tab.label}</span>
                      {isLocked && (
                        <svg
                          className="w-4 h-4 ml-auto"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      )}
                      {tab.id === 'favorites' && favorites.length > 0 && (
                        <span className="ml-auto bg-[#6DFB3F] text-[#020303] text-xs px-2 py-0.5 rounded-full font-medium">
                          {favorites.length}
                        </span>
                      )}
                      {tab.id === 'listings' && myListings.length > 0 && (
                        <span className="ml-auto bg-[#FFBD2E] text-[#020303] text-xs px-2 py-0.5 rounded-full font-medium">
                          {myListings.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Quick Links */}
              <div className="bg-[#0E1110] rounded-2xl p-4 border border-white/10">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-sm text-[#959898] hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Back to Home
                </Link>
              </div>
            </aside>

            {/* Main Content */}
            <div className="space-y-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <>
                  {/* Unlocked Features */}
                  {currentTier && (
                    <div
                      className="rounded-2xl p-6 border"
                      style={{
                        backgroundColor: `${currentTier.color}08`,
                        borderColor: `${currentTier.color}30`,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl">🎉</span>
                        <h3 className="text-lg font-semibold" style={{ color: currentTier.color }}>
                          {currentTier.name} Features Unlocked
                        </h3>
                      </div>
                      <div className="grid sm:grid-cols-3 gap-3">
                        {currentTier.features.map((feature) => (
                          <div
                            key={feature.name}
                            className="flex items-center gap-3 bg-white/5 rounded-xl p-4"
                          >
                            <span className="text-2xl">{feature.icon}</span>
                            <div>
                              <span className="text-white text-sm font-medium">{feature.name}</span>
                              <svg
                                className="w-4 h-4 inline ml-2"
                                style={{ color: currentTier.color }}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Next Level Preview */}
                  {nextTier && (
                    <div className="bg-[#0E1110] rounded-2xl p-6 border border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-semibold">Unlock with {nextTier.name}</h3>
                        <span
                          className="text-xs px-3 py-1 rounded-full"
                          style={{ backgroundColor: `${nextTier.color}20`, color: nextTier.color }}
                        >
                          +1 verification needed
                        </span>
                      </div>
                      <div className="grid sm:grid-cols-3 gap-3">
                        {nextTier.features.map((feature) => (
                          <div
                            key={feature.name}
                            className="flex items-center gap-3 bg-[#151918] rounded-xl p-4 opacity-60"
                          >
                            <span className="text-2xl">{feature.icon}</span>
                            <span className="text-[#959898] text-sm">{feature.name}</span>
                            <svg
                              className="w-4 h-4 ml-auto text-[#959898]/50"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                              />
                            </svg>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All Tiers Overview */}
                  <div className="bg-[#0E1110] rounded-2xl p-6 border border-white/10">
                    <h3 className="text-white font-semibold mb-4">All Trust Levels</h3>
                    <div className="grid sm:grid-cols-3 gap-4">
                      {featureTiers.map((tier) => (
                        <div
                          key={tier.name}
                          className={`rounded-xl p-4 border transition-all ${
                            trustLevel.level >= tier.level
                              ? 'bg-white/5 border-white/10'
                              : 'bg-[#151918] border-transparent opacity-50'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                              style={{
                                backgroundColor: `${tier.color}20`,
                                color: tier.color,
                              }}
                            >
                              {tier.level}
                            </div>
                            <span className="text-white font-medium">{tier.name}</span>
                            {trustLevel.level >= tier.level && (
                              <svg
                                className="w-4 h-4 ml-auto"
                                style={{ color: tier.color }}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </div>
                          <ul className="space-y-1">
                            {tier.features.map((f) => (
                              <li
                                key={f.name}
                                className="text-xs text-[#959898] flex items-center gap-1"
                              >
                                <span>{f.icon}</span> {f.name}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Browse Tab */}
              {activeTab === 'browse' && passedCount >= 1 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">Marketplace</h2>
                    <span className="text-sm text-[#959898]">{marketplaceItems.length} items</span>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {marketplaceItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-[#0E1110] rounded-2xl p-4 border border-white/10 hover:border-[#6DFB3F]/30 transition-all group"
                      >
                        <div className="aspect-square bg-[#151918] rounded-xl flex items-center justify-center text-5xl mb-4 group-hover:scale-105 transition-transform">
                          {item.image}
                        </div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-white font-medium group-hover:text-[#6DFB3F] transition-colors">
                              {item.title}
                            </h3>
                            <p className="text-[#6DFB3F] font-bold text-lg">${item.price}</p>
                            <div className="flex items-center gap-1 mt-1">
                              {item.verified && (
                                <svg
                                  className="w-3.5 h-3.5 text-[#6DFB3F]"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                              <span className="text-xs text-[#959898]">{item.seller}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => toggleFavorite(item.id)}
                            className={`p-2 rounded-lg transition-all ${
                              favorites.includes(item.id)
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-white/5 text-[#959898] hover:text-red-400'
                            }`}
                          >
                            <svg
                              className="w-5 h-5"
                              fill={favorites.includes(item.id) ? 'currentColor' : 'none'}
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Favorites Tab */}
              {activeTab === 'favorites' && passedCount >= 1 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-white">My Favorites</h2>
                  {favorites.length === 0 ? (
                    <div className="bg-[#0E1110] rounded-2xl p-12 border border-white/10 text-center">
                      <span className="text-5xl block mb-4">❤️</span>
                      <p className="text-[#959898] mb-4">No favorites yet</p>
                      <button
                        onClick={() => setActiveTab('browse')}
                        className="bg-[#6DFB3F] text-[#020303] px-6 py-2 rounded-lg font-medium"
                      >
                        Browse Marketplace
                      </button>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {marketplaceItems
                        .filter((item) => favorites.includes(item.id))
                        .map((item) => (
                          <div
                            key={item.id}
                            className="bg-[#0E1110] rounded-2xl p-4 border border-white/10"
                          >
                            <div className="aspect-square bg-[#151918] rounded-xl flex items-center justify-center text-5xl mb-4">
                              {item.image}
                            </div>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="text-white font-medium">{item.title}</h3>
                                <p className="text-[#6DFB3F] font-bold text-lg">${item.price}</p>
                              </div>
                              <button
                                onClick={() => toggleFavorite(item.id)}
                                className="p-2 rounded-lg bg-red-500/20 text-red-400"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* My Listings Tab */}
              {activeTab === 'listings' && passedCount >= 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-white">My Listings</h2>
                      <p className="text-sm text-[#959898]">
                        {myListings.length}/{maxListings === Infinity ? '∞' : maxListings} listings
                      </p>
                    </div>
                    <button
                      onClick={() => setShowNewListingModal(true)}
                      className="bg-[#6DFB3F] text-[#020303] px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-[#5de032] transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      New Listing
                    </button>
                  </div>

                  {myListings.length === 0 ? (
                    <div className="bg-[#0E1110] rounded-2xl p-12 border border-white/10 text-center">
                      <span className="text-5xl block mb-4">📦</span>
                      <p className="text-[#959898] mb-4">No listings yet</p>
                      <button
                        onClick={() => setShowNewListingModal(true)}
                        className="bg-[#6DFB3F] text-[#020303] px-6 py-2 rounded-lg font-medium"
                      >
                        Create Your First Listing
                      </button>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {myListings.map((listing) => (
                        <div
                          key={listing.id}
                          className="bg-[#0E1110] rounded-2xl p-4 border border-white/10"
                        >
                          <div className="aspect-square bg-[#151918] rounded-xl flex items-center justify-center text-5xl mb-4">
                            {listing.image}
                          </div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="text-white font-medium">{listing.title}</h3>
                              <p className="text-[#6DFB3F] font-bold text-lg">${listing.price}</p>
                              <div className="flex items-center gap-1 mt-1">
                                <svg
                                  className="w-3.5 h-3.5 text-[#6DFB3F]"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                <span className="text-xs text-[#959898]">You (Verified)</span>
                              </div>
                            </div>
                            <button
                              onClick={() => removeListing(listing.id)}
                              className="p-2 rounded-lg bg-white/5 text-[#959898] hover:text-red-400 hover:bg-red-500/20 transition-all"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Error state */}
              {passedCount === 0 && status === 'error' && (
                <div className="bg-[#0E1110] rounded-2xl p-8 border border-white/10 text-center">
                  <span className="text-5xl block mb-4">⚠️</span>
                  <h2 className="text-xl font-semibold text-white mb-2">Verification Failed</h2>
                  <p className="text-[#959898] mb-6">
                    We couldn&apos;t complete your verification.
                    {message && (
                      <span className="block text-red-400 text-sm mt-2">Error: {message}</span>
                    )}
                  </p>
                  <Link
                    href="/api/verify"
                    className="inline-block bg-[#6DFB3F] text-[#020303] px-6 py-3 rounded-xl font-semibold hover:bg-[#5de032] transition-colors"
                  >
                    Try Again
                  </Link>
                </div>
              )}

              {/* Not verified state */}
              {passedCount === 0 && status !== 'error' && (
                <div className="bg-[#0E1110] rounded-2xl p-8 border border-white/10 text-center">
                  <span className="text-5xl block mb-4">🔒</span>
                  <h2 className="text-xl font-semibold text-white mb-2">Get Started</h2>
                  <p className="text-[#959898] mb-6">
                    Complete at least one verification to unlock marketplace access.
                    <br />
                    Each verification unlocks more features.
                  </p>
                  <Link
                    href="/api/verify"
                    className="inline-block bg-[#6DFB3F] text-[#020303] px-6 py-3 rounded-xl font-semibold hover:bg-[#5de032] transition-colors"
                  >
                    Start Verification
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Demo Notice */}
      <footer className="text-center py-6 text-xs text-[#959898]">
        This is a demo. Verification status is simulated.
      </footer>

      {/* New Listing Modal */}
      <NewListingModal
        isOpen={showNewListingModal}
        onClose={() => setShowNewListingModal(false)}
        onSubmit={addListing}
        maxListings={maxListings === Infinity ? 999 : maxListings}
        currentCount={myListings.length}
      />
    </>
  );
}
