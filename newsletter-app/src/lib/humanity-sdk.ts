/**
 * Humanity SDK singleton instance.
 */

import { HumanitySDK, type HumanitySdkConfig } from '@humanity-org/connect-sdk';
import { getConfig } from './config';

let sdkInstance: HumanitySDK | null = null;

export function getHumanitySdk(): HumanitySDK {
  if (sdkInstance) {
    return sdkInstance;
  }

  const config = getConfig();

  const sdkConfig: HumanitySdkConfig = {
    clientId: config.humanity.clientId,
    redirectUri: config.humanity.redirectUri,
    clientSecret: config.humanity.clientSecret,
    environment: config.humanity.environment,
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
  ClientUserTokenResult,
  ClientUserTokenOptions,
} from '@humanity-org/connect-sdk';

