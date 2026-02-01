'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function HomePage() {
  const [loanAmount, setLoanAmount] = useState(25000);

  // Simulated score breakdown for demo
  const scoreFactors = [
    { name: 'Net Worth', weight: 30, icon: '📊', desc: 'Total assets minus liabilities' },
    { name: 'Bank Balance', weight: 25, icon: '🏦', desc: 'Available liquid funds' },
    { name: 'Income Stability', weight: 20, icon: '💼', desc: 'Verified employment income' },
    { name: 'Account Age', weight: 15, icon: '📅', desc: 'Financial history length' },
    { name: 'Identity Verified', weight: 10, icon: '✓', desc: 'KYC and biometric check' },
  ];

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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <span className="text-white font-semibold">QuickLoan</span>
            <span className="bg-[#6DFB3F]/20 text-[#6DFB3F] px-2 py-0.5 rounded text-xs font-medium">
              DEMO
            </span>
          </div>
          <Link
            href="/how-it-works"
            className="text-[#959898] hover:text-white text-sm transition-colors"
          >
            How it works
          </Link>
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
                Your financial trust,
                <br />
                <span className="text-[#6DFB3F]">verified instantly</span>
              </h1>

              <p className="text-[#959898] text-lg mb-6 max-w-md">
                We calculate your{' '}
                <span className="text-white font-medium">Financial Trust Score</span> by aggregating
                5 verified data points. No credit bureaus. No hard inquiries. Just cryptographically
                verified credentials.
              </p>

              {/* What We Check */}
              <div className="bg-[#0E1110] rounded-xl p-4 border border-white/10 mb-6">
                <div className="text-xs text-[#959898] uppercase tracking-wide mb-3">
                  Data points we aggregate
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Net Worth', 'Bank Balance', 'Income', 'Account Age', 'Identity'].map(
                    (item) => (
                      <span
                        key={item}
                        className="bg-[#1C1D1D] text-[#959898] px-3 py-1 rounded-full text-xs"
                      >
                        {item}
                      </span>
                    ),
                  )}
                </div>
              </div>

              <Link
                href={`/api/check?amount=${loanAmount}`}
                className="inline-flex items-center gap-2 bg-[#6DFB3F] text-[#020303] px-6 py-3 rounded-xl font-semibold hover:bg-[#5de032] transition-colors"
              >
                Calculate My Score
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
                Takes ~3 seconds · No credit impact · Privacy preserved
              </p>
            </div>

            {/* Right: Score Preview Card */}
            <div className="bg-[#0E1110] rounded-3xl p-8 border border-white/10">
              {/* Score Circle */}
              <div className="flex justify-center mb-6">
                <div className="relative w-40 h-40">
                  {/* Background circle */}
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="80" cy="80" r="70" fill="none" stroke="#1C1D1D" strokeWidth="12" />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="url(#scoreGradient)"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray="440"
                      strokeDashoffset="110"
                    />
                    <defs>
                      <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6DFB3F" />
                        <stop offset="100%" stopColor="#3FB83F" />
                      </linearGradient>
                    </defs>
                  </svg>
                  {/* Score text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xs text-[#959898] mb-1">Your Score</span>
                    <span className="text-4xl font-bold text-white">???</span>
                    <span className="text-xs text-[#6DFB3F]">Connect to reveal</span>
                  </div>
                </div>
              </div>

              {/* Score Factors */}
              <div className="space-y-3">
                <div className="text-xs text-[#959898] uppercase tracking-wide">Score factors</div>
                {scoreFactors.map((factor) => (
                  <div key={factor.name} className="flex items-center gap-3">
                    <span className="text-lg">{factor.icon}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white">{factor.name}</span>
                        <span className="text-[#959898]">{factor.weight}%</span>
                      </div>
                      <div className="h-1.5 bg-[#1C1D1D] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#6DFB3F]/30 rounded-full"
                          style={{ width: `${factor.weight}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 text-center">
                <span className="text-[#959898] text-xs">
                  Score range: <span className="text-white">300 - 850</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* How Score is Calculated */}
        <section className="px-4 py-16 border-t border-white/5">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-white mb-3">
                How Your Trust Score is Calculated
              </h2>
              <p className="text-[#959898] max-w-2xl mx-auto">
                Unlike traditional credit scores that rely on credit history, we use verified
                credentials to build a comprehensive financial profile.
              </p>
            </div>

            <div className="grid md:grid-cols-5 gap-4">
              {scoreFactors.map((factor, i) => (
                <div
                  key={factor.name}
                  className="bg-[#0E1110] rounded-2xl p-5 border border-white/10 text-center"
                >
                  <div className="text-3xl mb-3">{factor.icon}</div>
                  <div className="text-white font-semibold text-sm mb-1">{factor.name}</div>
                  <div className="text-[#6DFB3F] font-bold text-lg mb-2">{factor.weight}%</div>
                  <div className="text-[#959898] text-xs">{factor.desc}</div>
                </div>
              ))}
            </div>

            {/* Comparison */}
            <div className="mt-12 grid md:grid-cols-2 gap-6">
              <div className="bg-[#0E1110] rounded-2xl p-6 border border-white/10">
                <div className="text-red-400 text-xs font-medium uppercase tracking-wide mb-3">
                  Traditional Credit Scores
                </div>
                <ul className="space-y-2 text-sm">
                  {[
                    'Requires credit history (excludes 45M Americans)',
                    'Hard inquiries hurt your score',
                    'Based on debt, not wealth',
                    'Takes weeks to update',
                    'Opaque algorithms',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[#959898]">
                      <span className="text-red-400 mt-0.5">✕</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-[#0E1110] rounded-2xl p-6 border border-[#6DFB3F]/30">
                <div className="text-[#6DFB3F] text-xs font-medium uppercase tracking-wide mb-3">
                  Financial Trust Score
                </div>
                <ul className="space-y-2 text-sm">
                  {[
                    'Based on verified assets & income',
                    'No impact on credit score',
                    'Reflects actual financial health',
                    'Real-time verification',
                    'Transparent scoring factors',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[#959898]">
                      <span className="text-[#6DFB3F] mt-0.5">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Loan Pre-Qualification */}
        <section className="px-4 py-16 border-t border-white/5">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="text-xs text-[#6DFB3F] font-medium uppercase tracking-wide mb-3">
                  Use Case
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Instant Loan Pre-Qualification
                </h2>
                <p className="text-[#959898] mb-6">
                  Your Trust Score directly determines loan eligibility. Higher scores unlock better
                  rates and larger amounts—all calculated from verified data.
                </p>

                {/* Loan Amount Selector */}
                <div className="bg-[#151918] rounded-xl p-4 mb-6">
                  <div className="text-xs text-[#959898] mb-2">Select loan amount</div>
                  <div className="text-3xl font-bold text-white mb-4">
                    ${loanAmount.toLocaleString()}
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="100000"
                    step="1000"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full h-2 bg-[#1C1D1D] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#6DFB3F] [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-[#959898] mt-2">
                    <span>$1,000</span>
                    <span>$100,000</span>
                  </div>
                </div>

                {/* Score Tiers */}
                <div className="space-y-2">
                  <div className="text-xs text-[#959898] uppercase tracking-wide mb-2">
                    Score requirements
                  </div>
                  {[
                    { range: '750+', label: 'Excellent', rate: '6.99%', color: '#6DFB3F' },
                    { range: '700-749', label: 'Good', rate: '9.99%', color: '#FFBD2E' },
                    { range: '650-699', label: 'Fair', rate: '14.99%', color: '#FF9500' },
                    { range: '<650', label: 'Building', rate: 'Limited options', color: '#959898' },
                  ].map((tier) => (
                    <div
                      key={tier.range}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#0E1110]"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: tier.color }}
                        />
                        <span className="text-white text-sm">{tier.range}</span>
                        <span className="text-[#959898] text-xs">{tier.label}</span>
                      </div>
                      <span className="text-[#959898] text-sm">{tier.rate} APR</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Code Preview */}
              <div className="bg-[#1E1E1E] rounded-xl overflow-hidden border border-white/10">
                <div className="flex items-center gap-2 px-4 py-2 bg-[#252526] border-b border-white/10">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                    <div className="w-3 h-3 rounded-full bg-[#27CA40]" />
                  </div>
                  <span className="text-xs text-[#858585] ml-2">calculate-score.ts</span>
                </div>
                <pre className="p-4 text-xs font-mono overflow-x-auto leading-relaxed">
                  <code className="text-[#D4D4D4]">
                    <span className="text-[#6A9955]">// Query multiple data points at once</span>
                    {'\n'}
                    <span className="text-[#569CD6]">const</span> results ={' '}
                    <span className="text-[#569CD6]">await</span>{' '}
                    <span className="text-[#DCDCAA]">sdk.query</span>({'{'}
                    {'\n'}
                    {'  '}predicates: [{'\n'}
                    {'    '}
                    {'{ '}field: <span className="text-[#CE9178]">&apos;net_worth&apos;</span>, op:{' '}
                    <span className="text-[#CE9178]">&apos;&gt;=&apos;</span>, value:{' '}
                    <span className="text-[#B5CEA8]">50000</span>
                    {' }'},{'\n'}
                    {'    '}
                    {'{ '}field: <span className="text-[#CE9178]">&apos;bank_balance&apos;</span>,
                    op: <span className="text-[#CE9178]">&apos;&gt;=&apos;</span>, value:{' '}
                    <span className="text-[#B5CEA8]">10000</span>
                    {' }'},{'\n'}
                    {'    '}
                    {'{ '}field: <span className="text-[#CE9178]">&apos;income_verified&apos;</span>
                    , op: <span className="text-[#CE9178]">&apos;==&apos;</span>, value:{' '}
                    <span className="text-[#569CD6]">true</span>
                    {' }'},{'\n'}
                    {'    '}
                    {'{ '}field:{' '}
                    <span className="text-[#CE9178]">&apos;account_age_months&apos;</span>, op:{' '}
                    <span className="text-[#CE9178]">&apos;&gt;=&apos;</span>, value:{' '}
                    <span className="text-[#B5CEA8]">12</span>
                    {' }'},{'\n'}
                    {'    '}
                    {'{ '}field: <span className="text-[#CE9178]">&apos;kyc_verified&apos;</span>,
                    op: <span className="text-[#CE9178]">&apos;==&apos;</span>, value:{' '}
                    <span className="text-[#569CD6]">true</span>
                    {' }'},{'\n'}
                    {'  '}]{'\n'}
                    {'}'});
                    {'\n\n'}
                    <span className="text-[#6A9955]">// Calculate weighted score</span>
                    {'\n'}
                    <span className="text-[#569CD6]">const</span> score ={' '}
                    <span className="text-[#DCDCAA]">calculateTrustScore</span>(results);{'\n'}
                    <span className="text-[#6A9955]">// Returns: 300-850 based on factors</span>
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-16 border-t border-white/5">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Ready to see your Financial Trust Score?
            </h2>
            <p className="text-[#959898] mb-8">
              Connect with Humanity Protocol to verify your credentials and get your score in
              seconds. No credit impact, full privacy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/api/check?amount=${loanAmount}`}
                className="inline-flex items-center justify-center gap-2 bg-[#6DFB3F] text-[#020303] px-8 py-4 rounded-xl font-semibold hover:bg-[#5de032] transition-colors"
              >
                Get My Score
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
                See How It Works
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
