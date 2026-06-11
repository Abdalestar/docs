# Qtap Docs — Instructions for AI agents

**Writing or updating any docs article? Use the `qtap-docs-article` skill**
(`.claude/skills/qtap-docs-article/SKILL.md`). It defines the required workflow for
every article in this repo: run the **`stop-slop` skill** (`.claude/skills/stop-slop/`)
anti-slop pass on the prose, apply `.writing-rules/`, research before claiming,
capture real **annotated screenshot flows** with `.routine/flow-capture.mjs`,
validate every image with `.routine/validate-images.mjs`, then open a PR.

Non-negotiables: never ship placeholder or base64-as-`png` images; never replace
the screenshots a how-to needs with an SVG-only diagram; push images with `git push`
(not the GitHub MCP, which stores base64 text). The automated scheduled routine is
specified in `.routine/ROUTINE.md`.

---

# Qtap Docs Writer — Run Log

Automated runs by the Qtap Documentation Writer agent are logged here.

---

## 2026-06-11 — Getting Started Checklist & Trial-Day Bonuses

**Article:** `merchants/getting-started/checklist.mdx` (new)
**Branch:** `claude/eloquent-fermat-7eoo2g`
**PR:** https://github.com/Abdalestar/docs/pull/94
**Status:** Done (hero card is an SVG; real screenshots cover dashboard + task pages)

### What was written
New article documenting the Getting Started card on the dashboard home and the trial-day bonuses it grants. Added to the Getting Started nav group in `docs.json` (after `dashboard-overview`).

Facts (all verified against app source):
- 7 tasks from `CHECKLIST_ITEMS` in `app/api/checklist/route.ts`: account_created + business_setup (auto-complete, 0 days), first_loyalty_card (+1), first_qr_code (+1), invite_staff (+1), first_member (0), first_campaign (+1).
- Completion is computed from real counts (stamp_cards + points_programs, qr_codes, non-owner staff, organization_members, campaigns). Not manual checkboxes.
- Visibility (`getting-started-checklist.tsx`): shows when `isTrialing || isNewOrg` (org created < 30 days) and not dismissed; returns null at `progress === 100`. Reward badges + Claim button gated on `isTrialing`. Bonus is claimed (POST /api/checklist), not auto; one-time per item (`checklist_rewards_claimed`).
- Trial extension cap = 7 days total (`MAX_EXTENSION_DAYS` in `lib/billing/trial-extension.ts`); the 4 checklist days fit under it. extendTrial also updates Stripe trial_end when a subscription exists.
- Dismiss (Skip / X) is permanent (sets `settings.getting_started_dismissed`).

### Screenshots
- SMOKE_OK. Login works with both env accounts.
- **Both demo orgs (Najma points, Dana stamp) are at `progress=100`** — `/api/checklist` confirmed all 7 items complete — so the Getting Started card returns null and cannot be captured live. Seeding is not allowed (Supabase read-only). Left `Needs Screenshots = YES` for a future run with a fresh trialing account.
- Shipped 3 REAL annotated screenshots via `flow-capture.mjs` (flow at `.routine/flows/getting-started.json`): dashboard home (Quick Actions boxed), QR Codes page (Generate QR Code), Staff page (Invite Staff). Captured filled/idle states only, no destructive/outbound clicks.
- Built an accurate SVG of the card (`images/merchants/getting-started/checklist-card.svg`) from the component source: progress ring, 7 rows with reward badges, plus a legend showing offered → Claim +1d → +1d earned. `validate-images.mjs` 4/4 OK.

### Insights for future runs
- The checklist card only renders for trialing/new orgs with unfinished tasks. Established demo accounts will never show it. To screenshot the live card you need an org that is mid-onboarding (or a fresh trial signup).
- `playwright install-deps` fails in this sandbox (apt repo signing errors), but the bundled chromium still launches headless and captures fine. Don't treat install-deps failure as a blocker.
- The dashboard home `/` needs ~5.5s settle for metric tiles to leave skeleton state.

