'use client';

import Link from 'next/link';
import { useState, useCallback } from 'react';

// Code snippet component with copy functionality
function CodeBlock({ code, curl }: { code: string; curl?: string }) {
  const [copied, setCopied] = useState<'code' | 'curl' | null>(null);

  const copyToClipboard = useCallback(async (text: string, type: 'code' | 'curl') => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  // Tokenize and highlight a line of code
  const highlightLine = (line: string, lineIndex: number): React.ReactNode[] => {
    const tokens: React.ReactNode[] = [];
    let remaining = line;
    let keyIndex = 0;

    const keywords =
      /^(const|let|var|function|async|await|return|if|else|import|from|export|new|throw|try|catch|true|false|null|undefined)$/;
    const types = /^(string|number|boolean|Promise|Error|HumanitySDK)$/;

    while (remaining.length > 0) {
      if (remaining.startsWith('//')) {
        tokens.push(
          <span key={`${lineIndex}-${keyIndex++}`} className="text-[#6A9955]">
            {remaining}
          </span>,
        );
        break;
      }

      const stringMatch = remaining.match(/^(['"`])(?:(?!\1)[^\\]|\\.)*\1/);
      if (stringMatch) {
        tokens.push(
          <span key={`${lineIndex}-${keyIndex++}`} className="text-[#CE9178]">
            {stringMatch[0]}
          </span>,
        );
        remaining = remaining.slice(stringMatch[0].length);
        continue;
      }

      const numMatch = remaining.match(/^\d+(\.\d+)?/);
      if (numMatch) {
        tokens.push(
          <span key={`${lineIndex}-${keyIndex++}`} className="text-[#B5CEA8]">
            {numMatch[0]}
          </span>,
        );
        remaining = remaining.slice(numMatch[0].length);
        continue;
      }

      const wordMatch = remaining.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*/);
      if (wordMatch) {
        const word = wordMatch[0];
        let className = 'text-[#9CDCFE]';
        if (keywords.test(word)) className = 'text-[#569CD6]';
        else if (types.test(word)) className = 'text-[#4EC9B0]';
        else if (remaining.slice(word.length).match(/^\s*\(/)) className = 'text-[#DCDCAA]';

        tokens.push(
          <span key={`${lineIndex}-${keyIndex++}`} className={className}>
            {word}
          </span>,
        );
        remaining = remaining.slice(word.length);
        continue;
      }

      const opMatch = remaining.match(
        /^(===|!==|==|!=|<=|>=|=>|&&|\|\||[+\-*/%=<>!&|^~?:;,.()\[\]{}])/,
      );
      if (opMatch) {
        tokens.push(
          <span key={`${lineIndex}-${keyIndex++}`} className="text-[#D4D4D4]">
            {opMatch[0]}
          </span>,
        );
        remaining = remaining.slice(opMatch[0].length);
        continue;
      }

      const wsMatch = remaining.match(/^\s+/);
      if (wsMatch) {
        tokens.push(<span key={`${lineIndex}-${keyIndex++}`}>{wsMatch[0]}</span>);
        remaining = remaining.slice(wsMatch[0].length);
        continue;
      }

      tokens.push(
        <span key={`${lineIndex}-${keyIndex++}`} className="text-[#D4D4D4]">
          {remaining[0]}
        </span>,
      );
      remaining = remaining.slice(1);
    }
    return tokens;
  };

  const formatCode = (code: string) => {
    return code.split('\n').map((line, i) => (
      <div key={i} className="flex">
        <span className="text-[#858585] select-none w-8 text-right pr-4 shrink-0">{i + 1}</span>
        <span className="whitespace-pre">{highlightLine(line, i)}</span>
      </div>
    ));
  };

  return (
    <div className="bg-[#1E1E1E] rounded-xl overflow-hidden border border-white/10">
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <div className="w-3 h-3 rounded-full bg-[#27CA40]" />
          </div>
          <span className="text-xs text-[#858585] ml-2">typescript</span>
        </div>
        <div className="flex gap-2">
          {curl && (
            <button
              onClick={() => copyToClipboard(curl, 'curl')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                copied === 'curl'
                  ? 'bg-[#6DFB3F]/20 text-[#6DFB3F]'
                  : 'bg-[#3C3C3C] text-[#CCCCCC] hover:bg-[#4C4C4C]'
              }`}
            >
              {copied === 'curl' ? '✓ Copied!' : 'Copy cURL'}
            </button>
          )}
          <button
            onClick={() => copyToClipboard(code, 'code')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              copied === 'code'
                ? 'bg-[#6DFB3F]/20 text-[#6DFB3F]'
                : 'bg-[#3C3C3C] text-[#CCCCCC] hover:bg-[#4C4C4C]'
            }`}
          >
            {copied === 'code' ? '✓ Copied!' : 'Copy Code'}
          </button>
        </div>
      </div>
      <div className="p-4 overflow-x-auto text-sm font-mono leading-relaxed">
        {formatCode(code)}
      </div>
    </div>
  );
}

interface Step {
  id: number;
  title: string;
  description: string;
  technicalDetail: string;
  icon: React.ReactNode;
  code: string;
  curl?: string;
  analogy: string;
}

const steps: Step[] = [
  {
    id: 1,
    title: 'Initialize the SDK',
    description: 'Set up the Humanity SDK with your application credentials.',
    technicalDetail:
      'Create a HumanitySDK instance with your clientId and redirectUri. The SDK handles all OAuth complexity for you.',
    analogy: '🔑 Like getting your keys to access a secure building',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
    code: `import { HumanitySDK } from '@humanity-org/connect-sdk';

const sdk = new HumanitySDK({
  clientId: 'your_client_id',
  redirectUri: 'https://yourapp.com/callback',
  environment: 'sandbox', // or 'production'
});`,
  },
  {
    id: 2,
    title: 'Build Authorization URL',
    description: 'Generate a secure OAuth URL with PKCE protection.',
    technicalDetail:
      'sdk.buildAuthUrl() generates a code_verifier, code_challenge, and authorization URL. The verifier stays on your server, the challenge goes to Humanity.',
    analogy: '🔐 Like creating a secret handshake only you and Humanity know',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    ),
    code: `// Request identity verification scopes
const { url, codeVerifier } = sdk.buildAuthUrl({
  scopes: ['identity:read'],
  state: HumanitySDK.generateState(),
  nonce: HumanitySDK.generateNonce(),
});

// Store codeVerifier securely (server-side session/cookie)
// Redirect user to url`,
    curl: `# The SDK generates this URL for you:
GET https://auth.humanity.org/oauth/authorize?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=https://yourapp.com/callback&
  response_type=code&
  scope=identity:read&
  state=random_state_string&
  code_challenge=E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM&
  code_challenge_method=S256`,
  },
  {
    id: 3,
    title: 'User Completes Verification',
    description: 'User verifies on Humanity Protocol via biometric scan.',
    technicalDetail:
      'User is redirected to Humanity where they complete biometric verification. Palm scanning ensures uniqueness - cannot be faked or duplicated.',
    analogy: '✋ Like scanning your palm to prove you are you',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
        />
      </svg>
    ),
    code: `// User sees Humanity Protocol consent screen:
//
// "TrustMarket wants to verify:"
//   ✓ You are a real human
//   ✓ Your palm biometric (optional)
//
// [Deny]  [Verify Me]
//
// After approval, user is redirected back with code`,
  },
  {
    id: 4,
    title: 'Exchange Code for Token',
    description: 'Securely exchange the authorization code for an access token.',
    technicalDetail:
      'Call sdk.exchangeCodeForToken() with the code and stored codeVerifier. The SDK validates PKCE and returns an access token.',
    analogy: '🎫 Like exchanging your verified ticket for VIP access',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
        />
      </svg>
    ),
    code: `// In your callback handler
const code = searchParams.get('code');
const codeVerifier = getFromSession('codeVerifier');

const tokenResult = await sdk.exchangeCodeForToken({
  code,
  codeVerifier,
});

// tokenResult contains:
// - accessToken: string
// - expiresIn: number
// - grantedScopes: string[]
// - presetKeys: string[]`,
    curl: `curl -X POST "https://api.humanity.org/oauth/token" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "grant_type=authorization_code" \\
  -d "client_id=YOUR_CLIENT_ID" \\
  -d "code=AUTH_CODE_FROM_CALLBACK" \\
  -d "redirect_uri=https://yourapp.com/callback" \\
  -d "code_verifier=YOUR_STORED_CODE_VERIFIER"`,
  },
  {
    id: 5,
    title: 'Verify Single Preset',
    description: 'Check a single verification credential like is_human.',
    technicalDetail:
      'sdk.verifyPreset() checks one preset credential. Returns a boolean result indicating if the user passes that specific verification.',
    analogy: '✓ Like checking one stamp in a passport',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    code: `// Verify user is human
const isHumanResult = await sdk.verifyPreset({
  accessToken: tokenResult.accessToken,
  preset: 'is_human',
});

// isHumanResult:
// {
//   value: true,          // boolean result
//   preset: 'is_human',
//   timestamp: '2024-...'
// }

if (isHumanResult.value) {
  console.log('User is a verified human!');
}`,
    curl: `curl -X GET "https://api.humanity.org/presets/is_human" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"`,
  },
  {
    id: 6,
    title: 'Verify Multiple Presets',
    description: 'Check multiple verification credentials in a single call.',
    technicalDetail:
      'sdk.verifyPresets() checks up to 10 preset credentials in one API call. More efficient than multiple single calls.',
    analogy: '📋 Like checking all required stamps at once',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      </svg>
    ),
    code: `// Batch verify multiple presets
const result = await sdk.verifyPresets({
  accessToken: tokenResult.accessToken,
  presets: ['is_human', 'palm_verified', 'kyc_verified'],
});

// result.results Map:
// {
//   is_human: { value: true, timestamp: '...' },
//   palm_verified: { value: true, timestamp: '...' },
//   kyc_verified: { value: false, timestamp: '...' }
// }

const allVerified = result.results.every(r => r.value);`,
    curl: `curl -X POST "https://api.humanity.org/presets/batch" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "presets": ["is_human", "palm_verified", "kyc_verified"]
  }'`,
  },
  {
    id: 7,
    title: 'Query Credentials (Advanced)',
    description: 'Run custom queries against user credentials.',
    technicalDetail:
      'sdk.evaluatePredicateQuery() lets you check complex conditions. evaluateProjectionQuery() extracts specific data fields.',
    analogy: '🔍 Like running a custom database query',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
    code: `// Predicate query - returns boolean
const ageCheck = await sdk.evaluatePredicateQuery({
  accessToken,
  query: {
    check: {
      claim: 'identity.age',
      operator: '>=',
      value: 18
    }
  }
});
// ageCheck.passed: boolean

// Projection query - extracts data
const userData = await sdk.evaluateProjectionQuery({
  accessToken,
  query: {
    projections: [
      { claim: 'identity.country', lens: 'pluck' }
    ]
  }
});
// userData.data: { 'identity.country': 'US' }`,
  },
  {
    id: 8,
    title: 'Grant Seller Access',
    description: 'Based on verification, grant the user seller privileges.',
    technicalDetail:
      'With verification complete, update your database and session to mark the user as a verified seller. Their badge will appear on listings.',
    analogy: '🏆 Like receiving your official "Verified Seller" badge',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
        />
      </svg>
    ),
    code: `// Check all required verifications passed
const isVerified =
  isHumanResult.value &&
  palmResult.value;

if (isVerified) {
  // Update your database
  await db.users.update(userId, {
    verifiedSeller: true,
    verifiedAt: new Date(),
  });

  // Set session/cookie
  cookies().set('seller_verified', 'true', {
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });

  redirect('/result?status=success');
}`,
  },
];

