import { HumanitySDK } from '@humanity-org/connect-sdk';

// Singleton SDK instance
let sdkInstance: HumanitySDK | null = null;

export function getHumanitySDK(): HumanitySDK {
  if (!sdkInstance) {
    const clientId = process.env.HUMANITY_CLIENT_ID;
    const redirectUri = process.env.HUMANITY_REDIRECT_URI;
    const environment = process.env.HUMANITY_ENVIRONMENT || 'sandbox';

    if (!clientId) {
      throw new Error('HUMANITY_CLIENT_ID environment variable is required');
    }
    if (!redirectUri) {
      throw new Error('HUMANITY_REDIRECT_URI environment variable is required');
    }

    sdkInstance = new HumanitySDK({
      clientId,
      redirectUri,
      baseUrl: environment,
    });
  }

  return sdkInstance;
}

// Helper to generate secure state for OAuth
export function generateAuthState(): string {
  return HumanitySDK.generateState();
}

// Helper to generate nonce for OAuth
export function generateAuthNonce(): string {
  return HumanitySDK.generateNonce();
}

// Helper to verify state matches
export function verifyAuthState(expected: string, received: string | null): boolean {
  return HumanitySDK.verifyState(expected, received);
}
