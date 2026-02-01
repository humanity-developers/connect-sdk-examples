import { HumanitySDK, type HumanitySdkConfig } from '@humanity-org/connect-sdk';

export function createSdk(config: HumanitySdkConfig): HumanitySDK {
  return new HumanitySDK(config);
}

export { HumanitySDK };
