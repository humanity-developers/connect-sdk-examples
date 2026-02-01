import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

// Sample seller listings
const sellerListings = [
  { id: 101, title: 'My Vintage Camera', price: 299, status: 'active', views: 42 },
  { id: 102, title: 'Old Watch Collection', price: 450, status: 'active', views: 28 },
];

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const isVerified = cookieStore.get('seller_verified')?.value === 'true';

  // Redirect unverified users
  if (!isVerified) {
    redirect('/');
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
            <Link href="/dashboard" className="text-white text-sm font-medium transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="min-h-screen p-6 md:p-8 pb-24">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-white">Seller Dashboard</h1>
              <p className="text-[#959898] text-sm mt-1">Manage your listings and track sales</p>
            </div>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-[#6DFB3F]/20 text-[#6DFB3F]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Verified Seller
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: 'Active Listings',
                value: sellerListings.length.toString(),
                color: '#6DFB3F',
              },
              { label: 'Total Views', value: '70', color: '#6DFB3F' },
              { label: 'Messages', value: '3', color: '#FFBD2E' },
              { label: 'Trust Score', value: '5.0', color: '#6DFB3F' },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#0E1110] rounded-xl p-4 border border-white/10">
                <div className="text-2xl font-bold" style={{ color: stat.color }}>
                  {stat.value}
                </div>
                <div className="text-sm text-[#959898]">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Listings */}
            <div className="md:col-span-2">
              <div className="bg-[#0E1110] rounded-2xl border border-white/10 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                  <h2 className="text-lg font-semibold text-white">Your Listings</h2>
                  <button className="bg-[#6DFB3F] text-[#020303] px-4 py-2 rounded-lg font-medium text-sm hover:bg-[#5de032] transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

                {sellerListings.length > 0 ? (
                  <div className="divide-y divide-white/5">
                    {sellerListings.map((listing) => (
                      <div
                        key={listing.id}
                        className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#151918] rounded-lg flex items-center justify-center text-2xl">
                            📦
                          </div>
                          <div>
                            <div className="text-white font-medium">{listing.title}</div>
                            <div className="text-sm text-[#959898]">${listing.price}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm text-white">{listing.views} views</div>
                            <div
                              className={`text-xs capitalize ${listing.status === 'active' ? 'text-[#6DFB3F]' : 'text-[#959898]'}`}
                            >
                              {listing.status}
                            </div>
                          </div>
                          <button className="text-[#959898] hover:text-white p-2 transition-colors">
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
                                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-6 py-12 text-center">
                    <div className="text-4xl mb-4">📦</div>
                    <div className="text-white font-medium mb-2">No listings yet</div>
                    <p className="text-[#959898] text-sm mb-4">
                      Create your first listing to start selling
                    </p>
                    <button className="bg-[#6DFB3F] text-[#020303] px-6 py-2 rounded-lg font-medium text-sm hover:bg-[#5de032] transition-colors">
                      Create Listing
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Verification Status */}
              <div className="bg-[#0E1110] rounded-2xl p-6 border border-white/10">
                <h3 className="text-white font-semibold mb-4">Verification Status</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Human Verified', icon: '👤', passed: true },
                    { name: 'Palm Biometric', icon: '✋', passed: true },
                    { name: 'Identity Check', icon: '🪪', passed: true },
                  ].map((check) => (
                    <div key={check.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{check.icon}</span>
                        <span className="text-sm text-[#959898]">{check.name}</span>
                      </div>
                      {check.passed ? (
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
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#959898]">Badge expires</span>
                    <span className="text-white">Dec 2025</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-[#0E1110] rounded-2xl p-6 border border-white/10">
                <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full text-left px-4 py-3 rounded-lg bg-[#151918] hover:bg-[#1C1D1D] text-[#959898] hover:text-white transition-colors text-sm flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Create New Listing
                  </button>
                  <button className="w-full text-left px-4 py-3 rounded-lg bg-[#151918] hover:bg-[#1C1D1D] text-[#959898] hover:text-white transition-colors text-sm flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    View Messages
                  </button>
                  <Link
                    href="/marketplace"
                    className="w-full text-left px-4 py-3 rounded-lg bg-[#151918] hover:bg-[#1C1D1D] text-[#959898] hover:text-white transition-colors text-sm flex items-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    Browse Marketplace
                  </Link>
                </div>
              </div>

              {/* SDK Info */}
              <div className="bg-[#151918] rounded-xl p-4 border border-white/5">
                <div className="text-xs text-[#959898] mb-2">Powered by</div>
                <div className="text-sm text-white font-medium mb-1">Humanity Protocol SDK</div>
                <p className="text-xs text-[#959898] mb-3">
                  Seller verification via sdk.verifyPresets()
                </p>
                <Link href="/how-it-works" className="text-[#6DFB3F] text-xs hover:underline">
                  See how it works →
                </Link>
              </div>
            </div>
          </div>
        </div>
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
