# Qtap Documentation Writer — corrected routine prompt

This supersedes the previous routine prompt. It fixes the screenshot pipeline,
which silently failed on essentially every run and produced ~50 articles with no
usable images. Everything not mentioned here (Notion board, concurrency lock,
picking work, research across code/Supabase/Mintlify, anti-slop writing, PR
flow) carries over from the original prompt unchanged.

## What was broken (and is now fixed)

1. **Smoke test failed every run.** It probed Supabase `/auth/v1/health` and
   treated any non-`200` as fatal. That endpoint returns **HTTP 401 without an
   apikey** — a normal "host is up" answer. The run set `SCREENSHOTS_DISABLED`
   and shipped an SVG-only article. **Fix:** reachability = "the host answered
   at all." See `.routine/smoke-test.mjs`.

2. **False Vercel-SSO premise.** The routine demanded a `BYPASS_URL` from
   `get_access_to_vercel_url`. But `dashboard.qtap.qa` is a normal Supabase-auth
   app served at **HTTP 200** — there is no Vercel Auth gate. The bypass could
   never be satisfied, so the run took the "SSO blocked" path. **Fix:** the SSO
   machinery is removed; log in through the real form.

3. **Base64/data-URI written as `.png` text.** Screenshots produced outside
   Playwright's binary `path:` output were committed as base64 strings (often
   truncated), or as a literal `data:image/png;base64,placeholder`. **Fix:**
   only `.routine/screenshot.mjs` produces PNGs, always binary. Never write
   base64 or a data-URI into an image file. If any tool hands you base64, decode
   it (`Buffer.from(b64, 'base64')`) before writing bytes.

4. **Weak verification.** Phase 5 only checked `[ -f ]`. **Fix:** use
   `.routine/validate-images.mjs <mdx>`; it asserts PNG magic bytes, > 5 KB, and
   real dimensions. The run FAILS if any referenced PNG is invalid.

## Hard rules (screenshots)

- A task that *requires screenshots* is NOT done with SVG diagrams alone. SVGs
  complement screenshots; they do not replace them. If capture genuinely fails
  after the smoke test passed, stop and report — do not fabricate placeholders.
- Never commit a `.png` whose first 8 bytes are not `89 50 4E 47 0D 0A 1A 0A`.
- `.routine/validate-images.mjs` must pass before you open a PR. No exceptions.

## Screenshot procedure

```bash
cd <repo>
npm install -g playwright 2>&1 | tail -3
npx playwright install chromium --with-deps 2>&1 | tail -5
npm init -y >/dev/null 2>&1
npm install sharp 2>&1 | tail -3

# 1. Smoke test (fail fast). Expect "=== SMOKE_OK ===".
node .routine/smoke-test.mjs

# 2. Capture. Write a config listing the pages this article needs, then:
node .routine/screenshot.mjs .routine/pages.<task>.json

# 3. Optimize to 1200px -final.png variants (reference these in MDX).
node .routine/optimize.mjs images/<section>

# 4. Validate every image the MDX references. Must exit 0.
node .routine/validate-images.mjs <path/to/article>.mdx
```

If the smoke test prints `SMOKE_FAIL: …`, follow the original Failure Playbook
row (set `SCREENSHOTS_DISABLED`, draw the SVG, set `Needs Screenshots = YES`,
note which check failed) — but note that with the fixes above, the only real
failure modes left are an actual network-policy block, dead credentials, or a
genuinely down dashboard.

## Config format

See `.routine/pages.example.json`. One entry per screenshot:
`{ "path": "/analytics", "name": "analytics-overview", "section": "merchants/analytics", "waitFor": "text=Total Stamps", "waitMs": 3000 }`.
Credentials default to the test accounts; override with `QTAP_EMAIL` /
`QTAP_PASSWORD` env vars.
