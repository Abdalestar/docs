// Qtap Docs — screenshot capture (corrected, config-driven)
//
// Fixes vs the old version:
//   - No Vercel SSO "BYPASS_URL". dashboard.qtap.qa is a normal Supabase-auth
//     app; we log in through the real form.
//   - Writes BINARY PNGs via Playwright's `path:` option. It never serialises
//     base64 / data-URI text into a .png file (the bug that produced unviewable
//     "screenshots" across dozens of branches).
//
// Usage:
//   node .routine/screenshot.mjs .routine/pages.example.json
//
// Config JSON shape:
//   {
//     "deployUrl": "https://dashboard.qtap.qa",   // optional, this is the default
//     "loginPath": "/login",                       // optional
//     "defaultWaitMs": 2500,                        // settle time after navigation
//     "pages": [
//       { "path": "/", "name": "home", "section": "getting-started",
//         "fullPage": false, "waitMs": 3000, "waitFor": "text=Members" }
//     ]
//   }
//
// Output: images/<section>/<name>.png  (relative to repo root / cwd)
// Credentials: env QTAP_EMAIL / QTAP_PASSWORD override the first test account.

import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const cfgPath = process.argv[2];
if (!cfgPath) {
  console.error('Usage: node .routine/screenshot.mjs <config.json>');
  process.exit(64);
}
const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'));

const DEPLOY_URL = cfg.deployUrl || process.env.DEPLOY_URL || 'https://dashboard.qtap.qa';
const LOGIN_PATH = cfg.loginPath || '/login';
const DEFAULT_WAIT = cfg.defaultWaitMs ?? 2500;
const PAGES = cfg.pages || [];

// Credentials come from the environment ONLY. This repo is public — never hardcode
// or commit account emails/passwords. Set QTAP_EMAIL / QTAP_PASSWORD in the
// routine's environment configuration.
const TEST_ACCOUNTS = [
  { email: process.env.QTAP_EMAIL, password: process.env.QTAP_PASSWORD },
].filter((a) => a.email && a.password);
if (TEST_ACCOUNTS.length === 0) {
  console.log('FATAL: set QTAP_EMAIL and QTAP_PASSWORD in the environment');
  process.exit(64);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true });
const page = await context.newPage();

let loggedIn = false;
for (const acct of TEST_ACCOUNTS) {
  try {
    await page.goto(DEPLOY_URL + LOGIN_PATH, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', acct.email);
    await page.fill('input[type="password"]', acct.password);
    await page.click('button[type="submit"]');
    await page.waitForURL((u) => !u.toString().includes('/login'), { timeout: 20000 });
    console.log('Logged in as', acct.email);
    loggedIn = true;
    break;
  } catch (e) {
    console.log('Login failed for', acct.email, '-', e.message);
  }
}
if (!loggedIn) {
  console.log('ALL_CREDENTIALS_FAILED');
  await browser.close();
  process.exit(2);
}

let ok = 0, failed = 0;
for (const pg of PAGES) {
  const out = `images/${pg.section}/${pg.name}.png`;
  try {
    mkdirSync(dirname(out), { recursive: true });
    // NOTE: the dashboard polls continuously, so it never reaches 'networkidle'.
    // Use 'domcontentloaded' and rely on waitMs / waitFor to settle the UI.
    await page.goto(DEPLOY_URL + pg.path, { waitUntil: 'domcontentloaded', timeout: 30000 });
    if (pg.waitFor) {
      await page.waitForSelector(pg.waitFor, { timeout: 10000 }).catch(() => console.log('   (waitFor not found:', pg.waitFor + ')'));
    }
    await page.waitForTimeout(pg.waitMs ?? DEFAULT_WAIT);
    await page.screenshot({ path: out, fullPage: pg.fullPage ?? false });
    console.log('Saved', out);
    ok++;
  } catch (e) {
    console.log('FAILED', pg.name, '-', e.message);
    failed++;
  }
}

await browser.close();
console.log(`DONE (saved ${ok}, failed ${failed})`);
if (failed > 0) process.exit(3);
