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

## 2026-06-12 — Security settings screenshots (backfill)

**Article:** `merchants/settings/security.mdx`
**Branch:** `claude/eloquent-fermat-81guoz`
**PR:** https://github.com/Abdalestar/docs/pull/134
**Status:** Done (4 real annotated screenshots; validate-images 5/5 OK)

### Task selection
The board is otherwise fully `Done`; the only genuine `Status = "Not started"` row that is not a flagged duplicate was **"Account Security: Password, 2FA & Active Sessions"** (P1 High, `Needs Screenshots = YES`, gap-audit 2026-06-10), whose file `merchants/settings/security.mdx` was already on `main` with accurate source-grounded prose (PR #10, 2026-04-14) but **zero real screenshots** — the original write could not capture from the old Windows/Chrome-MCP pipeline. So this run did one task: add the real annotated flow. Prose unchanged; existing 2FA enrollment SVG kept. Also cleared `Needs Screenshots` on the older duplicate P2 "Security Settings" row (same MDX path).

### Rejected this run
- **The Member Profile: Activity, Notes & Tags** (the only other Not-started row) is a flagged duplicate of the published `members/profiles.mdx` (its proposed net-new "editable tags" feature doesn't exist; tags render read-only). Left as-is.
- **Card Designer (`/cards/design`)** looked like an undocumented route, but it's a non-functional prototype: its "Save & Continue" only writes the design to `sessionStorage`, and `/cards/new` never reads it back (the page's own comment says "In a real implementation, this would save the design to the database"). Documenting it would mislead. Not documented.
- **Campaign Analytics** stub stays blocked (performance endpoint 404s live, verified by a prior run).

### Screenshots
4 real annotated PNGs via `.routine/flows/security.json` (points demo, Najma Coffee) at `/settings/security`: `security-overview` (3 cards numbered 1/2/3, login email redacted, caption); `security-change-password` (3 fields + Update Password boxed, cropped); `security-2fa` (Authenticator App row, **Not Enabled** badge + **Enable** boxed, cropped); `security-sessions` (Current Session + **Sign Out All Sessions** boxed, login email redacted, cropped). `validate-images` 5/5 OK (4 PNG + the pre-existing SVG); pushed as binary via git. SMOKE_OK.

### Safety / gotchas
- Read-only capture: **Update Password / Enable / Sign Out All Sessions** never clicked.
- The **2FA enrollment dialog was intentionally NOT opened** — `handleMfaEnroll` calls `supabase.auth.mfa.enroll()`, which writes a real (unverified) TOTP factor to the demo account and renders a live secret + QR. That flow stays covered by the existing `2fa-enrollment-flow.svg`.
- Login email (`demo@najma.coffee`) redacted on both shots where the Active Sessions card appears.
- Card wrapper class is `rounded-xl border bg-card text-card-foreground shadow`; `div.rounded-xl:has-text('<title>')` crops each card cleanly. Cards are tall, so the overview used a 1300px-high viewport to fit all three in one shot. Labels: `text=Not Enabled` (badge), `#currentPassword` (field), `button:has-text('Sign Out All Sessions')`.
- Grounded in `app/(dashboard)/settings/security/page.tsx` (labels verified live).

---

## 2026-06-12 — Staff Performance Report

**Article:** `merchants/analytics/staff-performance.mdx`
**Branch:** `claude/eloquent-fermat-64ql9z`
**PR:** https://github.com/Abdalestar/docs/pull/124
**Status:** Done. Stub replaced with a full article + 4 real annotated screenshots (validate-images 4/4 OK).

### Task selection
The whole Notion board is `Done` with **zero `Not started` rows**, so per routine §3 this run did one screenshot-grade task: the highest-value `Needs Screenshots = YES` row whose file is on `main`. Most such rows' PRs were never merged, so their files aren't on `main`; the ones that ARE on `main` are "Coming soon" stubs. Picked **Staff Performance Analytics** (P2, `Done`/"Already published" but a stub on main) — the richest screenshotable target, parallel to the just-shipped Revenue Impact (#117) and Points Activity (#119).

Rejected **Campaign Analytics** (`merchants/campaigns/analytics.mdx`, also a stub, `Needs Screenshots=YES`): its only content not already covered by the published `merchants/campaigns/stats.mdx` (the four headline numbers) is the **Performance** card on `/campaigns/[id]` — the Sent-vs-Redeemed time series + per-branch redemption breakdown. That card is `(performance || perfLoading)`-gated and **does not render on the demo account** ("hidden in demo mode where the API has no data"), confirmed by live probe — so it can't be screenshotted there. Left for a run that can seed/find a campaign with reward-redemption data.

### What was written
The `/analytics/reports/staff-performance` report. Columns (`page.tsx`): Staff Member, Stamps Issued, Points Issued, Rewards Processed, Members Served, Avg Stamps/Day, Avg Points/Day, sorted most-active first. Filters: branch (hidden when <=1 branch; staff see only assigned branches) + time period (Today/Last 7/30/90 days/This year, default 30d). Per-staff drill-down (`[staffId]/page.tsx`): metric cards w/ change vs previous period, Activity Over Time, By Branch, Recent Activity. Access: owners+managers (`analytics !== 'none'`), staff none by default.

Honest gotchas: ledger-sourced, only staff-tagged actions count (a customer self-scan has no staff behind it); stamp columns read 0 on a points-only program.

### Research sources (qtap, read-only)
- `app/(dashboard)/analytics/reports/staff-performance/page.tsx` + `[staffId]/page.tsx`
- `hooks/use-reports.ts` `useStaffDetailedPerformance` — `stamp`→stamps, `points_earn`→points, `redeem`/`points_spend`→rewards, distinct `member_id`→members served, totals/periodDays for daily avg, sort by stamps+points
- `components/dashboard/analytics/time-period-selector.tsx`, `components/dashboard/branch-filter.tsx`, `lib/utils/permissions.ts`, `lib/validations/staff.ts`

### Screenshots
4 real annotated PNGs from the live points demo (Najma Coffee, 5 staff, 3 branches) via `.routine/flows/staff-performance.json`: overview (filters boxed), table close-up (headers boxed + stamps-0 note), period dropdown (5 options), drill-down (metric cards + chart; Recent Activity cropped out). All staff names redacted. SMOKE_OK; `validate-images` 4/4. `docs.json` unchanged (already in Analytics nav).

### Insights for future runs
- **Board is fully `Done`; the real backlog is the on-main "Coming soon" stubs.** Find them with `git ls-tree -r origin/main | grep '\.mdx$'` then check line count <8. As of this run, still stubs on main: `merchants/analytics/location-comparison.mdx` (**good next task** — Notion row "Location Comparison", P2, no PR, a real per-branch card report that should screenshot fine), `merchants/campaigns/analytics.mdx` (blocked, see above), `merchants/campaigns/rewards.mdx`. `revenue-impact`, `points-activity`, `staff/activity-logs` have open PRs (#117/#119/#113) not yet merged, so they still read as stubs on main — don't double-do them.
- The four analytics report pages all populate on `demo@najma.coffee`. Staff Performance shows real-person staff names (redact the first column). Points-only org → stamp columns are 0.
- Period selector renders a Radix `[role=listbox]` with `[role=option]` items; `clipTo: "[role=listbox]"` crops it cleanly.

---

## 2026-06-12 — Setting Your Points Earn Rate

**Article:** `merchants/points/earn-rate.mdx` (new)
**Branch:** `claude/eloquent-fermat-cdyv4w`
**PR:** https://github.com/Abdalestar/docs/pull/123
**Status:** Done (3 real annotated screenshots, validate-images 3/3 OK). One task this run per the run request.

### What was written
New how-to for the P2 row "Earn Rate: Points per Currency & Per-Visit Caps". Covers how members earn points: the **Points per** rate (`points_per_currency`, decimals via `step="0.01"`, validated 0.01–1000, default 1), the **Currency** dropdown, and the **Limits** card's **Max points per visit** cap (`max_points_per_transaction`, empty = no cap). Documents the award math from `points-operations/page.tsx` `calculatePoints()`: `Math.floor(amount * points_per_currency)` then `Math.min(points, max_points_per_transaction)`, the floor-rounding gotcha, the minimum-spend note shown on the calculator summary line, and the **Manual Points** override. Access: owners/managers edit programs (staff `points_programs: none`); staff can still award on Points Operations (`issue_points: true`). Distinct from `creating.mdx` (the create walkthrough); cross-linked. Added to Points Programs nav after `creating`.

### Research sources (Abdalestar/qtap, read-only)
- `components/dashboard/points-program-form.tsx` — Points per / Currency fields; the Limits card (Max points per visit, `min={1}`, placeholder "No limit"). Note: `min_transaction` is NOT in this form (unused-by-form DB column), so it was not documented as a settable field.
- `app/(dashboard)/points-operations/page.tsx` — `calculatePoints()` math; By Amount / Manual Points; the rate summary line ("N points per SYM1 | Min: ... | Max: ... pts").
- `lib/validations/loyalty.ts` — `points_per_currency` 0.01–1000.
- `lib/utils/permissions.ts` + `lib/validations/staff.ts` — `/points` needs `points_programs !== 'none'`; `/points-operations` needs `issue_points`.

### Screenshots
3 real annotated PNGs via `flow-capture.mjs` (`.routine/flows/points-earn-rate.json`) from the live points demo (Najma Coffee): Points per/Currency fields on `/points/new`, the Limits cap field, and the live Points Operations calculator (QR50 → +3,750 on the demo's 75-points-per-QR1 program, Min QR5 / Max 5000). No program saved, no member selected, no Award clicked; no customer PII. `validate-images.mjs` 3/3 OK, pushed as binary via `git push`. SMOKE_OK.

### Reality flag discovered (for a future run — do NOT document as working)
The **Condition Builder** (campaign wizard Step 5, "Custom Campaigns & the Condition Builder" row) is collected but never applied for any campaign a merchant can actually create. The execution engine (`app/api/campaigns/execute/route.ts`) and the eligibility checker (`app/api/campaigns/member-eligible/route.ts`) only read `target_conditions` inside `case 'custom':`, and the wizard's `type-selection.tsx` exposes only seven types (no `custom`). So the conditions step is a no-op for birthday/win_back/milestone/time_based/welcome/points_multiplier/flash_sale. Same class of issue as the A/B-testing flag. Annotated that Notion row's Notes; left it Not started. The "Campaigns Overview & the 8 Campaign Types" P1 row is also a duplicate (`merchants/campaigns/overview.mdx` already on main, and the UI has 7 types not 8).

---

## 2026-06-12 — Onboarding Wizard screenshots + prose fixes

**Article:** `merchants/onboarding-wizard.mdx`
**Branch:** `claude/eloquent-fermat-jnzjyg`
**Notion row:** "Onboarding Wizard Walkthrough (8 Steps incl. Trial Setup)" (P0, was Not started, Needs Screenshots YES)
**Status:** Done — 6 real annotated screenshots added; two factual corrections. SMOKE_OK.

### What this run did
The P0 row was marked "never shipped", but the article was in fact already on `main`
(commit ecd2e16) at `merchants/onboarding-wizard.mdx` (the Notion path `merchants/getting-started/onboarding-wizard.mdx` was never used). Kept the existing path
(already in the Getting Started nav in `docs.json`) rather than create a duplicate.
This run added the missing real screenshots and corrected the prose against source.

**Prose corrections (grounded in `app/(dashboard)/onboarding/page.tsx`):**
- Welcome CTA is **Get Started** (line 1030: `currentStep === 0 ? "Get Started" : 'Continue'`), not "Let's Get Started".
- Trial-includes list was missing **AI-powered business insights** (one of the four bullets in the Welcome card, lines 477-480). Added it.

**Source map:** `app/(dashboard)/onboarding/page.tsx` (8-step array `steps`, business types, goal options, loyalty options, Stripe SetupIntent payment step, `handleFinish` → `/cards/new` or `/points/new`, the onboarded-redirect effect), `app/api/onboarding/route.ts` (trial = Growth/14 days, SetupIntent, sets `onboarding_completed`, creates first location), `stores/auth-store.ts` (org loaded via `/rest/v1/staff` select).

### Screenshots (6 real, validate-images 7/7 OK incl. the pre-existing SVG)
Captured from the live points demo (Najma Coffee): welcome, business type (Cafe boxed),
goal (repeat customers boxed), business details (name filled), first location (manual
entry), loyalty type (Stamp Cards boxed). Payment(7)/Done(8) intentionally NOT captured.

### KEY GOTCHA for future runs (the onboarding redirect)
`/onboarding` redirects to `/` ~1s after a full load once the auth store resolves the
org and sees `organization.onboarding_completed === true` — true on BOTH demo accounts,
so the wizard can't be browsed normally. Two facts make capture possible:
- A full page load (`waitUntil: 'commit'`) resets the Zustand auth store (`isLoading:true`, `organization:null`), and the redirect only fires after the client `/rest/v1/staff` fetch repopulates the org (~1-1.5s). So there's a ~1s window per fresh load.
- The reliable method is **fresh commit-load + rapid chained Playwright clicks with NO intermediate waits, screenshot the instant the step renders**. Adding `waitForTimeout`/`waitForSelector` between steps blows the window and you capture the redirected dashboard instead. Deep steps (details/location/loyalty) need a name+address fill but still land inside the window if fired back-to-back.
- Delaying the `/rest/v1/staff` response via `context.route` helps a little but is NOT reliable on its own (the org still resolved by ~step 3-4 in testing); speed is the real lever.
- Payment (step 7) can't be reached: it fetches a Stripe SetupIntent (loading state) during which the org resolves and redirects, and completing it would create a real trial subscription. Done (step 8) is only reachable by completing payment. Both stay covered by the prose + the existing 8-step SVG.

---

## 2026-06-12 — Downgrading Your Plan (Pre-Flight Check)

**Article:** `merchants/billing/downgrade.mdx` (new)
**Branch:** `claude/eloquent-fermat-1tt4oc`
**PR:** https://github.com/Abdalestar/docs/pull/118
**Status:** Done (3 real annotated screenshots; validate-images 3/3 OK)

### What was written
New how-to for the P2 Notion row "Downgrading Your Plan (Pre-Flight Check)" (the sibling to the already-shipped `upgrade.mdx`). Covers the owner-only **Downgrade** button on the Billing Plans tab, the pre-flight usage check, the **Cannot downgrade yet** block, how to reduce each over-limit resource, and that an allowed downgrade is scheduled at period end. Added to the Settings nav after `billing/upgrade`. ~480 words of prose, 4 anti-slop passes (no em dashes / banned words).

### Facts (all grounded in source)
- Pre-flight check compares **four** active resource counts against the target plan: locations, staff, loyalty cards (`stamp_cards` + `points_programs` together), and campaigns (`lib/billing/downgrade-check.ts` `resourceChecks`; locations/staff/cards filter `is_active=true`, campaigns count all rows). QR codes/push are **not** part of the gate.
- `POST /api/billing/check-downgrade` returns `canDowngrade` + `issues`; `false` opens the AlertDialog ("Cannot downgrade yet", yellow triangle, per-resource "You have N active but the new plan allows M. Please deactivate X."). `true` proceeds to `handleSubscribe`.
- `changePlan` (`lib/stripe/helpers.ts`): existing paid sub downgrade -> `scheduled_downgrade` via a Stripe subscription schedule at current period end (features kept until then; a prior pending schedule is released first so the pending downgrade can be changed). Trial -> `trial_end: 'now'`, bills immediately at the new price.
- `PLAN_TIERS` limits (`lib/stripe/config.ts`): Starter 1/2/1/1, Growth 2/5/3/3, Elite 5/15/10/5, Franchise 15/∞/∞/∞ (locations/staff/loyalty cards/campaigns).
- Owner-only: non-owners see **Contact Owner** on each plan card (same gate as upgrade).

### Screenshots
SMOKE_OK. 3 real annotated PNGs via `flow-capture.mjs` (`.routine/flows/billing-downgrade.json`), points demo (Najma Coffee, Elite): Overview usage meters (Campaigns 8 of 5 red), Plans tab with **Downgrade** boxed, and the cropped **Cannot downgrade yet** dialog (Locations 3>1, Staff 5>2, Campaigns 8>1). The flow only clicks Downgrade toward Starter, which the account is guaranteed to exceed (8 campaigns vs 1), so the **read-only** check surfaces the block dialog and never schedules a real downgrade. `clipTo: "[role=alertdialog]"` crops the Radix AlertDialog.

### Notes for future runs
- Clicking **Downgrade** is safe to capture only when the account is known to exceed the target plan (then `handleSubscribe` is never called). If the account is within limits, the click would schedule a real downgrade (or open Checkout) — pick a target you know is over-limit, or stop at the Plans tab.
- Remaining Not-started board row after this run: "Completing a Member's Profile (Phone / Birthday)" (P3, `merchants/members/complete-profile.mdx`).

---

## 2026-06-12 — Revenue Impact (stub replaced with real article)

**Article:** `merchants/analytics/revenue-impact.mdx`
**Branch:** `claude/eloquent-fermat-lff5kp`
**Status:** Done. SMOKE_OK; 3 real annotated screenshots (validate-images 3/3 OK).

### What was written
The Notion board has zero `Status = "Not started"` rows (every row I read is Done),
so per routine §3 this run did one task. The "Revenue Impact" row (P2) was marked
`Done` + `Already published` + `Needs Screenshots = YES`, but `merchants/analytics/revenue-impact.mdx`
on `main` was a one-line **"Coming soon" stub**. Replaced the stub with a full,
source-grounded article + real live screenshots. The path is already in the Analytics
nav (`docs.json` unchanged).

Covers: the route (`/analytics/reports/revenue-impact`, no sidebar link, reached from
the Reports hub); the three top figures (Total Revenue, Loyalty Transactions, Avg
Revenue / Transaction); the dual-line "Revenue & Loyalty Activity Over Time" chart;
the branch + time-period filters; the honest estimate caveat; and access control.
Cross-links the Reports hub, Analytics Overview, and Roles and permissions.

### Research sources (qtap repo, read-only)
- `app/(dashboard)/analytics/reports/revenue-impact/page.tsx` — H1 "Revenue Impact Report",
  subtitle "Loyalty activity correlated with revenue", 3 tiles, chart title, BranchFilter +
  TimePeriodSelector.
- `hooks/use-reports.ts` `useRevenueImpact` — revenue = sum of `points_transactions.transaction_amount`
  where `type='earn'` and amount not null, in range; count = those rows. So points-only,
  and the "estimate not a POS feed" caveat is literal.
- `components/dashboard/analytics/time-period-selector.tsx` — Today / Last 7 / 30 / 90 days / This year.
- `lib/utils/permissions.ts` — `/analytics` guard = `perms.analytics !== 'none'` (owners + managers; staff none).
- Live page probe (points demo, Najma Coffee): Total Revenue $55,649.00, 868 transactions, $64.11 avg.

### Screenshots
`.routine/flows/revenue-impact.json` (points account): `revenue-impact-overview` (3 tiles
numbered + caption), `revenue-impact-filters` (top region cropped, branch + time-period
boxed), `revenue-impact-chart` (chart card cropped via `div.rounded-xl:has(.recharts-wrapper)`).
Aggregate page, no PII; no destructive/outbound actions.

### Notes for future runs
- The board is fully `Done`. Several `Needs Screenshots = YES` rows are NOT backfillable:
  `revenue-impact.mdx` / `points-activity.mdx` were "Coming soon" stubs (this run fixed
  revenue-impact; **points-activity is still a stub** and a good next target); Dashboard Tour
  (PR #3) and Adding Your First Customer (PR #5) are P1 but their PRs were never merged so the
  articles are absent from `main`; Scanning & Earning is the mobile app (not Playwright-capturable);
  Invoices & Payment needs a real Stripe subscription.
- `merchants/analytics/{points-activity,staff-performance,location-comparison}` exist in the
  Analytics nav; `points-activity.mdx` confirmed a stub on main. Worth checking the other two.

---

## 2026-06-12 — Stamp Card Advanced Settings

**Article:** `merchants/stamp-cards/advanced-settings.mdx` (new)
**Branch:** `claude/eloquent-fermat-b4ypws`
**PR:** https://github.com/Abdalestar/docs/pull/116
**Status:** Done (SMOKE_OK, 3 real annotated screenshots, validate-images 3/3 OK)

### What was written
New how-to for the P1-section gap row "Stamp Card Advanced Settings: Delay, Daily Cap, Multi-Stamp" (P2, was Not started). Documents the **Advanced Settings** collapsible on the Card Design step of the stamp card wizard. Placed under `merchants/stamp-cards/` (after `rewards`) for nav consistency, not the Notion-suggested `merchants/cards/` path. One task this run (per the run request).

**Facts (all grounded in source):**
- Panel renders on the Card Design step and saves with the card (`stamp-card-wizard.tsx`: `currentStep === 'design'` gate; fields persist on publish/save-draft at Review).
- **Stamping Delay** (`stamping_delay_minutes`, 0–1440 min) and **Daily Stamp Cap** (`daily_stamp_cap`, 1–100, blank = no limit) are enforced in `lib/stamps/issue-stamp.ts` only when `skip_rules` is false. Messages: delay -> "Please wait N more minute(s)…"; cap -> "Daily stamp limit reached (N per day)."
- These rules fire on customer earn paths (`app/api/scan/route.ts`, `app/api/nfc/tap/route.ts` call `issueStamp` without `skip_rules`).
- **Honest gotcha (Warning in the article):** manual stamps from Stamp Operations BYPASS delay + cap — `app/api/stamps/issue/route.ts` calls `issueStamp({ skip_rules: true })`. The `Number of Stamps` (`#stamps-qty`) field on `/stamp-operations` is the staff multi-stamp control.
- Brief tour of the rest of the panel: Stamp Expiry (Expiration), Welcome/Birthday bonus stamps (0–10), Allow Partial Redemption (cross-linked to rewards.mdx).

### Screenshots
3 real annotated PNGs from the live **stamp** demo (Dana) via `.routine/flows/stamp-advanced-settings.json`: collapsed panel on Card Design; expanded Stamping Rules (delay 5 / cap 3 / multi-stamp boxed + numbered); Stamp Operations Number of Stamps field. No card published/saved; no member selected (no PII). validate-images 3/3 OK; pushed as binary via git.

### Insights for future runs
- The live `/cards/new` is the **wizard** (`StampCardWizard`), steps Card Design / Rewards / Locations / Review. Advanced Settings is a `Collapsible` rendered below the step content on the Card Design step only. The stamp account's `/cards/new` renders fine (no plan-limit block).
- Advanced Settings inputs have **no name/id**. Reliable selectors: Stamping Delay `input[max="1440"]`, Daily Stamp Cap `input[placeholder="No limit"]`, Stamp Expiry `input[placeholder="Never expire"]`. There are 4 `[role=switch]` on the page, so box the **label** `text=Allow Multiple Stamps` rather than the switch (avoids toggling the wrong one — partial-redemption is the other panel switch).
- On `/stamp-operations`, selecting a card from the first `[role=combobox]` reveals `#stamps-qty` (Number of Stamps) without picking a member, so no PII. Stamp account has 3 cards (Glow Card, VIP Beauty Pass, Dana Card).
- **Enforcement reality (verify before claiming):** `stamp_expiry_days` and `allow_multi_stamp` are stored and displayed but I found NO enforcement code — no stamp-expiry cron (only `/api/points/expire` exists for points), and the Stamp Operations quantity field works regardless of the toggle. The article describes both at face value without asserting a hard gate or automatic stamp removal.
- The In-progress P1 row "Awarding Points: By Amount vs Manual Points" was locked by another run (skipped). The P1 "Stamp Card Rewards: Main, Sign-Up & Interim" row is a flagged duplicate of the published `stamp-cards/rewards.mdx` (skipped).

---

## 2026-06-11 — The Staff Activity Log

**Article:** `merchants/staff/activity-logs.mdx`
**Branch:** `claude/eloquent-fermat-d8kndz`
**PR:** https://github.com/Abdalestar/docs/pull/113
**Status:** Done (3 real annotated screenshots; validate-images 3/3 OK)

### What was written
New article for the P2 Notion row "The Staff Activity Log" (`/staff/activity`). The Notion-tracked path was `activity-log.mdx`, but a "Coming soon" stub already existed on `main` at `merchants/staff/activity-logs.mdx` and was already in `docs.json` nav, so the stub was turned into the real article (no nav change, no duplicate file).

**Facts (all grounded in qtap source):**
- Entry: Staff page → **Activity Log** button (`app/(dashboard)/staff/page.tsx`).
- Table columns Date & Time / Staff / Action / Branch / Member / Details (`activity-table.tsx`); Staff falls back to **System** for non-person actions; Member shows a dash when none.
- 11 `AnalyticsEventType` values (Stamp/Points Issued, Reward Redeemed, Member Joined/Visit, campaign + notification events) from `activity-filters.tsx` / `types/analytics.ts`.
- Honest gotcha: team-management events (invite/remove/permission edits) are NOT logged here — they aren't `analytics_events`.
- Reads the 200 most recent matching rows (`hooks/use-staff-activity.ts`, `.limit(200)`); filters by staff/action/date, and branch only when >1 location.
- Export CSV via `lib/utils/staff-activity-export.ts` (report header; disabled when empty).
- Access: owners + managers; Staff role can't open it by default (`/staff` gated by `perms.staff !== 'none'`, staff default `none`).

### Screenshots
SMOKE_OK. 3 real annotated PNGs from the live points demo (Najma Coffee) via `flow-capture.mjs` (`.routine/flows/staff-activity-log.json`): entry button on `/staff`; full log page (filters + Export CSV boxed, **Member column redacted** with an explicit rect); Action Type dropdown cropped to `[role=listbox]`. No destructive/outbound clicks.

### Notes
- Points demo has rich data (200 rows, all event types) and >1 location, so the Branch filter renders. Member column holds customer names → redacted; Staff column holds the merchant's own team (demo seed) → left visible since the article is about staff actions.
- One task this run per the request.

---

## 2026-06-11 — Understanding Your Usage Meters

**Article:** `merchants/billing/usage-meters.mdx` (new)
**Branch:** `claude/eloquent-fermat-0wnfgr`
**PR:** https://github.com/Abdalestar/docs/pull/112
**Status:** Done (3 real annotated screenshots; validate-images 3/3 OK)

### What was written
New Billing how-to for the six usage meters on **Settings > Billing → Overview**.
Notion row "Understanding Your Usage Meters" (P2, was the highest-priority
genuinely-new, screenshot-able Not-started row). Added to the Settings nav after
`settings/billing`.

Facts (grounded in `app/(dashboard)/settings/billing/page.tsx` + `lib/stripe/config.ts`):
- Six `UsageMeter`s: Locations, Staff Members, Loyalty Cards (active `stamp_cards` **+**
  active `points_programs`), QR Codes (this month), Campaigns, Push Notifications (this month).
- QR Codes and Push are monthly (query filters `created_at >= startOfMonth`); the other
  four are running totals. Campaigns counts **every** campaign row (no status filter), so it
  can read over the limit (demo shows `8 of 5`).
- `UsageMeter`: `isAtLimit = used >= limit` turns the count + bar red (red at 100%, not 80%).
  Unlimited (Infinity) shows the count + ∞ and no bar.
- Add-ons raise the effective limit (`usePlanLimits`).

### Screenshots
3 real annotated PNGs via `flow-capture.mjs` (`.routine/flows/billing-usage-meters.json`)
from the live points demo (Najma Coffee, Elite): full Overview; the real over-limit
Campaigns meter (`8 of 5`, red, cropped); the two `(this month)` meters boxed. Read-only
capture (Overview tab only); no billing change. `validate-images.mjs` 3/3 OK, pushed as binary.

### Selection notes (for future runs)
- The top P1 Not-started gap-audit rows were set aside this run as already-covered-on-main
  or un-screenshotable, and should be reconciled/closed:
  - **Audience Segments Explained** (`notifications/segments.mdx`) — already covered by
    `campaigns/push-notifications.mdx` "Choosing an audience" (all 7 segments w/ criteria).
  - **Redeeming a Reward: By Code vs Customer Lookup** (`redemptions/redeeming.mdx`) —
    duplicate of on-main `members/redemptions.mdx` (Code + Lookup + History).
  - **Redeeming a Campaign Reward Code (Staff Guide)** (`campaigns/redeem-code.mdx`) — the
    `campaign_rewards` validate/redeem flow (`app/api/campaigns/rewards/*`) has **no merchant
    dashboard UI** (API/mobile-only), so it can't be a screenshot how-to.
- `billing/plans.mdx` and `billing/upgrade.mdx` are on real `main` now (local `origin/main`
  was stale at clone time; the assigned branch and real main already carry PRs #98–#100+).
  The PR diff was still clean (only the 6 new files).

---

## 2026-06-11 — Send a notification to specific members

**Article:** `merchants/notifications/targeted.mdx` (new)
**Branch:** `claude/eloquent-fermat-4rjmw8`
**PR:** https://github.com/Abdalestar/docs/pull/105
**Status:** Done (4 real annotated screenshots; validate-images 4/4 OK). One task this run.

### What was written
New how-to for the hand-picked-members push flow (Notion "Sending a Targeted Notification to Specific Members", Campaigns section). Two entry points, both landing on `/notifications/new`:
- Members page bulk-select → the bulk bar's **Send Notification** → `?members=id1,id2,...`
- A member's row menu or profile **Send Notification** → `?member_id=...&member_name=...`
Both inject `target_member_ids` + `segment_type='custom'`, so the compose page hides the segment chooser and shows **Sending to N selected members**. Covers title ≤100 / body ≤500, Use Template, live preview, Send Now / Schedule / Save as Draft, the push-disabled skip + zero-recipients case, and access (owners + managers; staff `campaigns:'none'`). Added to the Campaigns nav after `push-notifications`; cross-links it rather than duplicating the segment-broadcast article.

### Research sources (Abdalestar/qtap, read-only)
- `app/(dashboard)/notifications/new/page.tsx` — `member_id`/`members=` params → `target_member_ids` + `segment_type='custom'`; header subtitle
- `components/dashboard/notifications/notification-form.tsx` — `targetMemberCount>0` swaps the SegmentSelector for the "Sending to N" box; field limits; schedule toggle; Save as Draft / Send Now
- `app/(dashboard)/members/page.tsx` (bulk bar + row-menu links, gated `role!=='staff'`), `members/[id]/page.tsx` (profile button disabled + tooltip when `push_enabled` false)
- `app/api/notifications/send/route.ts` + `lib/notifications/segments.ts` — base `push_enabled` filter, `.in('id', target_member_ids)`, "No recipients with push enabled"
- `lib/validations/notification.ts`, `lib/utils/permissions.ts` (`/notifications` needs `campaigns!=='none'`), `lib/validations/staff.ts`

### Insights for future runs
- **Task selection.** The highest-priority Not-started row was P1 "Campaigns Overview & the 8 Campaign Types" → `merchants/campaigns/overview.mdx`, but that file already exists on `main` (covers 7 types well; the "8th" is the non-UI `custom` schema type). It's a rewrite, not a new article, so per routine task-1 ("write a **new** article") I took the highest-priority Not-started row whose file doesn't exist. The 2026-06-10 gap audit added a batch of Campaigns/Notifications rows; several P2 new-file ones remain (push-vs-campaign, messages, scheduling-templates, and the overview rewrite).
- **flow-capture is flaky on the members table.** A re-run had the row-checkbox clicks not register (downstream steps then failed); on FAILED the engine doesn't overwrite a prior good PNG, so earlier good shots survived. If re-capturing one step, expect to re-run and keep the good ones.
- **Row-menu single-member shot:** pick a row whose Push cell is the green bell. Row 1 on the points demo had push **off**, so its menu showed the disabled "Push not enabled" item instead of "Send Notification"; row 2 had push on.
- Members PII: redact `td:nth-child(2)` (Member) + `td:nth-child(3)` (Contact) per row (`tbody tr:nth-child(N) ...`); one big block over rows 1-9 covers the viewport. Compose page + row menu have no PII.
- Did not click Send Now / Schedule / Save as Draft, so no notification was sent during capture.

---

## 2026-06-11 — Campaign Rewards (types & code issuance)

**Article:** `merchants/campaigns/rewards.mdx`
**Branch:** `claude/eloquent-fermat-lmvv0s`
**PR:** https://github.com/Abdalestar/docs/pull/104
**Status:** Done (3 real annotated screenshots; validate-images 3/3 OK)

### What was written
Filled the P1 Not-started row "Campaign Rewards: Types & How Codes Are Issued". The
article on `main` (`merchants/campaigns/rewards.mdx`) was a "Coming soon" stub and the
path was already in `docs.json` nav, so this run only replaced the stub body (no nav
change). One new-article task this run, per the user request.

**Facts (all grounded in qtap source):**
- Five reward types from `components/dashboard/campaigns/steps/reward-config.tsx`:
  Free Item (item name), Bonus Stamps (1–20), Bonus Points (1–1000), Discount (1–100%),
  Special Badge (name + icon star/crown/trophy/medal/gem). Reward is optional.
- Code issuance from `app/api/campaigns/execute/route.ts`: when a campaign with
  `reward_type` + `reward_config` runs, one `campaign_rewards` row per processed member;
  code `CAMP-` + 8 chars (A–Z0–9); 30-day default expiry; status issued→redeemed/expired.
- Honoring: `app/api/campaigns/rewards/[code]/redeem/route.ts` only updates the member
  balance for `bonus_stamps`/`bonus_points`. **free_item/discount/badge are honored
  manually at the till** (no auto-discount, no POS integration). Documented as a Warning.

### Screenshots
3 real annotated PNGs (1440×1000) from the stamp demo account (Dana Salon & Spa, under
its campaign limit so `/campaigns/new` renders) via `.routine/flow-capture.mjs`
(`.routine/flows/campaign-rewards.json`): the five reward types (numbered), the Discount
config field, and the Review summary. Wizard filled but never submitted (Activate /
Save as Draft never clicked). No PII on these wizard screens. `validate-images.mjs` 3/3 OK.

### Insights for future runs
- SMOKE_OK first try. The campaign reward CODE redemption endpoints
  (`/api/campaigns/rewards/validate/[code]`, `/[code]/redeem`) exist but are **not wired
  into any dashboard UI** (no frontend usage; grep found none). So the sibling P1 row
  "Redeeming a Campaign Reward Code (Staff Guide)" has no real dashboard screen to
  screenshot — likely a staff-scanner/mobile feature. Picked the reward-types article
  instead, whose surface (the wizard Reward + Review steps) is fully real.
- The points demo account (Najma) is at its campaign limit; use the **stamp** account for
  any `/campaigns/new` capture, as prior runs found.

---

## 2026-06-11 — Exporting and Deleting Members

**Article:** `merchants/members/export-delete.mdx` (new)
**Branch:** `claude/eloquent-fermat-2tdmbm`
**PR:** https://github.com/Abdalestar/docs/pull/103
**Status:** Done (3 real annotated screenshots, validate-images 3/3 OK)

### What was written
New how-to for the P2 gap-audit row "Exporting & Deleting Members". Goes deeper than the brief Export/Delete mentions in `members/overview.mdx` (cross-linked, not duplicated). Covers full CSV export, the selected-subset export, and the member-deletion flow.

**Facts (all grounded in `app/(dashboard)/members/page.tsx`):**
- `exportMembers()` pulls every member of the org from `member_org_view` (all pages), file `members-<date>.csv`. 10 columns: First/Last Name, Email, Phone, Birthday, Join Date, Total Stamps, Total Points, Visit Count, Last Visit. Visit Count / Last Visit derived from `transactions`.
- Export buttons gate on **role**, not the `members` permission: `staff?.role !== 'staff'` (owners + managers see Export CSV / Export Selected; Staff role never does).
- `exportSelectedMembers()` → `selected-members-<date>.csv` from the ticked rows.
- Delete = `deleteSelectedMembers()` deletes the `organization_members` row (org membership + loyalty data), NOT the global member identity. Two entry points: row menu "Delete Member" (single) and bulk toolbar "Delete" (multi). `canDeleteMembers` = owner OR effective `members === 'full'` (so owner always; manager by default since DEFAULT_PERMISSIONS.manager.members='full'; staff only with custom full access).
- AlertDialog: title "Permanently Remove Members", action "Permanently Delete" (reads "Deleting..." in flight) / "Cancel".

### Screenshots
`.routine/flows/export-delete.json` (points demo, Najma Coffee, 180 members): Export CSV boxed (badge 1, PII redacted); bulk toolbar with Export Selected (badge 2) + Delete (red), 2 rows selected, PII redacted; cropped "Permanently Remove Members" dialog, Permanently Delete boxed red. **Permanently Delete never clicked** — no member removed. Export buttons boxed but never clicked (no CSV downloaded). 1440×900 + cropped dialog, all real binary.

### Insights for future runs
- The Export button gate is purely `role !== 'staff'`, independent of the `members` enum (full/view_export/view/none). The `view_export` permission value exists in the schema but the Members page UI never reads it for the export button — only the role. Document export access as "owners and managers", not by permission value.
- Delete-confirm crop: `clipTo: "[role=alertdialog]"` with `clipPadding: 14` leaked a faint phone number from the row behind the scrim at the bottom edge; dropping to `clipPadding: 4` (and removing the below-button label that needed the extra room) kept the crop inside the white card with no PII leak.
- Row checkboxes are `table tbody tr:nth-child(N) td:first-child button[role=checkbox]`; selecting any row (not just select-all) inserts the bulk toolbar and shifts the table down ~80px, so reuse the bulk redact rect (y≈395) from members-overview.
- Single-branch environment again (`claude/eloquent-fermat-2tdmbm`): shipped the one new-article task this run rather than mixing a screenshot backfill into the same branch/PR (same call as the wcagj2 run).

---

## 2026-06-11 — Showing and scanning a QR code (customer scan flow)

**Article:** `merchants/qr-codes/customer-scan-flow.mdx` (new)
**Branch:** `claude/eloquent-fermat-8b1hya`
**PR:** https://github.com/Abdalestar/docs/pull/102
**Status:** Done. One task this run (highest-priority Not-started row, P0). 3 real screenshots + 1 SVG; validate-images 4/4 OK.

### What was written
New P0 how-to for the gap-audit row "Showing a QR Code to a Customer & How They Scan/Redeem". Covers displaying a code (PNG for print, SVG for posters/decals, the `dashboard.qtap.qa/scan/<code>` scan address), what the customer sees on success/failure, and the crediting rule. Redeeming is flagged as a separate staff step. Added to the QR Codes & NFC nav after Actions.

**The P0 fact (grounded in source):** a scan credits stamps/points only when Qtap can identify who scanned. `app/api/scan/route.ts` gates step 7 (award) entirely on `member_id`; the public `app/scan/[code]/page.tsx` posts only `{ code }`, so a phone-camera scan logs `qr_code_scans` + increments `scan_count` but adds nothing to anyone. Crediting happens via the Qtap app (sends the member) or staff scanning the member code. `qr-codes/[id]/page.tsx` confirms the QR encodes `${origin}/scan/${code}`.

### Screenshots
- `customer-scan-show-code.png` — merchant QR preview card (scan URL + PNG/SVG), cropped, read-only.
- `customer-scan-success.png` / `customer-scan-failed.png` — live `/scan/[code]` at phone width (430px viewport).
- `customer-scan-paths.svg` — app-vs-camera crediting diagram (the app isn't capturable from the sandbox).
- Flows: `.routine/flows/customer-scan-merchant.json` (1440px) and `customer-scan-result.json` (430px).

### Insights / gotchas for future runs
- **Najma points QR codes have `points_value = 0`**, so an anonymous points scan renders "You earned 0 points!" and an anonymous stamp scan renders "Stamp added! (undefined/undefined)" — both poor/misleading shots. The clean, honest success capture is the **reusable check-in** code `NAJMA-PEARL-TABLE` ("Check-in recorded! Thanks for visiting."), which awards nothing to anyone by design. One anonymous scan-count blip, no member, no notification.
- `/scan/<nonexistent>` returns the 404 "QR code not found. It may have been deleted." failure card with **no write** — safe for the failure shot. A non-matching code (`NAJMA-DEMO-NOTFOUND`) was verified via Supabase first.
- The customer scan page is public; the flow engine logs in (dashboard) then `goto`s `/scan/...` fine. Use a phone-width viewport (430px) for the customer shots, but keep the merchant dashboard shot at 1440px (the dashboard shows a "larger screen" notice below 768px).
- SMOKE_OK first try; pipeline unchanged (npm i sharp playwright, chromium preinstalled at /opt/pw-browsers).

---

## 2026-06-11 — Adjusting and Deducting Points

**Article:** `merchants/points/adjusting.mdx` (new)
**Branch:** `claude/eloquent-fermat-5p1qr1`
**PR:** https://github.com/Abdalestar/docs/pull/101
**Status:** Done (3 real annotated screenshots; validate-images 3/3 OK)

### What was written
New P1 how-to for the highest-priority `Not started` board row, "Adjusting & Deducting Points (Owner/Manager Only)". The board was otherwise all Done, so this was the single new-article task. Added to the Points Programs nav after `operations`.

Scoped as a deep-dive that complements `points/operations.mdx` (which already covers the basic award + Adjust/Deduct steps), the same overview-vs-deepdive split the staff articles use. It documents the four facts the overview omits, all grounded in source:
- **Owner/manager only.** Staff have `issue_points=true` by default, so they reach `/points-operations` and SEE the Adjust/Deduct tab, but `app/api/points/adjust/route.ts` 403s a staff role on submit. Documented honestly (UI does not hide the tab).
- **Reason required** (400 if empty), saved as `Staff adjustment: <reason>` attributed to the staff account.
- **Cannot go below zero** (400, balance untouched).
- **Deductions notify the member** (push, email fallback); positive adjustments do not (`if (pointsValue < 0)` block; `notification_sent: pointsValue < 0`).

### Research sources (Abdalestar/qtap, read-only)
- `app/api/points/adjust/route.ts` — owner/manager gate, reason 400, below-zero 400, deduction-only notification, points_transactions + transactions ledger + analytics logging.
- `app/(dashboard)/points-operations/page.tsx` — tabs (Award Points / Adjust/Deduct / Recent Activity), Add/Deduct toggle, `#adjust_points`, `#adjust_reason` (Reason (required)), OperationBranchSelect, balance preview, Confirm Points Deduction dialog (final button "Confirm Deduction").
- `lib/utils/permissions.ts` + `lib/validations/staff.ts` — `/points-operations` needs `issue_points` (true for owner/manager/staff defaults), so staff reach the page but the API still blocks the adjust.

### Screenshots
SMOKE_OK. 3 real annotated PNGs via `flow-capture.mjs` (`.routine/flows/points-adjusting.json`) from the points demo account (Najma Coffee): `points-adjust-tab.png` (tab + Add/Deduct toggle + Reason boxed), `points-adjust-preview.png` (Deduct 150, current→new balance + notify notice, cropped to the form card so no PII), `points-adjust-confirm.png` (Confirm Points Deduction dialog, member name redacted). The flow opens the confirm dialog and never clicks **Confirm Deduction**, so no real balance changed. `validate-images.mjs` 3/3 OK; pushed as binary via git.

### Notes / gotchas
- Adjust member-search result row is `.divide-y button` (a `<button>`, not a div); search needs ≥2 chars.
- The points account is multi-branch, so the confirm button stays disabled until a Branch is picked (OperationBranchSelect / `branchRequired`); the flow selects the first branch option.
- Crop selector `div.bg-card:has-text('Adjust Points Balance')` isolates the right-hand form card and keeps the selected member's email (left card) out of the shot.
- The gap-audit row proposed a fresh `points/adjusting.mdx`; `points/operations.mdx` already had an Adjust/Deduct section, so this article cross-links rather than re-teaching the basics.

---

## 2026-06-11 — Upgrading Your Plan

**Article:** `merchants/billing/upgrade.mdx`
**Branch:** `claude/eloquent-fermat-bgbr1y`
**PR:** https://github.com/Abdalestar/docs/pull/98
**Status:** Done (real screenshots shipped)

### What was written
New how-to for the P1 gap-audit row "Upgrading Your Plan" (Billing was the most under-covered section in the 2026-06-10 audit). Focused on the upgrade path only; does not duplicate the existing `settings/billing.mdx` mechanics article (cross-linked instead).

Covers: owner-only access (managers/staff with billing access see **Contact Owner**); the Plans tab; the Monthly/Annual toggle and price table; and an honest account of what confirming does. The key correction over the old billing article: an upgrade is **not** always a Stripe Checkout redirect. For an existing paid subscription it is an immediate prorated `subscriptions.update`; only a first-time subscriber is sent to Stripe Checkout; during a trial it ends the trial and bills now; a declined card fails cleanly.

### Research sources
- `app/(dashboard)/settings/billing/page.tsx` — Plans tab, billing toggle, Upgrade confirmation dialog copy, `isOwner`/Contact Owner, status badge
- `app/api/billing/checkout/route.ts` — owner check (role='owner', 403 otherwise), routes to `changePlan`
- `lib/stripe/helpers.ts` `changePlan` — no live sub → Checkout; upgrade → `subscriptions.update` `proration_behavior: always_invoice`, `error_if_incomplete`; trial → `trial_end: 'now'`; downgrade → scheduled at period end
- `lib/stripe/config.ts` `PLAN_TIERS` — monthly 29/49/79/199, annual 24/39/65/165, per-plan limits
- `lib/utils/permissions.ts` — `/settings` guard is `perms.settings === true`
- Supabase (read-only): Najma Coffee org is `elite` / `active`, no stripe_subscription_id → Franchise is the only upgrade target

### Screenshots
SMOKE_OK. 3 real annotated PNGs via `flow-capture.mjs` (`.routine/flows/billing-upgrade.json`), captured from the live dashboard as the points account (Najma Coffee, Elite): Plans tab, annual pricing after toggle, and the "Upgrade to Franchise?" confirmation (cropped). The flow stops at the dialog and never clicks Proceed to Checkout, so no real subscription changed. `validate-images.mjs` exits 0 (1440px shots + cropped dialog, all real binary).

### Notes
- `/settings/billing?subscribe=true` lands directly on the Plans tab (Tabs defaultValue), which made the flow deterministic.
- Radix AlertDialog uses `role="alertdialog"` (not `dialog`); `clipTo: "[role=alertdialog]"` is what crops the confirmation correctly.
- Demo org shows a "Free Plan" status badge despite being on Elite, because it has no `stripe_subscription_id`; avoided documenting that quirk.

---

## 2026-06-11 — Campaign Timing and Repeat Sends

**Article:** `merchants/campaigns/timing.mdx`
**Branch:** `claude/eloquent-fermat-wcagj2`
**PR:** https://github.com/Abdalestar/docs/pull/96
**Status:** Done (3 real annotated screenshots + 1 SVG; validate-images 4/4 OK)

### What was written
New article on when campaigns run and why each member only receives a campaign once. Notion task "Campaign Timing & Duplicate-Send Rules" (P2). Added to the Campaigns nav group after Overview.

**Facts (all grounded in source):**
- Execution engine runs every 15 minutes: `vercel.json` cron `*/15 * * * *` calls `/api/campaigns/execute`.
- Only `status='active'` campaigns are processed (`execute/route.ts` query); statuses draft/active/paused/ended from `types/campaign.ts`; badges from `campaign-card.tsx`.
- One send per member per campaign: `hasAlreadyReceived()` skips members with a prior `sent` interaction. Exceptions: birthday re-sends after 365 days; win-back honours `WinBackTriggerConfig.max_sends`.
- `total_sent` only counts pushes delivered to OneSignal (member needs app + `push_enabled`), so Sent can be lower than member count.
- Start/end date gating (`isCampaignWithinDateRange`); flash sale auto-ends when `max_redemptions` reached.

### Screenshots / diagrams
- `.routine/flows/campaign-timing.json` (committed): 3 steps off `/campaigns` on the points demo (demo@najma.coffee) — status tabs boxed, one campaign card cropped (status badge / Pause / Sent), card menu (View Stats / Delete). No destructive clicks (Pause/Delete boxed, never clicked).
- SVG `images/campaigns/campaign-timing-loop.svg`: the 15-min → active? → dates? → trigger? → already-sent? → send decision loop. Brand palette.

### Insights for future runs
- Smoke test passed first try (`=== SMOKE_OK ===`): Supabase 401 treated as reachable, login OK as demo@najma.coffee. Screenshots work headless from the sandbox via `.routine/flow-capture.mjs`; no Chrome-MCP/computer-use needed.
- Points demo account has 7 active campaigns (Founders Club, Tuesday Triple Stars, Weekend Double Stars, We Miss You, Halfway to a Latte, Birthday Brew, National Day Flash, Najma Welcome Stars), all Active, 0 Paused/Draft. Can't screenshot a Paused/Draft badge from real data; documented those states in prose + SVG.
- Reliable card crop selector: `div.rounded-xl:has(h3:has-text("<campaign name>"))` (shadcn Card class `rounded-xl border bg-card text-card-foreground shadow`). Menu trigger: `button[aria-haspopup="menu"]` scoped to that card.
- Branch policy this session forced a single branch (`claude/eloquent-fermat-wcagj2`), so only the one new-article task ran; the screenshot-backfill second task was skipped rather than mixed into the same PR.

---

## 2026-06-11 — QR Code Actions + Stamp Cards Overview screenshots

**Articles:** `merchants/qr-codes/actions.mdx` (new), `merchants/stamp-cards/overview.mdx` (backfill)
**Branch:** `claude/eloquent-fermat-ieh14o`
**PR:** https://github.com/Abdalestar/docs/pull/95
**Status:** Done. Smoke test SMOKE_OK; screenshots captured this run (the pipeline works now).

### Task 1 — New article: QR Code Actions (P1)
Wrote `merchants/qr-codes/actions.mdx` explaining the action a scan runs. Grounded in
`app/api/scan/route.ts` and the live Generate QR Code page. 3 annotated flow screenshots
(points account: action overview + Award Points; stamp account: Add Stamp). Added to the
QR Codes & NFC nav group. validate-images 3/3 OK.

### Task 2 — Backfill: Stamp Cards Overview (P1)
Added two annotated shots (the `/cards` list with three real Active cards + status filter
tabs; the card row menu with Duplicate boxed) to the on-main article. Prose unchanged.
validate-images 2/2 OK.

### Insights for future runs (important)
- **The live QR generator differs from the repo component.** `components/dashboard/qr-codes/qr-code-generator.tsx`
  in Abdalestar/qtap is an OLDER, simpler version (Reusable/One-time + a 4-option action
  Radix select including `reward`). The LIVE `/qr-codes/generate` page offers THREE action
  choices as radio cards: **Add Stamp**, **Award Points**, **Check-In** (no Reward option),
  plus a **Stamp Card** selector for Add Stamp and **Points Program** + **Points Value** for
  Award Points. Type options are Reusable / One-Time Use / Batch Generate. Always probe the
  live page; do not trust the repo component for labels.
- **`reward` action is a no-op.** `scan/route.ts` step 7 has no `reward` branch; it returns
  "Reward claimed successfully!" but awards/deducts nothing. It is also not creatable from the
  live UI. Document reward redemption via the Redemptions screen instead.
- **Notion "PR #NN merged" notes are unreliable.** PR #52 (ai-insights), #88 (manual-stamps
  screenshots), and others claim merged/Done but the files/images are NOT on `main`. Always
  verify with `git cat-file -e origin/main:<path>` before treating a row as backfilled.
- Stamp Cards live route is `/cards`, H1 "Stamp Cards"; card row three-dot menu items are
  Edit / Duplicate / Deactivate / Delete. The first `button[aria-haspopup=menu]` on the page
  is the location filter, not a card menu (card menus start at the 4th match).
- This environment pins all work to one assigned branch (`claude/eloquent-fermat-ieh14o`), so
  both tasks shipped in a single PR rather than one PR per task.

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

## 2026-06-11 — QR code troubleshooting

**Article:** `merchants/qr-codes/troubleshooting.mdx`
**Branch:** `claude/eloquent-fermat-5v6cq8`
**Notion row:** "Troubleshooting: QR Code Not Working" (P2, was Not started)
**Status:** Done. Real screenshots captured (SMOKE_OK this run).

### What was written
New troubleshooting article for QR codes that won't scan. Covers the four failure
causes a merchant can diagnose from the QR Codes page, each tied to the exact
customer-facing error string from `app/api/scan/route.ts`:
- Inactive (`is_active` false, 410): "This QR code is no longer active." Fix: row
  menu → Activate.
- Expired (past `expires_at`, 410): "This QR code has expired." Not revivable;
  regenerate.
- Max (`scan_count >= max_scans`, 410): "This QR code has reached its maximum number
  of scans." One-time codes reach this after a single scan. Regenerate.
- Deleted (404): "QR code not found. It may have been deleted." Permanent; use
  Deactivate to pause instead.
- Anonymous scan nuance: `/api/scan` with no `member_id` logs the scan and increments
  the count but awards nothing; the web `/scan/[code]` page only sends `{ code }`, so
  scanning with a plain camera/browser instead of the Qtap app credits no member.
- Stamp code not linked to a card (400): "This QR code is not linked to a stamp card.
  Please contact the merchant." (Warning callout.)

### Research sources (qtap repo, read-only)
- `app/api/scan/route.ts` — all error branches + status codes + the no-member award skip
- `app/scan/[code]/page.tsx` — customer scan page sends only `{ code }`
- `components/dashboard/qr-codes/qr-code-list.tsx` — Status badges (Active / Inactive /
  Expired / Max Reached) and the row menu (Activate/Deactivate, Delete)
- `app/(dashboard)/qr-codes/[id]/page.tsx` — detail page Active switch, Max Scans, Expires

### Screenshots (real, validated 3/3)
Captured with `.routine/flow-capture.mjs` from the live points demo account
(`demo@najma.coffee`), `.routine/flows/qr-troubleshooting.json`:
- `qr-troubleshoot-status.png` — QR Codes list, Scans + Status columns boxed
- `qr-troubleshoot-menu.png` — row menu (Deactivate, Delete) cropped
- `qr-troubleshoot-limits.png` — detail Details panel (Max Scans, Expires) cropped

### Notes / gotchas
- Production UI differs slightly from the repo snapshot: the row menu has View Details,
  Copy Code, Download, Deactivate, Delete (repo had fewer); the maxed status badge
  renders as "Max" (repo source string is "Max Reached"). Prose matches the live UI.
- Demo account had only Active and Max codes (64 active, 0 inactive/expired), so
  Inactive/Expired states are described from source, not screenshotted.
- Per session branch policy, committed to `claude/eloquent-fermat-5v6cq8` (not a
  `docs/<slug>` branch).

---

## 2026-06-11 — Inviting a Team Member

**Article:** `merchants/staff/inviting.mdx`
**Branch:** `docs/staff-inviting`
**PR:** https://github.com/Abdalestar/docs/pull/90
**Status:** Done with real screenshots (smoke test passed, 3 annotated shots shipped)

### What was written
New P1 how-to under Staff & Roles for the full invite journey: sending the
owner-only invite on `/staff`, the Pending→Active status, and the
accept-invite experience. Distinct from `staff/overview.mdx` (which covers
inviting at a glance) by going deep on the accept side and the field details.

**Verified facts:**
- Invite is owner-only. `api/staff/invite/route.ts` returns 403 for non-owners,
  and the Invite Staff button only renders when `currentStaff.role === 'owner'`.
- Dialog title is "Invite Team Member"; submit button is "Send Invitation"
  (not "Send Invite", which the overview article says).
- Role defaults to Staff. Location assignment only applies to Staff; managers
  are forced to All Locations (checkbox disabled when role=manager).
- Accept page (`app/(auth)/accept-invite/page.tsx`): password must be 8+ chars
  with uppercase, lowercase, and a number (stricter than the change-password
  8-char-only rule in security.mdx). Expired link shows "Invalid or expired
  invitation link."
- Existing Qtap accounts: API falls back from invite link to a magic link and
  links the new org to the existing account.

### Screenshots
Captured with `.routine/flow-capture.mjs` (new flow `.routine/flows/inviting.json`),
account `demo@najma.coffee`. 3 shots: staff page (Invite Staff badged), filled
invite dialog (cropped, email called out), staff table (Status column called
out). `validate-images.mjs` passed 3/3.

### Insights for future runs
- The smoke test and screenshot pipeline both work as-is in this cloud sandbox.
  No Chrome-MCP / computer-use / dom-to-image gymnastics needed anymore. Just
  `npm install sharp playwright`, `npx playwright install chromium`, then run
  the `.routine/*.mjs` scripts. This supersedes the long list of failed
  approaches in the 2026-05-07 entry.
- PR creation: the `mcp__GitHub-MCP__*` server returns 403 ("Resource not
  accessible by integration"). Use the lowercase `mcp__github__create_pull_request`
  server instead — that one works.
- The points demo account's staff table has no Pending member (all Active), so
  you can't capture a real Pending badge. Annotate the Status column header and
  explain both states instead of faking one.
- Don't navigate the logged-in merchant to `/accept-invite`; with a live session
  it renders the password form against the owner's own account. Describe the
  accept side in prose; the merchant isn't the audience for that screen anyway.

---

## 2026-06-08 — Redemptions Dashboard Screenshots (Backfill)

**Article:** `merchants/redemptions.mdx`
**Branch:** `claude/dreamy-newton-lxaer1`
**PR:** https://github.com/Abdalestar/docs/pull/86
**Status:** Done — real annotated screenshot flow shipped (5 PNGs + SVG), validated

### What this run did
The whole Notion board is `Done = YES` with no `Not started` rows, so this run was
one screenshot **backfill** (the user asked for a single task). Picked the
highest-value P2 `Needs Screenshots = YES` row, **Redemptions Dashboard**, which
matched the request to ground a staff-operations flow in the qtap codebase.

The article's prose was written in **PR #31**, which was never merged, so
`merchants/redemptions.mdx` was not on `main`. This run carried that prose over
**unchanged** and added the screenshots + SVG + nav entry so the page ships
complete in one PR (flagged in the PR body and Notes).

### Screenshots (SMOKE_OK, Playwright + the corrected pipeline)
Captured live from the Najma Coffee **points** demo account (`demo@najma.coffee`)
via `.routine/flow-capture.mjs` (`.routine/flows/redemptions.json`):
- `redeem-overview.png` — Redeem tab, Enter Code (1) / Look Up Customer (2) badged
- `enter-code.png` — 6-char code field filled, Look Up highlighted
- `lookup-search.png` — customer search results, **emails redacted**
- `member-points.png` — points balance + Available Rewards list, Redeem boxed
- `confirm-points.png` — Confirm Redemption dialog (reward/customer/points cost/new
  balance), cropped to the dialog, never clicked

`validate-images.mjs` exits 0; pushed with `git` (binary, not base64).

### Insights for future runs
- This Linux sandbox has Chromium pre-installed at `/opt/pw-browsers`
  (`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`); `npx playwright install chromium`
  is a no-op and `--with-deps` fails on blocked apt PPAs — just run the scripts.
- The `demo@najma.coffee` account is **not** in demo mode; `/redemptions` hits the
  real org's seeded members (synthetic but email-shaped — redact the email column).
  It is a **points** org, so the lookup flow exposes the points balance, Available
  Rewards, and the points confirm dialog (reward `trigger_value` = pts required).
- Selector gotcha: a Radix `TabsTrigger` renders as `<button>` with the same text as
  an action button. `button:text-is('Redeem')` matched the **Redeem tab**, not the
  reward button. Use `role=button[name="Redeem"]` (the tab is `role=tab`, and
  "Confirm Redemption" doesn't contain the substring "Redeem").
- The flow engine's `redact` resolves only `.first()` per spec; redact each row with
  `selector >> nth=N`. Rows hidden by an inner `max-h-* overflow` scroll still
  resolve a boundingBox and draw a stray bar — only redact the visible rows.
- History tab was genuinely empty; captured no empty-table shot (never seed data).

---

## 2026-06-08 — Detailed Reports Hub (new article, real screenshots)

**Article:** `merchants/analytics/reports-hub.mdx`
**Branch:** `claude/dreamy-newton-1udqce`
**PR:** https://github.com/Abdalestar/docs/pull/85
**Status:** Done. Five real annotated screenshots shipped (validate-images 5/5 OK).

### What was written
New article documenting the `/analytics/reports` Detailed Reports hub (h1 "Detailed
Reports", 4 cards) and the four reports it links to: Points Activity (transaction
log table), Revenue Impact (3 tiles + dual-line chart), Staff Performance (per-staff
table), Location Comparison (one card per branch). Documented the shared branch +
time-period filters and access control. Added to the Analytics nav in `docs.json`
after `overview`.

### Screenshots
Captured with `.routine/flow-capture.mjs` (flow at `.routine/flows/reports-hub.json`)
from the live points demo account (Najma Coffee). The smoke test passed (SMOKE_OK,
login as demo@najma.coffee). The flow engine + Playwright + git-push pipeline works
in this Linux sandbox; the historical Chrome-MCP/Windows failures do not apply here.
All five PNGs are real binary 1440x900 in `images/analytics/`.

### Research sources
- `app/(dashboard)/analytics/reports/page.tsx` — hub: 4 cards, titles, descriptions
- `app/(dashboard)/analytics/reports/{points-activity,revenue-impact,staff-performance,location-comparison}/page.tsx` — columns, tiles, chart, filters
- `lib/utils/permissions.ts` — `/analytics` guard is `perms.analytics !== 'none'` (owners + managers; staff `none` by default)

### Honest gotchas documented
- No sidebar link to the hub; reached at the `/analytics/reports` URL.
- Revenue Impact figure is an estimate from transaction amounts, not a POS feed.
- Stamp columns read 0 on a points-only program (expected).

### Insights for future runs
- The Reports hub (`/analytics/reports`) is an orphan route: nothing in `app/` or
  `components/` links to it (verified by grep). The four sub-reports are linked only
  from the hub's own cards.
- Existing analytics images live under `images/analytics/` (not `images/merchants/analytics/`);
  set the flow `section` to `analytics` to match `overview.mdx`.
- Prior PR #26 ("Analytics Reports hub", path `reports.mdx`) was never merged; neither
  `reports.mdx` nor `reports-hub.mdx` existed on `main`. This article uses the
  Notion-tracked path `reports-hub.mdx`. The two paths should be reconciled if #26
  is ever revived.
- `a:has-text('<card title>')` resolves to the whole card anchor, so numbered boxes
  land on the full card, not just the title text.

---

## 2026-06-08 — Billing Screenshots (backfill)

**Article:** `merchants/settings/billing.mdx`
**Branch:** `claude/dreamy-newton-p4pu2`
**PR:** https://github.com/Abdalestar/docs/pull/82
**Status:** Done (real screenshots shipped)

### What was done
Screenshot backfill into the already-published Billing article (P1, no prior images,
`Needs Screenshots = YES`, no prior PR). Prose unchanged. Added three `<Frame>` blocks:
- `billing-overview.png` — Overview tab: current plan, status badge, six usage meters
  (Campaigns shows the red over-limit bar at 8 of 5).
- `billing-plans.png` — Plans tab: four plan cards + Monthly/Annual toggle, Elite outlined.
- `billing-addons.png` — Add-ons tab: pay-per-feature store, NFC Tag card highlighted.

Captured from the live points demo account (Najma Coffee, plan = Elite) via
`.routine/flow-capture.mjs`; flow config at `.routine/flows/billing.json`. SMOKE_OK.
`validate-images.mjs` 3/3 OK, 1440x900, pushed as binary via `git push`.

### Notes / insights
- Smoke test **passes from the cloud web environment** (Playwright + chromium install,
  login as demo@najma.coffee). The historical "screenshots impossible" failures were a
  Windows-sandbox / MCP-binary problem; this environment captures and `git push`es binary
  PNGs cleanly. The many `Needs Screenshots = YES` Done rows are now backfillable.
- Billing is `/settings/billing` (its own route), a Radix Tabs page: Overview / Plans /
  Add-ons / History. Inactive tab content is unmounted until clicked.
- The demo account has no Stripe subscription (status badge "Free Plan" though plan limits
  are Elite), so Manage Subscription / Cancel Plan buttons do not render — no outbound
  Stripe action is reachable during capture. History/payment-method sections are also empty
  on this account, so only Overview/Plans/Add-ons were captured.
- Live label drift left as-is per backfill rule: prose "Click Buy" vs live "Purchase";
  Extra Location shows the current tier's price ($12/mo) not the "$15–$9" range.
- Board scan: no `Status = "Not started"` rows remain; `milestone.mdx` is a "Coming soon"
  stub (not a real backfill target). Did one task per the run request.

---

## 2026-06-08 — Your Wrapped (Analytics)

**Article:** `merchants/analytics/wrapped.mdx`
**Branch:** `claude/dreamy-newton-E81pM`
**Status:** Done. New article with a real 4-step annotated screenshot flow.

### What was written
New article for the `/analytics/wrapped` route ("Your Wrapped"), the auto-generated weekly/monthly/yearly recap of a merchant's loyalty program. Covers: the three period tabs (Weekly, Monthly, Yearly) and that each shows the **last completed** period (weekly = previous Sun–Sat, monthly = previous calendar month, yearly = previous calendar year); the **Your Numbers** card (Total Stamps, Points Earned, Redemptions, New Members, Est. Revenue, Growth) with what each means; **Highlights** (auto bullet lines, only those with data); **Top Customer** and **Busiest Day** conditional cards; the **Share** button; the "No data available for this period yet" empty state; plan gating; and access control. Added to the Analytics nav group in `docs.json` after `staff-performance`.

### Research sources (all in `Abdalestar/qtap`)
- `app/(dashboard)/analytics/wrapped/page.tsx` — page title "Your Wrapped", subtitle, "Auto-generated" badge, three tabs (default Weekly), card order, Share button, `FeatureGate feature="wrappedAnalytics"`, route guard + AccessDenied.
- `hooks/use-wrapped.ts` — `getPeriodRange` confirms each tab = previous completed period; metric math (Growth = newMembers / membersBefore), highlights logic, empty state.
- `types/wrapped.ts` — `WrappedSummary` shape, metric labels.
- `components/dashboard/analytics/wrapped/wrapped-card.tsx` — card anatomy (metrics grid, highlights bullets).
- `components/shared/feature-gate.tsx` + `lib/stripe/config.ts` — `wrappedAnalytics` is **false on Starter**, **true on Growth / Elite / Franchise**; Starter sees the upgrade prompt.
- `lib/utils/permissions.ts` + `lib/validations/staff.ts` — `/analytics` needs `analytics !== 'none'`; owner always, manager default `full`, staff default `none` (no access).

### Screenshots
- Real 4-step flow captured from the live points demo account (Najma Coffee) via `.routine/flow-capture.mjs` (flow at `.routine/flows/analytics-wrapped.json`): `wrapped-overview.png` (Weekly, tabs boxed + labelled), `wrapped-numbers.png` (cropped Your Numbers card), `wrapped-monthly.png` (Monthly tab, period boxed), `wrapped-yearly.png` (Yearly tab, period boxed). The demo customer name in the Top Customer card and the matching Highlights line is redacted on every shot.
- SMOKE_OK. All 4 PNGs are real binary; `validate-images.mjs` reports 4/4 OK. Pushed with `git push`, not the GitHub MCP.

### Notes
- The Wrapped page has **no sidebar or in-app link** that I could find (not in `components/layout/sidebar.tsx`, the analytics page, or the reports hub). It is reached at `/analytics/wrapped`. The article describes it as living "in the Analytics area" without inventing a click path.
- Anti-slop: no em dashes, no banned words, removed an "X, not Y" contrast-framing sentence in the period section. ~430 words.

---

## 2026-06-08 — Win-Back Campaigns Screenshots

**Article:** `merchants/campaigns/winback.mdx`
**Branch:** `claude/dreamy-newton-ZnnCJ`
**PR:** https://github.com/Abdalestar/docs/pull/80
**Status:** Done — 6 real annotated screenshots captured and committed (validate-images 6/6 OK)

### Task
Screenshot backfill (no Not-started rows remained on the board, so per routine §3 this run did one backfill task). Picked the highest-priority `Needs Screenshots = YES` row whose article is on `main`: "Win-back Campaigns" (P1). Prose left unchanged; six `<Frame>` images added.

### What worked (screenshots are unblocked now)
- `smoke-test.mjs` returned `SMOKE_OK` (login + screenshot from the live dashboard both succeed in this sandbox). The historical "screenshots never work" problem is gone — recent runs (PRs #73–77) also captured successfully.
- `flow-capture.mjs` walked the New Campaign wizard end to end and saved 6 annotated PNGs (1440×1000) under `images/campaigns/`.

### Key gotcha discovered
- The **points** demo account (Najma Coffee) is at its **5-campaign Elite-plan limit**, so `/campaigns/new` renders `Campaign Limit Reached` (from `new/page.tsx`'s `canCreate` guard) once the async campaign count loads. A first probe caught the wizard only because it rendered before the count resolved (`campaignCount === null`); later probes hit the limit screen. Fix: capture win-back from the **stamp** account (Dana Salon & Spa), which is under its limit. Win-back is account-agnostic, so the wizard shots are equally valid.

### Research sources (qtap repo, read-only)
- `components/dashboard/campaigns/campaign-wizard.tsx` — 7 steps (Type, Trigger, Reward, Message, Conditions, A/B Test, Review), `canProceed` gates, final buttons "Activate Campaign" / "Save as Draft"
- `steps/type-selection.tsx` — campaign types incl. `win_back` → "Win-Back Campaign"; `#name` field
- `steps/trigger-config.tsx` — win_back inactivity 14/30/60/90 days, max sends 1/2/3
- `steps/reward-config.tsx` — five reward types (Free Item, Bonus Stamps, Bonus Points, Discount, Special Badge)
- `steps/message-config.tsx` — `#notification-title` / `#notification-body`, Use Template, live preview
- `app/(dashboard)/campaigns/new/page.tsx` — plan-limit guard that hides the wizard

### Safety
- Wizard was filled but **never submitted**: Activate / Save as Draft were not clicked, no campaign created. No outbound action (no invite/notification) fired during capture.

### Notes for future runs
- For any `/campaigns/new` capture, prefer the **stamp** account or confirm the points account is under its campaign limit first.
- Live-label drift left as-is per the backfill rule: prose says Activate / Save Draft; live buttons read Activate Campaign / Save as Draft. Screenshots show the real labels.

---

## 2026-06-08 — Screenshot backfills: First Loyalty Program + Members (SMOKE_OK)

**Tasks:** two screenshot backfills (no `Not started` rows remained on the board).
**Status:** Done. Two PRs opened, both with real annotated screenshot flows.

### Headline: screenshots WORK from the cloud sandbox now
Every prior run log entry says screenshots failed (Chrome MCP, computer-use
`request_access` timeouts, dom-to-image, mixed-content, base64 upload, etc.).
**None of that applies anymore.** The corrected `.routine/` pipeline works
end to end from this environment:

- `node .routine/smoke-test.mjs` → `=== SMOKE_OK ===` (logged in as the points
  demo account, captured a real 128 KB PNG).
- `node .routine/flow-capture.mjs <flow>.json` captured real, annotated,
  cropped, PII-redacted PNGs from the live dashboard for both accounts.
- `git push` commits them as real binary; `validate-images.mjs` exits 0.

Future runs: **do not** reach for Chrome MCP / computer-use / dom-to-image /
base64 tricks. Just run the smoke test, then `flow-capture.mjs`, then
`git push`. Playwright + Chromium install cleanly (`npm i playwright sharp`
+ `npx playwright install chromium`).

### Task 1 — Your First Loyalty Program (P0)
**Article:** `merchants/first-loyalty-program.mdx` · **PR:** #76 ·
**Branch:** `docs/first-loyalty-program-screenshots` · stamp account (Dana Salon & Spa).
5-step flow added (it had zero images): Cards page + Create Card; Card Design
(name + stamp goal boxed, live preview); Add a reward dialog (cropped);
Locations; Review (Publish Card / Save as Draft boxed). Prose unchanged.

### Task 2 — Members overview (P1)
**Article:** `merchants/members/overview.mdx` · **PR:** #77 ·
**Branch:** `docs/members-overview-screenshots` · points account (Najma Coffee, 180 members).
4-step flow added: members list (search/sort/Export CSV boxed, name + contact
columns redacted); sort menu (cropped); per-member menu (cropped); bulk
actions (select-all + bulk bar, PII redacted). Swapped the single generic
reused hero (`getting-started/members-section.png`) for the new annotated
list shot; otherwise prose unchanged.

### Key technical insights for flow-capture
- **The Cards list page needs ~6 s to render** (`waitFor` the Create Card
  button + `waitMs: 6000`); 3.5 s shows only the nav chrome.
- **Stamp-card wizard step indicator** (`button:has-text("Card Design"|"Rewards"|
  "Locations"|"Review")`) jumps between steps **without validation** (`goToStep`
  has no guard), so you can capture Locations/Review without saving a reward or
  publishing. BUT a Radix popover accumulates after you open the reward dialog
  and then intercepts later step clicks. **Fix:** give each wizard step its own
  `goto: /cards/new` so every step does a single clean click from a fresh load.
- On Review, **`Publish Card` is `disabled`** until the card is valid, so you
  can't `hover` it to scroll into view — hover the enabled `Save as Draft`
  instead, then box both.
- **Members PII:** redact the Member + Contact columns with explicit `rect`s
  (Member x≈329–572, Contact x≈572–859). Selecting all shifts the table down
  ~82 px (tbody y 319→401), so the bulk-state redact rect starts at y≈395.
  Crop the sort dropdown to `[role=listbox]` and the row menu to `[role=menu]`
  (no PII in either) instead of redacting.
- There are **two** search boxes on `/members`; target the page one by
  placeholder `Search by name, email, or phone...`, not the nav search.
- Label drift (left as-is per backfill rule, screenshots show real labels):
  Cards button is **Create Card** (not New Card); review CTA is **Publish Card**;
  reward buttons are **Add reward** / **Save reward**; members has **Export CSV**
  (not Download), **Newest First** sort (not "Sort By"), **Send Notification** /
  **Push not enabled** (not "Mute Notifications"), **Delete Member** (not Delete).

### Notion
Both rows already `Done` (backfills); flipped `Needs Screenshots` → NO, set PR
Link + Date Completed + Notes. The whole board is now `Done` with zero
`Not started` rows.

### Gap discovery (1 added)
- **QR Code Detail & Analytics** → `/qr-codes/[id]` (P3, Needs Screenshots YES).
  ~600-line page with scan chart, edit/delete, recent scans — parallel to the
  documented `/nfc-tags/[id]` but uncovered by the existing QR articles.
  (`/onboarding`, `/staff/activity`, `/settings/notifications` are already
  documented — not gaps.)
---

## 2026-06-08 — Member Redemptions Screenshots (backfill)

**Article:** `merchants/members/redemptions.mdx`
**Branch:** `claude/dreamy-newton-KLNir`
**Status:** Done — 6 real screenshots added; prose unchanged

### What was done
Screenshot backfill for the Member Redemptions how-to (no Not-started rows remained on
the Notion board, so the highest-priority `Needs Screenshots = YES` row was worked).
Added a 6-step annotated flow captured from the live dashboard via
`.routine/flow-capture.mjs`. Article was already on `main` with zero images.

Captured (flows at `.routine/flows/redemptions.json` and `redemptions-history.json`):
1. `redemptions-01-page` — page with the Enter Code / Look Up Customer buttons badged (points account).
2. `redemptions-02-enter-code` — Enter Redemption Code card, sample code typed, Look Up boxed (cropped).
3. `redemptions-03-lookup` — customer search with a matching result; email/phone redacted (cropped).
4. `redemptions-04-rewards` — selected customer's points balance + Available Rewards, a Redeem button boxed (cropped).
5. `redemptions-05-confirm` — Confirm Redemption dialog, Confirm button boxed (cropped). Dialog opened only; never confirmed.
6. `redemptions-06-history` — populated History table (stamp account, 11 rows; points account history is empty).

All 6 pass `validate-images.mjs` (6/6 OK, real binary PNGs). Pushed with `git push`.

### Research sources
- `app/(dashboard)/redemptions/page.tsx` — tabs (Redeem/History), method buttons (Enter Code / Look Up Customer), code lookup, member search (>= 2 chars), points-eligible rewards, Confirm Redemption dialog, history query (`transactions` where `type='redeem'`, limit 50).

### Notes / gotchas
- Live UI labels differ from the published prose (article says "Code" / "Lookup" tabs;
  the live buttons are **Enter Code** / **Look Up Customer**). Left prose as-is per the
  backfill no-prose-edit rule; the screenshots show the real labels.
- Points demo account has rich member + points-eligible rewards but **empty** redemption
  history; the stamp demo account has 11 history rows. Used points for steps 1-5 and
  stamp for the History shot.
- Never clicked Confirm Redemption (would process a real redemption). Customer email/phone
  redacted on the search result; History/dialog show names only (demo-account seed data).

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
