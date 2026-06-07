// Qtap Docs — flow capture engine (multi-step, annotated, cropped screenshots)
//
// Unlike screenshot.mjs (one screenshot per page), this walks a real user flow:
// it navigates, clicks, fills, opens dialogs and menus, and captures a screenshot
// at each meaningful step. Each capture can be annotated (boxes, numbered badges,
// arrows, labels, a caption bar, PII redaction) and/or cropped to the relevant
// component. Selectors are resolved with Playwright (so text=/has-text work);
// annotations are drawn as a DOM overlay positioned from the resolved bounding
// boxes, then the overlay is removed after the shot.
//
// Usage:  node .routine/flow-capture.mjs .routine/flows/<flow>.json
//
// Flow JSON shape:
// {
//   "deployUrl": "https://dashboard.qtap.qa",   // optional default
//   "section": "merchants/staff",                // images/<section>/<name>.png
//   "account": "demo@najma.coffee",              // or "stamp" / "points" alias, or email
//   "password": "Test1234!",                      // optional (defaults to Test1234!)
//   "defaultWaitMs": 2500,
//   "steps": [
//     {
//       "name": "01-staff-page",
//       "goto": "/staff",                          // optional navigation
//       "actions": [                               // optional, run in order before capture
//         { "click": "button:has-text('Invite Staff')" },
//         { "fill": ["input[name=email]", "sara@example.com"] },
//         { "select": ["select[name=role]", "Manager"] },
//         { "press": "Enter" },
//         { "hover": ".row" },
//         { "wait": 800 }
//       ],
//       "waitFor": "text=Send Invite",             // optional settle-on-selector
//       "waitMs": 3000,                             // optional extra settle
//       "clipTo": "[role=dialog]",                 // optional crop to an element (+padding)
//       "clip": { "x":0, "y":0, "width":1440, "height":520 },  // or explicit crop
//       "fullPage": false,
//       "annotate": [
//         { "type": "box",    "target": "button:has-text('Invite Staff')", "number": 1, "color": "plum" },
//         { "type": "arrow",  "from": {"x":700,"y":120}, "target": "button:has-text('Invite Staff')" },
//         { "type": "label",  "target": "button:has-text('Invite Staff')", "text": "Start here", "color": "plum" },
//         { "type": "caption","text": "The Staff page lists your team and their roles." },
//         { "type": "redact", "target": "td.email" }
//       ]
//     }
//   ]
// }

import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const cfgPath = process.argv[2];
if (!cfgPath) { console.error('Usage: node .routine/flow-capture.mjs <flow.json>'); process.exit(64); }
const flow = JSON.parse(readFileSync(cfgPath, 'utf8'));

const DEPLOY_URL = flow.deployUrl || process.env.DEPLOY_URL || 'https://dashboard.qtap.qa';
const SECTION = flow.section || 'misc';
const DEFAULT_WAIT = flow.defaultWaitMs ?? 2500;
const VIEWPORT = flow.viewport || { width: 1440, height: 900 };

const ACCOUNT_ALIASES = {
  points: 'demo@najma.coffee',
  najma: 'demo@najma.coffee',
  stamp: 'pexojas444@isfew.com',
  dana: 'pexojas444@isfew.com',
};
const primaryEmail = ACCOUNT_ALIASES[flow.account] || flow.account || process.env.QTAP_EMAIL || 'demo@najma.coffee';
const primaryPass = flow.password || process.env.QTAP_PASSWORD || 'Test1234!';
const ACCOUNTS = [
  { email: primaryEmail, password: primaryPass },
  { email: 'demo@najma.coffee', password: 'Test1234!' },
  { email: 'pexojas444@isfew.com', password: 'Test1234!' },
  { email: 'gocekeh608@onbap.com', password: 'Test1234!' },
];

const COLORS = { plum: '#8E4A63', gold: '#F0D793', charcoal: '#423F4C', red: '#E5484D', light: '#F8F5F2' };
const col = (c) => COLORS[c] || c || COLORS.plum;

