# cognito-auth — Humanity Protocol × AWS Cognito

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../LICENSE)
[![SDK Version](https://img.shields.io/badge/Connect_SDK-v0.1.0-green.svg)](https://www.npmjs.com/package/@humanity-org/connect-sdk)
[![Node](https://img.shields.io/badge/Node-18+-purple.svg)](https://nodejs.org)

Reference implementation for integrating AWS Cognito with Humanity Protocol.
Users who authenticate via Cognito can access Humanity verification data through the
**JWT Bearer token exchange** — with no second consent screen after the first login.

---

## Architecture Overview

```
┌──────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│  Your App    │    │   AWS Cognito    │    │  Humanity Protocol  │
│  (Frontend)  │    │   User Pool      │    │  Connect API        │
└──────┬───────┘    └────────┬─────────┘    └──────────┬──────────┘
       │                     │                          │
       │  1. Login via       │                          │
       │  Cognito UI         │                          │
       │────────────────────>│                          │
       │                     │                          │
       │  2. Cognito JWT     │                          │
       │  (id_token)         │                          │
       │<────────────────────│                          │
       │                                                │
       │  3. Exchange Cognito JWT for Humanity token    │
       │  POST /oauth/token (grant_type=jwt-bearer)     │
       │───────────────────────────────────────────────>│
       │                                                │
       │  4. Humanity access_token + refresh_token      │
       │<───────────────────────────────────────────────│
       │                                                │
       │  5. Fetch verified data                        │
       │  GET /userinfo or /v2/presets/...              │
       │───────────────────────────────────────────────>│
```

### Two integration paths

| Path | When to use | How it works |
|------|-------------|--------------|
| **JWT Bearer Grant** ⭐ | Your app handles Cognito login | Backend exchanges Cognito JWT for HP token server-to-server |
| OIDC Federation | "Login with Humanity" button in Cognito hosted UI | Cognito redirects to HP consent flow, exchanges code for tokens |

The **JWT Bearer Grant is the primary pattern** in this example.
OIDC federation (Step 4) is optional and requires the user to complete the HP consent flow first.

---

## Prerequisites

- AWS account with a Cognito User Pool
- A [Humanity Developer Account](https://developers.humanity.org)
- Node.js 18+ or Bun

```bash
npm install @humanity-org/connect-sdk
```

---

## Step 1 — Create a Humanity Application

Create an application in the [Developer Dashboard](https://developers.humanity.org) or via API:

```bash
curl -X POST https://api.humanity.org/v2/developer/applications \
  -H "Authorization: Bearer <your_shared_jwt>" \
  -H "Content-Type: application/json" \
  -d '{ "name": "My Cognito App" }'
```

Response:
```json
{
  "clientId": "app_9cdb0787fad6118dc18a49fc84389a46",
  "publicKey": "pk_...",
  "clientSecret": "sk_6497734a8d163bb750110473854f4b7b...",
  "internalId": "MyCognitoApp_a9a810a1-...",
  "appType": "production"
}
```

> ⚠️ Save the `clientSecret` — it's shown only once.

---

## Step 2 — Configure Cognito on the Application

Bind your Cognito User Pool to the HP application.
This can be done via the Developer Dashboard → Settings → **AWS Cognito Integration** card, or via API:

```bash
curl -X PUT https://api.humanity.org/v2/developer/applications/<clientId> \
  -H "Authorization: Bearer <your_shared_jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "cognitoRegion": "us-east-1",
    "cognitoUserPoolId": "us-east-1_AbCdEf123",
    "cognitoClientId": "1a2b3c4d5e6f7g8h9i0j"
  }'
```

| Field | Required | Description |
|-------|----------|-------------|
| `cognitoRegion` | ✅ | AWS region (e.g. `us-east-1`) |
| `cognitoUserPoolId` | ✅ | User Pool ID from the Cognito console |
| `cognitoClientId` | ✅ | App Client ID — enforces JWT audience validation |

> The configuration is stored **per application** in the database.
> No server-level environment variables are needed on the HP API side.
> Each HP application can bind to a different Cognito User Pool.

---

## Step 3 — Set Up AWS Cognito User Pool

If you don't already have a Cognito User Pool:

1. AWS Console → Cognito → **Create user pool**
2. Configure sign-in options (email, phone, username)
3. Configure security (password policy, MFA)
4. Create an **App Client**:
   - Note the **App Client ID** — this is your `cognitoClientId`
   - Enable the **Hosted UI** if you want Cognito's built-in login page
   - Set your **Callback URL**: `http://localhost:3000/auth/callback`

---

## Step 4 — Add Humanity as an OIDC Identity Provider *(Optional)*

> Skip this if you're only using the JWT Bearer Grant (the primary pattern).
> Only needed if you want a "Login with Humanity" button on the Cognito hosted UI.

### 4a. Register the Cognito callback on your HP app

```bash
curl -X PUT https://api.humanity.org/v2/developer/applications/<clientId>/redirect-uris \
  -H "Authorization: Bearer <your_shared_jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "redirectUris": [
      "https://<your-cognito-domain>.auth.<region>.amazoncognito.com/oauth2/idpresponse"
    ]
  }'
```

### 4b. Add the identity provider in Cognito

Cognito → Sign-in experience → **Add identity provider** → OpenID Connect (OIDC).

Use **Manual input** for endpoints (not "Auto fill through issuer URL"):

| Field | Value |
|-------|-------|
| Provider name | `humanity` |
| Client ID | Your HP `clientId` |
| Client secret | Your HP `clientSecret` |
| Authorized scopes | `openid profile.full identity:read` |
| Attribute request method | `GET` |
| Authorization endpoint | `https://api.humanity.org/oauth/authorize` |
| Token endpoint | `https://api.humanity.org/oauth/token` |
| UserInfo endpoint | `https://api.humanity.org/userinfo` |
| JWKS URI | `https://api.humanity.org/.well-known/jwks.json` |

### 4c–4d. Enable and map attributes

Enable the `humanity` provider on your App Client (App integration → App client → Hosted UI).

Attribute mappings:

| Cognito attribute | OIDC claim |
|---|---|
| `sub` | `sub` |
| `email` | `email` |
| `email_verified` | `email_verified` |

---

## Step 5 — Initial Consent Flow

Before the JWT Bearer Grant works, the user must complete the HP consent flow at least once.
This creates an active authorization linking the user to your application.

### Option A: Standard OAuth flow from your app

```typescript
import { HumanitySDK } from '@humanity-org/connect-sdk';

const sdk = new HumanitySDK({
  clientId: 'app_9cdb0787fad6118dc18a49fc84389a46',
  redirectUri: 'http://localhost:3000/consent/callback',
});

// Build the HP authorization URL (PKCE is built-in)
const { url, codeVerifier } = sdk.buildAuthUrl({
  scopes: ['openid', 'identity:read', 'profile.full'],
});

// Redirect user to `url`, store codeVerifier in session
// After approval, exchange the code:
const tokens = await sdk.exchangeCodeForToken({ code, codeVerifier });
```

In this example, the consent flow lives in [`src/routes/consent.ts`](src/routes/consent.ts).

### Option B: "Login with Humanity" via Cognito (Step 4)

If you set up the OIDC federation in Step 4, the consent flow happens automatically
when the user clicks the "humanity" button on the Cognito login page.

---

## Step 6 — JWT Bearer Token Exchange

Once the user has an active authorization, exchange their Cognito JWT for a HP token:

```typescript
import { HumanitySDK } from '@humanity-org/connect-sdk';

const sdk = new HumanitySDK({ clientId, redirectUri });

// After Cognito login, get the id_token:
// AWS Amplify v6: const { tokens } = await fetchAuthSession();
//                 const cognitoIdToken = tokens?.idToken?.toString();
// Cognito JS SDK v1: session.getIdToken().getJwtToken()

const result = await sdk.exchangeCognitoToken({ cognitoToken: cognitoIdToken });
// result.accessToken, result.grantedScopes, result.appScopedUserId, ...
```

Or with a raw `fetch`:

```typescript
const response = await fetch('https://api.humanity.org/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: cognitoIdToken,
    client_id: 'app_9cdb0787fad6118dc18a49fc84389a46',
  }),
});
const tokens = await response.json();
```

### How the exchange works internally

1. Look up the HP application by `client_id`
2. Validate the Cognito JWT against the app's bound `cognitoRegion` / `cognitoUserPoolId` / `cognitoClientId`:
   - Signature verified via Cognito's JWKS (cached per user pool)
   - Issuer must match `https://cognito-idp.<region>.amazonaws.com/<userPoolId>`
   - Audience must match the configured `cognitoClientId`
3. Resolve the HP user from the Cognito `sub` claim (falls back to verified email)
4. Check for an active authorization between the user and client
5. Issue HP OAuth tokens (access + refresh)

### Error responses

| Error | Description |
|-------|-------------|
| `invalid_client` | Unknown or inactive `client_id` |
| `unsupported_grant_type` | `cognitoRegion`, `cognitoUserPoolId`, or `cognitoClientId` not configured (see Step 2) |
| `invalid_grant` — token validation | JWT signature invalid, expired, wrong audience, or wrong issuer |
| `invalid_grant` — user not found | No HP user linked to this Cognito identity |
| `invalid_grant` — consent required | User hasn't completed the consent flow yet (see Step 5) |

---

## Step 7 — Use the Humanity Access Token

```typescript
// Fetch user info
const userInfo = await fetch('https://api.humanity.org/userinfo', {
  headers: { Authorization: `Bearer ${tokens.access_token}` },
});

// Verify specific presets
const isHuman = await fetch('https://api.humanity.org/v2/presets/humanity_user', {
  headers: { Authorization: `Bearer ${tokens.access_token}` },
});
```

---

## Example App Structure

```
cognito-auth/
├── README.md                       # This guide
├── package.json
├── .env.example                    # Template for required env vars
├── src/
│   ├── index.ts                    # Express server entry point
│   ├── config.ts                   # Load and validate env vars
│   ├── types.ts                    # Shared TypeScript types
│   ├── routes/
│   │   ├── auth.ts                 # Cognito login/callback routes
│   │   ├── consent.ts              # Humanity consent flow routes
│   │   └── api.ts                  # Protected routes using HP tokens
│   ├── services/
│   │   ├── cognito.ts              # Cognito Hosted UI token operations
│   │   ├── humanity.ts             # JWT bearer exchange + ConsentRequiredError
│   │   └── session.ts              # Session helpers
│   └── middleware/
│       └── requireAuth.ts          # Ensure user has valid tokens
└── views/
    ├── login.html                  # Landing page with Cognito login button
    ├── consent.html                # Prompt for HP consent (first-time only)
    └── dashboard.html              # Show HP verification data
```

---

## Getting Started

### 1. Install

```bash
cd cognito-auth
npm install
# or: bun install
```

### 2. Configure

```bash
cp .env.example .env.local
```

Fill in `.env.example`:

```env
# AWS Cognito
COGNITO_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_AbCdEf123
COGNITO_CLIENT_ID=1a2b3c4d5e6f7g8h9i0j
COGNITO_DOMAIN=myapp.auth.us-east-1.amazoncognito.com
COGNITO_CALLBACK_URL=http://localhost:3000/auth/callback

# Humanity Protocol
HUMANITY_CLIENT_ID=app_9cdb0787fad6118dc18a49fc84389a46
HUMANITY_CLIENT_SECRET=sk_6497...
HUMANITY_REDIRECT_URI=http://localhost:3000/consent/callback

# Session
SESSION_SECRET=$(openssl rand -hex 32)
```

### 3. Register Redirect URIs

Before running, make sure these are registered on your HP application:
- `http://localhost:3000/auth/callback` ← Cognito callback
- `http://localhost:3000/consent/callback` ← HP consent callback

### 4. Configure Cognito on your HP App (Step 2)

```bash
curl -X PUT https://api.humanity.org/v2/developer/applications/$HUMANITY_CLIENT_ID \
  -H "Authorization: Bearer <shared_jwt>" \
  -H "Content-Type: application/json" \
  -d "{
    \"cognitoRegion\": \"$COGNITO_REGION\",
    \"cognitoUserPoolId\": \"$COGNITO_USER_POOL_ID\",
    \"cognitoClientId\": \"$COGNITO_CLIENT_ID\"
  }"
```

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Security Considerations

### Audience validation is mandatory
`cognitoClientId` is required on the HP application. This ensures:
- Only tokens issued for your specific Cognito App Client are accepted
- Tokens from other App Clients in the same pool are rejected
- Cross-application token replay attacks are prevented

### Client authentication on token exchange
The authorization code exchange enforces one of two authentication methods:

| Client type | Authentication |
|---|---|
| Public (SPA, mobile) | PKCE required (`code_challenge` → `code_verifier`) |
| Confidential (Cognito, server) | `client_secret` required when no PKCE |

### User resolution safety
1. Cognito `sub` is checked first (immutable, unforgeable)
2. Email fallback only when `email_verified === true`
3. Unverified emails are never used — prevents account takeover via forged email claims

### PKCE is optional but enforced when used
PKCE was made optional to support Cognito's OIDC federation (which doesn't send PKCE params).
However: when `code_challenge` is sent during authorization, `code_verifier` is required at exchange.

### Per-application Cognito configuration
Each HP application stores its own Cognito config independently. Different apps can connect to
different Cognito pools. Rotating one app's Cognito config doesn't affect others.

---

## Troubleshooting

### `unsupported_grant_type`
The HP application is missing Cognito config. Run the `PUT /v2/developer/applications/:id` call from Step 2.

### `invalid_grant` — Cognito token validation failed
- JWT expired (Cognito id_tokens typically live 1 hour)
- Wrong `cognitoClientId` → audience mismatch
- Wrong `cognitoRegion` or `cognitoUserPoolId` → issuer mismatch
- Clock skew between your server and Cognito

### `invalid_grant` — No Humanity user found
The Cognito `sub` doesn't match any HP user, and the email is missing or unverified.
Ensure the user has a Humanity account with the same email used in Cognito.

### `invalid_grant` — No active Humanity authorization found
The user hasn't completed the HP consent flow yet.
The `/auth/callback` route catches `ConsentRequiredError` and redirects to `/consent` automatically.

### OIDC federation returns `invalid_request`
If using ngrok (free tier), the interstitial page breaks server-to-server token exchange.
Use Cloudflare Tunnel or test against the deployed API at `https://api.humanity.org`.

---

## Related Examples

| Example | Description |
|---------|-------------|
| [next-oauth](../next-oauth) | Standard PKCE OAuth flow — good starting point for the HP consent flow |
| [next-backend-auth](../next-backend-auth) | Backend JWT issuance after HP OAuth |
| [newsletter-app](../newsletter-app) | Full app with presets + Query Engine |

---

## License

MIT
