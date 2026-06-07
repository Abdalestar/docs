// Qtap Docs — screenshot smoke test (corrected)
//
// Fails fast if the sandbox cannot capture a real, logged-in screenshot of the
// dashboard. Run BEFORE researching/writing so the run can adapt.
//
// What changed vs the old version (the two bugs that disabled screenshots on
// every run):
//   1. Supabase reachability no longer gates on response.ok(). The health
//      endpoint returns HTTP 401 without an apikey, which is a perfectly normal
//      "the host is up" answer. We only fail if the request throws / returns
//      nothing (DNS, TLS, network-policy block).
//   2. The Vercel SSO "BYPASS_URL" step is gone. dashboard.qtap.qa is a normal
//      Supabase-auth app served at HTTP 200 — there is no Vercel Auth gate to
//      bypass. We go straight to the login form.
//
// Usage:  node .routine/smoke-test.mjs
// Env overrides: DEPLOY_URL, SUPABASE_URL, QTAP_EMAIL, QTAP_PASSWORD

import { chromium } from 'playwright';

const DEPLOY_URL   = process.env.DEPLOY_URL   || 'https://dashboard.qtap.qa';
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qeriqybbomqqkdqaylhl.supabase.co';

// Credentials come from the environment ONLY. This repo is public — never hardcode
// or commit account emails/passwords. Set QTAP_EMAIL / QTAP_PASSWORD in the
// routine's environment configuration.
const TEST_ACCOUNTS = [
  { email: process.env.QTAP_EMAIL, password: process.env.QTAP_PASSWORD },
].filter((a) => a.email && a.password);
if (TEST_ACCOUNTS.length === 0) {
  console.log('SMOKE_FAIL: missing_credentials - set QTAP_EMAIL and QTAP_PASSWORD');
  process.exit(1);
}

const OUT = new URL('./smoke-test.png', import.meta.url).pathname;

console.log('=== SMOKE TEST START ===');

let browser;
try {
  browser = await chromium.launch({ headless: true });
  console.log('[1/5] Playwright launched');
} catch (e) {
  console.log('SMOKE_FAIL: playwright_launch -', e.message);
  process.exit(1);
}

const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  ignoreHTTPSErrors: true,
});
const page = await context.newPage();

// [2/5] Supabase auth reachable. A response at all (even 401) means the host is
// up. Only DNS/TLS/network-policy failures throw here.
try {
  const resp = await page.goto(SUPABASE_URL + '/auth/v1/health', { waitUntil: 'load', timeout: 15000 });
  if (!resp) {
    console.log('SMOKE_FAIL: supabase_unreachable - no response');
    await browser.close();
    process.exit(1);
  }
  console.log('[2/5] Supabase reachable (status', resp.status() + ')');
} catch (e) {
  console.log('SMOKE_FAIL: supabase_unreachable -', e.message);
  await browser.close();
  process.exit(1);
}

// [3/5] Dashboard host reachable.
try {
  await page.goto(DEPLOY_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  console.log('[3/5] Dashboard reachable. URL:', page.url());
} catch (e) {
  console.log('SMOKE_FAIL: dashboard_unreachable -', e.message);
  await browser.close();
  process.exit(1);
}

// [4/5] Login actually completes with at least one test credential.
let loggedIn = false;
for (const acct of TEST_ACCOUNTS) {
  try {
    await page.goto(DEPLOY_URL + '/login', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', acct.email);
    await page.fill('input[type="password"]', acct.password);
    await page.click('button[type="submit"]');
    await page.waitForURL((u) => !u.toString().includes('/login'), { timeout: 20000 });
    console.log('[4/5] Login OK as', acct.email, '-> ', page.url());
    loggedIn = true;
    break;
  } catch (e) {
    console.log('   login failed for', acct.email, '-', e.message);
  }
}
if (!loggedIn) {
  console.log('SMOKE_FAIL: login_failed - all credentials rejected');
  await page.screenshot({ path: new URL('./smoke-failure.png', import.meta.url).pathname }).catch(() => {});
  await browser.close();
  process.exit(1);
}

// [5/5] Capture a real, non-empty screenshot.
try {
  await page.waitForTimeout(2000);
  await page.screenshot({ path: OUT, fullPage: false });
  const { statSync } = await import('fs');
  const size = statSync(OUT).size;
  if (size < 1024) {
    console.log('SMOKE_FAIL: screenshot_empty - size', size);
    await browser.close();
    process.exit(1);
  }
  console.log('[5/5] Screenshot captured:', size, 'bytes ->', OUT);
} catch (e) {
  console.log('SMOKE_FAIL: screenshot_capture -', e.message);
  await browser.close();
  process.exit(1);
}

await browser.close();
console.log('=== SMOKE_OK ===');
