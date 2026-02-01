# TrustMarket - Verified Seller Marketplace

A marketplace demo showing how to verify sellers are real humans using the Humanity Protocol SDK. Buyers can trust that every verified seller has completed human and biometric verification.

<img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />

## Features

- 🔐 **OAuth 2.0 with PKCE** — Secure authorization flow with Humanity Protocol
- 👤 **Human Verification** — Verify users with the `is_human` preset
- ✋ **Palm Biometric** — Optional biometric verification with `palm_verified` preset
- 🏪 **Verified Seller Badges** — Display trust badges on seller profiles
- 📊 **Tiered Access** — Unlock features based on verification level
- 🛒 **Marketplace Demo** — Browse, favorite, and list items

## Demo



## How the Humanity Protocol API works

### Preset Verification

TrustMarket uses **presets** to verify seller identity. Presets are pre-configured verification checks:

| Preset | Description |
|--------|-------------|
| `is_human` | User has completed basic human verification |
| `palm_verified` | User has completed palm biometric verification |

Presets are verified using the SDK's `verifyPreset` method:

```typescript
const isHumanResult = await sdk.verifyPreset({
  accessToken,
  preset: 'is_human',
});

const palmResult = await sdk.verifyPreset({
  accessToken,
  preset: 'palm_verified',
});

// Grant seller access based on verification
if (isHumanResult.value && palmResult.value) {
  grantVerifiedSellerAccess(userId);
}
```

### Trust Level System

TrustMarket implements a tiered trust system based on completed verifications:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Trust Level System                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Level 1: Basic         Level 2: Verified       Level 3: Trusted           │
│   ─────────────         ────────────────         ───────────────            │
│   • Browse marketplace  • Create listings       • Unlimited listings        │
│   • Save favorites      • Verified badge        • Featured placement        │
│   • Contact sellers     • Search priority       • Instant payouts           │
│                                                                              │
│   Requires:             Requires:               Requires:                   │
│   1 verification        2 verifications         3 verifications             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### OAuth Flow

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Seller    │────▶│  TrustMarket    │────▶│ Humanity Proto  │
│             │     │                 │     │      API        │
└─────────────┘     └─────────────────┘     └─────────────────┘
      │                     │                       │
      │  1. Click Verify    │  2. Redirect to       │
      │                     │     OAuth flow        │
      │                     │                       │
      │  5. Show result     │  3. User completes    │
      │     + badge         │     verification      │
      │                     │                       │
      │                     │  4. Callback with     │
      │                     │     tokens + verify   │
      │                     │     presets           │
      ▼                     ▼                       ▼
```

## How to run locally

### 1. Clone and navigate

```bash
git clone https://github.com/anthropics/hp-dev-api-docs
cd hp-dev-api-docs/examples/trustmarket
```

### 2. Install dependencies

```bash
bun install
# or
npm install
```

### 3. Configure environment

Copy the example environment file and edit it:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `HUMANITY_CLIENT_ID` | OAuth client ID from the [Developer Dashboard](https://developer.humanity.org) |
| `HUMANITY_CLIENT_SECRET` | OAuth client secret (starts with `sk_`) |
| `HUMANITY_REDIRECT_URI` | Must match exactly: `http://localhost:3200/api/auth/callback` |
| `HUMANITY_ENVIRONMENT` | Environment: `sandbox` or `production` |

```env
# Humanity Protocol OAuth
HUMANITY_CLIENT_ID=your_client_id
HUMANITY_CLIENT_SECRET=sk_your_client_secret
HUMANITY_REDIRECT_URI=http://localhost:3200/api/auth/callback
HUMANITY_ENVIRONMENT=sandbox
```

### 4. Run the development server

```bash
bun dev
# or
npm run dev
```

