import Link from 'next/link';

// Sample marketplace listings
const allListings: Record<
  string,
  {
    id: number;
    title: string;
    price: number;
    seller: string;
    verified: boolean;
    image: string;
    category: string;
    description: string;
  }
> = {
  '1': {
    id: 1,
    title: 'Vintage Camera',
    price: 299,
    seller: 'Alex K.',
    verified: true,
    image: '📷',
    category: 'electronics',
    description:
      'Beautiful vintage film camera in excellent condition. Perfect for photography enthusiasts who appreciate classic equipment.',
  },
  '2': {
    id: 2,
    title: 'Mechanical Keyboard',
    price: 159,
    seller: 'Sarah M.',
    verified: true,
    image: '⌨️',
    category: 'electronics',
    description:
      'Premium mechanical keyboard with Cherry MX switches. RGB backlighting and programmable keys.',
  },
  '3': {
    id: 3,
    title: 'Designer Watch',
    price: 450,
    seller: 'Mike R.',
    verified: true,
    image: '⌚',
    category: 'fashion',
    description:
      'Elegant designer watch with automatic movement. Sapphire crystal face and genuine leather band.',
  },
  '4': {
    id: 4,
    title: 'Vintage Vinyl Records',
    price: 89,
    seller: 'Emma L.',
    verified: false,
    image: '💿',
    category: 'music',
    description:
      'Collection of classic vinyl records from the 70s and 80s. Various genres including rock, jazz, and soul.',
  },
  '5': {
    id: 5,
    title: 'Leather Messenger Bag',
    price: 175,
    seller: 'Chris P.',
    verified: true,
    image: '👜',
    category: 'fashion',
    description:
      'Handcrafted full-grain leather messenger bag. Perfect for daily commute or travel.',
  },
  '6': {
    id: 6,
    title: 'Retro Gaming Console',
    price: 220,
    seller: 'Jordan T.',
    verified: true,
    image: '🎮',
    category: 'electronics',
    description:
      'Classic gaming console with 2 controllers and 10 built-in games. Fully refurbished and tested.',
  },
  '7': {
    id: 7,
    title: 'Handmade Ceramic Vase',
    price: 65,
    seller: 'Lisa N.',
    verified: false,
    image: '🏺',
    category: 'home',
    description:
      'Beautiful handmade ceramic vase. Each piece is unique with subtle variations in glaze.',
  },
  '8': {
    id: 8,
    title: 'Wireless Headphones',
    price: 199,
    seller: 'Dave W.',
    verified: true,
    image: '🎧',
    category: 'electronics',
    description:
      'Premium wireless headphones with active noise cancellation. 30-hour battery life.',
  },
};

interface ListingPageProps {
  params: Promise<{ id: string }>;
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { id } = await params;
  const listing = allListings[id];

