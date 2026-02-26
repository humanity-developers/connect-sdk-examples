# cognito-auth — Humanity Protocol × AWS Cognito

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../LICENSE)
[![SDK Version](https://img.shields.io/badge/Connect_SDK-v0.1.0-green.svg)](https://www.npmjs.com/package/@humanity-org/connect-sdk)
[![Node](https://img.shields.io/badge/Node-18+-purple.svg)](https://nodejs.org)

> **If you already use AWS Cognito, you can exchange a Cognito JWT for a Humanity
> OAuth token with a single backend call — no second consent screen needed.**

This example shows how to integrate Humanity Protocol identity verification into an
application that already authenticates users with AWS Cognito using the
**RFC 7523 JWT Bearer Grant**.

---

## The Integration Pattern

```
User authenticates    Frontend sends      Backend calls             HP API verifies
  with Cognito     →  Cognito id_token → exchangeCognitoToken()  → Cognito JWKS,
(Amplify / Hosted UI)  to your backend    on the HP SDK             resolves user,
                                                                     issues HP token
```

1. User logs in with Cognito (Amplify, Hosted UI, or any standard Cognito flow).
2. Frontend sends the Cognito **id_token** to your backend.
3. Backend calls `sdk.exchangeCognitoToken({ cognitoToken })`.
4. The HP API:
   - Verifies the JWT signature against your Cognito User Pool's JWKS.
   - Resolves the HP user by Cognito `sub` (falls back to verified `email`).
   - Checks for an active HP authorization for your `client_id`.
   - Issues a Humanity access + refresh token pair.
5. You use the Humanity token to verify presets, gate features, etc.

### Prerequisite

The user must have completed the Humanity consent flow **at least once** before the
JWT bearer grant will work. After that first consent, all subsequent sign-ins use
this fast path — no additional HP UI interaction required.

---

## SDK Usage

```typescript
import { HumanitySDK } from '@humanity-org/connect-sdk';

const sdk = new HumanitySDK({
  clientId: process.env.HUMANITY_CLIENT_ID!,
  redirectUri: process.env.HUMANITY_REDIRECT_URI!,
  environment: 'production',
});

// AWS Amplify v6 — obtain the Cognito id_token on the frontend
// import { fetchAuthSession } from 'aws-amplify/auth';
// const { tokens } = await fetchAuthSession();
// const cognitoToken = tokens?.idToken?.toString() ?? '';

const humanityToken = await sdk.exchangeCognitoToken({ cognitoToken });

// Use it like any other HP token
const result = await sdk.verifyPresets({
  accessToken: humanityToken.accessToken,
  presets: ['isHuman', 'ageOver18'],
});
```

### `exchangeCognitoToken()` options

| Option        | Type     | Required | Description |
|---------------|----------|----------|-------------|
| `cognitoToken`| `string` | ✅        | Cognito `id_token` (preferred) or `access_token`. |
| `clientId`    | `string` | ➖        | Override the HP `client_id`. Defaults to the value passed to the SDK constructor. |

The method throws `HumanityError` with:
- `unsupported_grant_type` — Cognito integration is disabled on the HP API server (`COGNITO_ENABLED` not set).
- `invalid_grant` — Cognito JWT is invalid/expired, or no active HP authorization exists for this user + client.

---

## What's in this Example

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Landing page with flow diagram, code snippet, and demo button |
| `src/app/dashboard/page.tsx` | Post-exchange dashboard: session info + preset verification |
| `src/app/api/auth/cognito-exchange/route.ts` | **Core** — calls `sdk.exchangeCognitoToken()` |
| `src/app/api/auth/session/route.ts` | Read / delete the HP session cookie |
| `src/app/api/presets/route.ts` | Verify HP presets using the server-stored access token |
| `src/app/api/dev/mock-cognito-token/route.ts` | Dev-only mock Cognito JWT generator |
| `src/lib/humanity-sdk.ts` | Singleton SDK factory |
| `src/lib/session.ts` | Server-only `httpOnly` cookie session (jose-signed) |
| `src/lib/cognito-mock.ts` | Mock token generator for UI development (not for production) |

---

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- A [Humanity Protocol developer account](https://developer.humanity.org)
- An AWS Cognito User Pool (for real end-to-end testing)

### 1. Install

```bash
cd cognito-auth
npm install
```

### 2. Configure

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Humanity Protocol (required)
HUMANITY_CLIENT_ID=hp_your_client_id
HUMANITY_CLIENT_SECRET=sk_your_client_secret
HUMANITY_ENVIRONMENT=sandbox

# AWS Cognito (required for end-to-end testing)
COGNITO_USER_POOL_ID=us-east-1_yourPoolId
COGNITO_REGION=us-east-1
COGNITO_CLIENT_ID=your_cognito_app_client_id

# Session signing secret
SESSION_SECRET=$(openssl rand -base64 32)
```

> **Note:** The HP API server also needs `COGNITO_ENABLED=true`, `COGNITO_REGION`,
> `COGNITO_USER_POOL_ID`, and optionally `COGNITO_CLIENT_ID` configured.

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3002](http://localhost:3002).

### 4. Test end-to-end

To run the full exchange against the HP API:

1. Make sure your Cognito User Pool is configured and `COGNITO_*` env vars are set.
2. Replace the `/api/dev/mock-cognito-token` call in `src/app/page.tsx` with real Cognito auth:

```tsx
// AWS Amplify v6
import { fetchAuthSession } from 'aws-amplify/auth';

const { tokens } = await fetchAuthSession();
const cognitoToken = tokens?.idToken?.toString();
```

3. Ensure the user has previously completed the HP consent flow for your `client_id`.
4. Send the real Cognito token — the exchange will succeed and return a live HP token.

---

## HP API Server Configuration

The HP API must have Cognito integration enabled:

| Variable | Required | Description |
|----------|----------|-------------|
| `COGNITO_ENABLED` | ✅ | Must be `"true"` to enable the JWT bearer grant. |
| `COGNITO_REGION` | ✅ | AWS region of the User Pool (e.g. `us-east-1`). |
| `COGNITO_USER_POOL_ID` | ✅ | User Pool ID (e.g. `us-east-1_xxxxxx`). |
| `COGNITO_CLIENT_ID` | ➖ | If set, the API validates the JWT's `aud` claim against this value. |
| `COGNITO_JWKS_CACHE_TTL_MS` | ➖ | How long to cache the JWKS keys (default: 3 600 000 = 1 hour). |

---

## Security Notes

- **Never send the HP access token to the browser.** This example stores it in an
  `httpOnly`, `secure`, `sameSite=lax` cookie signed with `jose`. The browser
  receives only session metadata.
- **In production**, store tokens server-side (Redis, DB) and keep only a session ID
  in the cookie. Encrypting the full token in a cookie is fine for demos.
- **The Cognito `sub` is the primary lookup key.** Email fallback is only used when
  `email_verified: true` — preventing account takeover via unverified email addresses.
- **Rate limits** apply to `POST /oauth/token` just like the standard token endpoint.

---

## How it differs from the standard OAuth flow

| | Standard OAuth (PKCE) | Cognito JWT Bearer |
|---|---|---|
| User sees HP consent screen | Every new session | First time only |
| Subsequent logins | Full redirect flow | Single backend call |
| Best for | Public-facing apps, first-time users | Apps already using Cognito |
| Frontend involvement | Redirect + callback | Send token to your backend |
| HP server requirement | None | `COGNITO_ENABLED=true` |

---

## Troubleshooting

### `unsupported_grant_type`
The HP API server does not have `COGNITO_ENABLED=true`. Contact your deployment team.

### `invalid_grant` — Cognito token validation failed
- The Cognito JWT is expired or from a different User Pool.
- Check `COGNITO_REGION` and `COGNITO_USER_POOL_ID` match the token's issuer.

### `invalid_grant` — No Humanity authorization found
- The user has not completed the HP consent flow for this `client_id` yet.
- Direct them through the standard HP OAuth flow first, then use the JWT bearer grant for all subsequent logins.

### Mock tokens don't work end-to-end
Expected — mock tokens are signed with an ephemeral key that the HP API cannot verify.
Use a real Cognito token from a configured User Pool for end-to-end testing.

---

## Related Examples

| Example | Description |
|---------|-------------|
| [next-oauth](../next-oauth) | Standard PKCE OAuth flow — start here for first-time consent |
| [next-backend-auth](../next-backend-auth) | Backend JWT issuance after HP OAuth |
| [newsletter-app](../newsletter-app) | Full app with presets + Query Engine |

---

## License

MIT