// Drawn in the page context. Receives already-resolved numeric rects.
function drawOverlay(specs) {
  const old = document.getElementById('__doc_overlay');
  if (old) old.remove();
  const ov = document.createElement('div');
  ov.id = '__doc_overlay';
  Object.assign(ov.style, { position: 'fixed', inset: '0', zIndex: 2147483647, pointerEvents: 'none' });
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');
  svg.style.position = 'absolute'; svg.style.inset = '0';
  ov.appendChild(svg);

  for (const s of specs) {
    const r = s.rect; // {x,y,width,height} or null
    if (s.type === 'box' && r) {
      const rect = document.createElementNS(ns, 'rect');
      rect.setAttribute('x', r.x - 4); rect.setAttribute('y', r.y - 4);
      rect.setAttribute('width', r.width + 8); rect.setAttribute('height', r.height + 8);
      rect.setAttribute('rx', 8); rect.setAttribute('fill', 'none');
      rect.setAttribute('stroke', s.color); rect.setAttribute('stroke-width', '3');
      svg.appendChild(rect);
    }
    if (s.type === 'redact' && r) {
      const rect = document.createElementNS(ns, 'rect');
      rect.setAttribute('x', r.x); rect.setAttribute('y', r.y);
      rect.setAttribute('width', r.width); rect.setAttribute('height', r.height);
      rect.setAttribute('rx', 4); rect.setAttribute('fill', s.color || '#423F4C');
      svg.appendChild(rect);
    }
    if (s.type === 'arrow' && r) {
      const to = { x: r.x + r.width / 2, y: r.y - 6 };
      const from = s.from || { x: to.x - 90, y: to.y - 70 };
      const line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', from.x); line.setAttribute('y1', from.y);
      line.setAttribute('x2', to.x); line.setAttribute('y2', to.y);
      line.setAttribute('stroke', s.color); line.setAttribute('stroke-width', '3');
      svg.appendChild(line);
      const ang = Math.atan2(to.y - from.y, to.x - from.x);
      const ah = 12;
      const poly = document.createElementNS(ns, 'polygon');
      const p1 = `${to.x},${to.y}`;
      const p2 = `${to.x - ah * Math.cos(ang - 0.4)},${to.y - ah * Math.sin(ang - 0.4)}`;
      const p3 = `${to.x - ah * Math.cos(ang + 0.4)},${to.y - ah * Math.sin(ang + 0.4)}`;
      poly.setAttribute('points', `${p1} ${p2} ${p3}`); poly.setAttribute('fill', s.color);
      svg.appendChild(poly);
    }
    if (s.type === 'badge' || (s.type === 'box' && s.number != null)) {
      const bx = r ? r.x - 4 : (s.at ? s.at.x : 20);
      const by = r ? r.y - 4 : (s.at ? s.at.y : 20);
      const g = document.createElementNS(ns, 'g');
      const c = document.createElementNS(ns, 'circle');
      c.setAttribute('cx', bx); c.setAttribute('cy', by); c.setAttribute('r', 14);
      c.setAttribute('fill', s.color); g.appendChild(c);
      const t = document.createElementNS(ns, 'text');
      t.setAttribute('x', bx); t.setAttribute('y', by + 5); t.setAttribute('text-anchor', 'middle');
      t.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
      t.setAttribute('font-size', '15'); t.setAttribute('font-weight', '700'); t.setAttribute('fill', '#fff');
      t.textContent = String(s.number ?? '');
      g.appendChild(t); svg.appendChild(g);
    }
    if (s.type === 'label' && (r || s.at)) {
      const lx = r ? r.x : s.at.x, ly = r ? r.y + r.height + 8 : s.at.y;
      const d = document.createElement('div');
      Object.assign(d.style, {
        position: 'absolute', left: lx + 'px', top: ly + 'px',
        background: s.color, color: '#fff', font: '600 13px system-ui, -apple-system, sans-serif',
        padding: '5px 10px', borderRadius: '6px', maxWidth: '320px', boxShadow: '0 2px 8px rgba(0,0,0,.25)',
      });
      d.textContent = s.text || '';
      ov.appendChild(d);
    }
    if (s.type === 'caption') {
      const d = document.createElement('div');
      Object.assign(d.style, {
        position: 'fixed', left: '0', right: '0', bottom: '0',
        background: 'rgba(66,63,76,0.92)', color: '#fff',
        font: '600 15px system-ui, -apple-system, sans-serif',
        padding: '12px 20px', textAlign: 'center',
      });
      d.textContent = s.text || '';
      ov.appendChild(d);
    }
  }
  document.body.appendChild(ov);
}

