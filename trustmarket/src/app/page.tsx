'use client';

import Link from 'next/link';

// Verification factors - 3 checks via Humanity Protocol SDK
const verificationFactors = [
  { name: 'Human Verified', icon: '👤', desc: 'is_human preset check', weight: 40 },
  { name: 'Palm Biometric', icon: '✋', desc: 'palm_verified preset check', weight: 35 },
  { name: 'Identity Check', icon: '🪪', desc: 'kyc_verified preset check', weight: 25 },
];

// Sample marketplace listings
const sampleListings = [
  {
    id: 1,
    title: 'Vintage Camera',
    price: 299,
    seller: 'Alex K.',
    verified: true,
    image: '📷',
  },
  {
    id: 2,
    title: 'Mechanical Keyboard',
    price: 159,
    seller: 'Sarah M.',
    verified: true,
    image: '⌨️',
  },
  {
    id: 3,
    title: 'Designer Watch',
    price: 450,
    seller: 'Mike R.',
    verified: true,
    image: '⌚',
  },
  {
    id: 4,
    title: 'Vintage Vinyl Records',
    price: 89,
    seller: 'Emma L.',
    verified: false,
    image: '💿',
  },
];

export default function HomePage() {
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
        {/* Hero Section */}
        <section className="px-4 py-16">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-[#6DFB3F]/10 border border-[#6DFB3F]/30 text-[#6DFB3F] px-3 py-1 rounded-full text-xs font-medium mb-6">
                <span>✦</span>
                POWERED BY HUMANITY PROTOCOL
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                Sell with trust,
                <br />
                <span className="text-[#6DFB3F]">verified as human</span>
              </h1>

              <p className="text-[#959898] text-lg mb-6 max-w-md">
                Join the marketplace where every seller is{' '}
                <span className="text-white font-medium">cryptographically verified</span> as a real
                human. Buyers trust you more. You sell more.
              </p>

              {/* Trust Stats */}
              <div className="flex gap-8 mb-8">
                <div>
                  <div className="text-2xl font-bold text-white">97%</div>
                  <div className="text-xs text-[#959898]">Buyer trust rate</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">0%</div>
                  <div className="text-xs text-[#959898]">Bot accounts</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">2.3x</div>
                  <div className="text-xs text-[#959898]">More sales</div>
                </div>
              </div>

              <Link
                href="/api/verify"
                className="inline-flex items-center gap-2 bg-[#6DFB3F] text-[#020303] px-6 py-3 rounded-xl font-semibold hover:bg-[#5de032] transition-colors"
              >
                Get Verified Now
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>

              <p className="text-[#959898] text-xs mt-3">
                Takes ~30 seconds · Privacy preserved · No documents required
              </p>
            </div>

            {/* Right: Trust Badge Preview */}
            <div className="bg-[#0E1110] rounded-3xl p-8 border border-white/10">
              {/* Badge Preview */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-32 h-32 bg-[#6DFB3F]/20 rounded-full flex items-center justify-center">
                    <div className="w-24 h-24 bg-[#6DFB3F]/30 rounded-full flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-[#6DFB3F]"
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
                  </div>
                  {/* Verified badge */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#6DFB3F] text-[#020303] px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                    ✓ Verified Human
                  </div>
                </div>
              </div>

              <div className="text-center mb-6">
                <div className="text-white font-semibold text-lg">Your Seller Badge</div>
                <div className="text-[#959898] text-sm">Displayed on all your listings</div>
              </div>

              {/* Verification Factors */}
              <div className="space-y-3">
                <div className="text-xs text-[#959898] uppercase tracking-wide">What we verify</div>
                {verificationFactors.map((factor) => (
                  <div key={factor.name} className="flex items-center gap-3">
                    <span className="text-lg w-6">{factor.icon}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-white">{factor.name}</span>
                        <span className="text-[#959898]">{factor.weight}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 text-center">
                <span className="text-[#959898] text-xs">
                  Badge valid for <span className="text-white">12 months</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* How Verification Works */}
        <section className="px-4 py-16 border-t border-white/5">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-white mb-3">Verified in 3 Simple Steps</h2>
              <p className="text-[#959898] max-w-2xl mx-auto">
                Get your verified seller badge in under a minute. No documents to upload, no waiting
                for approval.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  title: 'Connect',
                  desc: 'Click verify and connect to Humanity Protocol securely.',
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  ),
                },
                {
                  step: '02',
                  title: 'Verify',
                  desc: 'Complete a quick biometric check to prove you are human.',
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
                    />
                  ),
                },
                {
                  step: '03',
                  title: 'Start Selling',
                  desc: 'Get your verified badge and start listing with buyer trust.',
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  ),
                },
              ].map((item, i) => (
                <div key={i} className="relative">
                  {i < 2 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-[#6DFB3F]/50 to-transparent" />
                  )}
                  <div className="text-[#6DFB3F] text-xs font-mono mb-3">{item.step}</div>
                  <div className="w-16 h-16 bg-[#0E1110] rounded-2xl flex items-center justify-center mb-4 border border-white/10">
                    <svg
                      className="w-8 h-8 text-[#6DFB3F]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {item.icon}
                    </svg>
                  </div>
                  <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                  <p className="text-[#959898] text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Verification Matters */}
        <section className="px-4 py-16 border-t border-white/5">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              {/* For Sellers */}
              <div className="bg-[#0E1110] rounded-2xl p-6 border border-white/10">
                <div className="text-xs text-[#6DFB3F] font-medium uppercase tracking-wide mb-3">
                  For Sellers
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Stand out from the crowd</h3>
                <ul className="space-y-3">
                  {[
                    'Verified badge on all listings',
                    'Higher visibility in search results',
                    'Buyers contact you first',
                    'Premium seller features',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-[#959898]">
                      <span className="text-[#6DFB3F] mt-0.5">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* For Buyers */}
              <div className="bg-[#0E1110] rounded-2xl p-6 border border-white/10">
                <div className="text-xs text-[#959898] font-medium uppercase tracking-wide mb-3">
                  For Buyers
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Shop with confidence</h3>
                <ul className="space-y-3">
                  {[
                    'Know sellers are real humans',
                    'Zero tolerance for bots/fraud',
                    'Cryptographic proof of identity',
                    'Protected transactions',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-[#959898]">
                      <span className="text-[#6DFB3F] mt-0.5">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* SDK Integration */}
        <section className="px-4 py-16 border-t border-white/5">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div>
                <div className="text-xs text-[#6DFB3F] font-medium uppercase tracking-wide mb-3">
                  For Developers
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Add Human Verification</h2>
                <p className="text-[#959898] mb-6">
                  The Humanity SDK makes it easy to verify users are real humans. Perfect for
                  marketplaces, social platforms, voting systems, and more.
                </p>

                <div className="space-y-4 mb-8">
                  {[
                    {
                      title: 'is_human Check',
                      desc: 'Simple boolean: is this user a verified human?',
                    },
                    {
                      title: 'Palm Biometric',
                      desc: 'Optional biometric verification for higher trust',
                    },
                    {
                      title: 'Preset Verification',
                      desc: 'Check multiple credentials in one call',
                    },
                  ].map((item) => (
                    <div key={item.title} className="flex gap-3">
                      <div className="w-5 h-5 bg-[#6DFB3F]/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <svg
                          className="w-3 h-3 text-[#6DFB3F]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">{item.title}</div>
                        <div className="text-[#959898] text-xs">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  href="/how-it-works"
                  className="inline-flex items-center gap-2 text-[#6DFB3F] hover:text-[#5de032] text-sm font-medium transition-colors"
                >
                  View technical walkthrough
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

              {/* Code Preview */}
              <div className="bg-[#1E1E1E] rounded-xl overflow-hidden border border-white/10">
                <div className="flex items-center gap-2 px-4 py-2 bg-[#252526] border-b border-white/10">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                    <div className="w-3 h-3 rounded-full bg-[#27CA40]" />
                  </div>
                  <span className="text-xs text-[#858585] ml-2">verify-seller.ts</span>
                </div>
                <pre className="p-4 text-xs font-mono overflow-x-auto leading-relaxed">
                  <code className="text-[#D4D4D4]">
                    <span className="text-[#6A9955]">// Check if user is a verified human</span>
                    {'\n'}
                    <span className="text-[#569CD6]">const</span> result ={' '}
                    <span className="text-[#569CD6]">await</span>{' '}
                    <span className="text-[#DCDCAA]">sdk.checkPresets</span>({'{'}
                    {'\n'}
                    {'  '}accessToken,{'\n'}
                    {'  '}presets: [{'\n'}
                    {'    '}
                    <span className="text-[#CE9178]">&apos;is_human&apos;</span>,{'\n'}
                    {'    '}
                    <span className="text-[#CE9178]">&apos;palm_verified&apos;</span>,{'\n'}
                    {'  '}]{'\n'}
                    {'}'});
                    {'\n\n'}
                    <span className="text-[#6A9955]">// Grant seller access</span>
                    {'\n'}
                    <span className="text-[#569CD6]">if</span> (result.
                    <span className="text-[#9CDCFE]">is_human</span> && result.
                    <span className="text-[#9CDCFE]">palm_verified</span>) {'{'}
                    {'\n'}
                    {'  '}
                    <span className="text-[#DCDCAA]">grantSellerAccess</span>(userId);{'\n'}
                    {'  '}
                    <span className="text-[#DCDCAA]">showVerifiedBadge</span>();{'\n'}
                    {'}'}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Marketplace Preview */}
        <section className="px-4 py-16 border-t border-white/5">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Featured Listings</h2>
                <p className="text-[#959898]">Browse items from verified sellers</p>
              </div>
              <Link
                href="/marketplace"
                className="text-[#6DFB3F] hover:text-[#5de032] text-sm font-medium transition-colors flex items-center gap-1"
              >
                View all
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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {sampleListings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/marketplace/${listing.id}`}
                  className="bg-[#0E1110] rounded-xl p-4 border border-white/10 hover:border-[#6DFB3F]/30 transition-colors group"
                >
                  <div className="aspect-square bg-[#151918] rounded-lg flex items-center justify-center text-4xl mb-3">
                    {listing.image}
                  </div>
                  <div className="text-white font-medium text-sm mb-1 group-hover:text-[#6DFB3F] transition-colors">
                    {listing.title}
                  </div>
                  <div className="text-[#6DFB3F] font-semibold">${listing.price}</div>
                  <div className="flex items-center gap-1 mt-2">
                    {listing.verified ? (
                      <>
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
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                        <span className="text-xs text-[#959898]">{listing.seller}</span>
                      </>
                    ) : (
                      <span className="text-xs text-[#959898]">{listing.seller}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-16 border-t border-white/5">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Ready to become a verified seller?
            </h2>
            <p className="text-[#959898] mb-8">
              Join thousands of verified sellers on TrustMarket. Get your badge in under a minute.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/api/verify"
                className="inline-flex items-center justify-center gap-2 bg-[#6DFB3F] text-[#020303] px-8 py-4 rounded-xl font-semibold hover:bg-[#5de032] transition-colors"
              >
                Get Verified
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center gap-2 bg-[#1C1D1D] text-white px-8 py-4 rounded-xl font-semibold border border-white/10 hover:bg-[#252626] transition-colors"
              >
                Learn More
              </Link>
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
            <button className="text-[#959898] hover:text-white p-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