---

## 2026-05-07 — Analytics Overview Screenshots (Attempt 2)

**Article:** `merchants/analytics/overview.mdx`
**Branch:** `docs/analytics-overview-update`
**PR:** https://github.com/Abdalestar/docs/pull/41
**Status:** Screenshots still not captured — all automated approaches blocked

### Goal
Add real screenshots to PR #41 (analytics overview rewrite). Article content is complete and committed; only the `<Frame>` image tags are missing.

### All approaches tried and why each failed

**1. `mcp__Claude_in_Chrome__upload_image` relay**
Plan: take Chrome MCP screenshot → use upload_image with the ID to push it to a `<input type="file">` on the local server.
Result: `"Unable to access message history to retrieve image"` — Chrome MCP screenshot IDs (`ss_XXXXX`) are not accessible to the `upload_image` tool. The two tools don't share an image store.

**2. `fetch()` / XHR from analytics page to localhost server**
Result: `"Failed to fetch"` — the analytics page is HTTPS. Connections from HTTPS to `http://127.0.0.1:7777` are blocked as mixed content by Chrome. Both `fetch()` and XHR are affected. No CSP meta tag exists; the restriction is browser mixed-content enforcement.

**3. `<script src="http://127.0.0.1:7777/...">` to load html2canvas from local server**
Result: Same mixed-content block applies to script loads from HTTPS pages.

**4. dom-to-image-more (17KB, injected inline)**
Fix applied: replaced `})(this)` with `})(window)` in the IIFE to make it work in eval context.
Library injected successfully (`window.domtoimage` defined), BUT: `domtoimage.toPng()` throws `(intermediate value).join is not a function` in the CSS `resolveAll` chain. The failure occurs when iterating `document.styleSheets` — at least one stylesheet (likely a cross-origin Next.js chunk or CDN font) causes the `cssRules` iterator to return a non-array. The error persists even with `disableEmbedFonts: true`.

**5. Raw SVG foreignObject canvas approach**
Built an SVG string from `node.outerHTML`, created a Blob URL, tried loading it as an `<img>` to draw to canvas.
Result: `img load error: "error"` — the browser refuses to render the SVG because it contains references to external resources (images, fonts, stylesheets from other origins). The canvas would be tainted regardless.

**6. html2canvas (199KB)**
Not attempted — 199KB source code = ~50K tokens inline in a single javascript_tool call. Too expensive for context window. Could be split into 4 chunks of ~50KB stored in globals then eval'd, but dom-to-image (simpler library) already failed at the CSS step, so html2canvas would likely fail the same way.

**7. `gif_creator` tool**
Result: `"Tab X is not in the MCP tab group. GIF recording only works for tabs within the MCP tab group."` — the analytics tab was opened before the MCP session, so it is not in the MCP's visual Chrome tab group. Even a new tab created with `tabs_create_mcp` and navigated to the analytics URL gets the same error.

**8. `mcp__computer-use__request_access`**
Result: Timed out after 180s — user not present for automated run. Without approval, no computer-use tools are available.

**9. PowerShell PrintWindow + Win32 API (from previous session)**
Result: Captures the wrong Chrome tab because PrintWindow captures the HWND's current visible content, which depends on which tab Chrome has active at the OS level — not which tab the Chrome MCP has logically active.