async function resolveRect(page, sel) {
  if (!sel) return null;
  try { return await page.locator(sel).first().boundingBox(); } catch { return null; }
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: VIEWPORT, ignoreHTTPSErrors: true });
const page = await context.newPage();

// Login
let ok = false;
for (const a of ACCOUNTS) {
  try {
    await page.goto(DEPLOY_URL + '/login', { waitUntil: 'networkidle', timeout: 30000 });
    await page.fill('input[type="email"]', a.email);
    await page.fill('input[type="password"]', a.password);
    await page.click('button[type="submit"]');
    await page.waitForURL((u) => !u.toString().includes('/login'), { timeout: 20000 });
    console.log('Logged in as', a.email);
    ok = true; break;
  } catch (e) { console.log('login failed', a.email, '-', e.message); }
}
if (!ok) { console.log('ALL_CREDENTIALS_FAILED'); await browser.close(); process.exit(2); }

let saved = 0, failed = 0;
for (const step of flow.steps) {
  const out = `images/${SECTION}/${step.name}.png`;
  try {
    mkdirSync(dirname(out), { recursive: true });
    if (step.goto) await page.goto(DEPLOY_URL + step.goto, { waitUntil: 'domcontentloaded', timeout: 30000 });
    for (const act of step.actions || []) {
      if (act.click) await page.locator(act.click).first().click({ timeout: 10000 });
      else if (act.fill) await page.locator(act.fill[0]).first().fill(act.fill[1], { timeout: 10000 });
      else if (act.select) await page.locator(act.select[0]).first().selectOption(act.select[1], { timeout: 10000 }).catch(async () => {
        // fallback for custom dropdowns: click trigger then the option by text
        await page.locator(act.select[0]).first().click();
        await page.getByText(act.select[1], { exact: false }).first().click();
      });
      else if (act.hover) await page.locator(act.hover).first().hover({ timeout: 10000 });
      else if (act.press) await page.keyboard.press(act.press);
      else if (act.wait) await page.waitForTimeout(act.wait);
    }
    if (step.waitFor) await page.waitForSelector(step.waitFor, { timeout: 10000 }).catch(() => console.log('   waitFor not found:', step.waitFor));
    await page.waitForTimeout(step.waitMs ?? DEFAULT_WAIT);

    // Resolve annotation rects (in Node, via Playwright selectors), then draw.
    if (step.annotate && step.annotate.length) {
      const resolved = [];
      for (const a of step.annotate) {
        resolved.push({ ...a, color: col(a.color), rect: a.rect || (a.target ? await resolveRect(page, a.target) : null) });
      }
      await page.evaluate(drawOverlay, resolved);
      await page.waitForTimeout(150);
    }

    // Determine crop
    let clip = step.clip || null;
    if (!clip && step.clipTo) {
      const b = await resolveRect(page, step.clipTo);
      if (b) {
        const pad = step.clipPadding ?? 16;
        clip = {
          x: Math.max(0, b.x - pad), y: Math.max(0, b.y - pad),
          width: Math.min(VIEWPORT.width, b.width + pad * 2),
          height: Math.min(VIEWPORT.height, b.height + pad * 2),
        };
      }
    }
    await page.screenshot({ path: out, fullPage: step.fullPage ?? false, ...(clip ? { clip } : {}) });
    await page.evaluate(() => document.getElementById('__doc_overlay')?.remove());
    console.log('Saved', out, clip ? '(cropped)' : '');
    saved++;
  } catch (e) {
    console.log('FAILED', step.name, '-', e.message);
    await page.evaluate(() => document.getElementById('__doc_overlay')?.remove()).catch(() => {});
    failed++;
  }
}

await browser.close();
console.log(`DONE (saved ${saved}, failed ${failed})`);
if (failed > 0) process.exit(3);
