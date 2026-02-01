# Humanity Protocol React + Vite OAuth Example

A complete example demonstrating OAuth 2.0 authentication with Humanity Protocol in a React application using Vite and TypeScript.

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Features

- 🔐 OAuth 2.0 with PKCE (Proof Key for Code Exchange)
- ✅ Preset verification (`is_human`, `email`)
- 📱 Client-side routing with React Router
- 🔒 Secure session management with React Context
- 🌐 Browser-compatible polyfills for Node.js modules

## Demo

This example includes three main pages:

1. **Home** - Landing page with sign-in button
2. **OAuth Callback** - Handles the OAuth redirect and token exchange
3. **Dashboard** - Protected page showing session info and preset verification results

## How It Works

This example uses the **Authorization Code flow with PKCE**, the recommended OAuth flow for browser-based Single Page Applications (SPAs).

### OAuth Flow

```
┌─────────┐                                       ┌──────────────┐
│ Browser │                                       │   Humanity   │
│   App   │                                       │   Protocol   │
└────┬────┘                                       └──────┬───────┘
     │                                                   │
     │  1. Initiate OAuth (buildAuthUrl)                │
     │   - Generate code_verifier                       │
     │   - Create code_challenge (SHA256)               │
     │   - Store code_verifier in sessionStorage        │
     │────────────────────────────────────────────────► │
     │                                                   │
     │  2. Redirect to Humanity (user authenticates)    │
     │ ◄────────────────────────────────────────────────│
     │                                                   │
     │  3. Redirect back with authorization code        │
     │ ◄────────────────────────────────────────────────│
     │                                                   │
     │  4. Exchange code for tokens                     │
     │   - Retrieve code_verifier from sessionStorage   │
     │   - Send code + code_verifier                    │
     │────────────────────────────────────────────────► │
     │                                                   │
     │  5. Receive access token                         │
     │ ◄────────────────────────────────────────────────│
     │                                                   │
     │  6. Verify presets                               │
     │────────────────────────────────────────────────► │
     │                                                   │
     │  7. Receive verification results                 │
     │ ◄────────────────────────────────────────────────│
     │                                                   │
```

### Key Concepts

**PKCE (Proof Key for Code Exchange)**

- Prevents authorization code interception attacks
- `code_verifier`: Cryptographically random string generated client-side
- `code_challenge`: SHA256 hash of the code_verifier
- Server verifies code_verifier matches code_challenge during token exchange

**OAuth Scopes vs Presets**

- **OAuth Scopes**: Permission requests in `buildAuthUrl()` (e.g., `openid`, `identity:read`)
- **Presets**: Specific claims to verify in `verifyPresets()` (e.g., `is_human`, `email`)

## Prerequisites

- Node.js 18 or later
- A Humanity Protocol account
- OAuth application credentials (client ID and redirect URI)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/humanity-developers/connect-sdk-examples.git
cd connect-sdk-examples/react-vite-oauth
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file:

```bash
cp .env.example .env
```

4. Configure your environment variables:

```env
VITE_HUMANITY_CLIENT_ID=your_client_id_here
VITE_HUMANITY_REDIRECT_URI=http://localhost:5173/oauth/callback
VITE_HUMANITY_BASE_URL=https://api.sandbox.humanity.org/
```

## Usage

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── Button.tsx              # Reusable button component
│   ├── LoginButton.tsx         # Initiates OAuth flow
│   └── VerificationStatus.tsx  # Displays preset verification results
├── pages/
│   ├── Home.tsx                # Landing page
│   ├── Dashboard.tsx           # Protected page with session info
│   └── OAuthCallback.tsx       # OAuth callback handler
├── lib/
│   └── humanity.ts             # SDK initialization and helpers
├── hooks/
│   └── useAuth.tsx             # Auth context and state management
├── App.tsx                     # Router configuration
├── main.tsx                    # Application entry point
└── index.css                   # Global styles
```

## Key Implementation Details

### SDK Initialization

```typescript
// src/lib/humanity.ts
import { HumanitySDK } from '@humanity-org/connect-sdk'

export const sdk = new HumanitySDK({
  clientId: import.meta.env.VITE_HUMANITY_CLIENT_ID,
  redirectUri: import.meta.env.VITE_HUMANITY_REDIRECT_URI,
  baseUrl: 'https://api.sandbox.humanity.org/',
})
```

### Initiating OAuth Flow

```typescript
// src/components/LoginButton.tsx
const { url, codeVerifier } = sdk.buildAuthUrl({
  scopes: ['openid', 'identity:read'],
  prompt: 'consent',
})

storeCodeVerifier(codeVerifier)
window.location.href = url
```

### Handling OAuth Callback

```typescript
// src/pages/OAuthCallback.tsx
const code = searchParams.get('code')
const codeVerifier = getCodeVerifier()

const token = await sdk.exchangeCodeForToken({
  code,
  codeVerifier,
})

const verification = await sdk.verifyPresets({
  accessToken: token.accessToken,
  presets: ['is_human', 'email'],
})

setAuth(token.accessToken, verification.results, token)
```

### Browser Polyfills Configuration

The Humanity SDK uses Node.js modules that aren't available in browsers. Configure polyfills in `vite.config.ts`:

```typescript
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['crypto', 'buffer', 'stream', 'util'],
      globals: { Buffer: true, process: true },
    }),
  ],
})
```

## Learn More

- [Humanity Protocol Documentation](https://docs.humanity.org)
- [OAuth 2.0 PKCE Specification](https://oauth.net/2/pkce/)

## License

MIT