export default function HowItWorksPage() {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [showTechnical, setShowTechnical] = useState<boolean>(true);

  const currentStep = steps.find((s) => s.id === activeStep) || steps[0];

  return (
    <main className="min-h-screen p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="text-[#959898] hover:text-white transition-colors text-sm mb-4 inline-block"
          >
            ← Back to TrustMarket
          </Link>
          <h1 className="text-3xl md:text-4xl font-semibold text-white mb-3">
            How Verification Works
          </h1>
          <p className="text-lg text-[#959898] max-w-2xl mx-auto">
            A step-by-step guide to integrating Humanity Protocol SDK for seller verification
          </p>
        </div>

        {/* Technical Toggle */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setShowTechnical(!showTechnical)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              showTechnical
                ? 'bg-[#6DFB3F] text-[#020303]'
                : 'bg-[#1C1D1D] text-[#959898] hover:text-white border border-white/10'
            }`}
          >
            {showTechnical ? '🔧 Technical Mode ON' : '👀 Show Technical Details'}
          </button>
        </div>

        {/* Step Progress */}
        <div className="relative mb-8 overflow-x-auto pb-2">
          <div className="flex justify-between items-center relative z-10 min-w-[500px]">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  step.id === activeStep
                    ? 'bg-[#6DFB3F] text-[#020303] scale-110'
                    : step.id < activeStep
                      ? 'bg-[#6DFB3F]/30 text-[#6DFB3F]'
                      : 'bg-[#1C1D1D] text-[#959898] hover:bg-[#252626]'
                }`}
              >
                {step.id}
              </button>
            ))}
          </div>
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-[#1C1D1D] -z-0 min-w-[500px]">
            <div
              className="h-full bg-[#6DFB3F] transition-all duration-300"
              style={{ width: `${((activeStep - 1) / (steps.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Active Step Detail */}
        <div className="bg-[#0E1110] rounded-[24px] p-6 md:p-8 border border-white/10 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-[#6DFB3F]/20 flex items-center justify-center text-[#6DFB3F] shrink-0">
              {currentStep.icon}
            </div>
            <div>
              <div className="text-sm text-[#6DFB3F] font-medium mb-1">
                Step {currentStep.id} of {steps.length}
              </div>
              <h2 className="text-xl md:text-2xl font-semibold text-white">{currentStep.title}</h2>
            </div>
          </div>

          <p className="text-[#959898] text-lg mb-6 leading-relaxed">{currentStep.description}</p>

          <div className="bg-[#151918] rounded-xl p-4 mb-6 border border-white/5">
            <div className="text-sm text-[#959898] mb-1">Simple Analogy</div>
            <p className="text-white">{currentStep.analogy}</p>
          </div>

          {showTechnical && (
            <div className="space-y-4">
              <div className="bg-[#151918] rounded-xl p-4 border border-white/5">
                <div className="text-sm text-[#6DFB3F] mb-2 font-medium">Technical Detail</div>
                <p className="text-[#959898] text-sm leading-relaxed">
                  {currentStep.technicalDetail}
                </p>
              </div>
              <div>
                <div className="text-sm text-[#6DFB3F] mb-2 font-medium">SDK Code</div>
                <CodeBlock code={currentStep.code} curl={currentStep.curl} />
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
            disabled={activeStep === 1}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeStep === 1
                ? 'text-[#959898]/50 cursor-not-allowed'
                : 'text-white bg-[#1C1D1D] hover:bg-[#252626] border border-white/10'
            }`}
          >
            ← Previous
          </button>

          {activeStep === steps.length ? (
            <Link
              href="/api/verify"
              className="px-6 py-3 rounded-xl font-medium bg-[#6DFB3F] text-[#020303] hover:bg-[#5de032] transition-colors"
            >
              Get Verified Now →
            </Link>
          ) : (
            <button
              onClick={() => setActiveStep(Math.min(steps.length, activeStep + 1))}
              className="px-6 py-3 rounded-xl font-medium bg-[#6DFB3F] text-[#020303] hover:bg-[#5de032] transition-colors"
            >
              Next Step →
            </button>
          )}
        </div>

        {/* SDK Methods Reference */}
        <div className="mt-8 bg-[#0E1110] rounded-[24px] p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
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
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            SDK Method Reference
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            {[
              { method: 'buildAuthUrl()', desc: 'Generate OAuth URL with PKCE' },
              { method: 'exchangeCodeForToken()', desc: 'Exchange auth code for token' },
              { method: 'verifyPreset()', desc: 'Check single verification' },
              { method: 'verifyPresets()', desc: 'Batch check multiple verifications' },
              { method: 'evaluatePredicateQuery()', desc: 'Run boolean condition query' },
              { method: 'evaluateProjectionQuery()', desc: 'Extract credential data' },
              { method: 'generateState()', desc: 'Create CSRF protection state' },
              { method: 'generateNonce()', desc: 'Create replay protection nonce' },
            ].map((item) => (
              <div key={item.method} className="flex items-start gap-2">
                <code className="text-[#6DFB3F] font-mono text-xs bg-[#151918] px-2 py-1 rounded shrink-0">
                  {item.method}
                </code>
                <span className="text-[#959898]">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-6 bg-[#0E1110] rounded-[24px] p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
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
            Why This Is Secure
          </h3>
          <ul className="space-y-2 text-[#959898] text-sm">
            <li className="flex items-start gap-2">
              <span className="text-[#6DFB3F] mt-1">✓</span>
              <span>
                <strong className="text-white">Biometric Verification:</strong> Palm scanning
                ensures each user is unique - can&apos;t be faked or duplicated
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#6DFB3F] mt-1">✓</span>
              <span>
                <strong className="text-white">PKCE Protection:</strong> Even if the auth code is
                intercepted, it&apos;s useless without the verifier
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#6DFB3F] mt-1">✓</span>
              <span>
                <strong className="text-white">Privacy Preserved:</strong> We only know you&apos;re
                human - we don&apos;t store biometric data
              </span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
