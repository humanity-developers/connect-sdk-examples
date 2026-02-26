/**
 * Express server entry point — Cognito × Humanity Protocol integration example
 *
 * Start with:
 *   cp .env.example .env.local
 *   # fill in credentials
 *   bun run dev        # or: npm run dev
 *
 * Then open http://localhost:3000
 */

import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import path from 'path';

import { getConfig } from './config';
import { CognitoService } from './services/cognito';
import { HumanityService } from './services/humanity';
import { createAuthRouter } from './routes/auth';
import { createConsentRouter } from './routes/consent';
import { createApiRouter } from './routes/api';
import { requireCognito, requireHumanity } from './middleware/requireAuth';
import { getCognitoTokens, getHumanityTokens } from './services/session';

// Load and validate config — throws if any required env var is missing
const config = getConfig();

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000, // 1 hour
    },
  }),
);

// ── Services ──────────────────────────────────────────────────────────────────
const cognito = new CognitoService(
  config.cognito.region,
  config.cognito.userPoolId,
  config.cognito.clientId,
  config.cognito.clientSecret,
  config.cognito.domain,
  config.cognito.callbackUrl,
);

const humanity = new HumanityService(
  config.humanity.apiUrl,
  config.humanity.clientId,
  config.humanity.clientSecret,
  config.humanity.redirectUri,
);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/auth', createAuthRouter(cognito, humanity));
app.use('/consent', createConsentRouter(humanity, config.humanity.scopes));
app.use('/api', createApiRouter(humanity));

// ── Views ─────────────────────────────────────────────────────────────────────
const VIEWS = path.join(process.cwd(), 'views');

// Landing / login page
app.get('/', (_req, res) => {
  res.sendFile(path.join(VIEWS, 'login.html'));
});

// Dashboard — requires both Cognito and HP tokens
app.get('/dashboard', requireHumanity, (req, res) => {
  // Inject session data so the dashboard HTML can display it.
  // In a real app, use a templating engine (Handlebars, EJS, etc.).
  const hp = getHumanityTokens(req)!;
  const cog = getCognitoTokens(req)!;

  // Read the dashboard template and inject a JSON script block
  const fs = require('fs') as typeof import('fs');
  let html = fs.readFileSync(path.join(VIEWS, 'dashboard.html'), 'utf-8');
  const data = JSON.stringify({
    appScopedUserId: hp.app_scoped_user_id,
    authorizationId: hp.authorization_id,
    grantedScopes: hp.granted_scopes,
    expiresIn: hp.expires_in,
    issuedAt: hp.issued_at,
    cognitoExpiresIn: cog.expires_in,
  });
  html = html.replace('__SESSION_DATA__', data);
  res.send(html);
});

// ── Start ──────────────────────────────────────────────────────────────────────
app.listen(config.port, () => {
  console.log(`\n🚀  Cognito × Humanity example running at http://localhost:${config.port}`);
  console.log(`\n   HP application : ${config.humanity.clientId}`);
  console.log(`   Cognito pool   : ${config.cognito.userPoolId}`);
  console.log(`   HP API         : ${config.humanity.apiUrl}`);
  console.log(`\n   Flow:`);
  console.log(`     1. Login with Cognito → http://localhost:${config.port}/auth/login`);
  console.log(`     2. First-time: grant HP consent → /consent`);
  console.log(`     3. Dashboard → /dashboard\n`);
});