  if (!listing) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-white mb-2">Listing not found</h1>
          <p className="text-[#959898] mb-6">This item may have been sold or removed.</p>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 bg-[#6DFB3F] text-[#020303] px-6 py-3 rounded-xl font-semibold hover:bg-[#5de032] transition-colors"
          >
            Browse Marketplace
          </Link>
        </div>
      </main>
    );
  }

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
            <Link
              href="/marketplace"
              className="text-[#959898] hover:text-white text-sm transition-colors"
            >
              Browse
            </Link>
            <Link
              href="/how-it-works"
              className="text-[#959898] hover:text-white text-sm transition-colors"
            >
              How it works
            </Link>
          </div>
        </div>
      </header>

      <main className="pb-20">
        {/* Breadcrumb */}
        <section className="px-4 py-4 border-b border-white/5">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-sm text-[#959898]">
              <Link href="/marketplace" className="hover:text-white transition-colors">
                Marketplace
              </Link>
              <span>/</span>
              <span className="capitalize">{listing.category}</span>
              <span>/</span>
              <span className="text-white">{listing.title}</span>
            </div>
          </div>
        </section>

        {/* Listing Detail */}
        <section className="px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Image */}
              <div className="bg-[#0E1110] rounded-2xl p-8 border border-white/10">
                <div className="aspect-square bg-[#151918] rounded-xl flex items-center justify-center text-8xl">
                  {listing.image}
                </div>
              </div>

              {/* Details */}
              <div>
                <div className="mb-6">
                  <span className="text-xs text-[#959898] uppercase tracking-wide">
                    {listing.category}
                  </span>
                  <h1 className="text-3xl font-bold text-white mt-2 mb-4">{listing.title}</h1>
                  <p className="text-[#959898]">{listing.description}</p>
                </div>

                <div className="text-4xl font-bold text-[#6DFB3F] mb-6">${listing.price}</div>

                {/* Seller Info */}
                <div className="bg-[#0E1110] rounded-xl p-4 border border-white/10 mb-6">
                  <div className="text-xs text-[#959898] uppercase tracking-wide mb-3">Seller</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${listing.verified ? 'bg-[#6DFB3F]/20' : 'bg-[#1C1D1D]'}`}
                      >
                        {listing.verified ? (
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
                              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                            />
                          </svg>
                        ) : (
                          <span className="text-[#959898]">?</span>
                        )}
                      </div>
                      <div>
                        <div className="text-white font-medium">{listing.seller}</div>
                        {listing.verified ? (
                          <div className="flex items-center gap-1 text-xs text-[#6DFB3F]">
                            <svg
                              className="w-3 h-3"
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
                            Verified Human
                          </div>
                        ) : (
                          <div className="text-xs text-[#959898]">Not verified</div>
                        )}
                      </div>
                    </div>
                    {listing.verified && (
                      <div className="bg-[#6DFB3F]/10 text-[#6DFB3F] text-xs px-3 py-1 rounded-full">
                        Trusted Seller
                      </div>
                    )}
                  </div>
                </div>

                {/* Verification Badge */}
                {listing.verified ? (
                  <div className="bg-[#6DFB3F]/10 rounded-xl p-4 border border-[#6DFB3F]/30 mb-6">
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-[#6DFB3F] shrink-0 mt-0.5"
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
                      <div>
                        <div className="text-[#6DFB3F] font-medium">Verified Seller</div>
                        <p className="text-[#959898] text-sm mt-1">
                          This seller has verified their identity through Humanity Protocol&apos;s
                          biometric verification. They are a confirmed real human.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/30 mb-6">
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-amber-500 shrink-0 mt-0.5"
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
                      <div>
                        <div className="text-amber-500 font-medium">Unverified Seller</div>
                        <p className="text-[#959898] text-sm mt-1">
                          This seller has not completed identity verification. Proceed with caution
                          when making purchases from unverified sellers.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button className="flex-1 bg-[#6DFB3F] text-[#020303] py-4 rounded-xl font-semibold hover:bg-[#5de032] transition-colors">
                    Contact Seller
                  </button>
                  <button className="px-4 py-4 rounded-xl border border-white/10 text-white hover:bg-[#1C1D1D] transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </button>
                  <button className="px-4 py-4 rounded-xl border border-white/10 text-white hover:bg-[#1C1D1D] transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                  </button>
                </div>

                <p className="text-xs text-[#959898] text-center mt-4">
                  Demo only - no actual transactions occur
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How Verification Works */}
        <section className="px-4 py-12 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-white mb-6 text-center">
              How Seller Verification Works
            </h2>
            <div className="bg-[#0E1110] rounded-2xl p-6 border border-white/10">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="w-12 h-12 bg-[#6DFB3F]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">👤</span>
                  </div>
                  <div className="text-white font-medium mb-1">is_human</div>
                  <p className="text-[#959898] text-xs">
                    Verifies the seller is a real human, not a bot
                  </p>
                </div>
                <div>
                  <div className="w-12 h-12 bg-[#6DFB3F]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">✋</span>
                  </div>
                  <div className="text-white font-medium mb-1">palm_verified</div>
                  <p className="text-[#959898] text-xs">
                    Unique biometric signature confirms identity
                  </p>
                </div>
                <div>
                  <div className="w-12 h-12 bg-[#6DFB3F]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🪪</span>
                  </div>
                  <div className="text-white font-medium mb-1">kyc_verified</div>
                  <p className="text-[#959898] text-xs">Document verification for higher trust</p>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-white/5 text-center">
                <Link
                  href="/how-it-works"
                  className="text-[#6DFB3F] hover:text-[#5de032] text-sm font-medium transition-colors"
                >
                  Learn more about verification →
                </Link>
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
