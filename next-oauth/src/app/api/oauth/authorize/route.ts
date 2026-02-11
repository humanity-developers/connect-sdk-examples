import { NextResponse } from 'next/server';
import { resolveDemoConfig, toSdkConfig } from '@/lib/demo-config';
import { saveOAuthSession } from '@/lib/session';
import { createSdk, HumanitySDK } from '@/lib/sdk';

export const runtime = 'nodejs';

type AuthorizeBody = {
  clientId?: string;
  redirectUri?: string;
  environment?: string;
  scopes?: string[];
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as AuthorizeBody;
  const config = resolveDemoConfig({
    clientId: body.clientId,
    redirectUri: body.redirectUri,
    environment: body.environment,
    scopes: body.scopes,
  });

  const sdk = createSdk(toSdkConfig(config));
  const state = HumanitySDK.generateState();
  const nonce = HumanitySDK.generateNonce();
  const { url, codeVerifier } = sdk.buildAuthUrl({
    scopes: config.scopes,
    state,
    nonce,
  });

  saveOAuthSession({
    clientId: config.clientId,
    redirectUri: config.redirectUri,
    environment: config.environment,
    scopes: config.scopes,
    codeVerifier,
    state,
    nonce,
    createdAt: Date.now(),
  });

  return NextResponse.json({ url });
}

