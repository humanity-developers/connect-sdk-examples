/**
 * Humanity SDK singleton.
 *
 * Note: the redirectUri is not used for the JWT bearer flow but is required
 * by the SDK constructor. Set it to your app origin or a dummy value.
 */

import { HumanitySDK, type HumanitySdkConfig } from '@humanity-org/connect-sdk';
import { getConfig } from './config';

let sdkInstance: HumanitySDK | null = null;

export function getHumanitySdk(): HumanitySDK {
  if (sdkInstance) return sdkInstance;

  const config = getConfig();

  const sdkConfig: HumanitySdkConfig = {
    clientId: config.humanity.clientId,
    // redirectUri is required by the SDK constructor but not used in the JWT bearer flow.
    // Set this to your real callback URI if you also support the standard OAuth flow.
    redirectUri: process.env.HUMANITY_REDIRECT_URI ?? 'http://localhost:3002/callback',
    clientSecret: config.humanity.clientSecret,
    environment: config.humanity.environment as 'production' | 'sandbox',
  };

  sdkInstance = new HumanitySDK(sdkConfig);
  return sdkInstance;
}

export function clearSdkCache(): void {
  sdkInstance = null;
}

export { HumanitySDK, HumanityError } from '@humanity-org/connect-sdk';
export type {
  TokenResult,
  JwtBearerGrantOptions,
} from '@humanity-org/connect-sdk';
