# Humanity Protocol Connect SDK Examples

Official examples for integrating Humanity Protocol's identity verification into web applications.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![SDK Version](https://img.shields.io/badge/Connect_SDK-v0.0.3-green.svg)](https://www.npmjs.com/package/@humanity-org/connect-sdk)
[![Node](https://img.shields.io/badge/Node-18+-purple.svg)](https://nodejs.org)

## Choose Your Example

| I want to... | Example | Complexity |
|--------------|---------|------------|
| Learn basic OAuth 2.0 + PKCE flow | [next-oauth](./next-oauth) | ⭐ |
| Issue my own JWTs from verified identity | [next-backend-auth](./next-backend-auth) | ⭐⭐ |
| Build personalized experiences from presets | [newsletter-app](./newsletter-app) | ⭐⭐⭐ |
| Already using AWS Cognito — skip the consent screen | [cognito-auth](./cognito-auth) | ⭐⭐ |
| Already using AWS Cognito — skip the HP consent flow | [cognito-auth](./cognito-auth) | ⭐⭐ |

## Quick Comparison

| Feature | next-oauth | next-backend-auth | newsletter-app | cognito-auth |
|---------|:----------:|:-----------------:|:--------------:|:------------:|
| OAuth 2.0 + PKCE | ✓ | ✓ | ✓ | |
| Token exchange & refresh | ✓ | ✓ | ✓ | ✓ |
| ID token verification | ✓ | ✓ | ✓ | |
| Backend JWT issuance | | ✓ | ✓ | |
| Preset verification (isHuman) | | ✓ | ✓ | ✓ |
| Social account detection | | | ✓ | |
| Query Engine integration | | | ✓ | |
| Database (MongoDB) | | | ✓ | |
| Debug tools | ✓ | ✓ | ✓ | ✓ |
| **AWS Cognito JWT bearer grant** | | | | **✓** |

## Prerequisites

- [Node.js 18+](https://nodejs.org) or [Bun](https://bun.sh)
- A Humanity Protocol developer account
- OAuth credentials (Client ID and Secret)

## Getting Your API Keys

### 1. Create a Developer Account

1. Go to the [Humanity Protocol Developer Portal](https://developer.humanity.org)
2. Sign up or log in
3. Navigate to **Applications** in the sidebar

### 2. Create an Application

1. Click **Create Application**
2. Fill in:
   - **Name**: Your app name (e.g., "My OAuth Test")
   - **Redirect URIs**: Add all environments you'll use:
     - `http://localhost:5173/oauth/callback` (next-oauth)
     - `http://localhost:3001/callback` (next-backend-auth)
     - `http://localhost:3100/callback` (newsletter-app)
3. Click **Create**

### 3. Copy Your Credentials

After creation, you'll see:

| Field | Where to use | Example |
|-------|--------------|---------|
| Client ID | `HUMANITY_CLIENT_ID` in `.env` | `hp_abc123...` |
| Client Secret | `HUMANITY_CLIENT_SECRET` in `.env` | `sk_xyz789...` |

> ⚠️ **Keep your Client Secret safe** — never commit it to git or expose it in client-side code.

### 4. Configure Presets (Optional)

For examples using preset verification (`next-backend-auth`, `newsletter-app`):

1. Go to the **Presets** tab in your application
2. Enable the presets you need:
   - `isHuman` — Basic humanity verification
   - `ageOver18` — Age verification
   - Social account links (Google, LinkedIn, etc.)

## Support & Resources

### Documentation

- [Humanity Protocol Docs](https://docs.humanity.org) — Official SDK documentation
- [Connect SDK Reference](https://docs.humanity.org/connect-sdk) — API reference

### Getting Help

**For issues with these examples** (bugs, unclear instructions, setup problems):
- [Open a GitHub Issue](https://github.com/humanity-org/connect-sdk-examples/issues)

**For SDK or API questions** (integration help, feature requests):
- [Humanity Protocol Discord](https://discord.gg/humanity)
- [Developer Support](mailto:developers@humanity.org)

### Stay Updated

- [Twitter @HumanityDev](https://twitter.com/humanitydev)
- [Developer Newsletter](https://humanity.org/newsletter)

## Contributing

Found an improvement? PRs welcome!

1. Fork the repo
2. Create a feature branch
3. Submit a PR with a clear description

## License

MIT — See [LICENSE](LICENSE) for details.
