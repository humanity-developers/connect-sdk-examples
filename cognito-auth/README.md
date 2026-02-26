# Cognito → Humanity Protocol Integration Example

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../LICENSE)
[![SDK](https://img.shields.io/badge/@humanity--org%2Fconnect--sdk-0.1.0-green)](https://www.npmjs.com/package/@humanity-org/connect-sdk)
[![Node](https://img.shields.io/badge/Node-18+-purple.svg)](https://nodejs.org)

A Next.js App Router example showing how to exchange an **AWS Cognito JWT** for a
**Humanity Protocol OAuth token** using the RFC 7523 JWT Bearer Grant —
without requiring the user to go through the HP consent screen again.

---

## The Problem This Solves

If your app already uses AWS Cognito for authentication, adding Humanity Protocol
verification normally means:

1. Send the user through the full HP OAuth consent flow (redirect, login, consent screen, callback)
2. Store the HP access token alongside the Cognito session
3. Handle two separate token refresh cycles

The **JWT Bearer Grant** eliminates steps 1–3 for returning users. Once a user has
consented to your app via HP once, you can obtain a fresh HP access token at any time
using their Cognito JWT. No redirect. No consent screen.

---

## Architecture

```
Browser (user is logged in via Cognito)
   │
   │  POST /api/auth/cognito-exchange
   │  { cognitoToken: "<Cognito id_token>" }
   │
   ▼
Your Backend (this Next.js app)
   │
   │  sdk.exchangeCognitoToken({ cognitoToken })
   │  → POST https://api.humanity.org/oauth/token
   │     { grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
   │       assertion: "<Cognito id_token>",
   │       client_id: "<your HP client id>" }
   │
   ▼
HP API Server
   ├─ Verifies Cognito JWT against Cognito JWKS
   ├─ Resolves HP user (by Cognito sub → verified email fallback)
   ├─ Checks for an active HP authorization for this client_id
   └─ Issues HP access_token + refresh_token
   │
   ▼
Your Backend
   ├─ Stores HP tokens in server-side session cookie (httpOnly)
   └─ Returns session metadata to browser (no raw tokens)
   │
   ▼
Browser
   └─ Redirects to /dashboard
      └─ Server component verifies HP presets using the stored access token
```

---

## Getting Started

### Prerequisites

- Node 18+ (or Bun)
- A Humanity Protocol developer account → [developer.humanity.org](https://developer.humanity.org)
- An AWS Cognito User Pool (for end-to-end testing)
- The HP API server must have Cognito integration enabled (`COGNITO_ENABLED=true`)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Humanity Protocol
HUMANITY_CLIENT_ID=hp_your_client_id
HUMANITY_CLIENT_SECRET=sk_your_secret
HUMANITY_ENVIRONMENT=sandbox

# AWS Cognito (for end-to-end testing)
COGNITO_USER_POOL_ID=us-east-1_yourPool
COGNITO_REGION=us-east-1
COGNITO_CLIENT_ID=your_cognito_app_client_id

# Session cookie signing key
SESSION_SECRET=your_random_32_char_secret
```

### 3. Run

```bash
npm run dev
# → http://localhost:3002
```

---

## Replacing the Mock with Real Cognito

The example includes a `cognito-mock.ts` that generates locally-signed tokens for UI
exploration. Replace it with a real Cognito token source:

### AWS Amplify v6 (frontend)

```ts
import { fetchAuthSession } from 'aws-amplify/auth';

async function getCognitoToken(): Promise<string> {
  const { tokens } = await fetchAuthSession();
  const idToken = tokens?.idToken?.toString();
  if (!idToken) throw new Error('Not authenticated with Cognito');
  return idToken;
}

// Send to your backend
const response = await fetch('/api/auth/cognito-exchange', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ cognitoToken: await getCognitoToken() }),
});
```

### Cognito Hosted UI + PKCE (standard web flow)

After the Cognito callback, the `id_token` is available in the URL fragment or
your session. Pass it directly to `/api/auth/cognito-exchange`.

### Manually (for testing with `curl`)

```bash
# 1. Get a real token via the Cognito token endpoint
TOKEN=$(curl -s -X POST \
  "https://your-domain.auth.us-east-1.amazoncognito.com/oauth2/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&client_id=xxx&code=yyy&redirect_uri=zzz" \
  | jq -r '.id_token')

# 2. Exchange for HP token
curl -X POST http://localhost:3002/api/auth/cognito-exchange \
  -H "Content-Type: application/json" \
  -d "{\"cognitoToken\": \"$TOKEN\"}"
```

---

## HP Server Configuration

The HP API server (`hp-dev-api`) must be started with:

```env
COGNITO_ENABLED=true
COGNITO_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_yourPool
# Optional — validates the `aud` claim
COGNITO_CLIENT_ID=your_cognito_app_client_id
# Cache TTL for Cognito JWKS keys (default: 1 hour)
COGNITO_JWKS_CACHE_TTL_MS=3600000
```

The server validates:
1. JWT signature against `https://cognito-idp.{region}.amazonaws.com/{userPoolId}/.well-known/jwks.json`
2. Issuer matches the configured pool
3. Audience matches `COGNITO_CLIENT_ID` (if set)
4. The HP user exists (looked up by Cognito `sub`, email fallback only if `email_verified=true`)
5. An active HP authorization exists for this user + `client_id`

---

## Error Reference

| Error | HTTP | Description |
|-------|------|-------------|
| `unsupported_grant_type` | 400 | `COGNITO_ENABLED=false` on the HP server |
| `invalid_grant` (token) | 400 | Cognito JWT is invalid, expired, or the JWKS key wasn't found |
| `invalid_grant` (user) | 400 | No HP user found for this Cognito identity |
| `invalid_grant` (auth) | 400 | User hasn't completed the HP consent flow for this client_id yet |

---

## Project Structure

```
cognito-auth/
├── .env.example
├── package.json
├── next.config.mjs
├── tsconfig.json
├── README.md
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── globals.css
    │   ├── page.tsx                         # Landing: enter/exchange Cognito token
    │   ├── dashboard/
    │   │   └── page.tsx                     # Protected: shows HP session + presets
    │   └── api/
    │       ├── auth/
    │       │   ├── cognito-exchange/
    │       │   │   └── route.ts             # POST — core token exchange endpoint
    │       │   ├── session/
    │       │   │   └── route.ts             # GET/DELETE — session info + logout
    │       │   └── mock-token/
    │       │       └── route.ts             # POST — dev-only mock Cognito JWT
    │       └── presets/
    │           └── route.ts                 # GET — verify HP presets (uses session)
    ├── components/
    │   ├── LogoutButton.tsx
    │   └── PresetTable.tsx
    └── lib/
        ├── config.ts                        # Env config
        ├── humanity-sdk.ts                  # SDK singleton
        ├── cognito-mock.ts                  # Dev-only mock JWT generator
        └── session.ts                       # Cookie session management
```

---

## Key Files

| File | Purpose |
|------|---------|
| `src/app/api/auth/cognito-exchange/route.ts` | **The core API route** — calls `sdk.exchangeCognitoToken()` |
| `src/lib/humanity-sdk.ts` | SDK singleton with `exchangeCognitoToken` |
| `src/lib/session.ts` | Server-only session cookie (HP token never sent to browser) |
| `src/app/dashboard/page.tsx` | Server component that verifies presets using the stored token |

---

## SDK Method

This example uses `sdk.exchangeCognitoToken()` from `@humanity-org/connect-sdk`:

```ts
import { HumanitySDK, type JwtBearerGrantOptions } from '@humanity-org/connect-sdk';

const sdk = new HumanitySDK({ clientId, redirectUri, clientSecret, environment });

const result = await sdk.exchangeCognitoToken({
  cognitoToken: cognitoIdToken,
  // clientId?: override the client_id (optional — defaults to SDK config)
});

// result: TokenResult
// {
//   accessToken: string
//   tokenType: 'Bearer'
//   expiresIn: number
//   scope: string
//   grantedScopes: string[]
//   authorizationId: string
//   appScopedUserId: string
//   refreshToken?: string
// }
```

---

## License

MIT
