/**
 * GET /api/auth/login
 * Redirect the browser to the Cognito Hosted UI login page.
 */

import { NextResponse } from 'next/server';
import { createCognitoService } from '@/services/cognito';

export const runtime = 'nodejs';

export async function GET() {
  const cognito = createCognitoService();
  const loginUrl = cognito.buildLoginUrl();
  return NextResponse.redirect(loginUrl);
}
