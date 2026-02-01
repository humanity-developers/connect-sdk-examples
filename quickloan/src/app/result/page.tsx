import Link from 'next/link';

interface ResultPageProps {
  searchParams: Promise<{
    status?: string;
    amount?: string;
    message?: string;
    score?: string;
  }>;
}

function formatCurrency(amount: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(parseInt(amount, 10));
}

// Score factors with their weights
const scoreFactors = [
  { name: 'Net Worth', weight: 30, icon: '📊' },
  { name: 'Bank Balance', weight: 25, icon: '🏦' },
  { name: 'Income Stability', weight: 20, icon: '💼' },
  { name: 'Account Age', weight: 15, icon: '📅' },
  { name: 'Identity Verified', weight: 10, icon: '✓' },
];

function getScoreTier(score: number) {
  if (score >= 750) return { label: 'Excellent', color: '#6DFB3F', rate: '6.99%' };
  if (score >= 700) return { label: 'Good', color: '#FFBD2E', rate: '9.99%' };
  if (score >= 650) return { label: 'Fair', color: '#FF9500', rate: '14.99%' };
  return { label: 'Building', color: '#959898', rate: 'Limited' };
}

function ScoreCircle({ score, maxScore = 850 }: { score: number; maxScore?: number }) {
  const percentage = (score / maxScore) * 100;
  const circumference = 2 * Math.PI * 70;
  const offset = circumference - (percentage / 100) * circumference * 0.75; // 75% of circle
  const tier = getScoreTier(score);

  return (
    <div className="relative w-48 h-48 mx-auto">
      <svg className="w-full h-full -rotate-90">
        <circle cx="96" cy="96" r="70" fill="none" stroke="#1C1D1D" strokeWidth="12" />
        <circle
          cx="96"
          cy="96"
          r="70"
          fill="none"
          stroke={tier.color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs text-[#959898] mb-1">Your Score</span>
        <span className="text-5xl font-bold text-white">{score}</span>
        <span className="text-sm font-medium mt-1" style={{ color: tier.color }}>
          {tier.label}
        </span>
      </div>
    </div>
  );
}

export default async function ResultPage({ searchParams }: ResultPageProps) {
  const params = await searchParams;
  const status = params.status || 'unknown';
  const amount = params.amount || '10000';
  const message = params.message;

  // Simulated score based on status (in real app, this would come from the API)
  const score = status === 'qualified' ? 765 : status === 'not_qualified' ? 580 : 300;
  const tier = getScoreTier(score);

  // Simulated factor results (in real app, from API)
  const factorResults =
    status === 'qualified'
      ? [
          { ...scoreFactors[0], passed: true, value: 85 },
          { ...scoreFactors[1], passed: true, value: 78 },
          { ...scoreFactors[2], passed: true, value: 90 },
          { ...scoreFactors[3], passed: true, value: 70 },
          { ...scoreFactors[4], passed: true, value: 100 },
        ]
      : status === 'not_qualified'
        ? [
            { ...scoreFactors[0], passed: false, value: 35 },
            { ...scoreFactors[1], passed: false, value: 42 },
            { ...scoreFactors[2], passed: true, value: 80 },
            { ...scoreFactors[3], passed: false, value: 25 },
            { ...scoreFactors[4], passed: true, value: 100 },
          ]
        : scoreFactors.map((f) => ({ ...f, passed: false, value: 0 }));

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-8">
      <div className="max-w-lg w-full">
        {/* Score Result Card */}
        <div className="bg-[#0E1110] rounded-[24px] p-6 md:p-8 border border-white/10">
          {/* Score Circle */}
          <ScoreCircle score={score} />

          {/* Score Range */}
          <div className="flex justify-between text-xs text-[#959898] mt-4 mb-8 px-4">
            <span>300</span>
            <span>Poor</span>
            <span>Fair</span>
            <span>Good</span>
            <span>Excellent</span>
            <span>850</span>
          </div>

          {/* Status Message */}
          {status === 'qualified' && (
            <div className="text-center mb-6">
              <h1 className="text-2xl font-semibold text-white mb-2">You&apos;re Pre-Qualified!</h1>
              <p className="text-[#959898]">
                Your Trust Score of <span className="text-[#6DFB3F] font-semibold">{score}</span>{' '}
                qualifies you for a loan up to{' '}
                <span className="text-white font-semibold">{formatCurrency(amount)}</span>
              </p>
            </div>
          )}

          {status === 'not_qualified' && (
            <div className="text-center mb-6">
              <h1 className="text-2xl font-semibold text-white mb-2">Keep Building Your Score</h1>
              <p className="text-[#959898]">
                Your Trust Score of <span className="text-amber-500 font-semibold">{score}</span>{' '}
                doesn&apos;t meet the{' '}
                <span className="text-white font-semibold">{formatCurrency(amount)}</span> threshold
                yet
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center mb-6">
              <h1 className="text-2xl font-semibold text-white mb-2">Baseline Score</h1>
              <p className="text-[#959898]">
                We couldn&apos;t verify your credentials.{' '}
                {message && <span className="text-red-400 text-sm">({message})</span>}
              </p>
            </div>
          )}

          {/* Score Breakdown */}
          <div className="bg-[#151918] rounded-xl p-4 mb-6">
            <div className="text-xs text-[#959898] uppercase tracking-wide mb-4">
              Score Breakdown
            </div>
            <div className="space-y-3">
              {factorResults.map((factor) => (
                <div key={factor.name} className="flex items-center gap-3">
                  <span className="text-lg w-6">{factor.icon}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white">{factor.name}</span>
                      <span className={factor.passed ? 'text-[#6DFB3F]' : 'text-[#959898]'}>
                        {factor.value > 0 ? `${factor.value}%` : '—'}
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#1C1D1D] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          factor.passed ? 'bg-[#6DFB3F]' : 'bg-[#959898]/30'
                        }`}
                        style={{ width: `${factor.value}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Loan Eligibility Tier */}
          {(status === 'qualified' || status === 'not_qualified') && (
            <div className="bg-[#151918] rounded-xl p-4 mb-6">
              <div className="text-xs text-[#959898] uppercase tracking-wide mb-3">
                Your Loan Tier
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tier.color }} />
                  <div>
                    <span className="text-white font-medium">{tier.label}</span>
                    <span className="text-[#959898] text-sm ml-2">({score} pts)</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">{tier.rate}</div>
                  <div className="text-[#959898] text-xs">APR available</div>
                </div>
              </div>
            </div>
          )}

          {/* Actions based on status */}
          {status === 'qualified' && (
            <>
              <Link
                href={`/apply?amount=${amount}&score=${score}`}
                className="block w-full bg-[#6DFB3F] text-[#020303] py-4 rounded-xl font-semibold text-center hover:bg-[#5de032] transition-colors mb-3"
              >
                Continue to Application
              </Link>
              <div className="flex justify-center gap-4 text-sm">
                <Link href="/" className="text-[#959898] hover:text-white transition-colors">
                  ← Check different amount
                </Link>
              </div>
            </>
          )}

          {status === 'not_qualified' && (
            <>
              {/* Improvement Tips */}
              <div className="bg-[#6DFB3F]/10 rounded-xl p-4 mb-4 border border-[#6DFB3F]/30">
                <div className="text-[#6DFB3F] font-medium mb-2">How to improve your score</div>
                <ul className="space-y-2 text-sm text-[#959898]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#6DFB3F]">→</span>
                    Verify additional credentials (income, employment)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#6DFB3F]">→</span>
                    Build account history over time
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#6DFB3F]">→</span>
                    Try a smaller loan amount (
                    <Link
                      href={`/api/check?amount=${Math.floor(parseInt(amount) * 0.5)}`}
                      className="text-[#6DFB3F] hover:underline"
                    >
                      {formatCurrency(String(Math.floor(parseInt(amount) * 0.5)))}
                    </Link>
                    )
                  </li>
                </ul>
              </div>

              <Link
                href="/"
                className="block w-full bg-[#6DFB3F] text-[#020303] py-4 rounded-xl font-semibold text-center hover:bg-[#5de032] transition-colors mb-3"
              >
                Try Different Amount
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="bg-[#151918] rounded-xl p-4 mb-4 border border-white/5">
                <div className="text-white font-medium mb-2">Why did this happen?</div>
                <ul className="space-y-2 text-sm text-[#959898]">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500">•</span>
                    Authorization was cancelled
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500">•</span>
                    No verified credentials found
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500">•</span>
                    Session timed out
                  </li>
                </ul>
              </div>

              <Link
                href="/"
                className="block w-full bg-[#6DFB3F] text-[#020303] py-4 rounded-xl font-semibold text-center hover:bg-[#5de032] transition-colors mb-3"
              >
                Try Again
              </Link>
            </>
          )}

          {status === 'unknown' && (
            <Link
              href="/"
              className="block w-full bg-[#1C1D1D] text-white py-4 rounded-xl font-semibold text-center hover:bg-[#252626] transition-colors border border-white/10"
            >
              ← Back to Home
            </Link>
          )}

          {/* How it works link */}
          <Link
            href="/how-it-works"
            className="block text-center text-[#959898] hover:text-white transition-colors text-sm mt-4"
          >
            Learn how your score is calculated →
          </Link>
        </div>

        {/* Score Legend */}
        <div className="mt-6 bg-[#0E1110] rounded-xl p-4 border border-white/10">
          <div className="text-xs text-[#959898] uppercase tracking-wide mb-3">Score Tiers</div>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            {[
              { range: '750-850', label: 'Excellent', color: '#6DFB3F' },
              { range: '700-749', label: 'Good', color: '#FFBD2E' },
              { range: '650-699', label: 'Fair', color: '#FF9500' },
              { range: '300-649', label: 'Building', color: '#959898' },
            ].map((t) => (
              <div key={t.label}>
                <div
                  className="w-2 h-2 rounded-full mx-auto mb-1"
                  style={{ backgroundColor: t.color }}
                />
                <div className="text-white font-medium">{t.range}</div>
                <div className="text-[#959898]">{t.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Demo Notice */}
        <p className="text-center text-xs text-[#959898] mt-6">
          This is a demo. Score is simulated based on verification status.
        </p>
      </div>
    </main>
  );
}