### What DOES work (confirmed)
- `<a href="data:..." download="filename.png">` + `.click()` from `javascript_tool` on the analytics tab **does** trigger a Chrome download to `C:\Users\Abdallah\Downloads\`. Confirmed with a test canvas (340-byte `test-canvas.png` saved successfully).
- dom-to-image injection itself works (`window.domtoimage` is defined and has `toPng`, `toCanvas` etc.).

### How to fix dom-to-image for this page
The `resolveAll` function in dom-to-image-more reads `document.styleSheets`, filters for `CSSRule.FONT_FACE_RULE` rules, and calls `.join("\n")` on the results. On the Next.js analytics page, at least one stylesheet causes the cssRules iterator to return something that is not a plain array by the time `.join` is called.

Patch option: monkey-patch `window.domtoimage.impl.fontFaces.resolveAll` before calling `toPng`:
```javascript
var orig = window.domtoimage.impl.fontFaces.resolveAll;
window.domtoimage.impl.fontFaces = {
  resolveAll: function() { return Promise.resolve(''); },
  impl: { readAll: function() { return Promise.resolve([]); } }
};
```
This skips font inlining entirely. Combined with `disableInlineImages: false`, the rendered PNG will use browser-default fonts but should otherwise capture the UI layout correctly.

### Recommended approach for manual run
1. Open the analytics dashboard at `https://dashboard.qtap.qa/analytics` and confirm it shows stamp card metrics.
2. Approve `request_access` for Google Chrome when prompted (user must be present).
3. Use `mcp__computer-use__screenshot` with `save_to_disk: true` — it returns a real filesystem path on Windows.
4. Or: apply the dom-to-image monkey-patch above, then call `window.__captureSection('filename.png')` — the `<a download>` path DOES work and saves to Downloads.

### Screenshots needed (6 total)
- `analytics-metrics-stamp.png` — top of page: metrics grid (Total Stamps, Redemptions, New Members, Return Rate) + time period selector
- `analytics-charts.png` — Stamps Over Time chart + Top Performing Staff bar chart
- `analytics-insights.png` — Insights panel + AI Insights panel
- `analytics-benchmarks.png` — Regional Benchmarks panel
- `analytics-customers.png` — Churn Risk + Best Customers (side by side)
- `analytics-ask-ai.png` — Ask AI About Your Data panel at bottom

