import { HumanitySDK } from '@humanity-org/connect-sdk';

export const sdk = new HumanitySDK({
  clientId: import.meta.env.VITE_HUMANITY_CLIENT_ID,
  redirectUri: import.meta.env.VITE_HUMANITY_REDIRECT_URI,
  baseUrl: 'https://api.sandbox.humanity.org/',
});

const CODE_VERIFIER_KEY = 'humanity_code_verifier';

export function storeCodeVerifier(codeVerifier: string) {
  sessionStorage.setItem(CODE_VERIFIER_KEY, codeVerifier);
}

export function getCodeVerifier() {
  return sessionStorage.getItem(CODE_VERIFIER_KEY);
}

export function clearCodeVerifier() {
  sessionStorage.removeItem(CODE_VERIFIER_KEY);
}