Open [http://localhost:3200](http://localhost:3200) in your browser.

## Project structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── callback/route.ts  # OAuth callback, verifies presets
│   │   └── verify/route.ts        # Initiates OAuth flow
│   ├── dashboard/page.tsx         # Verified seller dashboard
│   ├── how-it-works/page.tsx      # Technical explanation page
│   ├── marketplace/
│   │   ├── [id]/page.tsx          # Individual listing page
│   │   └── page.tsx               # Browse all listings
│   ├── result/page.tsx            # Verification results page
│   └── page.tsx                   # Landing page with CTA
└── lib/
    └── humanity.ts                # SDK initialization and helpers
```

## API endpoints

### Verification

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/verify` | GET | Initiates OAuth flow, redirects to Humanity Protocol |
| `/api/auth/callback` | GET | OAuth callback, exchanges code for tokens, verifies presets |

## SDK usage

### Initialize the SDK

```typescript
import { HumanitySDK } from '@humanity-org/connect-sdk';

const sdk = new HumanitySDK({
  clientId: process.env.HUMANITY_CLIENT_ID,
  redirectUri: process.env.HUMANITY_REDIRECT_URI,
  baseUrl: process.env.HUMANITY_ENVIRONMENT,
});
```

### Build authorization URL

```typescript
const { url, codeVerifier, state, nonce } = sdk.buildAuthUrl({
  scopes: ['identity:read'],
  state,
  nonce,
});

// Store codeVerifier, state, nonce in cookies
// Redirect user to url
```

### Handle OAuth callback

```typescript
// 1. Verify state matches
if (!verifyAuthState(storedState, callbackState)) {
  throw new Error('Invalid state');
}

// 2. Exchange code for tokens
const tokens = await sdk.exchangeCodeForToken({
  code,
  codeVerifier,
});

// 3. Verify presets
const isHuman = await sdk.verifyPreset({
  accessToken: tokens.accessToken,
  preset: 'is_human',
});

const palmVerified = await sdk.verifyPreset({
  accessToken: tokens.accessToken,
  preset: 'palm_verified',
});

// 4. Grant access based on results
if (isHuman.value && palmVerified.value) {
  // Full verified seller access
} else if (isHuman.value) {
  // Basic verified access
}
```

### Verify multiple presets

```typescript
// Check multiple presets in sequence
const presets = ['is_human', 'palm_verified'];
const results = [];

for (const preset of presets) {
  const result = await sdk.verifyPreset({
    accessToken,
    preset,
  });
  results.push({ preset, value: result.value });
}

// Count passed verifications
const passedCount = results.filter(r => r.value).length;
```

## Scripts

| Command | Description |
|---------|-------------|
| `bun dev` | Start Next.js locally on port 3200 |
| `bun build` | Production build |
| `bun start` | Start the production server |
| `bun lint` | Run ESLint |

## Get support

- [Humanity Protocol Documentation](https://docs.humanity.org)
- [Connect SDK Reference](https://docs.humanity.org/sdk)
- [Next.js Documentation](https://nextjs.org/docs)

## Other Examples

| Example | Description | Complexity |
|---------|-------------|------------|
| [next-oauth](../next-oauth) | Basic OAuth 2.0 + PKCE flow | ⭐ |
| [next-backend-auth](../next-backend-auth) | Issue your own JWTs from verified identity | ⭐⭐ |
| **You are here** | Marketplace with preset verification | ⭐⭐ |
| [newsletter-app](../newsletter-app) | Preset-based personalization with MongoDB | ⭐⭐⭐ |

---

## Troubleshooting

### Redirect URI Mismatch

**Error:** `redirect_uri_mismatch` or "Invalid redirect URI"

**Cause:** The redirect URI in your code doesn't exactly match what's registered in the Humanity Protocol dashboard.

**Fix:**
1. Go to [Developer Dashboard](https://developer.humanity.org) → Applications → Your App
2. Check the registered redirect URIs
3. Ensure `HUMANITY_REDIRECT_URI` in `.env` matches exactly
4. For local dev, register: `http://localhost:3200/api/auth/callback`

Common mistakes:
- ❌ `http://localhost:3200/api/auth/callback/` (trailing slash)
- ❌ `https://localhost:3200/api/auth/callback` (https vs http)
- ✅ `http://localhost:3200/api/auth/callback`

---

### CORS Errors

**Error:** "Access to fetch blocked by CORS policy"

**Cause:** Browser blocking cross-origin requests to the token endpoint.

**Fix:** Token exchange must happen server-side, not in the browser. In this example, the exchange happens in `app/api/auth/callback/route.ts`.

---

### Token Exchange Failing

**Error:** `invalid_grant` or "Code expired"

**Cause:** Authorization codes are single-use and expire quickly (~60 seconds).

**Fix:**
- Don't refresh the callback page (it tries to reuse the code)
- Ensure `code_verifier` matches the original `code_challenge`
- Check that you're not calling the token endpoint twice

---

### "Invalid nonce" Error

**Error:** Nonce verification failed

**Cause:** The nonce in the ID token doesn't match the nonce stored in your session.

**Fix:**
1. Ensure the nonce is stored in session/cookie **before** redirecting to authorize
2. Retrieve the **same** nonce value in the callback
3. Check that cookies are being set properly

---

### State Mismatch

**Error:** "Invalid state" or state verification failed

**Cause:** The state parameter returned from authorization doesn't match what was stored.

**Fix:**
1. Ensure state is stored in session **before** redirect
2. Same session must be available in callback
3. Check for cookie/session issues

---

### Preset Verification Returning False

**Error:** Preset check returns `false` when expected `true`

**Cause:** User hasn't completed verification, or preset not enabled for your app.

**Fix:**
1. Ensure the preset is enabled in your application settings
2. Verify the user has completed the verification process
3. Check that you're using the correct access token (not expired)

---

## License

MIT
