# QuickLoan - Humanity SDK Example

A loan platform demo that shows instant eligibility based on verified financial data using the Humanity SDK query engine.

## Overview

QuickLoan demonstrates how to use the Humanity SDK to:

- **Query verified credentials** - Access user's financial data through the query engine
- **Instant eligibility checks** - Determine loan eligibility based on verified net worth
- **Privacy-preserving verification** - Users control what data they share
- **Real-time decisions** - No manual document review required

## Features

- User authentication via Humanity Protocol
- Financial credential verification
- Net worth threshold checking for loan eligibility
- Configurable minimum net worth requirements
- Clean, responsive UI built with Next.js and Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Humanity SDK credentials (get them at https://developer.humanity.org)

### Installation

1. Install dependencies:

```bash
bun install
# or
npm install
```

2. Copy the environment example and configure:

```bash
cp .env.example .env.local
```

3. Update `.env.local` with your credentials:

```env
HUMANITY_CLIENT_ID=your_client_id_here
HUMANITY_REDIRECT_URI=http://localhost:3200/api/auth/callback
HUMANITY_ENVIRONMENT=sandbox
MIN_NET_WORTH_FOR_LOAN=50000
```

4. Start the development server:

```bash
bun dev
# or
npm run dev
```

5. Open [http://localhost:3200](http://localhost:3200) in your browser.

## How It Works

1. **User connects** - User authenticates through Humanity Protocol
2. **Credential query** - App queries for verified financial credentials
3. **Eligibility check** - Net worth is compared against `MIN_NET_WORTH_FOR_LOAN`
4. **Instant decision** - User sees their loan eligibility status immediately

## Query Engine Usage

This example showcases the Humanity SDK query engine for privacy-preserving eligibility checks:

```typescript
import { HumanitySDK } from '@humanity-org/connect-sdk';

const sdk = new HumanitySDK({
  clientId: process.env.HUMANITY_CLIENT_ID,
  redirectUri: process.env.HUMANITY_REDIRECT_URI,
  environment: process.env.HUMANITY_ENVIRONMENT, // "sandbox" or "production"
});

// Use predicate query to check eligibility without revealing actual values
const eligibilityResult = await sdk.evaluatePredicateQuery({
  accessToken: tokenResult.accessToken,
  query: {
    check: {
      claim: 'financial.net_worth',
      operator: '>=',
      value: 50000, // MIN_NET_WORTH_FOR_LOAN
    },
  },
});

// eligibilityResult.passed is true if user meets the threshold
```

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `HUMANITY_CLIENT_ID` | Your Humanity app client ID | Required |
| `HUMANITY_REDIRECT_URI` | OAuth callback URL | `http://localhost:3200/api/auth/callback` |
| `HUMANITY_ENVIRONMENT` | `sandbox` or `production` | `sandbox` |
| `MIN_NET_WORTH_FOR_LOAN` | Minimum net worth for loan eligibility | `50000` |

## Project Structure

```
quickloan/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Landing page with loan amount input
│   │   ├── layout.tsx                # Root layout
│   │   ├── globals.css               # Tailwind CSS imports
│   │   ├── check/
│   │   │   └── page.tsx              # Initiates OAuth flow with amount
│   │   ├── result/
│   │   │   └── page.tsx              # Displays eligibility results
│   │   └── api/
│   │       └── auth/
│   │           └── callback/route.ts # OAuth callback with query engine
│   └── lib/
│       └── humanity.ts               # SDK initialization and helpers
├── .env.example                      # Environment template
└── package.json                      # Dependencies and scripts
```

## Learn More

- [Humanity SDK Documentation](https://docs.humanity.org)
- [Query Engine Guide](https://docs.humanity.org/query-engine)
- [Next.js Documentation](https://nextjs.org/docs)

## License

MIT