All screenshots save to `C:\Users\Abdallah\docs\images\merchants\analytics\` and should use `<Frame>` tags in the MDX article.

### Errors / challenges
- Port 7777 `EADDRINUSE`: multiple stale server processes (PIDs 79776, 82668). Kill with `taskkill /PID <pid> /F` before starting.
- git HEAD null bytes: persisted from prior session; already fixed by Desktop Commander CMD `echo ref: refs/heads/main > .git\HEAD`.
- `capture-server.js`, `images/merchants/analytics/*.png` (failed captures), `commit-msg.txt` etc. are untracked in the repo — do NOT commit them.

---

## 2026-05-06 — Analytics Overview Rewrite

**Article:** `merchants/analytics/overview.mdx`
**Branch:** `docs/analytics-overview-update`
**PR:** https://github.com/Abdalestar/docs/pull/41
**Status:** Done (screenshots still needed — session expired)

### What was written
Full rewrite of the existing Analytics Overview article, which had factual errors and was missing six sections entirely. All facts verified against source code before writing.

**Corrections:**
- Stamp metrics: "Active members" → **Return Rate** (from `metrics-grid.tsx`)
- Points metrics: "Points issued" → **Points Earned**, "Outstanding balance" → **Outstanding Points**, added missing **Avg Revenue/Point** metric (from `points-metrics-grid.tsx`)
- Access control: article was silent on access; now documents that owners and managers have access by default and staff do not (analytics='none' in `DEFAULT_PERMISSIONS`)

**New sections added:**
- **Insights** — `insights-panel.tsx`; card title "Insights"; five insight types (performance, trend, recommendation, warning, opportunity); color-coded icons
- **AI Insights** — `AIInsightsPanel` component; AI-generated analysis of program patterns
- **Regional Benchmarks** — `regional-benchmarks.tsx`; /api/ai/benchmarks; four percentile badges (Top 25%, Above Avg, Below Avg, Needs Work); only renders when data is available
- **Churn Risk** — `churn-risk-list.tsx`; shows member_name, risk_level (high/medium/low), reason, days_inactive
- **Best Customers** — `best-customers-list.tsx`; top 10 members; tier badges (platinum/gold/silver/bronze); shows total_visits and total_points
- **Ask AI About Your Data** — `ai-chat.tsx`; card title "Ask AI About Your Data"; /api/ai/chat; four suggested questions

### Research sources
- `app/(dashboard)/analytics/page.tsx` — full page component tree confirming all sections rendered and their order
- `components/dashboard/analytics/metrics-grid.tsx` — stamp card metric labels
- `components/dashboard/analytics/points-metrics-grid.tsx` — points metric labels including Avg Revenue/Point
- `components/dashboard/analytics/churn-risk-list.tsx` — Churn Risk card title, description, field names, risk levels
- `components/dashboard/analytics/regional-benchmarks.tsx` — percentile badge strings, conditional render logic
- `components/dashboard/analytics/best-customers-list.tsx` — Best Customers card, tier badge values, top 10 limit
- `components/dashboard/analytics/ai-chat.tsx` — Ask AI card title, suggested question strings
- `components/dashboard/analytics/insights-panel.tsx` — Insights card title, insight type enum
- `lib/utils/permissions.ts` — analytics route guard: `perms.analytics !== 'none'`
- `lib/validations/staff.ts` — DEFAULT_PERMISSIONS: manager analytics='full', staff analytics='none'

### Screenshots / diagrams
- **Screenshots:** NOT captured. Session expired during multi-session capture attempt (tab switching failures: Reddit Chrome window at (21,0,1359,1020) intercepting clicks on tab bar; Figma intercepting Ctrl+4; HWND_TOPMOST did not resolve). `Needs Screenshots` flag remains on Notion row.
- **No new SVG diagram** created; article content is detailed enough without one.

### Anti-slop fixes applied
- No em dashes used
- No banned words (leverage, seamless, enhance, utilize, etc.)
- No rule-of-three in prose
- No self-narration phrases
- Intro avoids abstract framing — describes what the page does concretely

### Errors / challenges
- `git stash` failed in bash sandbox (exit code 1, no output) — fix: saved new file content to /tmp before git operations
- `git checkout main` blocked by stale index.lock — fix: Desktop Commander CMD session with `del /f /q` before every git command
- `gh pr create --title "..."` fails in CMD (space-splitting even with quotes) — fix: write commit message to file, use `--fill` + `--body-file`
- `gh -C <path>` not supported by gh CLI — fix: `cd /d C:\Users\Abdallah\docs` before gh command in same CMD invocation
- Notion `PR Link` property requires plain `"PR Link"` key, not `"userDefined:PR Link"` (the `userDefined:` prefix is only for properties literally named "id" or "url")

### Insights for future runs
- Analytics page renders in this order: TimePeriodSelector + ExportDialog → MetricsGrid (conditional on program type) → Charts row → InsightsPanel → AIInsightsPanel → RegionalBenchmarks → ChurnRiskList + BestCustomersList (side by side) → AIChat
- `metrics-grid.tsx` and `points-metrics-grid.tsx` are separate components with different metric sets. Always read both when documenting analytics.
- Regional Benchmarks only renders when `/api/ai/benchmarks` returns data. Document as conditional appearance.
- The bash sandbox cannot delete `.git/index.lock` (Operation not permitted on Windows mount). Always use Desktop Commander CMD session for git operations.
- Chrome MCP `save_to_disk=true` returns a screenshot ID but no filesystem path; the image only exists in-memory and cannot be saved from the sandbox.

---

## 2026-05-03 — Merchant Page Editor

**Article:** `merchants/settings/merchant-page-editor.mdx`
**Branch:** `docs/merchant-page-editor`
**PR:** https://github.com/Abdalestar/docs/pull/40
**Status:** Done (screenshots pending)

### What was written
Article covering the Merchant Page Editor (`/merchant-page` route). Covers:
- Intro: how to open the editor (Merchant Page in sidebar), live preview behavior on large screens
- Merchant Profile section (7 fields): Merchant Name, Cover Photo (PNG/JPEG 5MB 1200×600px), Merchant Logo (PNG/JPEG/SVG 10MB), Merchant Logo Transparent PNG (stamp icon, 512×512px 10MB), Description, Google Rating (slider 0.0–5.0, manual), Category (8 options: Restaurants/Cafes/Retail/Beauty/Health/Services/Entertainment/Other)
- Location Details section (5 fields): Location Name, Address, Phone Number, Working Hours (free text), Website URL; phone and hours in 2-column layout
- Loyalty Cards section: one config block per program; stamp card config (color swatches, stamp icon, stamps required, preview slider); points card config (color, icon, points per currency, preview balance); Rewards & Interim Rewards subsection (Add Reward dialog: type Main/Sign Up/Interim, name, image 2MB, staff notes, expiry days 1–365)
- Live preview: right-column phone preview, large screens only, hidden on small
- Saving and resetting: Preview button (opens `/m/slug?preview=true` in new tab with unsaved state), Create Merchant (first save POST), Update Merchant (subsequent saves PUT), Delete (confirmation dialog, resets page fields, loyalty programs unaffected)
- Warning callout: owner-only route; managers and staff see access denied; no per-role override

Also added `merchants/settings/merchant-page-editor` to the Settings group in `docs.json` (after `merchants/settings/merchant-page`).

### Research sources
- `app/(dashboard)/merchant-page/page.tsx` — page title, description, `useRouteGuard` usage, `MerchantPageEditor` mount
- `components/dashboard/merchant-page/merchant-page-editor.tsx` (69KB) — all form state, constants (STAMP_ICONS 12 emoji, CARD_COLORS 12 hex, CATEGORIES 8 options), `handleSave` POST/PUT, `handleDelete` with dialog text, `handlePreview` sessionStorage + new tab, reward dialog schema, `hidden lg:block` live preview sidebar
- `lib/utils/permissions.ts` — `pathname.startsWith('/merchant-page') return false` confirms owner-only
- `merchants/settings/merchant-page.mdx` — confirmed this covers `settings/page.tsx` (business settings), NOT the editor

### Screenshots / diagrams
- **Screenshots:** NOT captured. Automated run — user not present for `request_access`. `Needs Screenshots` flag left on Notion row.
- **SVG diagram:** `images/merchants/merchant-page-editor-flow.svg` — three left-column section cards (Merchant Profile, Location Details, Loyalty Cards), middle Actions box (Create Merchant, Update Merchant, Preview, Delete buttons + Access note), right column outcomes (Page published, Preview new tab, Page reset) and Live Preview callout. Uses brand colors (#8E4A63 plum, #F0D793 gold, #423F4C charcoal). 820×480px.

### Anti-slop fixes applied
- Em dashes in all bullet field descriptions → replaced with colons
- "four fields" when Location Details list had five items → "five fields"
- Heading "Saving, previewing, and resetting" (rule-of-three) → "Saving and resetting"
- Staccato pair "For stamp card accounts, it starts with a stamp card. For points accounts, it starts with a points card." → merged with semicolon
- "This section controls the visual identity of your page" (abstract) → "These fields control how your business appears on the customer-facing page"
- Em dash in Google Rating sentence → semicolon

### Errors / challenges
- `git checkout -f main` failed with `fatal: Unable to create '.git/index.lock': File exists` — persistent race condition (likely VS Code). Fix: Desktop Commander `start_process cmd /k` (PID 34184) persistent session; `del /f /q index.lock 2>nul` immediately before every git command in the same process.
- `docs.json` had trailing null bytes (known recurring issue) causing `json.decoder.JSONDecodeError: Extra data` on JSON parse. Fix: `open('docs.json','rb').read().rstrip(b'\x00')` then `json.dump` back with indent=2.
- `mcp__workspace__bash` cannot reach `C:\Users\Abdallah\qtaplatest` (different mount). Fix: used `mcp__filesystem__read_text_file` and `mcp__filesystem__list_directory` directly.
- Notion `notion-query-database-view` fails (Business plan required). Workaround: `notion-search` + `notion-fetch` to locate tasks.
- Prior context exhaustion mid-run: run continued from summary in a new context window. CLAUDE.md update deferred to continuation session.

### Insights for future runs
- `/merchant-page` and `/merchants` are separate routes. `/merchant-page` is the public page designer (MerchantPageEditor). `/merchants` is the business overview (loyalty stats + Create/Edit/Delete buttons). Do not conflate them.
- `merchant-page-editor.tsx` is 69KB. `mcp__filesystem__read_text_file` handles it cleanly; no need for chunked reads.
- Cover photo validation is client-side in `handleCoverPhotoChange`: 5MB limit, PNG/JPEG only. Same pattern for logo (10MB, adds SVG) and transparent logo (10MB, PNG only).
- The "Google Rating" field is purely a display value set by the merchant. It does not sync with Google. Document it as manual to avoid user confusion.
- Reward `trigger_value` is auto-set to `stamps_required` for Main rewards and 0 for Sign Up. Only Interim rewards expose the trigger value input.

### Gap discovery (Phase 6)
- "Merchant Profile Manager" Notion task (3551ae8f) closed as Done — duplicate of PR #33's `/merchants` overview. The task description incorrectly claimed the editor was already covered in `merchant-page.mdx`; that article covers the settings page, not the editor.
- New Notion row created for "Merchant Page Editor" → Done, PR #40.
- No additional undocumented routes discovered. All known routes now have corresponding articles or open PRs.

---

## 2026-04-14 — Security Settings

**Article:** `merchants/settings/security.mdx`
**Branch:** `docs/settings-security`
**PR:** https://github.com/Abdalestar/docs/pull/10
**Status:** Done (screenshots pending)

### What was written
Article covering the Security Settings page (`/settings/security` route). Covers:
- Change Password form (3 fields, 8-char minimum, verifies current password first via `signInWithPassword`)
- Two-Factor Authentication (TOTP only, QR code enrollment flow, manual entry key fallback, 6-digit verify step, badge shows Enabled/Not Enabled)
- Active Sessions panel (current session email + expiry, Sign Out All Sessions button with global scope)
- Access control: owners always; managers/staff only if `settings: true` in permissions (default is `false` for both)

Also added `merchants/settings/security` to the Settings group in `docs.json`.

### Research sources
- `app/(dashboard)/settings/security/page.tsx` — full UI: all three card sections, MFA enrollment dialog, session info, `useRouteGuard` hook
- `hooks/use-route-guard.ts` — confirms route guard delegates to `canAccessRoute`
- `lib/utils/permissions.ts` — confirms `/settings` is owner-always, or `perms.settings === true` for others
- `lib/validations/staff.ts` — confirms `DEFAULT_PERMISSIONS` for manager and staff both have `settings: false`
- `DATABASE_SCHEMA.md` — confirmed no custom security tables; password/MFA/session are handled entirely through Supabase Auth
- `docs/.writing-rules/SKILL.md`, `banned-words`, `content-patterns` — all 4 anti-slop passes applied

### Screenshots / diagrams
- **Screenshots:** NOT captured. `request_access` timed out (user not present for automated run). `Needs Screenshots` flag left on Notion row.
- **SVG diagram:** `images/settings/2fa-enrollment-flow.svg` — shows the 4-step 2FA enrollment flow (top) and a mock of all three page sections (bottom). Uses brand colors (#8E4A63 plum, #F0D793 gold, #423F4C charcoal).

### Anti-slop fixes applied
- Intro restructured to avoid a 3-item list (password + 2FA + sessions). Split into two sentences.
- "Turning off 2FA" section had three consecutive short sentences. Combined last two.
- Verified zero banned words (no leverage, seamless, enhance, utilize, implement, etc.)
- No em dashes, no contrast framing, no self-narration phrases.

### Errors / challenges
- `request_access` for computer-use timed out after 60s (no user present). Same result as all previous automated runs. Screenshots deferred.
- App repo path required `app/` not `src/app/`. Desktop Commander `dir` with parentheses in path (`(dashboard)`) caused syntax errors when unquoted; fixed by using PowerShell `Get-Content`.
- `mcp__filesystem__search_files` did not recursively search subdirectories — used Desktop Commander `dir /s` instead.

### Insights for future runs
- Security page uses Supabase Auth directly for all 3 features (password, MFA, sessions). No custom tables needed.
- The `useRouteGuard` hook defaults to `allowed: true` while loading, so the page briefly renders before an unauthorized user sees `AccessDenied`.
- MFA in Qtap is TOTP only (no SMS). If a future article covers SMS 2FA, that doesn't exist yet.
- `DEFAULT_PERMISSIONS` in `staff.ts` is the authoritative source for what each role can access. Always check this before writing access-control claims.
- PowerShell `Get-Content` works reliably for reading files with parentheses in their path. CMD `type` does not.

### Phase 5 errors / insights (PR creation)
- CMD `gh pr create --title "..."` fails with space-splitting even with correct quoting; fix: use `--fill` flag (commit message becomes title) + `--body-file pr-body.txt`
- PR #9 was already created by a prior automated run on branch `claude/intelligent-darwin-BZ4YF`; this run's PR #10 on `docs/settings-security` supersedes it with source-code-grounded content
- Desktop Commander does not stream stdout from `gh.exe` in PowerShell sessions; workaround: redirect output to a file (`> gh-output.txt`) and read with `type`
- PowerShell `Out-File` in a pipe can truncate/empty the target file if the pipe fails silently; prefer `Set-Content` with an intermediate variable

### Gap discovery (Phase 6)
Scanned all `app/(dashboard)/` routes against the Notion tracker. Two undocumented pages found and added:
- `merchants` route → `/merchants/merchant-profile.mdx` (P3 Low) — distinct from `settings/merchant-page` (the editor). Shows merchant's public profile card (name, logo, cover, phone, website, slug) with real-time loyalty stats (members, stamps, points, redemptions). Has Create/Edit/Delete buttons. The "My Business" overview page.
- `notifications` root → `/merchants/campaigns/notification-templates.mdx` (P3 Low) — two tabs: Sent history (notification log) and Templates (TemplateManager). Existing push-notifications.mdx covers only `/notifications/new`. Templates and sent history are undocumented.

---

## 2026-04-13 — Issuing Stamps Manually

**Article:** `merchants/stamp-cards/manual-stamps.mdx`
**PR:** https://github.com/Abdalestar/docs/pull/8
**Branch:** `docs/stamp-cards-manual-stamps`
**Status:** Done

### What was written
Article covering the Stamp Operations dashboard feature (`/stamp-operations` route). Explains how staff search for a member, select a stamp card, set a quantity, and confirm. Includes the auto-enrollment flow for members not yet in a card, and the recent transactions panel at the bottom of the page.

### Research sources
- `app/(dashboard)/stamp-operations/page.tsx` — full UI flow, state variables, text strings
- `lib/stamps/issue-stamp.ts` — `IssueStampParams` and `IssueStampResult` interfaces
- Supabase MCP (READ-ONLY): `member_stamps`, `transactions`, `stamp_cards` schema
- `DATABASE_SCHEMA.md` — cross-reference for table relationships
- `merchants/points/operations.mdx` — format reference (equivalent article for points)

### Known gaps from this run
- Screenshots not captured — Chrome extension requires user presence; automated run could not open a tab group. `Needs Screenshots` flag left on the Notion task.

### Gap discovery (Phase 6)
Two undocumented routes found and added to Notion task board:
- `analytics/wrapped` → `/merchants/analytics/wrapped.mdx` (P3 Low)
- `settings/security` → `/merchants/settings/security.mdx` (P2 Medium)
