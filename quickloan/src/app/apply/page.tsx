'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';

function formatCurrency(amount: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(parseInt(amount, 10));
}

function ApplyContent() {
  const searchParams = useSearchParams();
  const amount = searchParams.get('amount') || '10000';
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    purpose: '',
    term: '36',
    employment: '',
    income: '',
  });

  const loanTerms = {
    '12': { rate: 8.99, monthly: ((parseInt(amount) * 1.0899) / 12).toFixed(0) },
    '24': { rate: 9.99, monthly: ((parseInt(amount) * 1.1998) / 24).toFixed(0) },
    '36': { rate: 10.99, monthly: ((parseInt(amount) * 1.3297) / 36).toFixed(0) },
    '48': { rate: 11.99, monthly: ((parseInt(amount) * 1.4796) / 48).toFixed(0) },
    '60': { rate: 12.99, monthly: ((parseInt(amount) * 1.6495) / 60).toFixed(0) },
  };

  const selectedTerm = loanTerms[formData.term as keyof typeof loanTerms];

  return (
    <main className="min-h-screen p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-[#959898] hover:text-white transition-colors text-sm mb-4 inline-block"
          >
            ← Back to QuickLoan
          </Link>
          <h1 className="text-2xl md:text-3xl font-semibold text-white mb-2">
            Complete Your Application
          </h1>
          <p className="text-[#959898]">
            You pre-qualified for {formatCurrency(amount)} - let&apos;s finalize your loan
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {['Loan Details', 'Personal Info', 'Review'].map((label, idx) => (
            <div key={label} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step > idx + 1
                    ? 'bg-[#6DFB3F] text-[#020303]'
                    : step === idx + 1
                      ? 'bg-[#6DFB3F]/20 text-[#6DFB3F] border border-[#6DFB3F]'
                      : 'bg-[#1C1D1D] text-[#959898]'
                }`}
              >
                {step > idx + 1 ? '✓' : idx + 1}
              </div>
              <span
                className={`ml-2 text-sm hidden sm:inline ${
                  step === idx + 1 ? 'text-white' : 'text-[#959898]'
                }`}
              >
                {label}
              </span>
              {idx < 2 && (
                <div
                  className={`w-8 sm:w-16 h-0.5 mx-2 ${
                    step > idx + 1 ? 'bg-[#6DFB3F]' : 'bg-[#1C1D1D]'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Loan Details */}
        {step === 1 && (
          <div className="bg-[#0E1110] rounded-[24px] p-6 md:p-8 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-6">Loan Details</h2>

            {/* Loan Amount Display */}
            <div className="bg-[#151918] rounded-xl p-4 mb-6 border border-white/5">
              <div className="flex justify-between items-center">
                <span className="text-[#959898]">Pre-Qualified Amount</span>
                <span className="text-2xl font-bold text-[#6DFB3F]">{formatCurrency(amount)}</span>
              </div>
            </div>

            {/* Loan Purpose */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#959898] mb-2">
                What will you use this loan for?
              </label>
              <select
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full px-4 py-3 bg-[#151918] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#6DFB3F] focus:border-transparent"
              >
                <option value="">Select a purpose</option>
                <option value="debt">Debt Consolidation</option>
                <option value="home">Home Improvement</option>
                <option value="auto">Auto Purchase</option>
                <option value="medical">Medical Expenses</option>
                <option value="business">Business</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Loan Term */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#959898] mb-2">
                Choose your repayment term
              </label>
              <div className="grid grid-cols-5 gap-2">
                {Object.entries(loanTerms).map(([months, terms]) => (
                  <button
                    key={months}
                    onClick={() => setFormData({ ...formData, term: months })}
                    className={`p-3 rounded-xl text-center transition-all ${
                      formData.term === months
                        ? 'bg-[#6DFB3F]/20 border-2 border-[#6DFB3F] text-[#6DFB3F]'
                        : 'bg-[#151918] border border-white/10 text-[#959898] hover:border-white/20'
                    }`}
                  >
                    <div className="text-lg font-semibold">{months}</div>
                    <div className="text-xs">months</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Loan Summary */}
            <div className="bg-[#151918] rounded-xl p-4 mb-6 border border-white/5">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-[#959898] mb-1">APR</div>
                  <div className="text-lg font-semibold text-white">{selectedTerm.rate}%</div>
                </div>
                <div>
                  <div className="text-sm text-[#959898] mb-1">Monthly</div>
                  <div className="text-lg font-semibold text-[#6DFB3F]">
                    ${selectedTerm.monthly}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-[#959898] mb-1">Term</div>
                  <div className="text-lg font-semibold text-white">{formData.term} mo</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!formData.purpose}
              className={`w-full py-4 rounded-xl font-semibold transition-colors ${
                formData.purpose
                  ? 'bg-[#6DFB3F] text-[#020303] hover:bg-[#5de032]'
                  : 'bg-[#1C1D1D] text-[#959898] cursor-not-allowed'
              }`}
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Personal Info */}
        {step === 2 && (
          <div className="bg-[#0E1110] rounded-[24px] p-6 md:p-8 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-6">Personal Information</h2>

            <div className="bg-[#151918] rounded-xl p-4 mb-6 border border-[#6DFB3F]/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#6DFB3F]/20 flex items-center justify-center">
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
                </div>
                <div>
                  <div className="text-white font-medium">Identity Already Verified</div>
                  <div className="text-sm text-[#959898]">via Humanity Protocol</div>
                </div>
              </div>
            </div>

            {/* Employment Status */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#959898] mb-2">
                Employment Status
              </label>
              <select
                value={formData.employment}
                onChange={(e) => setFormData({ ...formData, employment: e.target.value })}
                className="w-full px-4 py-3 bg-[#151918] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#6DFB3F] focus:border-transparent"
              >
                <option value="">Select status</option>
                <option value="employed">Employed Full-Time</option>
                <option value="part-time">Employed Part-Time</option>
                <option value="self-employed">Self-Employed</option>
                <option value="retired">Retired</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Annual Income */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#959898] mb-2">Annual Income</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#959898]">$</span>
                <input
                  type="number"
                  value={formData.income}
                  onChange={(e) => setFormData({ ...formData, income: e.target.value })}
                  placeholder="75,000"
                  className="w-full pl-8 pr-4 py-3 bg-[#151918] border border-white/10 rounded-xl text-white placeholder:text-[#959898]/50 focus:outline-none focus:ring-2 focus:ring-[#6DFB3F] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-4 rounded-xl font-semibold bg-[#1C1D1D] text-white hover:bg-[#252626] transition-colors border border-white/10"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!formData.employment || !formData.income}
                className={`flex-1 py-4 rounded-xl font-semibold transition-colors ${
                  formData.employment && formData.income
                    ? 'bg-[#6DFB3F] text-[#020303] hover:bg-[#5de032]'
                    : 'bg-[#1C1D1D] text-[#959898] cursor-not-allowed'
                }`}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="bg-[#0E1110] rounded-[24px] p-6 md:p-8 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-6">Review Your Application</h2>

            {/* Loan Summary */}
            <div className="space-y-4 mb-6">
              <div className="bg-[#151918] rounded-xl p-4 border border-white/5">
                <div className="text-sm text-[#959898] mb-2">Loan Amount</div>
                <div className="text-2xl font-bold text-[#6DFB3F]">{formatCurrency(amount)}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#151918] rounded-xl p-4 border border-white/5">
                  <div className="text-sm text-[#959898] mb-1">Monthly Payment</div>
                  <div className="text-xl font-semibold text-white">${selectedTerm.monthly}</div>
                </div>
                <div className="bg-[#151918] rounded-xl p-4 border border-white/5">
                  <div className="text-sm text-[#959898] mb-1">APR</div>
                  <div className="text-xl font-semibold text-white">{selectedTerm.rate}%</div>
                </div>
              </div>

              <div className="bg-[#151918] rounded-xl p-4 border border-white/5">
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                  <div className="text-[#959898]">Purpose</div>
                  <div className="text-white text-right capitalize">
                    {formData.purpose.replace('-', ' ')}
                  </div>
                  <div className="text-[#959898]">Term</div>
                  <div className="text-white text-right">{formData.term} months</div>
                  <div className="text-[#959898]">Employment</div>
                  <div className="text-white text-right capitalize">
                    {formData.employment.replace('-', ' ')}
                  </div>
                  <div className="text-[#959898]">Annual Income</div>
                  <div className="text-white text-right">
                    ${parseInt(formData.income).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Disclosures */}
            <div className="bg-[#151918] rounded-xl p-4 mb-6 border border-white/5">
              <p className="text-xs text-[#959898] leading-relaxed">
                By clicking &quot;Submit Application&quot;, you agree to our terms of service and
                authorize us to verify your information. Rates shown are estimates and may vary
                based on final underwriting. This is a demo application - no actual loan will be
                processed.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-4 rounded-xl font-semibold bg-[#1C1D1D] text-white hover:bg-[#252626] transition-colors border border-white/10"
              >
                Back
              </button>
              <Link
                href={`/success?amount=${amount}&term=${formData.term}&rate=${selectedTerm.rate}&monthly=${selectedTerm.monthly}`}
                className="flex-1 py-4 rounded-xl font-semibold bg-[#6DFB3F] text-[#020303] hover:bg-[#5de032] transition-colors text-center"
              >
                Submit Application
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function ApplyPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen p-6 md:p-8 flex items-center justify-center">
          <div className="text-[#959898]">Loading...</div>
        </main>
      }
    >
      <ApplyContent />
    </Suspense>
  );
}
