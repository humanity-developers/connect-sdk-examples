'use client';

import Link from 'next/link';
import { useState, useCallback } from 'react';

// Code snippet component with syntax highlighting and copy buttons
function CodeBlock({
  code,
  language = 'typescript',
  curl,
}: {
  code: string;
  language?: string;
  curl?: string;
}) {
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
      /^(const|let|var|function|async|await|return|if|else|import|from|export|new|throw|try|catch|class|interface|type|extends|implements|public|private|protected|static|readonly|enum|namespace|module|declare|as|is|in|of|for|while|do|switch|case|break|continue|default|yield|void|never|any|unknown|this|super|true|false|null|undefined)$/;
    const types =
      /^(string|number|boolean|object|symbol|bigint|Promise|Error|Array|Object|Map|Set|Date|RegExp|Function)$/;

    while (remaining.length > 0) {
      // Comments
      if (remaining.startsWith('//')) {
        tokens.push(
          <span key={`${lineIndex}-${keyIndex++}`} className="text-[#6A9955]">
            {remaining}
          </span>,
        );
        break;
      }

      // Multi-line comment or JSX comment
      if (remaining.startsWith('/*') || remaining.startsWith('{/*')) {
        const isJsx = remaining.startsWith('{/*');
        const endMarker = isJsx ? '*/}' : '*/';
        const endIdx = remaining.indexOf(endMarker);
        if (endIdx !== -1) {
          const comment = remaining.slice(0, endIdx + endMarker.length);
          tokens.push(
            <span key={`${lineIndex}-${keyIndex++}`} className="text-[#6A9955]">
              {comment}
            </span>,
          );
          remaining = remaining.slice(endIdx + endMarker.length);
          continue;
        }
      }

      // Strings (single, double, backtick)
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

      // Template literal start
      if (remaining.startsWith('`')) {
        tokens.push(
          <span key={`${lineIndex}-${keyIndex++}`} className="text-[#CE9178]">
            {remaining}
          </span>,
        );
        break;
      }

      // Numbers
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

      // Words (identifiers, keywords, types)
      const wordMatch = remaining.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*/);
      if (wordMatch) {
        const word = wordMatch[0];
        let className = 'text-[#9CDCFE]'; // Default: variable/identifier

        if (keywords.test(word)) {
          className = 'text-[#569CD6]'; // Keyword
        } else if (types.test(word)) {
          className = 'text-[#4EC9B0]'; // Type
        } else if (remaining.slice(word.length).match(/^\s*\(/)) {
          className = 'text-[#DCDCAA]'; // Function call
        } else if (remaining.slice(word.length).match(/^\s*:/)) {
          className = 'text-[#9CDCFE]'; // Property name
        }

        tokens.push(
          <span key={`${lineIndex}-${keyIndex++}`} className={className}>
            {word}
          </span>,
        );
        remaining = remaining.slice(word.length);
        continue;
      }

      // Operators and punctuation
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

      // Whitespace
      const wsMatch = remaining.match(/^\s+/);
      if (wsMatch) {
        tokens.push(<span key={`${lineIndex}-${keyIndex++}`}>{wsMatch[0]}</span>);
        remaining = remaining.slice(wsMatch[0].length);
        continue;
      }

      // Fallback: single character
      tokens.push(
        <span key={`${lineIndex}-${keyIndex++}`} className="text-[#D4D4D4]">
          {remaining[0]}
        </span>,
      );
      remaining = remaining.slice(1);
    }

    return tokens;
  };

  // Format code with line numbers and syntax highlighting
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
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <div className="w-3 h-3 rounded-full bg-[#27CA40]" />
          </div>
          <span className="text-xs text-[#858585] ml-2">{language}</span>
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
              {copied === 'curl' ? (
                <>
                  <svg
                    className="w-3.5 h-3.5"
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
                  Copied!
                </>
              ) : (
                <>
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Copy cURL
                </>
              )}
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
            {copied === 'code' ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Copy Code
              </>
            )}
          </button>
        </div>
      </div>
      {/* Code */}
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
    title: 'You Enter Loan Amount',
    description:
      'You tell us how much you want to borrow. This starts the eligibility check process.',
    technicalDetail:
      'The app captures your loan amount and prepares to redirect you to Humanity Protocol for secure financial verification.',
    analogy: '🏠 Like walking into a bank and saying "I\'d like to borrow $10,000"',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
        />
      </svg>
    ),
    code: `// User submits the loan check form
const handleSubmit = async (event: FormEvent) => {
  event.preventDefault();
  const amount = formData.get('amount');

  // Redirect to our API route that initiates OAuth
  window.location.href = \`/api/check?amount=\${amount}\`;
};

// The form submits to /api/check with the loan amount
<form action="/api/check" method="GET">
  <input name="amount" type="number" defaultValue="10000" />
  <button type="submit">Check If I Pre-Qualify</button>
</form>`,
  },
  {
    id: 2,
    title: 'PKCE Codes Generated',
    description:
      'We create a secret "handshake" that only you and Humanity Protocol know. This prevents anyone from intercepting your data.',
    technicalDetail:
      'PKCE (Proof Key for Code Exchange) generates a random code_verifier and its SHA-256 hash (code_challenge). The challenge is sent to Humanity, but the verifier stays secret with us.',
    analogy:
      "🔐 Like creating a secret password that only works once - even if someone sees it being used, they can't reuse it",
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
    code: `import crypto from 'crypto';

// Generate a cryptographically random code verifier
function generateCodeVerifier(): string {
  // 32 bytes = 256 bits of entropy
  return crypto.randomBytes(32)
    .toString('base64url');
}

// Create the code challenge by hashing the verifier
function generateCodeChallenge(verifier: string): string {
  return crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url');
}

// Example output:
const codeVerifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
const codeChallenge = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM";

// The verifier stays secret on our server
// Only the challenge is sent to Humanity`,
  },
  {
    id: 3,
    title: 'Redirect to Humanity',
    description:
      "You're sent to Humanity Protocol to prove who you are and give permission to check your financial data.",
    technicalDetail:
      "The app redirects to Humanity's /authorize endpoint with: client_id, redirect_uri, scopes (financial:net_worth, financial:bank_balance), state (CSRF protection), and code_challenge.",
    analogy: '🚪 Like being directed to a secure room where you can safely share your documents',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
        />
      </svg>
    ),
    code: `import { HumanitySDK } from '@humanity-org/connect-sdk';

// Initialize the SDK with your credentials
const sdk = new HumanitySDK({
  clientId: process.env.HUMANITY_CLIENT_ID,
  redirectUri: 'https://quickloan.example.com/api/auth/callback',
  environment: 'sandbox', // or 'production'
});

// Build the authorization URL
const { url, codeVerifier } = sdk.buildAuthUrl({
  // Request access to financial data
  scopes: ['financial:net_worth', 'financial:bank_balance'],
  // CSRF protection - unique per request
  state: crypto.randomUUID(),
  // Additional security nonce
  nonce: crypto.randomUUID(),
});

// Store codeVerifier in secure HTTP-only cookie
cookies().set('humanity_code_verifier', codeVerifier, {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
});

// Redirect user to Humanity Protocol
redirect(url);`,
    curl: `curl -X GET "https://auth.humanity.org/authorize?\\
  client_id=YOUR_CLIENT_ID&\\
  redirect_uri=https://quickloan.example.com/api/auth/callback&\\
  response_type=code&\\
  scope=financial:net_worth%20financial:bank_balance&\\
  state=abc123-unique-state&\\
  code_challenge=E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM&\\
  code_challenge_method=S256"`,
  },
  {
    id: 4,
    title: 'You Grant Permission',
    description:
      'You review exactly what data QuickLoan is asking for and choose to approve or deny.',
    technicalDetail:
      'Humanity shows a consent screen listing the requested scopes. You can see exactly what financial data will be shared. Nothing happens without your explicit approval.',
    analogy: '✅ Like a doctor asking "Is it okay if I check your records?" before accessing them',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
    code: `// What the user sees on Humanity's consent screen:
// ┌─────────────────────────────────────────────────────┐
// │                  Humanity Protocol                   │
// │                                                      │
// │  QuickLoan wants to access:                         │
// │                                                      │
// │  ✓ Your verified net worth                          │
// │  ✓ Your verified bank balance                       │
// │                                                      │
// │  This app will be able to:                          │
// │  • Read your financial verification status          │
// │  • Query if you meet specific thresholds            │
// │                                                      │
// │  This app will NOT be able to:                      │
// │  • See your actual account numbers                  │
// │  • Access your transaction history                  │
// │  • Make any changes to your accounts                │
// │                                                      │
// │  ┌─────────────┐    ┌─────────────────────┐        │
// │  │   Deny      │    │   Allow Access      │        │
// │  └─────────────┘    └─────────────────────┘        │
// └─────────────────────────────────────────────────────┘

// User clicks "Allow Access" → redirected back with auth code`,
  },
  {
    id: 5,
    title: 'Authorization Code Returned',
    description:
      'After you approve, Humanity sends you back to QuickLoan with a special one-time code.',
    technicalDetail:
      'Humanity redirects back to our callback URL with an authorization code and the original state parameter. We verify state matches to prevent CSRF attacks.',
    analogy: '🎫 Like getting a ticket stub that proves you were at the concert',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 16l-4-4m0 0l4-4m-4 4h18"
        />
      </svg>
    ),
    code: `// Humanity redirects user to our callback URL:
// GET /api/auth/callback?code=AUTH_CODE_HERE&state=abc123-unique-state

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Extract the authorization code
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  // CRITICAL: Verify state matches what we stored
  const storedState = cookies().get('humanity_state')?.value;

  if (state !== storedState) {
    // Possible CSRF attack - reject the request
    return NextResponse.redirect('/result?status=error&message=Invalid+state');
  }

  // State is valid - proceed to exchange code for token
  const codeVerifier = cookies().get('humanity_code_verifier')?.value;

  // Continue to token exchange...
}`,
  },
  {
    id: 6,
    title: 'Exchange Code for Token',
    description:
      'We trade the one-time code (plus our secret verifier) for an access token that lets us query your data.',
    technicalDetail:
      "The app sends the authorization code AND the original code_verifier to Humanity's /token endpoint. Humanity verifies that SHA256(code_verifier) matches the original code_challenge.",
    analogy: '🔑 Like exchanging your ticket stub + ID to get into the VIP area',
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
    code: `// Exchange authorization code for access token
const tokenResponse = await sdk.exchangeCode({
  code: authorizationCode,
  codeVerifier: storedCodeVerifier, // The secret we kept
});

// Humanity verifies:
// 1. The authorization code is valid and not expired
// 2. SHA256(codeVerifier) === original code_challenge
// 3. The client_id matches

const { accessToken, refreshToken, expiresIn } = tokenResponse;

// accessToken structure (JWT):
// {
//   "sub": "user_123abc",
//   "aud": "your_client_id",
//   "scope": "financial:net_worth financial:bank_balance",
//   "exp": 1699999999,
//   "iat": 1699996399
// }

console.log('Access token obtained, expires in:', expiresIn, 'seconds');`,
    curl: `curl -X POST "https://auth.humanity.org/token" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "grant_type=authorization_code" \\
  -d "client_id=YOUR_CLIENT_ID" \\
  -d "client_secret=YOUR_CLIENT_SECRET" \\
  -d "code=AUTH_CODE_FROM_CALLBACK" \\
  -d "redirect_uri=https://quickloan.example.com/api/auth/callback" \\
  -d "code_verifier=dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"

# Response:
# {
#   "access_token": "eyJhbGciOiJSUzI1NiIs...",
#   "token_type": "Bearer",
#   "expires_in": 3600,
#   "refresh_token": "def50200..."
# }`,
  },
  {
    id: 7,
    title: 'Query Your Financial Data',
    description:
      'With your permission granted, we securely query your verified financial information.',
    technicalDetail:
      "Using the access token, we call the Humanity Query Engine API to fetch your net worth and bank balance. This data is cryptographically verified - it can't be faked.",
    analogy: '📊 Like having a trusted accountant look at your verified records',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
    code: `// Query the user's verified financial data
const queryResult = await sdk.query({
  accessToken: accessToken,

  // Define predicates - questions about the user's data
  predicates: [
    {
      field: 'net_worth',
      operator: '>=',
      value: 50000, // Is net worth at least $50,000?
    },
    {
      field: 'bank_balance',
      operator: '>=',
      value: requestedLoanAmount * 0.2, // 20% of loan as reserves?
    },
  ],
});

// Response contains boolean results, NOT actual values
// This preserves privacy - we only know IF they qualify
const result = {
  predicates: [
    { field: 'net_worth', operator: '>=', value: 50000, result: true },
    { field: 'bank_balance', operator: '>=', value: 2000, result: true },
  ],
  allPassed: true, // All predicates returned true
};

// We never see the actual dollar amounts!
// Just verified yes/no answers to our questions`,
    curl: `curl -X POST "https://api.humanity.org/v1/query" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "predicates": [
      {
        "field": "net_worth",
        "operator": ">=",
        "value": 50000
      },
      {
        "field": "bank_balance",
        "operator": ">=",
        "value": 2000
      }
    ]
  }'

# Response:
# {
#   "predicates": [
#     { "field": "net_worth", "operator": ">=", "value": 50000, "result": true },
#     { "field": "bank_balance", "operator": ">=", "value": 2000, "result": true }
#   ],
#   "allPassed": true,
#   "timestamp": "2024-01-15T10:30:00Z",
#   "signature": "..."
# }`,
  },
  {
    id: 8,
    title: 'Instant Decision',
    description:
      'Based on your verified financial data, we instantly determine if you pre-qualify - no credit check needed!',
    technicalDetail:
      'We compare your verified net worth and bank balance against our lending criteria. Because the data is cryptographically verified by Humanity Protocol, we can trust it immediately.',
    analogy:
      '✨ Like getting an instant answer because your documents are already stamped "verified"',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    code: `// Make the pre-qualification decision
function determineEligibility(
  queryResult: QueryResult,
  requestedAmount: number
): EligibilityResult {

  // Check if all our requirements were met
  const meetsNetWorthRequirement = queryResult.predicates
    .find(p => p.field === 'net_worth')?.result ?? false;

  const meetsBankBalanceRequirement = queryResult.predicates
    .find(p => p.field === 'bank_balance')?.result ?? false;

  const isQualified = meetsNetWorthRequirement && meetsBankBalanceRequirement;

  return {
    qualified: isQualified,
    amount: requestedAmount,
    // No credit check was performed!
    creditCheckPerformed: false,
    // Decision backed by cryptographic proof
    verificationProof: queryResult.signature,
  };
}

// Redirect to result page
if (result.qualified) {
  redirect(\`/result?status=qualified&amount=\${amount}\`);
} else {
  redirect(\`/result?status=not_qualified&amount=\${amount}\`);
}

// The entire process: ~3 seconds
// Traditional loan pre-qualification: days to weeks`,
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
            ← Back to QuickLoan
          </Link>
          <h1 className="text-3xl md:text-4xl font-semibold text-white mb-3">How It Works</h1>
          <p className="text-lg text-[#959898] max-w-2xl mx-auto">
            A step-by-step look at how we securely verify your financial eligibility using OAuth 2.0
            with PKCE
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
          {/* Progress Line */}
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

          {/* Analogy Box */}
          <div className="bg-[#151918] rounded-xl p-4 mb-6 border border-white/5">
            <div className="text-sm text-[#959898] mb-1">Simple Analogy</div>
            <p className="text-white">{currentStep.analogy}</p>
          </div>

          {/* Technical Details */}
          {showTechnical && (
            <div className="space-y-4">
              <div className="bg-[#151918] rounded-xl p-4 border border-white/5">
                <div className="text-sm text-[#6DFB3F] mb-2 font-medium">Technical Detail</div>
                <p className="text-[#959898] text-sm leading-relaxed">
                  {currentStep.technicalDetail}
                </p>
              </div>

              {/* Code Block */}
              <div>
                <div className="text-sm text-[#6DFB3F] mb-2 font-medium">Code Example</div>
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
              href="/"
              className="px-6 py-3 rounded-xl font-medium bg-[#6DFB3F] text-[#020303] hover:bg-[#5de032] transition-colors"
            >
              Try It Now →
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

        {/* Security Note */}
        <div className="mt-8 bg-[#0E1110] rounded-[24px] p-6 border border-white/10">
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
                <strong className="text-white">PKCE Protection:</strong> Even if someone intercepts
                the authorization code, they can&apos;t use it without the code_verifier
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#6DFB3F] mt-1">✓</span>
              <span>
                <strong className="text-white">State Parameter:</strong> Prevents cross-site request
                forgery attacks
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#6DFB3F] mt-1">✓</span>
              <span>
                <strong className="text-white">Your Control:</strong> You explicitly consent to what
                data is shared
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#6DFB3F] mt-1">✓</span>
              <span>
                <strong className="text-white">Verified Data:</strong> Financial data is
                cryptographically verified - impossible to fake
              </span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
