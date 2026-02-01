'use client';

import Link from 'next/link';
import { useState } from 'react';

// Sample marketplace listings
const allListings = [
  {
    id: 1,
    title: 'Vintage Camera',
    price: 299,
    seller: 'Alex K.',
    verified: true,
    image: '📷',
    category: 'electronics',
  },
  {
    id: 2,
    title: 'Mechanical Keyboard',
    price: 159,
    seller: 'Sarah M.',
    verified: true,
    image: '⌨️',
    category: 'electronics',
  },
  {
    id: 3,
    title: 'Designer Watch',
    price: 450,
    seller: 'Mike R.',
    verified: true,
    image: '⌚',
    category: 'fashion',
  },
  {
    id: 4,
    title: 'Vintage Vinyl Records',
    price: 89,
    seller: 'Emma L.',
    verified: false,
    image: '💿',
    category: 'music',
  },
  {
    id: 5,
    title: 'Leather Messenger Bag',
    price: 175,
    seller: 'Chris P.',
    verified: true,
    image: '👜',
    category: 'fashion',
  },
  {
    id: 6,
    title: 'Retro Gaming Console',
    price: 220,
    seller: 'Jordan T.',
    verified: true,
    image: '🎮',
    category: 'electronics',
  },
  {
    id: 7,
    title: 'Handmade Ceramic Vase',
    price: 65,
    seller: 'Lisa N.',
    verified: false,
    image: '🏺',
    category: 'home',
  },
  {
    id: 8,
    title: 'Wireless Headphones',
    price: 199,
    seller: 'Dave W.',
    verified: true,
    image: '🎧',
    category: 'electronics',
  },
];

const categories = [
  { id: 'all', label: 'All Items' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'fashion', label: 'Fashion' },
  { id: 'home', label: 'Home' },
  { id: 'music', label: 'Music' },
];

export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const filteredListings = allListings.filter((listing) => {
    if (selectedCategory !== 'all' && listing.category !== selectedCategory) {
      return false;
    }
    if (verifiedOnly && !listing.verified) {
      return false;
    }
    return true;
  });

  return (
    <>
      {/* Top Banner */}
      <div className="bg-[#0E1110] border-b border-white/10 px-4 py-2">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-2 text-xs">
          <span className="bg-[#1C1D1D] text-[#959898] px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide">
            Example App
          </span>
          <span className="text-[#959898]">
            This demo shows how to use the{' '}
            <Link href="https://docs.humanity.org" className="text-[#6DFB3F] hover:underline">
              Humanity Protocol SDK
            </Link>
          </span>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-white/10 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
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
            <span className="bg-[#6DFB3F]/20 text-[#6DFB3F] px-2 py-0.5 rounded text-xs font-medium">
              DEMO
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/marketplace" className="text-white text-sm font-medium transition-colors">
              Browse
            </Link>
            <Link
              href="/how-it-works"
              className="text-[#959898] hover:text-white text-sm transition-colors"
            >
              How it works
            </Link>
            <Link
              href="/api/verify"
              className="bg-[#6DFB3F] text-[#020303] px-4 py-2 rounded-lg font-medium text-sm hover:bg-[#5de032] transition-colors"
            >
              Sell on TrustMarket
            </Link>
          </div>
        </div>
      </header>

      <main className="pb-20">
        {/* Page Header */}
        <section className="px-4 py-8 border-b border-white/5">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-2">Marketplace</h1>
            <p className="text-[#959898]">Browse items from verified human sellers</p>
          </div>
        </section>

        {/* Filters */}
        <section className="px-4 py-6 border-b border-white/5">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
            {/* Categories */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-[#6DFB3F] text-[#020303]'
                      : 'bg-[#1C1D1D] text-[#959898] hover:text-white border border-white/10'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Verified filter */}
            <button
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                verifiedOnly
                  ? 'bg-[#6DFB3F]/20 text-[#6DFB3F] border border-[#6DFB3F]/30'
                  : 'bg-[#1C1D1D] text-[#959898] hover:text-white border border-white/10'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              Verified Sellers Only
            </button>
          </div>
        </section>

        {/* Listings Grid */}
        <section className="px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {filteredListings.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-4xl mb-4">🔍</div>
                <div className="text-white font-medium mb-2">No listings found</div>
                <p className="text-[#959898] text-sm">
                  Try adjusting your filters to see more items.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredListings.map((listing) => (
                  <Link
                    key={listing.id}
                    href={`/marketplace/${listing.id}`}
                    className="bg-[#0E1110] rounded-xl p-4 border border-white/10 hover:border-[#6DFB3F]/30 transition-all hover:shadow-lg hover:shadow-[#6DFB3F]/5 group"
                  >
                    <div className="aspect-square bg-[#151918] rounded-lg flex items-center justify-center text-5xl mb-4 group-hover:scale-105 transition-transform">
                      {listing.image}
                    </div>
                    <div className="text-white font-medium mb-1 group-hover:text-[#6DFB3F] transition-colors">
                      {listing.title}
                    </div>
                    <div className="text-[#6DFB3F] font-bold text-lg">${listing.price}</div>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                      {listing.verified ? (
                        <>
                          <div className="w-5 h-5 bg-[#6DFB3F]/20 rounded-full flex items-center justify-center">
                            <svg
                              className="w-3 h-3 text-[#6DFB3F]"
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
                          <span className="text-xs text-[#959898]">{listing.seller}</span>
                          <span className="text-[10px] text-[#6DFB3F] bg-[#6DFB3F]/10 px-1.5 py-0.5 rounded">
                            Verified
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="w-5 h-5 bg-[#1C1D1D] rounded-full flex items-center justify-center">
                            <span className="text-[10px] text-[#959898]">?</span>
                          </div>
                          <span className="text-xs text-[#959898]">{listing.seller}</span>
                        </>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Why Verified Sellers */}
        <section className="px-4 py-12 border-t border-white/5">
          <div className="max-w-4xl mx-auto bg-[#0E1110] rounded-2xl p-8 border border-white/10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#6DFB3F]/20 rounded-xl flex items-center justify-center shrink-0">
                <svg
                  className="w-6 h-6 text-[#6DFB3F]"
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
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Why buy from verified sellers?
                </h3>
                <p className="text-[#959898] text-sm mb-4">
                  Verified sellers have passed Humanity Protocol&apos;s biometric verification,
                  proving they are real humans - not bots, scammers, or fake accounts.
                </p>
                <div className="flex flex-wrap gap-4 text-xs">
                  <div className="flex items-center gap-1.5 text-[#6DFB3F]">
                    <span>✓</span> Real human verified
                  </div>
                  <div className="flex items-center gap-1.5 text-[#6DFB3F]">
                    <span>✓</span> Palm biometric check
                  </div>
                  <div className="flex items-center gap-1.5 text-[#6DFB3F]">
                    <span>✓</span> Privacy preserved
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0E1110]/95 backdrop-blur border-t border-white/10 px-4 py-3 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#6DFB3F]">✦</span>
            <span className="text-[#959898] text-sm">
              This is just <span className="text-white font-medium">1 of 30+</span> use cases you
              can build with the SDK
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="https://demo.humanity.org"
              className="inline-flex items-center gap-2 bg-[#6DFB3F] text-[#020303] px-4 py-2 rounded-lg font-medium text-sm hover:bg-[#5de032] transition-colors"
            >
              Explore more
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
