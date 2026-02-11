/**
 * Humanity SDK singleton instance.
 * 
 * This module provides a configured instance of the HumanitySDK
 * that can be used throughout the application.
 */

import { HumanitySDK, type HumanitySdkConfig } from '@humanity-org/connect-sdk';
import { getConfig } from './config';

let sdkInstance: HumanitySDK | null = null;

/**
 * Get the configured HumanitySDK instance.
 * The SDK is lazily initialized on first access.
 */
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

/**
 * Clear the SDK instance cache.
 * Useful for testing or when configuration changes.
 */
export function clearSdkCache(): void {
  sdkInstance = null;
}

// Re-export useful types and utilities from the SDK
export { HumanitySDK, HumanityError } from '@humanity-org/connect-sdk';
export type {
  TokenResult,
  ClientUserTokenResult,
  ClientUserTokenOptions,
} from '@humanity-org/connect-sdk';

