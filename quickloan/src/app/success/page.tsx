'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function formatCurrency(amount: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(parseInt(amount, 10));
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const amount = searchParams.get('amount') || '10000';
  const term = searchParams.get('term') || '36';
  const rate = searchParams.get('rate') || '10.99';
  const monthly = searchParams.get('monthly') || '400';

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-8">
      <div className="max-w-md w-full">
        <div className="bg-[#0E1110] rounded-[24px] p-6 md:p-8 border border-white/10 text-center">
          {/* Success Animation */}
          <div className="w-24 h-24 bg-[#6DFB3F]/20 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-[#6DFB3F]/10 rounded-full animate-ping" />
            <svg
              className="w-12 h-12 text-[#6DFB3F] relative z-10"
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

          <h1 className="text-2xl md:text-3xl font-semibold text-white mb-3">
            Application Submitted!
          </h1>
          <p className="text-[#959898] mb-8">
            Your loan application has been received. You&apos;ll hear from us within 24 hours.
          </p>

          {/* Loan Summary Card */}
          <div className="bg-[#151918] rounded-xl p-6 mb-8 border border-white/5 text-left">
            <div className="text-sm text-[#959898] mb-4">Application Summary</div>

            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <span className="text-[#959898]">Loan Amount</span>
                <span className="text-xl font-bold text-[#6DFB3F]">{formatCurrency(amount)}</span>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-semibold text-white">${monthly}</div>
                  <div className="text-xs text-[#959898]">Monthly</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-white">{rate}%</div>
                  <div className="text-xs text-[#959898]">APR</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-white">{term}</div>
                  <div className="text-xs text-[#959898]">Months</div>
                </div>
              </div>
            </div>
          </div>

          {/* Reference Number */}
          <div className="bg-[#151918] rounded-xl p-4 mb-8 border border-white/5">
            <div className="text-sm text-[#959898] mb-1">Application Reference</div>
            <div className="font-mono text-white text-lg">
              QL-{Date.now().toString(36).toUpperCase()}
            </div>
          </div>

          {/* Next Steps */}
          <div className="text-left mb-8">
            <div className="text-sm text-[#959898] mb-3">What happens next?</div>
            <div className="space-y-3">
              {[
                { icon: '📧', text: 'Check your email for confirmation' },
                { icon: '📞', text: 'A loan specialist may call you' },
                { icon: '📝', text: 'Upload any required documents' },
                { icon: '💰', text: 'Funds deposited within 1-3 days' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm">
                  <span className="w-8 h-8 bg-[#1C1D1D] rounded-lg flex items-center justify-center">
                    {item.icon}
                  </span>
                  <span className="text-[#959898]">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full bg-[#6DFB3F] text-[#020303] py-4 rounded-xl font-semibold text-base hover:bg-[#5de032] transition-colors text-center"
            >
              Done
            </Link>
            <Link
              href="/how-it-works"
              className="block text-[#959898] hover:text-white transition-colors text-sm text-center"
            >
              Learn how the verification worked →
            </Link>
          </div>
        </div>

        {/* Demo Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-[#959898]">
            This is a demo application. No real loan will be processed.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen p-6 md:p-8 flex items-center justify-center">
          <div className="text-[#959898]">Loading...</div>
        </main>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
