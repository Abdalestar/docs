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
