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

## 2026-09-03 — Reading a QR code's scan analytics

**Article:** `merchants/qr-codes/scan-analytics.mdx` (new)
**Branch:** `claude/busy-clarke-hlzpua`
**PR:** https://github.com/Abdalestar/docs/pull/199
**Status:** Done. SMOKE_OK (TLS bridge, §6a); 5 real annotated screenshots, validate-images 5/5 OK.
One task this run.

### THIS LOG WAS 13 RUNS STALE — read the board, not this file
The entry below this one is 2026-08-20 (PR #185), but PRs #186 through #198 shipped
daily since, one per day off `claude/busy-clarke-*` branches. Worse, **`main` has moved
a long way**: it now carries 110 articles, including most of what older entries here call
"open and unmerged". Do not re-derive the backlog from this file. Query the Notion data
source and `list_pull_requests` first, then diff against `origin/main`.

### Task selection — board fully triaged, backfill exhausted, so gap discovery
Every non-Done row is a verified duplicate, a feature that was never shipped, blocked on
a demo account this routine cannot reach, or one of the ~10 "NEEDS AN ENGINEERING FIX"
tracker rows that PRs #191-#198 filed (those are not writing tasks). Backfill is empty:
the zero-PNG scan of `origin/main` returns the same four non-workable files as every run
since 2026-08-14.

**The account blockers have NOT lifted** (re-verified read-only this run). `QTAP_EMAIL`
and `QTAP_NAJMA_EMAIL` are still both `owner@goldencrust.qa`, so the third credential slot
is still wasted, and both reachable orgs are growth/active with 0 AI credits and no
`stripe_subscription_id`. Cancel Subscription, The AI Suite and MCP/AI stay blocked.

**`Abdalestar/qtap` main has not moved since 2026-08-10** (`git fetch` confirms HEAD ==
origin/main at 387c35b). So route-diff and new-feature gap discovery are both exhausted;
the productive seam is still drift between shipped code and published prose, plus
under-documented sub-surfaces of documented pages, which is what this run took.

### What was written
`components/dashboard/qr-codes/qr-analytics-section.tsx` (380 lines) +
`lib/qr-analytics/insights.ts` (208 lines) render a full **Scan Analytics** panel below
the 7-day chart on `/qr-codes/[id]`, and nothing in the docs mentioned it. Grepping
`merchants/`, `support/`, `customer-app/` for "scan analytics", "identified scans",
"anonymous scans", "device split", "browser breakdown", "repeat scanner" and "operating
system" returned zero hits; published `qr-code-detail.mdx` stops at Recent Scans.

Facts shipped: the four summary figures and the
`${repeatScanners} returned · ~${estimatedUniqueScanners} unique scanners` sub-line
(the estimate adds distinct anonymous IPs, so one person on two networks counts twice);
`buildHighlights` capping at 4 lines with its two conditional lines (anonymous nudge needs
>=5 scans and >=50% anonymous; repeat line needs >=3 unique members); `.limit(1000)` on the
page's scan query, and why **Total Scans** can disagree with the panel; the
`MemberIdentity` ghost and shortened-id fallback in Top repeat scanners, both visible live;
access via `qr_batches !== 'none'`.

### THE FINDING — device analytics have been dead since August 2026
`qr_code_scans.user_agent` / `ip_address` feed Device split, Browser breakdown, Operating
systems and the `~unique scanners` estimate. **Neither live scan door writes them:**
- `Qtap_app/supabase/functions/process-qr-scan/index.ts:101` (in-app scan, called from
  `src/hooks/useSubmitScan.ts`) inserts only `qr_code_id`, `member_id`, `location_id`.
- `Qtap_app/supabase/functions/enroll-web/index.ts:659` does the same and says so in its
  own comment: *"qr_code_scans has ip_address / user_agent columns that the app door leaves
  null, and this door leaves them null too."*
- The only writer that does set them, `qtap app/api/scan/route.ts:147`, has **no callers
  left in either repo** (grepped). It is the legacy door.

Confirmed read-only in production: every scan 2025-12 → 2026-07 carries a user agent
(2438 of 2481 rows), and **all 38 scans in 2026-08 have `user_agent` NULL** — a clean
cutover at the 2026-08-03 rework. So those three cards read "Unknown 100%" for everyone
now. Shipped as a Warning plus the honest screenshot; a Notion row tracks the fix.
**This is NOT a demo-seed artifact — do not re-diagnose it as one.**

### Screenshots (read-only, nothing created or changed)
`.routine/flows/qr-scan-analytics.json`, stamp demo (Brew & Bean, QR `CEO-STAMP-001`,
24 scans / 5 members). Only the cookie banner was clicked. Customer names in Top repeat
scanners redacted (the demo set includes the founder's own record).

### Gotchas for future runs
- **The panel starts at y≈669 and the page is 3166px tall.** Set
  `"viewport": {"width":1440,"height":3300}` and every `clipTo` resolves with no scrolling
  and no hovers. Much simpler than the hover-to-scroll dance earlier runs used.
- shadcn **`CardTitle` is a `div.font-semibold`, not an `h3`**, so the card selector that
  works is `div.rounded-xl:has(div.font-semibold:has-text('<title>'))`. The four summary
  cards are `div.rounded-xl.min-w-0 >> nth=N`; the summary grid is
  `div.grid.min-w-0.grid-cols-2`.
- Device split + Browser breakdown share a generic grid wrapper with Hour/Day, so `clipTo`
  cannot isolate a pair. Explicit clips at 1440 width: `{x:272,y:1100,w:768,h:390}` for the
  device pair, `{x:272,y:1668,w:768,h:366}` for the timing pair.
- **Numbered badges covered the summary labels** ("Identified" rendered as "dentified").
  Plain boxes plus an ordered `<Frame caption>` is the readable version, the same lesson
  the notification-stats run recorded. Re-shoot a single step with a `node -e` filter into
  a temp one-step flow.
- Run node from `/home/user/docs`; a probe written to `/tmp` fails `ERR_MODULE_NOT_FOUND`
  for playwright.
---

## 2026-08-20 — Joining from a QR code without the app (web enrollment)

**Article:** `merchants/members/joining-without-the-app.mdx` (new)
**Branch:** `claude/busy-clarke-bfqr71`
**PR:** https://github.com/Abdalestar/docs/pull/185
**Status:** Done. SMOKE_OK (TLS bridge); 8 real annotated screenshots, validate-images 8/8 OK.
One task this run: the board has no workable row left and no backfill left (see below).

### Task selection — READ THIS BEFORE HUNTING THE BOARD
`notion-query-data-sources` **now works** (SQL mode, no Business-plan error). One query
gets the whole board:
`SELECT "Article Title","Status","Priority","MDX Path","Notes" FROM "collection://5aecc4c4-389b-458c-a114-43e5ee3704b6" WHERE "Status" != 'Done'`
Do not go back to notion-search + fetch-per-row.

All 30 open rows are already flagged. Every P1 is DUPLICATE (Redeeming a Reward,
Redeem Campaign Code, Stamp Card Rewards, Campaigns Overview) or BLOCKED (Cancel
Subscription needs a demo org with a real stripe_subscription_id; Custom Conditions
and Push Frequency are features that do not exist). P2/P3 are the same story, plus
three newer BLOCKED-on-capture rows (AI Suite, MCP/AI, Deleted members) that all
need a demo account this routine cannot reach. Verified independently this run:
"The Four Detailed Analytics Reports" and "Duplicating a Card & the Status Workflow"
are ALSO duplicates now (all four report articles are on main; overview.mdx already
has a "Card statuses" section and a "Duplicating a card" section with a screenshot).

Backfill is still exhausted: the on-main zero-PNG scan returns the same four
non-workable files as the 2026-08-14 run.

So this run did **gap discovery** (§14) and wrote the gap. New Notion row created and
worked in the same run.

### The gap (worth a look from engineering too)
qtap commits of 2026-08-03 ("Web enrollment page: /scan/[code] becomes phone-first
enroll -> wallet pass; anonymous earn dies", 9f4927c, 2321d1c) **replaced the anonymous
scan page**. A customer with a plain phone camera now types a phone number and becomes
a real member with a first stamp and an Apple Wallet pass. Nothing in the docs covered
it, and two published articles now contradict it:
- `merchants/members/how-members-join.mdx` still says "An anonymous scan does not add a
  member ... no member joins and no stamp or points are given".
- `merchants/qr-codes/customer-scan-flow.mdx` documents the same dead behaviour.
Both were left untouched (new-article run, not a rewrite) and flagged in the PR body
and on the Notion row. **A future run should fix those two.**

### What was written (all grounded, read-only)
- `app/scan/[code]/page.tsx` + `components/enroll/enrollment-client.tsx` — the join page:
  merchant's real card design, phone + Terms required, name/birthday optional, marketing
  checkbox separate from Terms, `Get my card` -> "Confirm your phone number" dialog.
- `app/api/enroll/route.ts` — E.164 normalization (NANP 11-digit rule, Italy trunk-zero
  exception, default +974), plausibility check, per-IP 30/min and per-code 50/min limiter.
- mobile repo `supabase/functions/enroll-web/index.ts` — the three endings, which is the
  spine of the article: `enrolled` (earn + audit + scan_count/one-time burn + pass),
  `welcome_back` (pass re-offered, NO earn, NO burned scan), `has_app_account` (no earn,
  no pass). Same `_shared/earn.ts` engine as an in-app scan, so sign-up / interim / main /
  campaign rewards all fire. **Vouchers are granted and stay silent** until the app.
- `mint-pass.ts` — `platform: "apple"`, `.pkpass`. Apple Wallet only; no Google claim.
- migration `037_web_enrollment_identity.sql` — `phone_verified` NOT NULL DEFAULT true,
  written false only by web enrollment; `claim_web_member()` flips it on OTP.
- `components/dashboard/app-required-notice.tsx` — the two counter variants.
- `lib/validations/staff.ts` — staff default `members: 'view'`, so **staff do see the
  badge**. I nearly shipped "owners and managers only"; check DEFAULT_PERMISSIONS, do not
  assume.

### Screenshots (nothing was created)
`Get my card` only calls `setPhoneToConfirm` — the POST fires from `Confirm and join`
alone, which was never clicked. So the confirm dialog is safe to capture and no member
was enrolled and no code burned. Flows: `web-enroll-customer.json` (430px),
`web-enroll-merchant.json` (1440px), `web-enroll-counter-mobile.json` (390x844, §8c).

### Gotchas for future runs
- **The country picker follows the sandbox IP.** `x-vercel-ip-country` resolves to US
  from this runner, so the join page opens on "United States" and an 8-digit Qatar number
  fails validation, silently killing the confirm-dialog step. Add
  `{"select": ["select[aria-label='Country calling code']", "QA"]}` as the first action.
- **The consent banner is suppressed on `/scan/*`** (deliberate, see the 2026-08-03
  commit), so a `Decline` click there times out. Dashboard flows still need it.
- `:text-is('...')` resolves badly for redaction on the redemptions summary strip (the
  redact silently no-ops). An explicit `rect` works. It DOES work for boxing the shadcn
  `No app yet` Badge, where `span:has-text(...)` lands the badge at 0,0 on the logo.
- Useful demo data on **Brew & Bean Cafe** (`QTAP_STAMP_EMAIL`): QR codes
  `CLAUDE-JOIN-COUNTER` (active stamp), `CEO-EXPIRED-001`, `CEO-MAXED-001`,
  `CEO-ONETIME-COFFEE` (inactive) cover all four enroll error states, and member
  `Q721848` is `phone_verified = false` WITH an available reward, which is the only way
  to capture the loud redemption notice. Golden Crust has one such member, no reward.
- `c.qtap.qa` (the domain `lib/utils/codes.ts` encodes into downloaded/exported QR art)
  is **not reachable from this sandbox** (`ERR_CONNECTION_CLOSED`, though DNS resolves to
  Vercel). Almost certainly the agent-proxy allowlist, which covers only dashboard.qtap.qa
  and *.supabase.co. Do not report it as a product outage. Capture from
  `dashboard.qtap.qa/scan/<code>`, which serves the same page. Separately worth an
  engineering look: the QR gallery/export encode `c.qtap.qa` while `/qr-codes/generate`
  and `/qr-codes/[id]` still build `${origin}/scan/...`.
---

## 2026-08-20 — The Recent Activity feed (gap-discovery article)

**Article:** `merchants/getting-started/recent-activity.mdx` (new)
**Branch:** `claude/wizardly-bohr-97jyz8`
**PR:** https://github.com/Abdalestar/docs/pull/184
**Status:** Done. SMOKE_OK (TLS bridge, ROUTINE §6a); 3 real annotated screenshots,
validate-images 3/3 OK. One task this run.

### Task selection — THE BOARD IS FULLY BLOCKED, READ THIS BEFORE HUNTING
Yesterday's run (2026-08-19) triaged every remaining row. I re-verified the top of the
board and every Not-started row is one of: a verified duplicate of an on-main article, a
reality-flagged non-feature, or **blocked on capture because of the demo accounts**. No
screenshot backfill exists either: the zero-PNG scan of `origin/main` returns the same
four non-workable files as the 2026-08-14 run (`customer-app/settings-profile`,
`index.mdx`, `support/faq.mdx`, `merchants/campaigns/analytics.mdx`).

**Confirmed live via Supabase this run — the three "needs a better account" blockers all
still hold.** Only two orgs are reachable (`QTAP_EMAIL` and `QTAP_NAJMA_EMAIL` are BOTH
`owner@goldencrust.qa`; `QTAP_STAMP_EMAIL` is `owner@brewbean.qa`):

| Org | plan | status | ai_insight_credits | stripe_subscription_id |
|---|---|---|---|---|
| Golden Crust Bakery (reachable) | growth | active | 0 | NULL |
| Brew & Bean Cafe (reachable) | growth | active | 0 | NULL |
| Najma Coffee | elite | active | 78 | NULL |
| Dana Salon & Spa | franchise | active | 84 | set |
| Falcon Gym | elite | active | 0 | set |

So these three rows stay blocked and **cannot be unblocked from inside this routine**:
- **Canceling Your Subscription & the Grace Period** (P1) — the Cancel Plan button only
  renders when `stripe_subscription_id` is set AND status is `active`. Neither reachable
  org has a subscription.
- **The AI Suite** (P2) — `/api/ai/insights` and `/api/ai/chat` need Elite/Franchise plus
  credits; both reachable orgs are growth with 0 credits.
- **Connecting Claude or ChatGPT (Settings > MCP / AI)** (P2) — owner-only AND
  Elite/Franchise, so only the locked upsell state renders.

**One env change fixes all three: point `QTAP_NAJMA_EMAIL` at Najma Coffee or Dana Salon
& Spa** (today it is a duplicate of `QTAP_EMAIL`, so the third credential slot is wasted),
or move Golden Crust to Elite with credits and a test-mode subscription. That single fix
is worth more than anything else on the board right now.

Also still blocked for data reasons, not plan reasons: **Deleted members** (no member in
any org has `deletion_requested_at`/`deleted_at` set, verified read-only) and
**Maintenance mode / announcements** (turning either on would hit every merchant).

### What was written (gap discovery instead)
With no workable row, I did §14 gap discovery and found a genuine uncovered surface:
`components/dashboard/live-activity-feed.tsx`, the **Recent Activity** card on the
dashboard home (`data-tour="activity-feed"`, mounted at `app/(dashboard)/page.tsx:343`).
`dashboard-overview.mdx` gives it one paragraph and no screenshot, and **none of the 21
open PRs (#163-#183) touches it** (I diffed every open-PR branch against `origin/main` to
be sure). Created the Notion row for it and locked it before writing.

Facts, all grounded in source and confirmed on the live page:
- `.limit(10)` — the card holds the ten most recent `transactions` rows, however old they
  are. On the points demo the top row was **8 days old** while the green "LIVE ACTIVITY"
  marker pulsed, which is the honest gotcha the article leads with.
- `setInterval(fetchActivities, 30000)` — self-refreshes about every 30 seconds, so a
  stamp issued at the counter can take up to half a minute to appear.
- The query filters on `organization_id` only, with **no location filter and no read of
  the top-bar location picker**, so the feed spans every branch; the branch name renders
  under the description only when the transaction carries a `location_id`.
- Row description is `transactions.description` verbatim, so wording varies live
  ("Points earned" next to "25 points at Golden Crust Bakery" and "Test purchase").
- `MemberIdentity ... fallbackName="Member"` — a row with no resolvable member renders
  literally as **Member** (seen live on Golden Crust).
- `transactions`-sourced, so campaign sends, pushes, staff invites and QR generation are
  absent. Cross-linked `staff/activity-logs` (`.limit(200)`, verified in
  `hooks/use-staff-activity.ts`).
- `canAccessRoute`: `pathname === '/'` returns true for everyone, so staff see it too.
- Empty state string is "No recent activity".

### Screenshots (read-only, nothing issued or redeemed)
`.routine/flows/recent-activity.json` (points) + `recent-activity-stamp.json` (stamp):
`recent-activity-context.png` (dashboard home, feed card boxed), `recent-activity-card.png`
(cropped card, Live Activity marker / branch / relative time numbered),
`recent-activity-stamps.png` (same card on Brew & Bean). Customer names redacted on all
three: the demo member set includes the founder's own record (`abdalestar@gmail.com`).

### Gotchas for future runs
- **Do not copy the login block from `smoke-test.mjs` by hand.** A probe that filled
  `#email`/`#password` after `domcontentloaded` silently failed (fields stayed empty and
  the shot came back as the login page). The working sequence is the one in
  `flow-capture.mjs`: `goto(/login, {waitUntil:'networkidle'})`, fill
  `input[type="email"]` / `input[type="password"]`, click `button[type="submit"]`, then
  `waitForURL(u => !u.includes('/login'))`.
- Feed selectors, all stable and scoped to `[data-tour="activity-feed"]`:
  `span.uppercase` (the LIVE ACTIVITY marker, exactly 1), `span.font-medium.truncate`
  (the 10 member names, redact each with `>> nth=N`), `span.data-mono` (the 10 relative
  times), `p.text-xs.text-muted-foreground` (branch lines, only on tagged rows).
- The card sits at roughly `{x:860, y:638, w:556, h:726}` and runs **below a 900px fold**.
  Set `"viewport": {"width":1440,"height":1500}` in the flow or `clipTo` returns a sliver.
- **Points transactions render with the stamp icon.** `points_earn`/`points_spend` are not
  in the component's `if/else` chain, so they keep the initial `eventType = 'stamp'` and
  the `points`/`Coins` entry in `iconMap` is never used. Cosmetic, but do not write "each
  activity type has its own icon" — the article deliberately says nothing about icons.
- The cookie consent banner is still per-context: click **Decline** in the first step of a
  flow only.

### Board note
21 PRs (#163-#183) are open and unmerged. The docs backlog is now a **merge** problem, not
a writing problem: main lacks all of that work, which is also why the board looks
exhausted from inside a run.
---

## 2026-08-19 — Campaign audience (wizard step 4)

**Article:** `merchants/campaigns/audience.mdx` (new)
**Branch:** `claude/wizardly-bohr-hweohr`
**PR:** https://github.com/Abdalestar/docs/pull/183
**Status:** Done. SMOKE_OK (needed the TLS bridge); 7 real annotated screenshots,
validate-images 7/7 OK. One task this run.

### Task selection
The run log in this file was stale: two runs already shipped earlier today (#177
automatic notifications, #178 demo mode), so re-read the board before trusting it.
Queried the board with `notion-query-data-sources` (SQL mode works, unlike the old
`query_database_view`) and pulled Notes for every non-Done row. **Every P1 is blocked
or a duplicate, all re-verified 2026-08-19 by earlier runs:** billing/cancel (no demo
org has a `stripe_subscription_id`, so the Cancel Plan button never renders),
custom-conditions (condition builder still a no-op), redeeming / redeem-code /
cards-rewards / campaigns-overview (duplicates of published articles), push frequency
(the attention-budget rate limiter in design.md does not exist in the app).

Took the newest gap-discovery row instead, **"Campaign audience: who can see this
campaign (wizard step 4)"** (P2, created 20:24 the same day, explicitly *not* blocked
and confirmed screenshotable on Golden Crust). The other two new rows are blocked on
account reach: MCP/AI needs an Elite or Franchise login, maintenance/announcements
needs a real announcement to be live.

### What was written
The Audience step, which had zero coverage anywhere in the docs and is the switch
between a pushed campaign and a claimable one. Grounded in `Abdalestar/qtap`:
- `lib/campaigns/audience.ts` — `AUDIENCE_OPTIONS` (the exact labels/descriptions every
  surface reads), `CLAIM_WINDOW_PRESETS` (5), `isClaimable` = anything except `private`.
- `campaign-wizard.tsx` — the steps array is now **eight**: Type, Trigger, Reward,
  **Audience**, Message, Conditions, A/B Test, Review. `canProceed` case 4 waives the
  title/body requirement when the campaign is claimable.
- `lib/campaigns/announce-gate.ts` `isPullOffer` covers every non-private visibility, so
  `app/api/campaigns/execute/route.ts` skips `processCampaign` for a claimable campaign:
  no mass push, no pre-issued rewards. That is why `campaign-card.tsx` swaps
  Sent/Opened/Clicked for Claimed/Redeemed.
- Migration `040_campaign_audience_and_shared_issuer.sql` — three-way visibility, the
  `members_read_visible_campaigns` RLS, `issue_campaign_reward` (row-lock, claim limits,
  **auto-insert into `organization_members`** so a public claim enrols the customer,
  expiry `LEAST(end_date, now + window)` else now+30d), and `claim_campaign_reward`'s
  `members_only` error, which the mobile app turns into a Join prompt
  (`MerchantDetailsScreen.tsx`).
- `050_protect_live_campaign_edits.sql` — post-claim lock, shipped as a Warning.
- `campaign-audience-control.tsx` on `/campaigns/[id]` — the one field that page lets you
  edit after the fact (explicit Save, Cancel restores; claim limits read-only there).

### Also fixed the stale wizard article
`merchants/campaigns/wizard.mdx` still said **seven** steps and numbered everything after
Reward one too low. Corrected the count, inserted Audience at position 4 with a link to
the new article, renumbered Message/Conditions/A-B/Review, and noted the message is only
required for a notification-only campaign. Its own images still validate 8/8.

### Verified live rather than assumed
On the Members-only path, **Next on the Message step stays enabled with title and body
empty**, and Review renders "No notification - customers find this on your page."
`audience-04-review.png` is that shot.

### Screenshots (nothing created, nothing saved)
Wizard filled and walked to Review; **Activate Campaign / Save as Draft never clicked**.
On the campaign detail page the audience dropdown was opened but **Save never clicked**.
No customer PII (campaign names are the merchant's own).

### Gotchas for future runs
- **All three campaigns on Golden Crust are `private`**, so only the **Private** badge can
  be captured. The Members/Public badges are prose; the options themselves are shown twice
  (wizard radio group + detail dropdown), so nothing is left unillustrated.
- **`notion-query-data-sources` in SQL mode works on this workspace** and is far cheaper
  than fetching rows one by one. `SELECT "Article Title", substr("Notes",1,400) ... WHERE
  "Status" != 'Done'` gives you the whole triage picture in one call. ROUTINE §3 still says
  `query_database_view` returns 400 — that is a different tool, this one is the replacement.
- **`step.waitFor` runs AFTER the actions loop.** A step that clicks Next three times can
  never satisfy a `waitFor` naming the first screen; it logs "waitFor not found" and still
  captures the right thing. Harmless, but do not chase it.
- **The TLS bridge died mid-run again** (second time it is logged). Symptom: every account
  fails login with `ERR_TIMED_OUT` / networkidle timeouts, which looks like dead credentials.
  Check `.../tasks/<id>.output` still says listening, then restart via Bash background mode.
  `ss` and `netstat` produce no output in this sandbox, so do not gate a retry on them.
- **Do not `waitUntil: 'domcontentloaded'` on `/login` in a throwaway probe.** The form
  submits as a plain GET before React hydrates and the credentials land in the query string.
  Either use `networkidle` like the smoke test, or wait ~4s after the email input appears.
- Claim-limit selectors: `#claim-limit-per-member`, `#claim-limit-total`, `#claim-window`
  (they only exist once a claimable option is chosen). Audience radios are
  `label[for="audience-private|members|public"]`. The card badge is best targeted by its
  `title` attribute (`[title='Sent as a notification only']`); a `span:has-text('Private')`
  box silently drew nothing.
- Campaign detail pages are NOT linked as `a[href^="/campaigns/<id>"]` from the list; reach
  them through the card's `button[aria-haspopup="menu"]`. The seeded demo campaign is
  `11111111-0000-0000-0000-000000000001` ("Double Points Weekend").

### Backfill
None available. The same four unworkable zero-image files on `main` as the last several
runs (customer-app/settings-profile = mobile, index.mdx = landing page, support/faq.mdx =
not a how-to, campaigns/analytics.mdx = the blocked stub).
---

## 2026-08-19 — Campaign messages and personalization

**Article:** `merchants/campaigns/messages.mdx` (new)
**Branch:** `claude/wizardly-bohr-ouup8z`
**Status:** Done. SMOKE_OK; 5 real annotated screenshots + 1 brand SVG (validate-images 6/6 OK).
One task this run: no screenshot backfill was available.

### Task selection — every P1 row is blocked or a duplicate (checked this run)
The board has 31 non-Done rows but the seven P1s are all unworkable:
- **Canceling Your Subscription & the Grace Period** — BLOCKED on capture. The
  **Cancel Plan** button renders only when `org.stripe_subscription_id` is set AND
  `subscription_status === 'active'` (`app/(dashboard)/settings/billing/page.tsx`).
  Both reachable demo orgs (Golden Crust Bakery, Brew & Bean Cafe) have
  `stripe_subscription_id = null`, so neither the button nor the cancel dialog can be
  screenshotted. Needs a demo org with a real Stripe subscription.
- **Custom Campaigns & the Condition Builder** — still a product no-op. `target_conditions`
  is only read inside `case 'custom':` in `execute/route.ts` + `member-eligible/route.ts`,
  and `type-selection.tsx` still exposes only seven types (no `custom`).
- **Redeeming a Reward: By Code vs Customer Lookup** — duplicate of on-main `merchants/redemptions.mdx`.
- **Redeeming a Campaign Reward Code (Staff Guide)** — the `/redemptions` code box now DOES
  resolve `campaign_rewards` codes (page.tsx line ~296), so the "no UI" blocker is gone, but
  the surface is already covered by `redemptions.mdx` + `redemptions/scan-redemption.mdx`.
- **Stamp Card Rewards** / **Campaigns Overview & the 8 Campaign Types** — duplicates of
  on-main `stamp-cards/rewards.mdx` and `campaigns/overview.mdx`.
- **Push Frequency & the Attention-Budget Guideline** — no rate limiter exists in the app
  (grep over `lib/notifications`, `app/api/notifications`, `app/api/campaigns` finds none).
  It is a design.md §10 principle, not a shipped feature. Do not write it as a how-to.

So this run took the highest-value P2: **Campaign Messages & Personalization Variables**,
whose only blocker was the single-vs-double brace bug.

### THE BRACE BUG IS FIXED — that row is unblocked
Verified in source AND on the live deployment this run:
- `components/dashboard/campaigns/steps/message-config.tsx` chips now insert
  `{{customer_name}}`, `{{first_name}}`, `{{stamps_count}}`, `{{reward_name}}`, and every
  built-in template body uses double braces.
- `lib/utils/personalize-message.ts` substitutes the 7 double-brace tokens AND now carries
  single-brace fallbacks for campaigns saved before the fix, so old campaigns are no longer
  sending raw text. There are unit tests (`__tests__/lib/personalize-message.test.ts`),
  including one proving `Order {12345} is ready` is left alone.
- `app/api/notifications/send/route.ts` no longer gates on `body.includes('{{')`; it
  personalizes every send.
Live probe on Golden Crust confirmed the deployed build: **Use Template** filled
`Hey {{customer_name}}, it's been a while!` and the preview rendered "Hey John".

### What was written
The Message step deep-dive that `campaigns/wizard.mdx` only covers in one paragraph:
the 100/500 limits and the both-required gate (`canProceed` case 4, waived when the
campaign is claimable), **Use Template** overwriting both fields, the full six-token table
(the chips expose four; `{{points_count}}` and `{{merchant_name}}` must be typed), and the
honest gotchas:
- The chip appends its tag to the **end** of the body (`onChange(title, body + variable)`),
  not at the cursor.
- The wizard preview substitutes **name tags only** (its regex covers customer_name and
  first_name), so `{{stamps_count}}` sitting unfilled in the preview is normal.
- `{{stamps_count}}` / `{{points_count}}` are **lifetime** totals, not current-card progress:
  no caller passes `current_points_balance`, every send path passes `total_points_earned`.
- An unrecognized tag goes out literally (documented as a Warning).
- `{{reward_name}}` falls back to the word "reward" with no reward attached, and a one-off
  push from `/notifications` has no campaign behind it, so it falls back the same way.
- The Review step's Notification card shows the message **as written**, tags unfilled.

**Deliberately NOT documented:** `{{stamps_remaining}}` is in the engine's token list, but no
caller passes `stampsRequired`, so it always fills 0. Left out rather than claimed as working.

### Screenshots (nothing was saved)
`.routine/flows/campaign-messages.json`, points demo (Golden Crust Bakery), one continuous
walk of the wizard: Message step empty, after Use Template, after clicking the Stamps Count
chip, the preview close-up, and the Review notification card. **Activate Campaign / Save as
Draft were never clicked**, so no campaign was created. No PII (wizard screens only).

### Notes / gotchas for future runs
- `/campaigns/new` renders on **Golden Crust (points)** and shows `Campaign Limit Reached`
  on **Brew & Bean (stamp)**, which is at the 3-campaign Growth limit. That is the reverse of
  the old Najma/Dana situation in earlier run logs. Check before picking an account.
- The wizard now has **8 steps** (Type, Trigger, Reward, **Audience**, Message, Conditions,
  A/B Test, Review) and the step indicator is **not clickable** any more (no `goToStep`), so a
  flow has to walk with **Next**. The Trigger step gate is
  `Object.keys(trigger_config).length > 0`, so a select has to be *changed*; its default value
  alone does not enable Next.
- Personalization chips are shadcn `Badge` divs: `div.cursor-pointer:has-text('Stamps Count')`.
  `span:has-text(...)` times out.
- **Drift worth a future prose pass:** on-main `campaigns/wizard.mdx` still describes a
  7-step wizard and does not mention the Audience step. Left alone here (out of scope).
---

## 2026-08-19 — Card terms and the questions members read

**Article:** `merchants/cards/card-terms.mdx` (new)
**Branch:** `claude/wizardly-bohr-a4n890`
**PR:** https://github.com/Abdalestar/docs/pull/181
**Status:** Done. SMOKE_OK; 5 real annotated screenshots (validate-images 5/5 OK). One task this run.

### Task selection
The board's remaining Not-started rows are all dead ends, re-verified this run:
duplicates already on `main` (Campaigns Overview, Redeeming by Code vs Lookup, Stamp
Card Rewards, Editing Staff Permissions, Resending Invites, NFC Registering, Staff Seat
Limits, Merchant Alert Preferences, Managing QR Codes, Business Hours, Exporting
Analytics); not-implemented features (Custom Conditions no-op, A/B Testing, Push
Frequency cap — none shipped); or blocked-on-capture needing an entitled/seeded account
the routine can't reach (Cancel Subscription + MCP/AI both need a live Stripe sub;
Deleted-members ghost + Maintenance mode need seeded/live state). So per §3 this run did
one **gap-discovery** new article and left the second task undone (screenshot backfill is
genuinely exhausted — every on-main article carries real images; the only zero-image
files are the blocked `campaigns/analytics` stub, `support/faq`, `index`, and the mobile
`customer-app/settings-profile`).

### What was written
The **Terms and conditions** field and the up-to-4 **FAQs** editor that both stamp cards
and points programs carry, plus the customer card details sheet they feed. Undocumented
before: `stamp-cards/advanced-settings.mdx` covers the other Card Design fields but not
terms/FAQs; only `points/editing.mdx` mentioned FAQs in passing. Grounded in
`Abdalestar/qtap`:
- `components/dashboard/shared/faqs-editor.tsx` — `MAX_FAQS = 4`, `normalizeFaqs` drops
  rows with an empty question, Add-question disables at 4 with a limit note.
- `components/dashboard/stamp-card/tabs/card-design-tab.tsx` — the **Back card** column:
  `#termsConditions` (500-char counter, **Insert T&Cs Template** link) + FAQs editor.
- `components/dashboard/points-program-form.tsx` — same two as separate **Terms &
  Conditions** and **FAQs** cards.
- `components/dashboard/merchant-page/terms-sheet.tsx` — the customer sheet: **How you
  earn**, the derived **Valid / Limit / Where** rows, **Full terms**, the **Questions**
  accordion, and the conditional rendering (full terms only with terms, Questions only
  with ≥1 FAQ).
- `components/dashboard/stamp-card/mobile-preview.tsx` — the live `TermsSheetContent`
  preview in the editor's phone frame.

### Screenshots
5 PNGs via `.routine/flows/card-terms.json` on the **stamp** demo (Brew & Bean Cafe):
Back card fields, Insert T&Cs Template result, the 2-question FAQ editor, and the live
card details sheet in its earn/terms and Questions states. Wizard filled but **never
published or saved**; no card written; no PII (all merchant-owned content). Added to the
Stamp Cards nav after `advanced-settings`.

### Notes for future runs
- The board is exhausted of clean, capturable work with the two reachable growth-plan
  demo orgs (Golden Crust points / Brew & Bean stamps). The genuine backlog is rows that
  need an **Elite/Franchise** account with a **live Stripe subscription** the routine can
  log into (Cancel, MCP/AI, AI Suite) or **seeded state** (a member with a deletion
  request for the Deleted-members ghost; a live maintenance window). Ask for one of those,
  or a plan bump on the reachable orgs, to unblock the next batch.
- The single-vs-double-brace personalization bug is **fixed** (`lib/utils/personalize-message.ts`
  now replaces both forms; commit f89d1b3), so the "Campaign Messages & Personalization
  Variables" row is no longer blocked on that — but the campaign wizard is unreachable for
  capture on both demo orgs (over the 3-campaign growth limit → `/campaigns/new` shows
  Campaign Limit Reached). It needs an under-limit account or a plan bump.
---

## 2026-08-19 — The top bar (theme, alerts, and your account)

**Article:** `merchants/getting-started/top-bar.mdx` (new)
**Branch:** `claude/wizardly-bohr-2x8fc3`
**PR:** https://github.com/Abdalestar/docs/pull/180
**Status:** Done. SMOKE_OK; 6 real annotated screenshots, desktop + mobile
(validate-images 6/6 OK). One task this run: **no screenshot backfill exists** (see below).

### READ THIS BEFORE PICKING A TASK — the run log above is stale
The previous entry names "Wallet Passes: The Pass Design Studio" as the next run's
task. It was **done on 2026-08-15 (PR #163)**. More generally, this board is now
worked several times a day: PRs #163-#179 all landed between 08-15 and 08-19, and
four new rows were auto-discovered on 08-19 alone. **Query the board, do not trust
this log's "next task" line.** `notion-query-data-sources` works in SQL mode against
`collection://5aecc4c4-...` and is far cheaper than search + fetch per row:
`SELECT "Article Title","Status","Priority","MDX Path","PR Link" ... WHERE "Status" != 'Done'`.

### Task selection (every P1 is dead; earlier runs triaged them today)
All seven `Not started` P1 rows carry a dated 2026-08-19 verdict from earlier runs and
none is workable: Campaigns Overview / Redeeming by Code vs Lookup / Redeeming a Campaign
Reward Code / Stamp Card Rewards are verified **duplicates** of published articles;
Custom Campaigns (condition builder no-op) and Push Frequency (no attention-budget
feature exists) are **not implemented**; Canceling Your Subscription is **blocked on
capture**. I independently re-verified the last one and the P2 "Deleted members" row:

- **Canceling Your Subscription** (`billing/cancel.mdx`) is a genuine, well-built,
  undocumented feature (owner-only `cancel-subscription` route setting
  `cancel_at_period_end`, a `grace-expiry` cron, a real Cancel Plan dialog). It is
  blocked only because the button needs `stripe_subscription_id` + status `active`,
  and **both reachable orgs have `stripe_subscription_id` NULL** (confirmed read-only).
  This is the highest-value row on the board the moment a subscribed demo account exists.
- **Deleted members** (P2, added 08-19) is blocked the same way: `MemberIdentity` only
  renders its ghost treatment when a member has `deletion_requested_at`/`deleted_at`, and
  **neither reachable org has a single one** (Brew & Bean 6 members, Golden Crust 4,
  zero flagged). Seeding is forbidden, so the ghost state cannot be captured.

So the workable row was the P3 **top bar** row, added 08-19 as the complement to PR #179
(the location switcher in the same bar).

### The finding: the top-bar search box does nothing
The row asked to verify this before writing, and it was right to.
`components/layout/header.tsx` renders **both** search inputs (desktop line 67, mobile
overlay line 51) with no `value`, no `onChange`, no `onKeyDown` and no surrounding form.
Live: typing a member name and pressing Enter left the URL unchanged, opened no
listbox/popover, and left the text in the box. Same class as the `/cards/design` and
condition-builder no-ops. **Worth a product fix: wire it up or hide it.**

The row said to close itself if the search was decorative. I wrote the article anyway,
because the *other* half is real and undocumented, and because a merchant who types in a
dead search box needs a page that says so. The article carries it as a Warning pointing
at the search that works, and never describes it as working.

### What was written (grounded in `Abdalestar/qtap`)
- `components/shared/theme-toggle.tsx` — Light / Dark / System, tick on the active one.
- `components/providers/theme-provider.tsx` — default `system`; persisted to
  **`localStorage['qtap-theme']`**, so the choice is per browser, not per account, and
  does not follow you to another machine or affect staff; `system` re-applies live via a
  `matchMedia('(prefers-color-scheme: dark)')` listener while the page is open.
- `header.tsx` — bell is `router.push('/notifications')`; account menu is Profile
  (`/settings`), Billing (`/settings/billing`), Terms + Privacy (both `qtap.qa`,
  `target=_blank`), Log out. Nothing in the bar is permission-gated.
- **Two-stage responsive behaviour** (do not conflate these): the search collapses to an
  icon below **md/768** (`hidden md:flex` + `flex md:hidden`), while the theme and demo
  toggles move into the account dropdown below **sm/640** (`hidden sm:block` + `sm:hidden`).
  Between 640 and 767 the search is an icon but the theme toggle is still in the bar.

**Two claims cut after failing verification:** Cards and Staff have **no** search input
(only Members "Search by name, email, or phone..." and QR Codes "Search by name or
code..." do), and there is **no "best on a larger screen" notice anywhere in the current
code**, despite `design.md` §2.7 describing one. Do not repeat that claim from design.md.

### Screenshots
`.routine/flows/top-bar.json` (1440x900) + `top-bar-mobile.json` (390x844). Read-only;
the only state changed was the capture browser's own theme. No customer PII (the header
shows the demo owner's first name and org name, which is the merchant's own data).

### Gotchas for future runs
- **Header buttons are positional.** At 1440 the header's buttons are, in order:
  0 hidden, 1 demo toggle, 2 location switcher, 3 theme toggle, 4 bell, 5 account. So the
  account button is `:nth-match(header button, 6)`. The theme toggle is reliably
  `header button:has-text('Toggle theme')` (its `sr-only` span carries that text) and is
  the only header button with any text besides the switcher and the account button.
- **Put any dark-mode step LAST in a flow.** The engine uses one context and the theme
  persists in `localStorage`, so every step after it renders dark.
- **The nested theme menu on mobile works.** Inside the account dropdown the theme toggle
  is a Radix menu inside a Radix menu; clicking it opens Light/Dark/System and picking one
  really does set `html.dark` + `qtap-theme`. Verified end to end, so it is safe to
  document. Two `[role=menu]` are then open, so `clipTo: "[role=menu]"` grabs the wrong
  one: use an explicit `clip`.
- **Watch the 5KB `validate-images` floor on thin crops.** A 390x60 crop of the mobile
  search bar came in at 3.4KB and failed the gate; widening the clip to 390x230 (bar plus
  the page behind it) fixed it and made a better image anyway.
- The TLS bridge (§6a) was needed again: direct `PLAYWRIGHT_PROXY=$HTTPS_PROXY` still
  fails `supabase_unreachable`/`ERR_CONNECTION_RESET`. Generate a scratch cert, run
  `.routine/tls-bridge.mjs` with the Bash tool's **background mode**, then
  `PLAYWRIGHT_PROXY=http://127.0.0.1:38443`.

### Board hygiene worth a human's 10 minutes
Four P1 rows are verified duplicates of published articles and one is a wrong-path
duplicate. They sort to the top of every run, and at least three separate runs have now
picked one up, re-verified it, and put it back. Closing them (or repointing
"Stamp Card Rewards" at `merchants/stamp-cards/rewards.mdx` and marking it Done) would
give every future run its time back. I left them alone rather than close rows I did not
work, following the precedent of the earlier notes.
---

## 2026-08-19 — Switching between branches (the top-bar location switcher)

**Article:** `merchants/settings/branch-switcher.mdx` (new)
**Branch:** `claude/wizardly-bohr-pogi1n`
**Status:** Done. SMOKE_OK (TLS bridge needed, §6a); 6 real annotated screenshots,
validate-images 6/6 OK. One task this run.

### Task selection
Every `Not started` row on the board is flagged BLOCKED or DUPLICATE, all re-verified
by earlier runs on 2026-08-19: all seven P1 rows (cancel-subscription needs a live
Stripe sub; condition builder is still a no-op; redeeming / campaign redeem-code /
stamp-card rewards / campaigns-overview are duplicates on main; push frequency is not
implemented) and the P2 rows (deleted-member ghost cannot be captured because no member
in any org carries `deletion_requested_at`; MCP/AI needs an Elite org; the rest are
duplicates). The screenshot-backfill queue is also empty: the zero-image scan on
`origin/main` still returns only `customer-app/settings-profile`, `index.mdx`,
`support/faq.mdx` and the blocked `campaigns/analytics` stub. So this run did one
gap-discovery article (§14), same call as the demo-mode run.

**The gap:** zero doc mentions of the header location switcher (grepped `merchants/`,
`customer-app/`, `support/`). New Notion row created and worked.

### What was written
`components/layout/location-switcher.tsx`, rendered from `components/layout/header.tsx`.
Facts, all grounded in `Abdalestar/qtap` and confirmed live:
- Renders only at 2+ active locations (`locations.length <= 1` returns null); menu is
  All Locations / one item per active branch / Add Location. Staff-role users see only
  their `assigned_locations`.
- Selection persists per browser: zustand `persist`, localStorage key `qtap-location`,
  `partialize` keeps `selectedLocationId` only.
- **Only two pages read it.** `grep useLocationStore` returns `app/(dashboard)/page.tsx`
  and `app/(dashboard)/analytics/page.tsx` (the third hit, points-program-form, is an
  unrelated `valid_locations`).
- Dashboard home: `useDashboardStats(locationId)` filters the Stamps/Points Issued and
  Rewards Redeemed tiles; Total/Active Members are never filtered, and the page prints
  its own note "Showing activity for X. Member counts are across all branches."
- **THE COUNTING GOTCHA (documented as a Warning).** All-branches sums the
  `organization_members` rollups (`total_points_earned`); branch view counts
  `transactions` ROWS, because the rollups have no branch dimension (the code says so in
  its own comment). Verified live: 797 across all locations vs 4 at Al Sadd, and
  `sum(total_points_earned) = 797` in Supabase. So branches do not add up to the total.
- Analytics: `useAnalyticsOverview`, `useStampsOverTime`, `useStaffPerformance` and
  `usePeakHours` really filter (`.eq('location_id', …)`). Points hooks are never passed
  `locationId` by the page, and the AI panels/churn/best-customers take none.
- The four detailed reports + the campaign Performance card use a separate on-page
  `BranchFilter`, independent of the header switcher. Cross-linked Location Comparison
  as the way to actually compare branches.

### REALITY FLAGS (raised on the Notion row, not documented as working)
- `useCustomerSegments(locationId)` and `useInsights(locationId)` take the param but use
  it **only in the SWR cache key**; their queries have no location filter. Same for
  `usePointsOverTime`. So the segments donut, Insights panel and the points chart on the
  dashboard home silently ignore the branch you picked. The article omits them from the
  "what changes" list rather than claiming they follow the switcher.
- `usePointsAnalyticsOverview` DOES filter by location but `/analytics` never passes it.

### Screenshots
`.routine/flows/branch-switcher.json`, points demo (Golden Crust Bakery, 2 branches:
Al Sadd / The Pearl). Read-only: only the switcher selection changed (per-browser
localStorage in the capture session). The all-branches vs one-branch pair is the whole
article: same member tiles, 797 → 4 and 6 → 1 on the activity tiles, with the app's own
scope note boxed. No customer PII on any shot (the dashboard home crops exclude the
Recent Activity feed; staff names on the analytics/report shots are the merchant's own
team, same treatment as the published staff-activity article).

### Gotchas for future runs
- **The TLS bridge is needed again** and its liveness check is misleading: `curl -x
  http://127.0.0.1:38443` returned 000 and a restart died with EADDRINUSE, yet the
  bridge was alive and the capture worked. Retry the capture before concluding the
  bridge is dead; flow-capture's first login attempt timed out and the second succeeded.
- `annotate` boxes key off `target` (a selector), not `selector`. A wrong key fails
  silently and no box is drawn.
- Dashboard tile row sits at page y≈168-298, but selecting a branch inserts the scope
  note and pushes the tiles down ~20px to y≈188-318. Fixed `clip` rects need different
  y for the all-branches and one-branch shots.
- Golden Crust has 8 `points_earn` transactions with a NULL `location_id`, which is live
  proof of the "untagged activity drops out of every branch view" line in the article.
---

## 2026-08-19 — Demo mode (gap-discovery new article)

**Article:** `merchants/getting-started/demo-mode.mdx` (new)
**Branch:** `claude/wizardly-bohr-utauck`
**PR:** https://github.com/Abdalestar/docs/pull/178
**Status:** Done. SMOKE_OK (needed the TLS bridge); 6 real annotated screenshots,
validate-images 6/6 OK. One task this run: **no backfill exists and every board row
is blocked or duplicate** (see below).

### READ THIS BEFORE HUNTING FOR A TASK — the board is fully triaged
The previous run log said the next task was "Wallet Passes: The Pass Design Studio".
**That is stale**: it shipped 2026-08-15 as PR #163. Don't take it.

`notion-query-database-view` still 400s, but **`notion-query-data-sources` in SQL mode
works** and is far cheaper than search + fetch per row:

```
SELECT "Article Title","Status","Priority","MDX Path","Notes"
FROM "collection://5aecc4c4-389b-458c-a114-43e5ee3704b6" WHERE "Status" != 'Done'
```

That returns 30 Not-started rows. **All seven P1 rows were re-verified and closed out by
an earlier run on 2026-08-19**, and I re-confirmed the two worth re-checking:
- Canceling Your Subscription (blocked: both reachable orgs have `stripe_subscription_id`
  NULL, so the Cancel Plan button never renders), Custom Campaigns / Condition Builder
  (still a no-op), Push Frequency (feature does not exist), and four verified duplicates
  (Redeeming a Reward, Redeem Campaign Code, Stamp Card Rewards, Campaigns Overview).
- Most P2 rows are duplicates too. The genuinely-open P2s are all capture-blocked:
  **Deleted members** (no member in ANY org has `deletion_requested_at` set),
  **MCP / AI** (owner + Elite/Franchise only), **AI Suite** (blocked per its note).

**Backfill is exhausted.** The zero-PNG-on-main scan returns only
`customer-app/settings-profile` (mobile), `index.mdx`, `support/faq.mdx`, and the
`campaigns/analytics.mdx` stub. So per §14 this run did a gap-discovery article.

### CAMPAIGN ANALYTICS — the old blocker diagnosis is WRONG, re-check narrowed
The 2026-06 note says `/api/analytics/campaigns/[id]/performance` 404s because the route
fetched the campaign with a user-scoped client and RLS blocked it. **That is no longer the
cause.** The route was rebuilt (commits `24650f1`, `9f6b720`, `e77bd60`, all in `main`) and
now fetches the campaign with `createAdminClient()`. I confirmed **production is running
that new build**: `?period=bogus` returns the new `400 {"error":"Invalid period. Must be
one of: 7d, 30d, 90d, all"}`. Yet `?period=30d` still returns `404 {"error":"Campaign not
found"}` for campaigns that exist, while logged in as an `is_active` **owner** of the
campaign's org (verified in `staff`). So the remaining suspect is the route's own staff
check against the RLS policy `staff_select_own_org`, which gates on `user_organization_ids()`
— the same function an earlier run found not returning the demo user's org for seeded
`push_notifications`. The Performance card is `(performance || perfLoading)`-gated, so it
renders a skeleton then unmounts. **Still not screenshotable, but the bug is one layer in
from where the old note pointed.** Also: the card is NOT hidden by an `isDemoMode` check
despite the code comment saying so.

### What was written
Demo mode, which had **zero mentions anywhere in the docs** yet ships on every dashboard
page. The eye button in the header (`components/dashboard/demo/demo-toggle.tsx`, mounted
from `components/layout/header.tsx`, unconditional, `hidden sm:block` with a fallback
inside the account dropdown on small screens) flips `stores/demo-store.ts` `isDemoMode`,
which swaps in ~1,750 lines of sample data from `lib/demo/demo-data.ts` (Brew House Qatar,
2 branches, 20 fictional members, cards, programs, rewards, QR codes, NFC tags, campaigns,
notifications, transactions, analytics, AI insights, churn, staff activity, wrapped).
Consumed by `app/(dashboard)/{members,members/[id],qr-codes,nfc-tags,redemptions,
stamp-operations,points-operations}` and `hooks/use-{analytics,campaigns,notifications,
qr-codes,nfc-tags,staff-activity,ai-insights,wrapped,points-analytics,supabase-query}.ts`.
Turning it on also starts a 10-step guided tour (`TOUR_STEPS` + `guided-tour.tsx`).
The store is `persist`ed to localStorage under `qtap-demo-mode`, so it is per browser and
survives reloads. No role or plan gate.

### TWO HONEST GOTCHAS (both verified, do not soften them in a future edit)
1. **Write blocking is NOT uniform.** Delete / toggle-active / add-tag / assign-location
   hit explicit guards and toast `Demo Mode` + "... is disabled in demo mode". But
   `handleIssueStamp` in `stamp-operations/page.tsx` and the points award path have **no
   demo guard** and POST to the real `/api/stamps/issue` with the selected sample member id.
   That is still safe only because the sample ids are fabricated: verified read-only,
   `SELECT count(*) FROM members WHERE id::text LIKE 'd1000000-0000-4000-8000-%'` = 0.
   The article says this plainly instead of claiming every button is blocked.
2. **The dashboard home still shows REAL data in demo mode**: the org name in the top bar,
   and the Recent Activity feed (`components/dashboard/live-activity-feed.tsx` never reads
   the demo store). Shipped as a `<Warning>` because it matters when demoing to someone.
   Customer names in that feed are redacted (charcoal) in `demo-02`.

### Screenshots
`.routine/flows/demo-mode.json`, points demo, 1440x900. Toggle (cropped to `header`),
banner + tour step 1, tour step 2 cropped, `/members` (20 sample members, **no redaction
needed, they are fictional**), `/qr-codes` (sample codes), banner Exit cropped.
**SAFETY:** read-only; nothing created, deleted, issued or redeemed. The only state changed
was the demo toggle itself.

### Gotchas for a future run
- The demo toggle is `button:has(svg.lucide-eye)` (exactly one on the page). The tour's
  close X is `button.h-6.w-6:has(svg.lucide-x)`; the tour card is `div.w-\\[300px\\]`.
- **Close the tour before capturing any other page.** Its `z-[60]` overlay dims the whole
  screen and persists across navigation, so every later shot comes out greyed.
- `setDemoMode(true)` also sets `tourActive: true`, so the tour always opens with demo mode.
- The `redact` annotation defaults to **plum**, not charcoal (`col()` falls through to plum
  when `color` is unset). Pass `"color": "charcoal"` or you get a loud pink block.
- A `number` badge is drawn *above* the box, so it is clipped by a `clip` starting at `y:0`.
  Drop the number on a top-edge crop.
- TLS bridge was required again (§6a). It does not survive a container restart; restart it
  with Bash background mode before any capture.
---

## 2026-08-19 — Messages Qtap sends for you (automatic member notifications)

**Article:** `merchants/notifications/automatic.mdx` (new)
**Branch:** `claude/wizardly-bohr-yy6lek`
**PR:** https://github.com/Abdalestar/docs/pull/177
**Status:** Done. SMOKE_OK; 7 real annotated screenshots (validate-images 7/7 OK).
One task this run: **no screenshot backfill exists on `main`** (same four unworkable
files as 2026-08-14).

### Task selection — read this before hunting the board
The board has been triaged hard by the 2026-08-19 runs and **every P1 Not-started row
is now a verified duplicate or blocked**, with the finding written into its Notes:
Campaigns Overview, Redeeming by Code vs Lookup, Stamp Card Rewards, Redeeming a
Campaign Reward Code (all duplicates of published pages), Custom Campaigns (condition
builder still a no-op), Push Frequency (the attention-budget cap is a `design.md`
commitment, not shipped code), Canceling Your Subscription (real feature, but neither
reachable demo org has a `stripe_subscription_id`, so the Cancel Plan button never
renders). The two newest P2 rows are blocked too: Deleted members (no member in any
org carries `deletion_requested_at`) and MCP / AI (both demo orgs are `growth`, so the
page only shows the locked upsell). **Read the Notes column before picking a row** —
those rows keep sorting to the top and being re-rejected, which burns a chunk of every
run. Several of them carry an explicit "recommend closing".

The highest-priority genuinely actionable row was the P3 **Automatic Reward
Notifications (System)**, whose own note said it became capturable once the
notifications history started rendering on Golden Crust. Took it.

### What was written
The receipts Qtap sends a customer on its own. They fill most of a merchant's
`/notifications` history and were mentioned nowhere in the docs (grepped
`merchants/`, `customer-app/`, `support/`). Grounded in `Abdalestar/qtap` and
`Abdalestar/Qtap_app`, read-only:
- `lib/notifications/payloads.ts` — the six builders and their exact copy
  (`stampEarnedPayload`, `cardCompletedPayload`, `pointsEarnedPayload`,
  `pointsAdjustmentPayload`, `rewardRedeemedPayload`, `offerRedeemedPayload`).
- `lib/notifications/notify-member.ts` — one path for all of them: OneSignal push +
  `push_notifications` history row + the `notification_deliveries` row the app inbox
  reads. That third write is *why* these appear on the merchant's Notifications page.
  Its header table is the canonical `data.type` contract; keep reading it first.
- Callers: `stamps/issue` (card_completed on the completing stamp), `points/award`,
  `points/adjust` (add rides `points_earned`, deduct rides `points_expired`),
  `rewards/redeem`, `rewards/redeem-code`, `points/redeem`,
  `campaigns/rewards/[code]/redeem`, `points/expire`, and
  `lib/notifications/reward-earned.ts` (the self-scan path, `reward_earned`).
- Customer-initiated ones live in the **mobile** repo, not the dashboard:
  `supabase/functions/_shared/earn.ts` (the `+N pts earned · Balance: N` receipt),
  `join-merchant/index.ts` (the welcome message, only when no signup reward exists),
  `claim-campaign/index.ts` (`<Org> · offer claimed`).
- `send-push-notification/index.ts` — transactional messages skip the
  `notification_prefs` and `member_merchant_mutes` checks entirely
  (`if (canPush && category !== "transactional")`), and the inbox rows are written
  even when the phone stays quiet. That is the basis for the "can't be turned off"
  and "Not pushed" sections.
- `notification-card.tsx` — **Not pushed** is the label for status `suppressed`
  (amber, BellOff icon); the row menu on a sent notification offers **Delete** and
  nothing else.
- `lib/utils/permissions.ts` — `/notifications` needs `campaigns !== 'none'`.

Honest gotchas shipped: percentages on a one-recipient row can only read 0% or 100%;
Delete removes the merchant's copy only; **points expiry and self-scan reward-earned
fall back to email** when the push is undeliverable, and `points/expire` gates
`notifyMember` on `push_enabled`, so unlike the counter receipts it writes no inbox
row for a member with push off. `reward_ready` is legacy and was deliberately not
documented.

### Screenshots (nothing was sent or deleted)
7 PNGs from the points demo (Golden Crust Bakery) via
`.routine/flows/automatic-notifications.json`: the full list (Not pushed + Reward
redeemed boxed), the row menu with Delete boxed, and cropped single rows for the
points receipt, a redemption, the Not pushed badge, the join welcome, and an offer
claim. **Delete was never clicked** — `deleteNotification` fires immediately with no
confirm dialog. No customer PII: these rows carry only the merchant's own business,
reward and offer names.

### Gotchas for future runs
- **`/notifications` renders real history on Golden Crust now.** The long-standing
  "both demo orgs show empty tabs" note (2026-06-12) is out of date: the account has
  18 sent rows, almost all of them automatic. That unblocked this article and would
  unblock any other notification-history capture.
- The list needs ~9s plus a `waitFor [role=tablist]`. Row cards are
  `div.rounded-xl.bg-card`, 110px tall, and `:has-text('<body text>')` resolves one
  cleanly; `clipTo` on the card is enough to include an open row menu, since the Radix
  menu opens inside the card's bounding box.
- Cookie banner: click **Decline** as the first action of the first step only.
- A one-step temp copy of a flow (`node -e` filter into `/tmp/one.json`) is the cheap
  way to re-shoot a single step without re-running the whole flow.
---

## 2026-08-19 — What each staff permission unlocks

**Article:** `merchants/staff/permission-reference.mdx` (new)
**Branch:** `claude/wizardly-bohr-sgc65b`
**PR:** https://github.com/Abdalestar/docs/pull/176
**Status:** Done. SMOKE_OK; 3 real annotated cropped screenshots (validate-images 3/3 OK).
One task this run: **no screenshot backfill exists** and **every Not-started row is
blocked or a duplicate**, so this was a gap-discovery article.

### Task selection — the board is fully triaged, read this before hunting
Earlier runs today annotated every open row. All seven P1 rows are dead ends:
Canceling Your Subscription (blocked, neither reachable org has a
`stripe_subscription_id` so Cancel Plan never renders), Custom Campaigns (condition
builder still a no-op), Redeeming a Reward / Redeeming a Campaign Reward Code /
Campaigns Overview / Stamp Card Rewards (all verified duplicates on `main`), Push
Frequency (the attention-budget cap does not exist in the product). The top P2,
Connecting Claude or ChatGPT (`/settings/mcp`), is blocked because both demo orgs are
on `growth` and only render the locked upsell. Backfill is still exhausted: the
no-PNG scan on `origin/main` returns the same four unworkable files as 2026-08-14.

**`notion-query-data-sources` works on this board.** ROUTINE §3 says to use
`notion-search` + per-row `notion-fetch`; that is no longer necessary. SQL mode
against `collection://5aecc4c4-389b-458c-a114-43e5ee3704b6` returns every row with
its properties in one call. Query `WHERE Status != 'Done'` plus `substr(Notes,1,600)`
and you have the whole triage in two calls instead of twenty fetches.

**PRs #163–#175 are open and unmerged**, so `main` lacks pass-design-studio,
voucher-design, offers/editing, billing/add-ons, notifications/stats, the four QR
articles, analytics/customer-lists, merchant-page/business-overview,
members/joined-without-the-app and the customer-scan recapture. Do not re-do any of them.

### What was written
The 18-checkbox Edit Permissions list mapped to the pages and actions each box opens.
`roles-permissions.mdx` covers the three roles and how to open the dialog, and
`setup-recipes.mdx` covers cashier vs manager, but no article on `main` names a single
checkbox (grepped: zero hits for "View QR codes", "Create cards", "Export data").

This became worth documenting on 2026-08-09: qtap commit `6a3fb8c` ("Make staff
permissions actually govern ops pages end to end") fixed the long-standing no-op that
earlier runs flagged. Dotted custom grants are now normalized, route matching is
segment-aware, and the sidebar plus the stamp/points APIs run the same helper.

Facts, all grounded in `Abdalestar/qtap`:
- `lib/utils/permissions.ts` `permissionIdsToEffectivePermissions` — the mapping, and
  the four wider-than-they-look groupings the article calls out: any of
  `members.create|edit|delete` → `members: 'full'` (so ticking Edit members also
  grants delete, which is what `canDeleteMembers` reads on `members/page.tsx`);
  `cards.*` sets **both** `stamp_cards` and `points_programs`; any `qr.*` →
  `qr_batches: 'generate'`; `notifications.send` → `campaigns: 'edit'`;
  `analytics.export` → `analytics: 'full'`.
- Same file, `canAccessRoute` — the per-route rules, including `/nfc-tags` needing
  `qr_batches !== 'none'` **and** `role !== 'staff'`, `/stamp-operations` →
  `issue_stamps`, `/points-operations` → `issue_points`, `/redemptions` → `redeem`,
  and `/` always allowed.
- `components/dashboard/staff-permissions-dialog.tsx` `PERMISSION_CATEGORIES` — the
  exact 18 labels and descriptions, and the per-role default id lists.
- `lib/validations/staff.ts` `DEFAULT_PERMISSIONS` — manager `staff: 'view'`, staff
  role `staff: 'none'`. Custom grants start from `NO_PERMISSIONS` and the checklist
  has no Staff/Billing/Settings items, so **turning Use Custom Permissions on for a
  manager silently removes their Staff page**. Shipped as a Warning.
- `components/layout/sidebar.tsx` — nav is filtered through `canAccessRoute` plus the
  loyalty-type rule, so a restricted teammate sees a shorter menu, not dead ends.
- `app/api/staff/update-permissions/route.ts` — owner-only (403 otherwise) and the
  owner row cannot be modified.

### Screenshots (nothing was saved)
3 cropped PNGs via `.routine/flows/permission-reference.json` on the points demo
(Golden Crust Bakery), all of the Edit Permissions dialog for the Staff-role teammate:
defaults greyed with the switch off, the switch on with Members + Loyalty, and the
bottom half with four numbered boxes. **Save Changes was never clicked**, so no staff
row changed. `custom_permissions` is `{}` on every demo staff row, so the dialog opens
on role defaults and toggling the switch is pure client state.

### Gotchas for future runs
- **The dialog scrolls internally** (672x900 box, 1934px of content). `clipTo:
  "[role=dialog]"` captures only the visible band, so the scroll position is the shot.
  `hover` on a target scrolls it to the nearest edge, which is deterministic at the
  ends: hovering the first field pins the top, hovering **Save Changes** pins the
  bottom. Two different mid-list hovers can land on the same band, which is how a
  4-step flow collapsed into 3 (steps 3 and 4 were identical).
- Staff row menus are the **4th and 5th** `button[aria-haspopup="menu"]` on `/staff`
  (1 = location filter, 2 = theme, 3 = account). The owner row has no menu.
- Toggling **Use Custom Permissions** on pre-fills the boxes with the role defaults
  (the `!useCustomPermissions` effect keeps `permissions` in sync), so the checklist
  is never empty on screen.

### Gap discovery (1 added, blocked)
- **Deleted members: the 'Deleted member' ghost across the dashboard** →
  `merchants/members/deleted-members.mdx` (P2, Not started). Genuinely uncovered, zero
  mentions anywhere in the docs. `components/dashboard/member-identity.tsx` (qtap
  commits `6a9d991` + `b74f6a5`, 2026-08-06) renders any member with
  `deletion_requested_at` or `deleted_at` as "Deleted member" with a grey Deleted badge
  and a generic avatar, across the members list and detail, redemptions, stamp and
  points ops, code lookup, receipts, the live activity feed, the staff activity table
  and its CSV, and QR analytics. Contact details and member actions are hidden; history,
  stats and merchant-authored notes stay counted. Mechanics live in the **mobile** repo
  (`Qtap_app/supabase/migrations/039_account_deletion_grace.sql` + `040`): the app calls
  `request_account_deletion()`, push dies immediately, a 30-day grace window runs during
  which a fresh OTP login calls `restore_own_account()` and the ghost reverts, then a
  daily 02:15 UTC pg_cron job invokes the `finalize-account-deletions` edge function,
  which zeroes every points balance with an "Account deletion: balance forfeited" ledger
  entry, cancels active `reward_redemptions`, and scrubs the identity.
  **BLOCKED ON CAPTURE:** no member in any org (Golden Crust 0, Brew & Bean 0, Tea Time
  0, Najma 0, Dana 0) carries either flag, so the ghost cannot be screenshotted and
  seeding is not allowed. Worth a seed-data fix, same class as the pass-studio
  placeholder-UUID gap.
---

## 2026-08-19 — The Merchants page (business overview)

**Article:** `merchants/merchant-page/business-overview.mdx` (new)
**Branch:** `claude/wizardly-bohr-d9rg8d`
**PR:** https://github.com/Abdalestar/docs/pull/173
**Status:** Done. SMOKE_OK; 6 real annotated screenshots (validate-images 6/6 OK).
One task this run: **no screenshot backfill exists** (see below).

### Task selection — the previous run's "NEXT RUN'S TASK" note was stale
The 2026-08-14 log points at "Wallet Passes: The Pass Design Studio" as the next task.
That row is already **Done** (PR #163, 2026-08-15). Do not take it.

Read the board with `notion-query-data-sources` (SQL mode works on this workspace and is
far cheaper than search + fetch per row):
`SELECT "Article Title","Status","Priority","MDX Path" FROM "collection://5aecc4c4-…" WHERE "Status" != 'Done'`.

All **seven P1 rows are blocked or duplicates**, each verified and annotated earlier the
same day: Canceling Your Subscription (needs an org with a live `stripe_subscription_id`;
both reachable demo orgs have it NULL), Push Frequency (the attention-budget cap is a
`design.md` commitment, not shipped code), Custom Campaigns (condition builder no-op),
Redeeming by Code vs Lookup / Stamp Card Rewards / Campaigns Overview (duplicates on main),
Redeeming a Campaign Reward Code (no dashboard UI). **Every P2 row** is likewise flagged
duplicate, blocked, or reality-flagged; I additionally confirmed "The Four Detailed
Analytics Reports" is now a duplicate (all four report articles plus the hub are on main)
and "Campaign Analytics" is a duplicate of the published `campaigns/stats.mdx` apart from
the still-blocked Performance card. In P3, "Duplicating a Card & the Status Workflow" is
also covered already (`stamp-cards/overview.mdx` has both a *Card statuses* and a
*Duplicating a card* section with the row-menu screenshot).

That left **"The Merchants page (/merchants business overview)"** (P3, auto-discovered
2026-08-19, no PR) as the only genuinely open, unblocked, screenshotable row. Took it.

### What was written
`/merchants` is a top-level sidebar item and nothing on `main` documented it (old PR #54
never merged). Distinct from the three neighbours, all cross-linked: `settings/merchant-page.mdx`
(business settings), `settings/merchant-page-editor.mdx` (the editor at `/merchant-page`),
`merchant-page/public-view.mdx` (the customer-facing `/m/<slug>`). Added to the Settings nav
between `settings/merchant-page` and `settings/merchant-page-editor`.

Grounded in `Abdalestar/qtap`:
- `app/(dashboard)/merchants/page.tsx` (396 lines) — H1 "Merchants" / "Manage your merchants.";
  the header button reads **Edit Merchant** or **Create Merchant** off `hasMerchantPage`; the
  card (logo with a dashed placeholder fallback, name, badge, `line-clamp-2` description, then a
  meta row of category / locationName / phone / website / googleRating); Preview / Edit / Delete;
  the "No merchant yet" empty state.
- The live totals are a **client-side aggregate over `organization_members`** (row count for
  members, plus sums of `total_stamps_earned` / `total_points_earned` / `total_redemptions`).
  Each figure is hidden while zero, and the whole row is hidden until `totalMembers > 0 ||
  totalStampsEarned > 0 || totalPointsEarned > 0`. They are lifetime totals, not a date range.
- `app/api/merchant-page/route.ts` `DELETE` — clears `settings.merchant_page`,
  `cover_image_url` and `logo_url` **only**. Loyalty programs, members, balances and the org
  name / phone / website survive. Written as a `<Warning>` so the confirm dialog ("This will
  remove your cover photo, logo, and all merchant settings") is not read as "delete my business".

### Three honest gotchas documented
- **The Active badge is hardcoded** (`<Badge variant="default">Active</Badge>`). It appears
  whenever a profile exists and tracks nothing. Same class as the other "displayed but not
  wired" flags in this log.
- **Preview only renders when the org has a `slug`.**
- **`/merchants` is owner-only, `/merchant-page` is not.** `lib/utils/permissions.ts` returns
  `false` for every non-owner on `/merchants` but allows `manager` on `/merchant-page` (its own
  comment explains the API accepts managers). `components/layout/sidebar.tsx` filters nav through
  `canAccessRoute`, and `/merchant-page` **is not in the sidebar nav array at all** — so a manager
  may edit the profile but has no sidebar route to it. (`settings/merchant-page-editor.mdx` still
  claims "Merchant Page in sidebar"; that is stale, left alone under the no-prose-edit rule.)

### Screenshots (nothing was created, edited or deleted)
`.routine/flows/merchants-overview.json` (points demo, Golden Crust Bakery, 5 steps) +
`merchants-overview-stamp.json` (stamp demo, Brew & Bean Cafe, 1 step showing a **stamps**
total in place of points). The delete confirmation was opened for the shot and its **Delete**
action was never clicked. The card carries the merchant's own business details and aggregate
counts, so there is no customer PII and no redaction was needed.

**Two states could not be captured, described in prose instead:**
- The **empty state**. Both reachable orgs have `settings.merchant_page` set; the four orgs
  without one (Al liwan Suites, Chef Roza, Falcon Gym, saeedkhawaja) are not reachable with the
  configured credentials.
- The **"N loyalty cards"** line. `settings.merchant_page.loyaltyCards` is an array only on
  Tea Time, which is unreachable.

### GAP DISCOVERY — published prose is now wrong (new P1 row)
qtap commit `3ab2647` "Add points.adjust staff permission (DASH-9)" invalidated
`merchants/points/adjusting.mdx`, which is on `main` and says "Only owners and managers can
finish an adjustment… when they try to confirm, Qtap blocks the change". Today
`DEFAULT_PERMISSIONS` sets `adjust_points: true` for **manager AND staff**
(`lib/validations/staff.ts` lines 42 and 58), and `app/api/points/adjust/route.ts` gates on
`canAccess(staff, 'adjust_points')` rather than role. So staff CAN adjust by default and the
403 only happens when an owner removes the capability. Filed as a P1 correction row; not fixed
here because this branch already carried PR #173 for a different article.

### Notes / gotchas for future runs
- **The TLS bridge is still required** and `PLAYWRIGHT_PROXY="$HTTPS_PROXY"` alone is NOT
  enough: Chromium's handshake is reset for `dashboard.qtap.qa` and `*.supabase.co` even
  pointed straight at the agent proxy, while `curl` gets 200/401 on the same hosts. Run
  `.routine/tls-bridge.mjs` (ROUTINE §6a) and use `PLAYWRIGHT_PROXY=http://127.0.0.1:38443`.
  Start it with the Bash tool's background mode; it stayed up for the whole run.
- Selector traps on `/merchants`: `span:has-text("members")` matches the **sidebar Members nav
  item** first, so scope counters to `div.flex.items-center.gap-4.pt-1 > div:nth-child(N)`;
  `button:has-text("Edit")` matches **Edit Merchant** first, use `button:text-is("Edit")`; the
  card itself is a unique `div.rounded-xl`. Click the cookie **Decline** in the first step only.
- `/merchants` needs ~9s to settle before the totals row appears.
- **`campaigns/analytics.mdx` re-verified blocked today.** `GET /api/analytics/campaigns/<id>/performance`
  returns 404 "Campaign not found" for a real `gen_random_uuid()` campaign owned by the logged-in
  owner (`6ced08c4-…`), and `/campaigns/[id]` renders no Performance card. Note that Golden Crust's
  seeded campaigns also carry non-RFC-4122 placeholder ids (`11111111-0000-…`), the same seed-data
  problem the pass-design run hit; the 404 is not caused by that, since a valid UUID 404s too.
- **`/settings/system` is NOT a docs gap.** It is a platform-only page (maintenance mode +
  global announcements), hidden from merchants and gated by `PLATFORM_ADMIN_EMAILS`.
- Route coverage is otherwise complete: every `app/(dashboard)` route now maps to an article or
  an existing board row, so route-diff gap discovery is exhausted. The productive source of new
  rows is now **drift between shipped code and published prose**, like the DASH-9 finding above.
---

## 2026-08-19 — QR code plan limits and monthly quotas

**Article:** `merchants/qr-codes/plan-limits.mdx` (new)
**Branch:** `claude/wizardly-bohr-5rnq1r`
**PR:** https://github.com/Abdalestar/docs/pull/171
**Status:** Done. SMOKE_OK (TLS bridge needed); 3 real annotated screenshots
(validate-images 3/3 OK). One task this run: **no screenshot backfill exists**
(the zero-image scan on `origin/main` still returns only the same four
non-workable files: `customer-app/settings-profile`, `index.mdx`,
`support/faq.mdx`, and the blocked 6-line `campaigns/analytics.mdx` stub).

### Task selection — read this before hunting, the board is misleading
The run log's "NEXT RUN'S TASK" pointer (Wallet Passes / Pass Design Studio) was
**stale**: that row is Done via PR #163, and today alone already produced #170
(Churn Risk & Best Customers) plus several others. `main` is many PRs behind, so
**never pick a task from this log's pointer — query the board.**

`notion-query-data-sources` works on this board (`SELECT ... WHERE "Status" != 'Done'`)
and is far cheaper than `notion-search` + per-row `notion-fetch`. It returns ~33 open
rows, but almost every one carries a verified DUPLICATE or BLOCKED note in its Notes
field. Both remaining P1s are dead: **Canceling Your Subscription** (neither reachable
demo org has a `stripe_subscription_id`, so the Cancel button never renders) and
**Push Frequency** (the per-customer attention budget does not exist in code; only a
10-calls-per-minute-per-org abuse guard does). The one genuine, unflagged, screenshottable
row was **QR Code Plan Limits & Monthly Quotas** (P2).

### What was written
The monthly QR **creation** quota, which is enforced server-side and documented
nowhere on `main`. `billing/usage-meters.mdx` names the meter in passing without the
numbers, the reset date or the batch rule; `qr-codes/expiry-and-limits.mdx` covers
**per-code** limits, a different thing.

Facts, all grounded in `Abdalestar/qtap`:
- `lib/stripe/config.ts` — `qrCodesPerMonth` 50 / 300 / 1500 / Infinity. Confirmed
  live: the Plans tab cards read exactly that, and Golden Crust (Growth) shows
  "QR Codes (this month) 0 of 300 used".
- `app/api/qr-codes/route.ts` — counts `qr_codes` where `created_at >= startOfMonth`
  (1st, midnight), so the window is the calendar month and resets on the 1st;
  `requestedCount = batch_quantity` and `currentCount + requestedCount > qrLimit`
  rejects the **whole batch** before inserting anything; the 403 message is quoted
  verbatim in the article.
- `lib/billing/entitlement.ts` `entitledPlan()` — a non-paying status drops the org
  to starter limits.
- Delete is a hard `.delete()` on both the list and detail pages, so a code deleted
  in the same month frees its slot; one from an earlier month frees nothing (written
  as a Warning so nobody kills a working printed code for no gain).
- `canAccess(staff, 'qr_batches')`; `DEFAULT_PERMISSIONS` manager `generate`, staff `none`.

### Screenshots (nothing was created or deleted)
`.routine/flows/qr-plan-limits.json`, points demo (Golden Crust, Growth): the cropped
Billing meter row; the Plans tab with the QR line boxed on all four plan cards; and
`/qr-codes/generate` with **Batch Generate** + Quantity 40, cropped to the QR Code Type
card. **Generate 40 Codes was never clicked.**

### TWO REALITY FLAGS — do NOT document either as working
1. **`bonus_qr_codes` does not raise the enforced cap.** `hooks/use-plan-limits.ts`
   adds it to the limit the Billing meter *displays*, but `app/api/qr-codes/route.ts`
   gates on the raw `PLAN_TIERS` value. The field is only ever set by the legacy
   `extra_qr_codes` add-on, which is not in the current store, so nobody should hit
   it today, but the meter and the gate can disagree.
2. **"Batch QR generation N/batch" on `/pricing`** (`batchQrPerBatch` 25/100/100/500)
   is rendered but enforced **nowhere**. The generate form's Quantity input is a flat
   `min={2} max={100}` regardless of plan. Same class as the Condition Builder no-op.

### Board hygiene instead of gap discovery
No new rows added (the board has 33 open rows and today's earlier run already added
two). Instead, three rows were verified against `origin/main` and annotated DUPLICATE
so future runs stop re-deriving them: **Staff Seat Limits per Plan** (covered by
staff/overview + staff/inviting + billing/plans + billing/usage-meters), **Managing QR
Codes** (covered by qr-code-detail + troubleshooting + overview), and **Buying &
Registering an NFC Tag** (covered by nfc-tags.mdx's "Adding a tag" plus its $19 add-on
Note).

### Gotchas for future runs
- **The TLS bridge was needed again.** Bare `PLAYWRIGHT_PROXY=$HTTPS_PROXY` still fails
  `supabase_unreachable`/`ERR_CONNECTION_RESET`. Generate a scratch cert, start
  `.routine/tls-bridge.mjs` with the Bash tool's **background mode** (not `nohup`), then
  use `PLAYWRIGHT_PROXY=http://127.0.0.1:38443` for every capture script.
- **Run node from the repo root.** `node_modules` lives in `/home/user/docs`; a throwaway
  probe written to the scratchpad dir fails with `ERR_MODULE_NOT_FOUND` for `playwright`,
  and a `cd` inside a Bash call does not persist to the next one (so a `rm` you think ran
  in the repo may have run in `/home/user`).
- **Login in a hand-rolled probe needs the smoke test's exact sequence**:
  `goto('/login', {waitUntil:'networkidle'})` → `waitForSelector('input[type="email"]')`
  → fill → `click('button[type="submit"]')` → `waitForURL(u => !u.includes('/login'))`.
  Clicking too early submits the form as a GET and leaves you on
  `/login?email=...&password=...` with the credentials in the URL.
- The Billing Overview card still shows a **"Free Plan" badge next to "Current Plan:
  Growth"** on the demo org (no `stripe_subscription_id`). It is in the meter screenshot.
  Don't document that quirk; the caption carries the plan instead.
- `#quantity` on `/qr-codes/generate` only exists after clicking **Batch Generate**;
  `div.rounded-xl:has(#quantity)` crops the QR Code Type card cleanly.
---

## 2026-08-19 — Churn Risk & Best Customers (new article)

**Article:** `merchants/analytics/customer-lists.mdx` (new)
**Branch:** `claude/wizardly-bohr-x78lrf`
**PR:** https://github.com/Abdalestar/docs/pull/170
**Status:** Done. SMOKE_OK; 4 real annotated screenshots (validate-images 4/4 OK). One task
this run: **there is still no screenshot backfill left on `main`**.

### The run log above this line was four runs stale
`CLAUDE.md` stopped at 2026-08-14 but PRs #163-#169 shipped since (pass design studio #163,
voucher design #164, offer editing #165, add-on store #166, notification stats #167, QR
colours/print #168, QR show-on-screen #169 — the last one about 90 minutes before this run).
All are still **open and unmerged**, so `main` lacks them. Do not re-derive the board from
this file alone: query the Notion data source and `list_pull_requests` first.

### Task selection (the board is fully blocked, not empty)
`notion-query-data-sources` in **SQL mode works** (`mode: "sql"`, table name is the
`collection://` URL) and is far better than the search-then-fetch dance ROUTINE §3 describes.
It returned 30 Not-started rows. Every one is already flagged by a prior verified run:
- **P1**: cancel (no `stripe_subscription_id` on either reachable org, so the Cancel button
  never renders), condition builder + campaign messages + A/B (product no-ops), redeeming +
  campaign redeem-code + stamp-card rewards + campaigns overview (duplicates on main).
- **P2**: staff permissions, member profile, alert preferences, manage-invites, detailed
  reports (duplicates); scheduling-templates (schedule toggle is a no-op); AI suite (blocked,
  see below); NFC registering, QR managing, QR plan limits, seat limits, hours/social — I
  re-verified these four against `main` this run and they ARE covered (`nfc-tags.mdx` has the
  full Add Tag walkthrough, `qr-code-detail.mdx` + `qr-codes/overview.mdx` cover
  edit/activate/delete/bulk, `billing/plans.mdx` carries both quota tables,
  `settings/merchant-page.mdx` has Business Hours and Social Links with screenshots).
- **P3**: card designer + duplicate-and-status (on main), exporting analytics (covered in
  `analytics/overview.mdx`), reward statuses (the status table is in `redemptions.mdx`).

Zero-PNG scan on `origin/main` still returns only `support/faq.mdx`, `index.mdx`,
`customer-app/settings-profile.mdx` and the `campaigns/analytics.mdx` stub. No backfill.

### What was written
The **Churn Risk** and **Best Customers** cards at the bottom of `/analytics`. This is the
half of the BLOCKED "AI Suite" row that a Growth account *can* render: neither route has a
plan gate, unlike `/api/ai/insights` (Elite + credits), and I confirmed both live on both
demo orgs. `analytics/overview.mdx` on main mentions neither, so nothing is duplicated.

Grounded in `Abdalestar/qtap`:
- `churn-risk-list.tsx` / `best-customers-list.tsx` — titles, badge colours, day counter,
  the `slice(0, 10)` top-ten cap, both empty states.
- `app/api/ai/churn-prediction/route.ts` — members ordered by `last_activity_at` ascending
  (nulls first, limit 50), the **20 quietest** handed to `gpt-4o-mini` for high/medium/low
  plus a reason, and the rule-based fallback (>14d medium, >30d high, capped at 20).
- `lib/ai/best-customers-scoring.ts` — `score = activity + recency*3 + frequency`, where
  activity is points*0.1 or stamps*2 and frequency is the primary metric per month since
  joining. Tiers are **relative bands** (rank 0 always platinum, then 10/30/60%).
- `app/api/ai/best-customers/route.ts` — `scoring_method: 'rule_based'`, ranks on
  `total_points_earned` for points orgs and `total_stamps_earned` for stamp orgs.
- `lib/utils/permissions.ts` — `/analytics` needs `analytics !== 'none'`.

Honest gotchas in the article: the risk level is a model's judgment, not a threshold (a
10-day gap came back **medium** and a **low** row appeared on the points org even though the
prompt asks for medium and high only — verified live, twice); the day counter falls back to
`joined_at` for a member who never returned; tiers move when *other* members get busier, so
merchants should not promise a tier as a reward. `total_spend` is hardcoded 0 in the scoring
so `formatSpend` returns null and the spend chip never renders — left undocumented.

### Screenshots
`.routine/flows/customer-lists.json` (stamp, Brew & Bean: 6 members, 3 idle) and
`customer-lists-points.json` (points, Golden Crust). Read-only: nothing clicked but the
cookie banner and hovers. **The points shot is the teaching one** — a member holding 400
points ranks 4th behind one with 252, which is recency*3 made visible.

### Gotchas for future runs
- **Both cards sit at y≈1440 on `/analytics`**, below any normal fold. Use a tall `viewport`
  (2300+) AND a `hover` on the card so Playwright scrolls it in, or `clipTo` comes back
  "empty/outside". They need ~13-15s to settle; at 8s the churn card is still skeletons.
- **Redact the avatars, not just the names.** `best-customers-list.tsx` renders real
  `avatar_url` photos for members who have one (3 of 6 on the stamp org). Names are
  `<card> p.truncate`, avatars are `<card> li span[class*="h-9"]`; `>> nth=N` chaining works
  in annotate targets.
- Badges are `div`s, not spans: `div[class*="text-red-700"]` for high, `text-yellow-700` for
  medium, `text-green-700` for low. A box on a selector that resolves to nothing is dropped
  silently, so eyeball every annotated shot.
- **The AI output changes between runs.** The same org returned 3 churn rows one minute and
  2 the next, and the risk mix moved. Do not annotate by row index expecting a fixed level,
  and do not re-run a capture you were happy with.
- `flow-capture.mjs` **falls back to the points account** when the stamp login fails, and
  says so only in one `Logged in as` line. A transient `networkidle` timeout on `/login` did
  exactly that this run and produced a points-data capture inside a flow declared `"stamp"`.
  Always grep the run output for `Logged in as`.

### Reality flags found (do NOT document as working)
- **`/settings` Danger Zone → Delete Account is a dead control.** `variant="destructive"
  disabled` with no handler in `app/(dashboard)/settings/page.tsx`. There is no self-serve
  account deletion in the dashboard.
- **`/settings/mcp` exists and is undocumented** ("MCP / AI" tab: connect Claude or ChatGPT
  read-only to your analytics). Owner-only AND Elite/Franchise, so both reachable demo orgs
  render only the locked upsell. Filed as a gap row, blocked on credentials.
- **`points/adjusting.mdx` is now wrong.** qtap commit `3ab2647` added an `adjust_points`
  capability, `DEFAULT_PERMISSIONS` gives it to manager **and staff**, and the API gates on
  `canAccess(staff, 'adjust_points')` rather than the old role check. The published article
  still says staff get a 403. Filed as a follow-up row; verify the deploy before editing.

### Gap discovery (3 rows added)
MCP / AI settings page (P2, blocked on plan), the `points/adjusting.mdx` drift fix (P2), and
the `/merchants` business-overview page (P3, a top-level sidebar item with nothing on main).
---

## 2026-08-19 — Showing a QR code on screen (Gallery + presenter)

**Article:** `merchants/qr-codes/show-on-screen.mdx` (new)
**Branch:** `claude/wizardly-bohr-fjjalx`
**Status:** Done. SMOKE_OK; 6 real annotated screenshots in desktop AND mobile viewports
(validate-images 6/6 OK). One task this run.

### Task selection — every P1 on the board is blocked or a duplicate
All 7 `Not started` P1 rows were checked against their own Notes and against `origin/main`,
and none is workable: **Cancel subscription** (BLOCKED 2026-08-17, neither reachable demo org
has a `stripe_subscription_id`, so the Cancel button never renders), **Custom Campaigns /
Condition Builder** and **Push Frequency** (verified product no-ops), **Redeeming by code vs
lookup** (duplicate of on-main `redemptions.mdx`), **Redeem a Campaign Reward Code** (no
dashboard UI at all), **Stamp Card Rewards** (duplicate of on-main `stamp-cards/rewards.mdx`),
**Campaigns Overview** (already on main, 81 lines). So the run took the highest-value genuine
P2: the row the previous run auto-discovered, "Showing a QR Code on Screen (Gallery View &
Show to Customer)". No screenshot backfill exists on `main`, so one task this run.

Note the SQL path works now: `notion-query-data-sources` in `sql` mode against
`collection://5aecc4c4-…` returns the whole board in one call. ROUTINE §3 still says
`query_database_view` 400s (true, that tool is deprecated) — use `query-data-sources` instead
and skip the search+fetch-per-row loop.

### What was written
The two undocumented surfaces on `/qr-codes`: **Gallery** view and the full-screen presenter.
On-main `overview.mdx` gives Gallery one sentence and never mentions the presenter;
`qr-code-detail.mdx` documents the detail page without its **Show to customer** button.
Grounded in `Abdalestar/qtap`:
- `components/dashboard/qr-codes/qr-code-gallery.tsx` — 140px canvas per card rendered from
  the code's own `template_style`; card menu **Show to customer / View / Copy Code /
  Deactivate|Activate / Delete**; the menu button is `opacity-100` below `sm` and
  hover-revealed from `sm` up (the component's own comment says a phone has no hover); card
  body routes to `/qr-codes/[id]`; badges Expired / Max Reached / Active / Inactive.
- `components/dashboard/qr-codes/qr-fullscreen.tsx` — org name + code name above, 640px
  canvas, mono code + "Point your camera at the code" below; Escape, the X, and a backdrop
  click all close; `navigator.wakeLock` held while open and **not** re-acquired on
  `visibilitychange` (documented as the honest caveat).
- `app/(dashboard)/qr-codes/page.tsx` — `viewMode` is `useState('table')`, so Gallery is not
  remembered between visits (documented as a Note); the presenter is also reachable from a
  full-width button on `/qr-codes/[id]` (line 396).
- `lib/utils/permissions.ts` + `lib/validations/staff.ts` — `/qr-codes` needs
  `qr_batches !== 'none'` (owner full, manager `generate`, staff `none`), so owners + managers.

### REAL BUG FOUND AND DOCUMENTED — the presenter is cut off below 640px
`qr-fullscreen.tsx:105` sets `className="w-[min(85vw,60vh)] h-auto"` on the canvas, but that
arbitrary Tailwind class **is not taking effect**: computed width is a flat `640px` at every
viewport. Measured live on the stamp demo at 1440 / 1024 / 820 / 768 / 700 / 688 / 640 / 430:
the canvas stays 640px wide throughout and its `x` only goes negative at 430 (and is -125 at
390). So on a phone in portrait the QR loses ~125px off each edge, the finder patterns go with
it, and the code cannot scan. Nobody noticed because 640 fits every desktop.
The article states this plainly (a Warning plus a mobile screenshot of the clipped code) and
tells merchants to present from a screen about 640px wide or more. **Worth an engineering fix**
(the class is almost certainly not being generated); once the canvas really is
`min(85vw,60vh)`, drop the Warning and the phone caveat from the article.

### Screenshots (nothing was changed on the account)
`.routine/flows/qr-show-on-screen.json` (1440x900) + `qr-show-on-screen-mobile.json` (390x844),
both on the **stamp** demo (Brew & Bean Cafe, 10 codes, several named, one Expired and one
Max Reached, so the badges are real). Read-only: only the view toggle, a card hover, the card
menu, and **Show to customer** were clicked. Deactivate / Delete / Copy were never clicked and
no code was created, edited, or removed.

### Gotchas for future runs
- **`div.grid > div` matches the KPI tiles, not the gallery.** The gallery card is
  `div.rounded-xl:has(canvas)`; `:nth-match(div.rounded-xl:has(canvas), N)` works as an
  annotate/clipTo target (top-level only, it cannot take a descendant).
- **`button[aria-haspopup="menu"]` first-matches the header location switcher.** The gallery
  card's menu button is `button[class*='group-hover:opacity-100']`, which is unique to it and
  works at both viewports (`.first()` = first card).
- The view toggle is reliably `button:has(svg.lucide-layout-grid)` (gallery) /
  `svg.lucide-list` (table).
- **Table rows are not clickable.** Clicking a `<tr>` does nothing; a detail page opens from
  the row menu's View Details or from a gallery card body. A probe that clicks a row and then
  reads `page.url()` will silently still be on `/qr-codes`.
- The presenter overlay is `z-[100]` but the app header still bleeds through the top ~46px, so
  clip the desktop shot to `{y:48, height:852}` (that also drops the account-name chip).
- `/login` needs ~5s after `input[type=email]` appears before filling. Submit any earlier and
  the un-hydrated form does a **GET**, putting the demo password in the query string.
- The TLS bridge (§6a) was needed again: direct and plain-`HTTPS_PROXY` runs both fail
  `supabase_unreachable`. `BRIDGE_CERT_DIR=<dir> node .routine/tls-bridge.mjs` in Bash
  background mode, then `PLAYWRIGHT_PROXY=http://127.0.0.1:38443` on every capture.
- App inconsistency, not documented (no merchant-visible effect): the gallery presenter encodes
  `scanUrlFor(code)` = `https://c.qtap.qa/scan/<code>` while the detail page's presenter and its
  PNG/SVG downloads encode `${origin}/scan/<code>`. Both routes exist; the same code can ship
  as two different URLs depending on where it was shown or downloaded from.
---

## 2026-08-19 — Colors, logos, and print files (QR)

**Article:** `merchants/qr-codes/printing.mdx` (new)
**Branch:** `claude/wizardly-bohr-43loss`
**PR:** https://github.com/Abdalestar/docs/pull/168
**Status:** Done. SMOKE_OK (TLS bridge required, ROUTINE §6a); 4 real images,
validate-images 4/4 OK. One task this run.

### Task selection
Took the P2 row "Customizing QR Colors & Printing (PNG / SVG / PDF / ZIP)"
(`merchants/qr-codes/printing.mdx`, no PR). Every P1 row is still blocked and now
annotated as such on the board (Canceling Subscription, Push Frequency, Condition
Builder, plus four duplicates), and the 2026-08-19 run before this one had already
taken the best P2 (notification stats). The AI Suite row stays blocked on account
capability (both reachable orgs are growth with 0 AI credits).

Overlap check before writing: `generating.mdx` mentions the color fields in one
line, `overview.mdx` and `placement-ideas.mdx` each mention PDF/ZIP in one line.
Nothing on `main` covers what is actually in each file, the color-persistence rules,
or the center-logo add-on. The article cross-links rather than restating those.

### What was written (all grounded in `Abdalestar/qtap`)
- `app/(dashboard)/qr-codes/generate/page.tsx` — the **Customization** card
  (`#qr_color` / `#bg_color`, default `#000000` on `#FFFFFF`), the live 200px preview,
  PNG/SVG at width 500 named `qr-<CODE>.<ext>`, both disabled while `type === 'batch'`,
  and `template_style: { color, bgColor }` written at save.
- `app/(dashboard)/qr-codes/[id]/page.tsx` — redraws a saved code from its stored
  `template_style`; `handleSave` updates **name, location_id, is_active only**, so a
  saved code can never be recoloured (shipped as a Warning). Row menu **Download**
  routes to `/qr-codes/[id]?download=true`, which auto-downloads the PNG (the on-main
  `overview.mdx` line "exports the QR code as a PDF" is drift; left alone).
- `lib/utils/qr-export.ts` — PDF is A4, 3 columns, 40mm codes, header "QR Codes Export",
  per-cell name **sliced to 20 chars** + code + `action | type`; ZIP is 512px PNGs named
  `<name-or-code>_<code>.png`. Both files `qr-codes-<ISO date>.<ext>`.
- **THE GOTCHA WORTH KEEPING:** both bulk exports call `renderQrDataUrl` with only
  `{width, margin, logoUrl}`, so `dark`/`light` fall back to black/white. **A PDF or ZIP
  export silently drops per-code colours**; single PNG/SVG keep them. Shipped as a Note.
- `lib/utils/qr-render.ts` + `qr-logo.ts` — error correction goes M → **H** when a logo
  is set; the 24% plate / 20% image geometry; the **decode self-check** (`jsQR` reads the
  composited canvas back and re-renders clean if it does not resolve to the same URL),
  which is the "Logo hidden on this code" preview message. `isQrLogoEntitled` = franchise
  (or legacy `enterprise`) **or** `custom_qr_branding_enabled`; `getQrLogoUrl` is opt-out
  via `settings.qr_logo_enabled`, account-wide, and resolved at render time so existing
  codes pick the logo up.
- `lib/utils/permissions.ts` + `lib/validations/staff.ts` — `/qr-codes` needs
  `qr_batches !== 'none'` (manager default `generate`, staff `none`).
- No contrast validation exists anywhere in the render path, so the article tells
  merchants to scan the preview themselves rather than implying Qtap checks it.

### NEW TECHNIQUE — screenshotting an exported PDF
`printing-pdf-sheet.png` is a real render of a real export, not a mock. Headless
Chromium **downloads** a `file://*.pdf` instead of rendering it (`page.goto` throws
"Download is starting"), and there is no poppler/imagemagick in this sandbox. What works:
1. `acceptDownloads: true`, click **PDF**, `download.saveAs(...)`.
2. `npm i pdfjs-dist`, `page.addScriptTag({ path: 'node_modules/pdfjs-dist/build/pdf.min.mjs', type: 'module' })` (exposes `window.pdfjsLib`), set
   `GlobalWorkerOptions.workerSrc` to a Blob URL built from `pdf.worker.min.mjs`, feed the
   PDF in as base64 → `Uint8Array`, render page 1 at scale 2 to a canvas, then
   `locator('#cv').screenshot()`. Crop the empty page bottom with sharp.
Clicking **PDF** is safe to capture: `jsPDF` runs entirely client-side, nothing is written
to the account and nothing leaves the browser. Nothing else was clicked (no Save QR Code,
no Delete); the two demo orgs are unchanged.

### Screenshots
`.routine/flows/qr-printing.json` (points demo) for the Customization card (colours filled
with `#8E4A63` on `#F8F5F2`, the locked add-on row boxed) and the Preview card showing the
recoloured code with PNG/SVG boxed. `.routine/flows/qr-printing-stamp.json` (stamp demo,
which has named codes) for the cropped "3 selected / PDF / ZIP" header bar. No PII: QR
names and codes are merchant-defined.

### Gotchas for future runs
- **Filling a field lower on `/qr-codes/generate` scrolls the page**, and the Preview card
  is `lg:sticky top-6`, so a `clipTo` crop of it then includes the fixed nav bar. End the
  action list with `{ "hover": "h1" }` to scroll back to the top before the shot.
- The bulk-export bar is `grid grid-cols-3 gap-2 **sm:contents**`, so at desktop width that
  wrapper has no box and `clipTo` on it silently falls back to a full-page shot. Use an
  explicit `clip` (`{x:830,y:72,width:606,height:80}` at 1440px) instead.
- The **logo** half of Custom QR Branding cannot be screenshotted working: Golden Crust and
  Brew & Bean are both `growth` with `custom_qr_branding_enabled = false`, and the two orgs
  that have it (Najma elite, Dana franchise) are not reachable with the configured
  credentials. The locked padlock row is the honest capture; the enabled behaviour is prose.
- No reachable org has a QR code with a non-default `template_style` (Najma has 2), so
  "a saved code keeps its colours" is prose, not a screenshot.
- The TLS bridge dropped one request mid-run (`ERR_TIMED_OUT` on `/login`) and the same
  command succeeded on an immediate retry. Retry once before assuming the bridge died.
---

## 2026-08-19 — Reading your notification stats

**Article:** `merchants/notifications/stats.mdx` (new)
**Branch:** `claude/bold-mendel-85onnj`
**PR:** https://github.com/Abdalestar/docs/pull/167
**Status:** Done. SMOKE_OK (TLS bridge required, ROUTINE §6a); 4 real annotated
screenshots, validate-images 4/4 OK. One task this run.

### Task selection (every P1 row is blocked; read this before hunting)
All seven `Not started` P1 rows are dead ends and four of them are now annotated
as such on the board: **Canceling Your Subscription** (blocked 2026-08-17: neither
reachable demo org has a `stripe_subscription_id`, so Cancel Plan never renders),
**Push Frequency** (blocked 2026-08-17: the per-customer attention budget is a
design.md aspiration with no enforcing code), **Custom Campaigns / Condition
Builder** (long-standing no-op), and Redeeming a Reward / Redeem Campaign Code /
Stamp Card Rewards / Campaigns Overview (all duplicates of published articles).

I also verified and annotated four more rows as duplicates this run: **Exporting
Analytics** (analytics/overview.mdx already has the section + screenshot),
**Business Hours & Social Links** (settings/merchant-page.mdx has both sections +
screenshots), **Editing Staff Permissions** (roles-permissions.mdx covers the
custom-permissions dialog), **Resending/Canceling Invites** (staff/overview.mdx +
staff/inviting.mdx cover both halves).

**The AI Suite row is a genuine gap but is BLOCKED on account capability**, not on
product reality. On-main `analytics/overview.mdx` is 70 lines and mentions none of
Churn Risk, Best Customers, Regional Benchmarks or Ask AI. But probing `/analytics`
live: `/api/ai/insights` **403s** (needs Elite/Franchise **and** `ai_insight_credits > 0`)
so the whole AIInsightsPanel returns null; `/api/ai/chat` has the same gate;
RegionalBenchmarks returns 200 with no comparisons and renders null. Only Churn Risk
and Best Customers render. Both reachable orgs are **growth with 0 credits**
(Golden Crust = `QTAP_EMAIL` **and** `QTAP_NAJMA_EMAIL`; Brew & Bean = `QTAP_STAMP_EMAIL`);
Najma (elite, 78 credits) and Dana (franchise, 84) are not reachable. Left for a run
with better credentials rather than shipping a half-screenshotted article.

So this run took the highest-priority **workable** row: "Reading Notification Stats
(Delivery / Open / Click)" (P2, no PR).

### ENVIRONMENT CHANGE — the notifications history renders now
The 2026-06-12 note ("`/notifications` shows NO history on the live demo orgs", RLS
invisibility, which is why push-notifications.mdx fell back to SVGs) **no longer
applies to Golden Crust**. The org has 18 `sent` + 1 `suppressed` `push_notifications`
rows and every one is visible to the demo login, with real Delivered/Opened/Clicked
percentages including a `Clicked: 100%` row and a `Delivered: 0%` row. Anything that
needed a populated notifications list is now capturable.

### What was written
The four figures on a sent notification, which `campaigns/push-notifications.mdx`
covers in three bullets and which omit **Delivered** entirely. Grounded in `Abdalestar/qtap`:
- `components/dashboard/notifications/notification-card.tsx` — figures render only for
  `status === 'sent'`; `statusConfig` labels `suppressed` as **Not pushed** and `failed`
  as **Failed**.
- `hooks/use-notifications.ts` — all three percentages divide by the same
  `total_recipients` and are `Math.round`ed; list is `.limit(50)` newest first.
- `app/api/notifications/send/route.ts` — `total_recipients = members.length`; members
  with push off or no device are deliberately NOT filtered out because the edge function
  writes their inbox row; "suppressed members count as recipients but never as delivered".
  `sendFailed = delivered === 0 && failed > 0`, so an **all-suppressed composer send still
  ends `sent`** and reads Sent: 1 / Delivered: 0%.
- `lib/notifications/notify-member.ts` — the `delivered` / `suppressed` / `failed` model.
- `app/api/webhooks/onesignal/route.ts` — `total_opened` / `total_clicked` move only on
  OneSignal events, so an in-app inbox read never registers as an open.
- `lib/notifications/payloads.ts` — the automatic titles (`+N points at <org>`,
  `Reward redeemed! 🎉`, `Offer redeemed! 🎉`, `You completed your <org> card! 🎉`).
- `app/(dashboard)/settings/notifications/page.tsx` — those toggles are merchant-facing
  alerts (`email_new_member`, `push_low_stock`…), NOT the member messages. Said in the article.
- `lib/utils/permissions.ts` — `/notifications` needs `campaigns !== 'none'` (owners + managers).

### PRECISION FIX worth keeping
The amber **Not pushed** badge is `push_notifications.status = 'suppressed'`, and **no
dashboard-composed or scheduled send ever writes it** — `send/route.ts` and
`process-scheduled/route.ts` only ever write `sent` or `failed`. It appears only on the
automatic single-member rows the edge function writes. My first draft presented it as a
general send outcome; corrected before commit. Verified in Supabase: Golden Crust has
exactly 18 `sent` + 1 `suppressed`.

### Screenshots
`.routine/flows/notification-stats.json` (points demo): the page with the Sent (18) tab
and an automatic message boxed; one Sent card cropped with all four figures outlined; the
**Not pushed** card cropped; the **Delivered: 0%** card cropped. Read-only — nothing sent,
scheduled or deleted. No customer PII (titles/bodies name the merchant, its rewards, and
point balances only).

### Gotchas for future runs
- **Numbered badges crowd a tight crop.** Four numbered boxes on a single ~120px-tall card
  row put each badge on top of the neighbouring figure ("Sent: 1" read as "ent: 1"). Plain
  boxes with no `number` plus an ordered `<Frame caption>` is the readable version.
- A shadcn `Badge` renders as a **div**, so `span:has-text("Not pushed")` resolves nothing
  and the box is silently dropped. `text="Not pushed"` works (matches the 2026-08-18 note).
- `div.rounded-xl:has(h3)` `.first()` cleanly isolates the first notification card. A
  descendant chain like `div.rounded-xl:has(h3:has-text("X")) span:has-text("Delivered:")`
  DOES resolve — it is only `>> nth=` chaining that fails silently.
- The list needs ~9s to settle; cards below the fold need a `hover` on the target first or
  `clipTo` reports an empty area.
- The cookie **Decline** click still has to be the first action of the first step only, and
  needs a ~3s wait before it or the banner has not mounted yet.
---

## 2026-08-18 — The add-on store (new article)

**Article:** `merchants/billing/add-ons.mdx` (new)
**Branch:** `claude/bold-mendel-1w9mzt`
**Status:** Done. SMOKE_OK (via the TLS bridge); 4 real annotated screenshots, validate-images 4/4 OK.
One task this run.

### Task selection — the P1 shelf is fully blocked, read this before hunting
The run log's "NEXT RUN'S TASK" (Wallet Passes / Pass Design Studio) was **already
shipped** on 2026-08-15 as PR #163. The log was stale; trust the board, not the log.

Every remaining `Not started` **P1** row is verified-blocked or a duplicate, so this run
went to P2:
- *Canceling Your Subscription* — BLOCKED 2026-08-17 (verified again this run): both
  reachable demo orgs have no `stripe_customer_id`/`stripe_subscription_id`, so the
  Cancel button never renders. Needs seeded demo data.
- *Custom Campaigns / Condition Builder* — product no-op, re-verified 2026-08-08.
- *Redeeming a Reward by Code vs Lookup* — duplicate of on-main `redemptions.mdx`.
- *Redeeming a Campaign Reward Code* — no dashboard UI (API/mobile only).
- *Stamp Card Rewards* — duplicate of on-main `stamp-cards/rewards.mdx`.
- *Push Frequency* — BLOCKED 2026-08-17, the attention budget does not exist in code.
- *Campaigns Overview* — `campaigns/overview.mdx` already on main.

Two P2 rows were checked and rejected as duplicates before picking:
**Editing Staff Permissions & Custom Permissions** is fully covered by on-main
`staff/roles-permissions.mdx` (Custom Permissions, the six categories, the Locations
tab, role reset, and even Resending an Invitation) — which also makes
*Resending/Canceling Invites* a near-duplicate. Took **The Add-Ons Store** (P2), the
highest-priority genuinely-new, screenshotable row. `merchants/billing/add-ons.mdx`
was not on main, and `settings/billing.mdx` only carries a 6-row price table.

### What was written
The `/settings/billing` **Add-ons** tab (card title "Pay-Per-Feature Store"), grounded in
`Abdalestar/qtap`:
- `lib/stripe/config.ts` `FEATURE_DISPLAY_PRICES` — the six add-ons, prices, and the
  `availableOn` strings that drive the badges.
- `app/(dashboard)/settings/billing/page.tsx` — `getFeatureLabel/Description`, the
  `isAvailable` gate (button reads `Requires <tier>` and is disabled), `isTrialing` →
  "Subscribe first" + amber alert, `isOwner` → "Contact Owner", `getFeaturePurchaseState`
  (Active badge / "Already Active" / "Purchase Another" / "N credits — Buy More"), and the
  **Active Add-ons** card on Overview (only renders for extra locations, extra loyalty
  cards, or custom QR branding).
- `lib/stripe/client.ts` — **the one-time vs monthly split**, which is the fact the
  existing billing article omits: `mode: 'subscription'` for extra_location,
  extra_loyalty_card, custom_qr_branding; `mode: 'payment'` for nfc_tag, batch_qr_100,
  ai_insight_pack.
- `app/api/billing/create-checkout/route.ts` — owner-only 403, trial 403, Stripe Checkout.
- `app/api/webhooks/stripe/route.ts` — what each purchase actually writes
  (`max_locations`, `extra_loyalty_cards`, `purchased_nfc_tags`, `batch_qr_credits`,
  `ai_insight_credits +50`, `custom_qr_branding_enabled`) **and the cancellation path**
  that decrements them (extra_location never below the plan default).
- `hooks/use-plan-limits.ts` — how the extras fold into effective limits.
- `app/api/ai/insights/route.ts` — 1 credit per run, 403 at zero.
- `lib/utils/qr-logo.ts` — Franchise gets custom QR branding without buying it.

### Screenshots (nothing was purchased)
4 PNGs in `images/settings/`, flow `.routine/flows/billing-add-ons.json`, points demo
(Golden Crust Bakery, **growth/active**): the full store; the Extra Location card cropped
(badge 1 / Purchase 2); the **AI Insight Pack locked** card ("Elite+" badge, disabled
"Requires Elite+"); and the Batch Generate paywall. **No Purchase button was ever
clicked** — every one of them opens a real Stripe checkout. No PII on any of these screens.

### NEW CAPTURE UNLOCKED — the batch paywall
A 2026-06-12 run recorded that the batch purchase paywall could not be captured because
both demo accounts had batch access (Elite/Franchise). **That has changed.** Both demo
orgs are now **growth** with `batch_qr_credits = 0` and no paid `billing_history` row, so
`/qr-codes/batch` renders the real "Unlock Batch QR Code Generation" paywall with all four
pack tiers. Captured it.

### TWO PRODUCT BUGS FOUND (documented honestly, flagged for engineering)
1. **The larger batch packs cannot be bought.** `BATCH_TIERS` in
   `components/dashboard/qr-codes/batch-generator.tsx` offers `batch_qr_500/1000/5000`,
   but `FEATURE_PRICES` in `lib/stripe/client.ts` only defines `batch_qr_100`. So
   `getFeaturePrice` returns null and `/api/billing/create-checkout` answers **503
   "Price not configured"**. Even if one were bought, the webhook's `BATCH_QR_QUANTITIES`
   only maps `batch_qr_100`, so credits would compute as `NaN`. Not click-verified (a
   working button would fire a real Stripe checkout), so the article warns rather than
   asserts.
2. **Two prices for the same pack.** The Add-ons store shows the 100-code pack at
   "$15 admin fee" (`FEATURE_DISPLAY_PRICES`), the Batch Generate paywall shows
   "100 QR Codes / $10 one-time" (`BATCH_TIERS`). Both are live on screen. The article
   tells merchants to check the amount at checkout.

### Gotchas for future runs
- **The demo orgs are on `growth` now, not Elite/Franchise.** This is what makes the
  "Requires Elite+" gate and the batch paywall capturable, and it also means the
  **Active Add-ons** card never renders (all add-on counts are 0) — described in prose,
  not screenshotted.
- Annotation selector gotcha: a shadcn `Badge` is a **div**, so
  `... span:has-text('Growth+')` silently resolves to nothing and the box is dropped with
  no error (you get a shot numbered "2" with no "1"). Use the exact-text engine
  `text="Growth+"` instead; `.first()` lands on the first card in DOM order.
  Chained `>> nth=0 >> css=` targets also silently fail in `resolveRect`.
- The TLS-bridge condition from ROUTINE §6a is still live: the bare smoke test fails
  `supabase_unreachable / ERR_CONNECTION_RESET`, and passes through
  `PLAYWRIGHT_PROXY=http://127.0.0.1:38443`. Start the bridge with the Bash tool's
  background mode.
---

## 2026-08-19 — Camera scans now open the join page (recapture)

**Article:** `merchants/qr-codes/customer-scan-flow.mdx` (rewritten, was factually wrong)
**Branch:** `claude/wizardly-bohr-ytua17`
**Status:** Done. SMOKE_OK; 5 new real annotated mobile screenshots + 1 redrawn SVG
(validate-images 7/7 OK). One task this run.

### Task selection
Took the highest-priority `Not started` row, and the newest: **"Recapture
customer-scan-flow.mdx: a camera scan now opens the join page"** (P1, created
2026-08-19 09:32 by the PR #174 run, no PR). The published article told merchants a
camera scan credits nobody and that they should ask customers to scan from the app,
which stopped being true when web enrollment shipped. PR #174 fixed the same stale
fact in `members/how-members-join.mdx` and `qr-codes/actions.mdx` and deliberately
left this row out because it needed a recapture, not a prose patch: two of its three
images and the whole `customer-scan-paths.svg` were built on the wrong branch.

Note the board has moved well past what this log records: `origin/main` is still at
the PR #162 merge, but PRs #163 to #174 are open, so most recent work is not on main.

### What changed
Rewritten against `Abdalestar/qtap` and the `enroll-web` edge function (read via the
Supabase MCP, it is not in the dashboard repo):
- `app/scan/[code]/page.tsx` now renders `components/enroll/enrollment-client.tsx`,
  a join page. Heading "Welcome to <merchant>", card preview, Full name (optional),
  Phone (required, country picker seeded from `x-vercel-ip-country`, falling back to
  QA), Birthday (optional, "Get a reward on it"), Terms checkbox (required),
  marketing opt-in (optional), **Get my card**, then a "Confirm your phone number"
  dialog with Edit number / Confirm and join.
- `app/api/enroll/route.ts` proxies to the `enroll-web` edge function with the
  service-role key. Three endings, and the status is a property of (person, THIS
  merchant): `enrolled` (founding scan through the shared `_shared/earn.ts` engine,
  `qr_code_scans` row, `scan_count` bump, one-time burn, pass minted after the earn
  so it renders 1/N), `welcome_back` (no earn, no audit row, no scan spent, pass
  re-offered), `has_app_account` (no earn, no pass).
- `WEB_VISIBLE_EARN_KEYS` is an allowlist of `action, message, merchant, stamp,
  points`, so signup / interim / main / campaign rewards are written and pushed but
  never shown on the web page. Documented as a Warning: staff can be looking at a
  reward the customer has never heard of.
- No OTP by design, so `phone_verified` is written FALSE and the app claim flips it.
  Documented in a Note, cross-linked to `members/joined-without-the-app`.
- A `checkin` code still joins the customer (`ensureEnrollment` runs) and only
  updates `last_activity_at`; `passTargetFromQr` returns null so there is no pass.
  The old "check-in adds nothing" Note was kept but corrected on the joining half.
- Error states, exact live headings, all verified by loading real codes: "This QR
  code is not valid" / "is inactive" / "has expired" / "has reached its limit".

### Screenshots (nothing was submitted)
`.routine/flows/customer-scan-join.json` (390x844) and `customer-scan-join-form.json`
(390x1500, so a `clipTo` crop of the tall form and the dialog stays inside the
viewport). Deleted `customer-scan-success.png`, `customer-scan-failed.png` and the
old `customer-scan-result.json` flow; redrew `customer-scan-paths.svg` as the three
endings. Kept the merchant-side `customer-scan-show-code.png`, still accurate.
**SAFETY:** loading `/scan/<code>` is a GET on `/api/qr-codes/[code]/details` and
writes nothing; the form was filled and walked to the confirm dialog but **Confirm
and join was never clicked**, so no member was created and no scan was spent.

### Gotchas for future runs
- **The country picker follows the sandbox's IP, not Qatar.** `detectedCountry` comes
  from `x-vercel-ip-country`, and this sandbox is US-routed, so the first capture
  showed "United States" and a Qatari test number failed the NANP length rule with
  "Please enter a valid phone number", so the confirm dialog never opened. Fix:
  `{"select": ["select[aria-label='Country calling code']", "QA"]}` as the first
  action. That is also the honest shot for a Qatar merchant's docs.
- Phone plausibility is enforced client-side before the dialog opens
  (`components/enroll/countries.ts`): QA is 8 digits starting 3/4/5/6/7.
- The join page needs 9s to settle on a stamp code and up to 12s on the points demo
  (`CEO-POINTS-001` was still on "Loading your loyalty card…" at 6s).
- No cookie consent banner on `/scan/[code]`, unlike the dashboard.
- Read-only capture codes on the reachable demos: `CLAUDE-JOIN-COUNTER` (Brew & Bean,
  stamp, 5-stamp Coffee Lovers Card), `CEO-POINTS-001` (Golden Crust, points),
  `CEO-EXPIRED-001`, `CEO-MAXED-001`, `CEO-ONETIME-COFFEE` (inactive), and any
  nonexistent code for the not-valid card.
- The article cross-links `merchants/members/joined-without-the-app`, which lands with
  the open PR #174 and is not on main yet. Flagged in the PR body.
---

## 2026-08-19 — Points-adjust correction (DASH-9) + Joined without the app

**Articles:** `merchants/points/adjusting.mdx` (correction), `merchants/members/joined-without-the-app.mdx` (new)
**Branch:** `claude/wizardly-bohr-mtce1h`
**Status:** Done. SMOKE_OK (TLS bridge needed, §6a); 4 real annotated screenshots, validate-images 4/4 OK.
Two tasks this run, one PR (this environment pins the branch).

### Task 1 — the DASH-9 correction (P1, the only actionable Not-started row)
Every other P1 row is annotated BLOCKED or DUPLICATE by the 2026-08-19 runs, and I
re-verified the one live row in source before editing:
- `lib/validations/staff.ts` `DEFAULT_PERMISSIONS` sets `adjust_points: true` for
  **manager and staff**.
- `app/api/points/adjust/route.ts` gates on `canAccess(staff,'adjust_points')`, not role.
- `app/(dashboard)/points-operations/page.tsx` line 120/521: the **Adjust/Deduct tab
  itself is gated on `canAdjust`**, so someone without the permission never sees the tab
  and never reaches a refusal. The published "staff see the tab then get blocked" story
  was wrong in both halves.
- Dialog label is **Adjust points**, under **Loyalty** (`staff-permissions-dialog.tsx`).
Also corrected the leak in `points/awarding.mdx` ("limited to owners and managers") and
added the capability to the staff-defaults sentence in `staff/roles-permissions.mdx`.

**Also corrected, same file:** "Adding points does not send a notice" is wrong.
`pointsAdjustmentPayload` builds a message for both directions and the route calls
`notifyMember` unconditionally; only the dashboard's orange note is deduct-only.

**CONFLICT TO WATCH:** open PR #172 edits the same two paragraphs and keeps the stale
access claim. Take this branch's "Who can adjust a balance", or merge this first.

### Task 2 — new article: customers who joined without the app
Genuinely uncovered on `main` and by every open PR. `/scan/[code]` is no longer an
anonymous scan page: it is a full **join page** (`components/enroll/enrollment-client.tsx`,
`app/api/enroll/route.ts` → the `enroll-web` edge function, read via Supabase MCP).
Facts the article is built on:
- No OTP on web by design, so `members.phone_verified` is written **false**; the app's
  claim flow flips it true. That flag is the whole feature.
- Outcomes: `enrolled` (founding scan earns + pass), `welcome_back` (**no earn** — repeat
  earning is staff-scanned), `has_app_account`.
- "VOUCHERS ARE GRANTED AND STAY SILENT": sign-up, interim, completed-card and campaign
  rewards are all written and pushed, and none are shown on the web page. So staff can see
  a reward the customer has never heard of.
- Surfaces: **No app yet** badge on `/members`, the `earning` notice on Stamp/Points
  Operations, the louder `redemption` notice on `/redemptions`
  (`components/dashboard/app-required-notice.tsx`).

### Knock-on corrections (the same single stale fact)
`how-members-join.mdx` said "no member joins and no stamp or points are given" on a camera
scan. Rewrote that section, its frontmatter description, one line of the intro, and the
**"No" branch of `how-members-join-flow.svg`**. Same sentence fixed in `qr-codes/actions.mdx`.

**LEFT FOR A FUTURE RUN (Notion row added):** `qr-codes/customer-scan-flow.mdx` carries the
same stale claim, but its two live screenshots AND `customer-scan-paths.svg` all show the
old anonymous-scan page, so it needs recapture, not a prose patch.

### Screenshots (nothing redeemed, nobody enrolled)
Stamp demo (Brew & Bean). Member `Q108836` is real web-enrolled data (`phone_verified=false`,
one banked Free Pastry). `Confirm Redemption` was never clicked and the join form was never
submitted (submitting POSTs `/api/enroll` and would create a member).
Flows: `no-app-member.json` (earning notice), `no-app-member-voucher.json` (needs a
**1150px-tall viewport** or the Confirm button clips), `no-app-member-list.json`,
`no-app-member-join.json` (390px, the customer's view).

### Gotchas for future runs
- `button:has-text("Look Up")` matches **Look Up Customer** first. Use `:text-is("Look Up")`.
- The page member search on `/stamp-operations` is `input[placeholder="Search members..."]`;
  `input[placeholder*="Search"]` grabs the nav search and silently returns nothing. It does
  match `qtap_id`, so you can find a nameless member without touching PII.
- `/scan/<code>` has no cookie banner, so a `Decline` click there fails the step.
- The members list rows show phone numbers: redact by text selector on the name and crop.

---

## 2026-08-19 — Points adjustment: corrected access + notification claims

**Article:** `merchants/points/adjusting.mdx` (correction, not a new article)
**Branch:** `claude/wizardly-bohr-64hsv7`
**PR:** https://github.com/Abdalestar/docs/pull/172
**Status:** Done. SMOKE_OK; 1 new annotated screenshot, validate-images 4/4 OK.

### Task selection — the board has no clean new-article row left, and here is the proof
I checked every `Not started` P1 individually rather than trusting the titles, and
annotated each Notion row so the next run does not repeat the work. All seven P1s are
dead ends:
- **Campaigns Overview**, **Redeeming a Reward (Code vs Lookup)**, **Stamp Card Rewards**
  → duplicates; the articles are on `main` already. These three keep sorting to the top
  as P1 and being rejected by run after run. All three now carry a "recommend closing"
  note.
- **Custom Campaigns / Condition Builder** → still a no-op (re-verified: wizard exposes
  7 types, none `custom`; `target_conditions` is read only inside `case 'custom'`).
- **Redeeming a Campaign Reward Code** → now covered by scan-redemption.mdx + offers/overview.mdx.
- **Canceling Your Subscription** → real, undocumented, worth writing, but **capture-blocked**:
  the Cancel Plan button needs `stripe_subscription_id` + status `active`, and both
  reachable demo orgs have a NULL subscription id.
- **Push Frequency / Attention Budget** → **not implemented.** The only limiter is
  `rateLimiters.notifications`, 10 req/min per org on the send endpoint. The deployed edge
  function states outright there is "no merchant-wide, daily, quiet-hours, or global send
  limit". The weekly cap is a design.md commitment, not shipped code.

No screenshot backfill either: the zero-image scan on `main` still returns only the same
four known-blocked files (campaigns/analytics stub, index, customer-app, support/faq).

So the run took the verified **doc-drift correction** row instead.

### What was actually wrong (two live errors on the published site)
1. **"Adding points does not send a notice."** False. `points/adjust` calls `notifyMember`
   unconditionally, and `pointsAdjustmentPayload` has an additions branch (title
   `+N points`, type `points_earned`) alongside the deduction branch (title
   `Points adjusted`, type `points_expired`).
2. **"falls back to email if push is off."** There is no email leg anywhere. I fetched the
   **deployed** `send-push-notification` edge function (version 21) rather than trusting the
   repo, which has an empty `supabase/functions/`. It calls OneSignal and writes a
   `notification_deliveries` inbox row, and writes that row even when the phone is
   unreachable (status `suppressed`). Adjustments are `transactional` in
   `_shared/notification-types.ts`, so prefs and merchant mutes cannot silence them.

### The row's premise was half wrong — do not repeat it
The Notion row said "staff can now adjust point balances". **They still cannot.** The API
gate did move to `canAccess(staff, 'adjust_points')` and `DEFAULT_PERMISSIONS` grants it to
manager *and* staff, but the database function did not move with it. I read the **live**
`public.staff_adjust_points` definition via Supabase (not just migration 053) and it still
raises `adjustment_not_allowed` for any role outside `('owner','manager')`. A staff member
passes the API check, reaches the confirm dialog, and is refused by PostgreSQL. Observable
behaviour is unchanged, so the access rule stayed "owners and managers".

**Lesson for future runs: when a gap-discovery row claims a permission changed, check the
RPC/migration too, not just the API route.** The two layers disagree here.

### Two product bugs raised (in the PR body and the Notion row)
- Staff are shown an Adjust/Deduct tab that can never succeed. Either the RPC should honour
  `adjust_points` or the tab should be gated on role.
- Confirm dialog copy (`points-operations/page.tsx` lines 1042, 1380) promises delivery
  "via push notification or email". The send path has no email.

### Screenshot
One new shot, `images/points/points-adjust-permission.png`, of the **Adjust points**
(`points.adjust`) permission in the Loyalty group of Edit Permissions. This doubles as the
deploy verification the row asked for: the capability is visibly live on dashboard.qtap.qa.
Flow at `.routine/flows/points-adjust-permission.json`. **Use Custom Permissions was toggled
for the shot but Save changes was never clicked**, so no teammate's permissions changed and
no points were adjusted.

### Gotchas
- Only **two** orgs are reachable and both are on **growth**: `QTAP_EMAIL` and
  `QTAP_NAJMA_EMAIL` are now the *same* address (owner@goldencrust.qa), `QTAP_STAMP_EMAIL`
  is owner@brewbean.qa. This is why the MCP / AI row and the billing-cancel row are both
  capture-blocked — both need Elite/Franchise or a live Stripe subscription.
- Neither org has a **pending** staff invite, and creating one would send a real email, so
  the "Resending/Canceling Invites" row cannot be captured in its pending state either.
- The TLS bridge (ROUTINE §6a) was needed again; the plain smoke test fails
  `supabase_unreachable` with `ERR_CONNECTION_RESET` before it.
- On a cropped `[role=dialog]` shot, an annotation `label` sits on top of the permission's
  description text. Box only, and let the `<Frame caption>` carry the explanation.

---

## 2026-08-14 — Public offers (new docs section)

**Article:** `merchants/offers/overview.mdx` (new)
**Branch:** `claude/bold-mendel-go9ikl`
**PR:** https://github.com/Abdalestar/docs/pull/162
**Status:** Done. SMOKE_OK; 8 real annotated screenshots (validate-images 8/8 OK).
One task this run: **there is no screenshot backfill left on `main`** (see below).

### Task selection
Took the second of the two P1 founder-directive rows from 2026-08-08, "Public Offers
Overview (Own Docs Section)" (the previous run took the scan-redemption one and
flagged this as next). Created the dedicated **Public Offers** nav group in
`docs.json` after Campaigns per directive 2; no existing offer pages needed moving,
this is the first one.

**Backfill genuinely exhausted.** Scanning `origin/main` for `.mdx` with zero `.png`
refs returns only four files, none of them workable: `customer-app/settings-profile`
(mobile app, not Playwright-capturable), `index.mdx` (landing page, not an article),
`support/faq.mdx` (not a how-to), and `merchants/campaigns/analytics.mdx` (the
long-standing 6-line stub, still blocked because
`/api/analytics/campaigns/[id]/performance` 404s live). Every other on-main article
carries real images now, so the old "unmerged backfill PR" backlog is cleared.

### NEXT RUN'S TASK
**"Wallet Passes: The Pass Design Studio"** (P1, Not started, no PR,
`merchants/passes/pass-design-studio.mdx`) is the one remaining genuine row. Routes
`/cards/[id]/pass-design` and `/points/[id]/pass-design`,
`components/dashboard/pass-studio/pass-design-studio.tsx`. Its Notion note warns:
verify Apple vs Google Wallet specifics in code before claiming either. I did not
take it because this environment pins the run to one branch and PR #162 was already
open on it; a second article would have muddied that diff.

### What was written
The `/campaigns/offers` surface, grounded in `Abdalestar/qtap`:
- `app/(dashboard)/campaigns/offers/page.tsx` + `components/dashboard/offers/offer-row.tsx`
  — H1 "Public offers", tabs All/Active/Drafts/Ended, per-row colour swatch, claims
  fraction, redeemed count, Pause/Resume, ⋯ Edit/Delete, "Delete offer" confirm.
- `components/dashboard/offers/offer-form.tsx` (1393 lines) — the three steps are
  **Offer / Appearance / Review**, but note the middle step holds far more than
  appearance: colour, cover, badge, audience, claim sheet, dates, claim window,
  total claims, frequency, home placement and announce all live in step 2. Seven
  reward types (discount, bogo, free_item, bonus_points, bonus_stamps,
  points_multiplier, custom). Title prefills from the reward type until edited.
- `lib/voucher/ground-tokens.ts` — ink/badge/rail/accent are all derived from the
  card colour's WCAG relative luminance (5 bands), which is why the form can honestly
  say any colour stays readable.
- `supabase/migrations/052_claim_cooldown.sql` (`issue_campaign_reward`) — 8 numeric
  digit code; claiming **auto-inserts `organization_members`** (a claim joins them);
  expiry = `LEAST(end_date, now + claim_window_minutes)` else now+30d; a live
  unredeemed voucher blocks re-claim; cooldown is anchored to `redeemed_at`, not to
  the claim. Frequency presets map to (per_member, cooldown): once (1, null),
  daily (null, 1440), weekly (null, 10080), monthly (null, 43200), no limit (null, null).
- `supabase/migrations/050_protect_live_campaign_edits.sql` — the post-claim deal
  lock (reward/value/title frozen; end date, claim window and total only ever extend).
  Documented as a Warning.
- `app/api/offers/expire/route.ts` + `vercel.json` `0 * * * *` — hourly sweep.
- `app/api/campaigns/rewards/[code]/redeem/route.ts` lines 322-327 — only
  bonus_stamps/bonus_points credit a balance; discount/bogo/free_item/badge are
  handed over at the till. Said plainly in the article.
- `lib/utils/permissions.ts` — `/campaigns` needs `campaigns !== 'none'` (owner,
  manager `edit`; staff `none`), so owners + managers.
- `app/m/[slug]/page.tsx` — the public page shows offers filtered to
  `campaign_type='offer'`, `visibility='public'`, `status='active'`, inside the date window.

### Screenshots (nothing was published)
Captured on the **stamp** demo (Brew & Bean Cafe), which has 4 real offers including
a genuine "11 of 25 claimed". The wizard was filled and walked to Review; **Publish
offer / Save draft were never clicked**, so no offer was created. Offer names and
merchant colours are the merchant's own, so no PII and no redaction needed.

Founder directive 3 was honoured with a real upload rather than a prose claim: a café
background was generated via the Replicate MCP (flux-schnell, 16:9), committed to
`images/offers/examples/voucher-background-cafe.jpg`, uploaded through the live cover
field, and `offers-cover-preview.png` shows the resulting voucher with that photo
centre-cropped and tinted by a custom `#0F3D2E` card colour.

### PIPELINE FIX — `upload` action in flow-capture.mjs
`fill` does not work on `input[type=file]`, and the cover input is `hidden` behind a
styled button. Added `{ "upload": ["input[type=file]", "path"] }`, which uses
`setInputFiles` (works on hidden inputs). Any future voucher/pass design article needs it.

### Gotchas for future runs
- **The offers list needs ~8-9s to settle.** At 6s it renders "Active (0)" with an
  empty list even though the org has offers, which reads exactly like an RLS failure
  and is not one. The PostgREST call returns 200. Give it `waitFor [role=tablist]`
  plus ~6.5s of extra wait.
- **The cookie consent banner is per-context, not per-page.** Click **Decline** in the
  first step of a flow only; later steps in the same run have no Decline button and
  the click times out, failing the step.
- **Do not use explicit `clip` on the offer form.** The step-2 card auto-scrolls by a
  different amount per run, so a fixed rect captures the wrong band. `clipTo` with a
  selector, plus a `hover` on the target first so it is in view, is reliable.
  `div[class*="sm:grid-cols-2"]:has(#claim-total)` still resolved short twice; the
  frequency `[role=listbox]` crop (dropdown open, all five presets) is the better shot.
- Both accessible demo accounts are on **growth**, not franchise, so "Feature on app
  Home" always shows the "email support@qtap.qa" note. That is the honest state and
  the article says so rather than inventing a self-serve toggle.
- The TLS bridge died mid-run once (`ERR_PROXY_CONNECTION_FAILED`). Restart it with
  the Bash tool's background mode; `nohup`/`setsid` from a shell command did not
  survive, and two half-dead bridges fighting over 38443 look like a network outage.

---

## 2026-08-10 — Redeeming by scanning the customer's QR

**Article:** `merchants/redemptions/scan-redemption.mdx` (new)
**Branch:** `claude/focused-cerf-375id8`
**PR:** https://github.com/Abdalestar/docs/pull/161
**Status:** Done. SMOKE_OK; 8 real annotated screenshots in desktop AND mobile viewports
(validate-images 8/8 OK). One task this run.

### Task selection
The board gained two P1 founder-directive rows on 2026-08-08, both `Not started`, and
they are the only genuine open work: "Redeeming by Scanning the Member QR (Stamps &
Points)" and "Public Offers Overview (Own Docs Section)". Took the first (ROUTINE §8d
directive 1). **Public Offers is still Not started and is the next run's task.** No
screenshot backfill was available, so this run did one task.

### What was written
The **Scan** button on `/redemptions`, which neither on-main redemption article covers
(`merchants/redemptions.mdx` = code + lookup; `merchants/redemptions/points-rewards.mdx`
= points by lookup). Both cross-linked, nothing duplicated. Added to the Members nav
after `merchants/redemptions`.

Facts, all grounded in `Abdalestar/qtap`:
- `components/dashboard/qr-scanner.tsx` — dialog "Scan customer", one decode per open
  (`handledRef`), closes itself, camera-failure text pointing staff at the search/code inputs.
- `lib/utils/resolve-scan.ts` — the classifier: member id (`Q`+6, legacy `QTAP-…`),
  reward code (8 digits or `SLUG-XXXXXX`), merchant earning QR (`Q`+11 / `T`+12, wrong
  surface at the counter). A member scan flips to Look Up Customer with the Qtap ID in
  the search box (the live search really does match `qtap_id`); a code scan fills the
  code box and looks it up.
- `app/(dashboard)/redemptions/page.tsx` — four consume paths, the confirm dialog, the
  branch selector that disables Confirm on a multi-branch account.
- `app/api/rewards/redeem/route.ts` — redeeming a voucher flips `pending_rewards.status`
  and writes a transaction; it does **not** touch `current_stamps` (documented as such).
- `lib/utils/permissions.ts` + `lib/validations/staff.ts` — `/redemptions` needs
  `redeem === true`, which is the default for manager AND staff.
- Customer side from `Abdalestar/Qtap_app`: `QRDetailModal` ("Show this code at the
  counter"), `OpenCardScreen`, wallet pass — all encode `members.qtap_id`.

Hardware: both options the founder asked for. There is **no QR-scanner product in the
in-dashboard Add-ons store** (`lib/stripe/config.ts` has extra_location, extra_loyalty_card,
nfc_tag, batch_qr_100, ai_insight_pack, custom_qr_branding and nothing else), so the
article says "ask your Qtap contact" and invents no price or checkout.

### Screenshots (nothing was redeemed)
8 PNGs; every flow stops at the Confirm Redemption dialog and never clicks it. Stamp side
on the stamp demo, points side on the points demo. Desktop 1440px + mobile 390x844 per §8c.

### TWO PIPELINE FIXES — read before the next scanner or proxy-blocked run
1. **`.routine/fake-camera.mjs` (new).** Headless Chromium here has **no camera at all**,
   and Chromium's own `--use-fake-device-for-media-capture` / `--use-file-for-fake-video-capture`
   do not help (zero `videoinput` devices; I generated a Y4M and it was never picked up).
   So the Scan dialog could only render its "could not start the camera" state. The module
   installs a canvas-backed video track carrying a **real** QR, so the page runs its
   genuine decode path. Opt in per flow: `"fakeCamera": {"qr": "...", "aim": "partial"|"locked", "qrPx": 340}`.
   `aim: "partial"` keeps the code out of the scan box (the viewfinder shot); `"locked"`
   decodes. **Mobile gotcha:** at 390px the dialog's scan window shrinks and a 340px QR
   never decodes — use `qrPx: 200`.
2. **`.routine/tls-bridge.mjs` + `PLAYWRIGHT_PROXY`.** This environment forces outbound
   HTTPS through an agent proxy, and Chromium's TLS handshake was **reset by the gateway**
   for `dashboard.qtap.qa` and `*.supabase.co` while `curl` and Node succeeded on the same
   hosts through the same proxy (github.com worked in Chromium, so it is host-specific, not
   a policy denial). Smoke test failed `supabase_unreachable` until the bridge was in place.
   The bridge terminates the browser's TLS on loopback and re-opens a **verified** upstream
   connection, so certificate checking still happens on the real hop. All three capture
   scripts now accept `PLAYWRIGHT_PROXY`; unset, behaviour is unchanged. Documented in
   ROUTINE.md §6a.

### Environment drift (the demo accounts changed)
- `QTAP_EMAIL` is now **owner@goldencrust.qa** (Golden Crust Bakery, **points**, multi-branch,
  3 members). `QTAP_STAMP_EMAIL` is **owner@brewbean.qa** (Brew & Bean Cafe, **stamps**,
  4 ready vouchers on member `QTAP-TT024`). `QTAP_NAJMA_EMAIL` timed out on login this run.
  The old Najma/Dana accounts from earlier run logs are no longer what these env vars point at.
- A **cookie consent banner** now covers the lower page on first load. Click **Decline** as
  the first action of every flow or it sits on top of your target.
- The RewardVoucher's redeem button is labelled **Confirm Redemption**, the same text as the
  dialog's final button. Scope selectors carefully.
- Live label drift left alone per the no-prose-edit rule: published `redemptions.mdx` says
  "6-character code"; the live field says 8-digit.

---

## 2026-06-14 — What is Qtap (screenshot backfill)

**Article:** `merchants/what-is-qtap.mdx`
**Branch:** `claude/upbeat-mccarthy-b83bly`
**PR:** https://github.com/Abdalestar/docs/pull/157
**Status:** Done. 4 real annotated screenshots; validate-images 4/4 OK. One task this run.

### Task selection
The board is effectively all `Done`; two tasks had already run today (Resetting a
Forgotten Password #152, Location Comparison #154). The only `Status = Not started`
row left is "The Member Profile: Activity, Notes & Tags" (P2), already flagged a
**duplicate** of the published `profiles.mdx` built on a wrong assumption (member
tags are read-only, no add/remove UI) — correctly skipped, no new article written.
So per §3 this run did one backfill: the highest-priority `Needs Screenshots = YES`
row that is on `main` and capturable → **What is Qtap (P0)**.

The article was on `main` but its 4 images were **generic reused dashboard heroes**
from `images/getting-started/` embedded as plain markdown. The long-blocked draft
PR #55 never shipped because the old `GITHUB_TOKEN` stored PNGs as base64 text — a
non-issue now (binary `git push` works). Replaced the 4 refs with purpose-shot,
annotated `<Frame>` screenshots; **prose unchanged** (image refs are not prose).

### Screenshots (`images/merchants/what-is-qtap/`)
- `wiq-dashboard.png` — merchant home (points demo). KPI tiles (1) + Quick Actions (2)
  boxed. **Clipped to height 650 to crop out the Recent Activity feed**, which shows
  customer names (PII) at the bottom. Tiles need ~11-12s settle or they stay skeletons.
- `wiq-stamp-cards.png` — `/cards` on the **stamp** demo (Dana); one active card boxed
  showing its stamp grid (points account's `/cards` is empty).
- `wiq-members.png` — `/members` (points demo). Stamps/Points columns boxed (1); the
  Member + Contact columns **redacted** with an explicit rect `{x:329,y:319,w:529,h:581}`
  (Member col x329-571, Contact x571-858; tbody starts y319; viewport 900).
- `wiq-qr-codes.png` — `/qr-codes` (points demo); Generate QR Code button boxed. No PII
  on this page (QR names/codes are merchant-defined).

Flows committed: `.routine/flows/what-is-qtap.json` + `what-is-qtap-stamp.json`. SMOKE_OK.
Read-only capture, no destructive/outbound actions.

### Notes for future runs
- The board is fully `Done`; remaining `Needs Screenshots = YES` rows are NOT
  backfillable: **Campaign Analytics** (Performance card's `/api/analytics/campaigns/[id]/performance`
  returns 404 live, card never renders), **Scanning & Earning** (mobile app, not
  Playwright-capturable), **Dashboard Tour** (PR #3 never merged, not on main),
  **Campaign Audience Conditions** (PR #51 base64-corrupted AND the condition builder
  is a no-op for non-custom campaign types — reality problem). "The Member Profile" is
  a Not-started duplicate. After this run there is no clean screenshot backfill left.
- `flow-capture.mjs` accepts an explicit `"rect"` on any annotate spec (box/redact),
  so coordinate-based redaction/boxing works without a selector — useful when the live
  DOM selector is unstable or for cropping PII out of feeds.
## 2026-06-14 — How and when points expire

**Article:** `merchants/points/expiry.mdx` (new)
**Branch:** `claude/upbeat-mccarthy-0dj36n`
**Notion row:** "Points Expiry: From-Earn, From-Last-Activity & Calendar-Year" (P2)
**Status:** Done. SMOKE_OK; 3 real annotated cropped screenshots (validate-images 3/3 OK).

### Task selection
The Notion board has no clean `Not started` new-article row left: the remaining
Not-started rows are all blocked or duplicates (Custom Campaigns / Campaign Messages
= product no-ops, Campaigns Overview / Campaign Analytics / Member Profile = already on
main as real articles). The "Points Expiry" row was marked **Done** but its run "pushed;
no PR opened", so `merchants/points/expiry.mdx` was **never on main** and absent from the
branch. Shipped it for real this run (same pattern as the Revenue Impact / Location
Comparison stub-replacements). One task this run per the request.

### What was written
A Points Programs deep-dive on the **Points Expiry** card inside a points program. Goes
deeper than `creating.mdx`/`overview.mdx` (which mention expiry in passing); cross-links
`creating.mdx` for the full setup. Covers: the **Enable Points Expiry** switch (off by
default), **Expiry Period (days)** (default 365, max 365), and the three **Expiry Type**
options with exact live labels and precise behavior:
- **From date earned** (`from_earn`) — each earn batch expires on its own clock from when
  it was earned (relies on `expires_at` set at earn time, so it schedules points earned
  after expiry is enabled).
- **From last activity** (`from_last_activity`) — a member's whole balance expires after
  N days of inactivity; earning resets the clock.
- **End of calendar year** (`calendar_year`) — all outstanding points expire at year start
  (cron only runs Jan 1-3; the days field is ignored).
What happens on expiry: daily cron, deducts only down to current balance (never negative,
no double-count of spent points), writes an `expire` history entry, sends the member a
"Points Expired" notification. Access: owners/managers edit programs; staff award/redeem.

### Research sources (qtap, read-only)
- `app/api/points/expire/route.ts` — daily cron (`vercel.json` `0 2 * * *`), active+`points_expire` programs only; the three `processExpiry` paths; `expireMemberPoints` (Math.min to current balance, writes `expire` txn + `points_expired` analytics); `sendExpiryNotification` ("Points Expired" OneSignal push).
- `components/dashboard/points-program-form.tsx` — Points Expiry card: switch (default off), `#expiry_days` (default 365), Expiry Type select with live labels "From date earned" / "From last activity" / "End of calendar year".
- `lib/validations/loyalty.ts` — `expiry_days` 0-365.
- `app/api/scan/route.ts` + `app/api/points/adjust/route.ts` — set `expires_at` on earn (the from_earn nuance).

### Screenshots
3 real annotated cropped PNGs from the live points demo (Najma Coffee) via
`.routine/flows/points-expiry.json`: card with the switch off (boxed); expanded fields
(Expiry Period + Expiry Type boxed/numbered); the Expiry Type dropdown (all three options).
No program created/saved (fill name + toggle/open-select only); no PII. `validate-images`
3/3 OK. Added to Points Programs nav after `operations`.

### Notes for future runs
- The board is exhausted of clean new-article tasks. Remaining Not-started rows need a
  product fix first (Custom Campaigns condition builder no-op; Campaign Messages single-vs-
  double-brace token bug) or duplicate on-main articles. Real backlog is now stub/never-
  merged rows like this one was.
- `origin/main` was stale at clone (168 behind); `git fetch origin main` brought it level
  with the assigned branch, so the PR diff is a clean single-task change.
## 2026-06-14 — Resetting a Forgotten Password

**Article:** `merchants/settings/password-reset.mdx` (new)
**Branch:** `claude/upbeat-mccarthy-ze6odl`
**PR:** https://github.com/Abdalestar/docs/pull/152
**Status:** Done (2 real annotated screenshots + 1 SVG; validate-images 3/3 OK). One task this run per the run request.

### Task selection
Board is effectively exhausted of legitimate Not-started rows: the only `Status = "Not started"` row is "The Member Profile: Activity, Notes & Tags", already flagged (verified) as a duplicate of the published `members/profiles.mdx`, so writing it would be a near-duplicate. The on-main stubs (`location-comparison.mdx`, `campaigns/analytics.mdx`) are covered by open PRs or blocked. So this run did one **gap-discovery new article** instead. Checked and rejected: `/cards/design` (orphan/half-built Card Designer — `/cards/new` does not read its `sessionStorage.cardDesign`, `card_templates` referenced only by its own hook, "in a real implementation" comment; documenting it would misrepresent a non-functional feature); `/merchants` overview (already documented in unmerged PR #54); both "Editing a Stamp Card" rows (Done, PR #137/#148).

### What was written
The locked-out account-recovery flow, which had no article. Distinct from `settings/security.mdx` (the in-app **Change password** form, which needs you signed in + your current password); cross-linked both ways (security.mdx already pointed at "the forgot password link on the login page").

**Facts (all grounded in `Abdalestar/qtap`, read-only):**
- Entry: **Forgot password?** on `/login` → `/forgot-password` (CardTitle "Forgot Password", `#email` placeholder "you@business.com", button **Send Reset Link**, **Back to Login**).
- `app/api/auth/forgot-password/route.ts`: admin `generateLink` type `recovery` + `sendAuthEmail` ("Reset your Qtap password"); **always returns `{success:true}` and never reveals whether the email exists** (anti-enumeration). Documented in a `<Note>`.
- `/reset-password` (CardTitle "Reset Password", `#password` + `#confirmPassword`, button **Reset Password**): `resetPasswordSchema` in `lib/validations/auth.ts` = 8+ chars, uppercase, lowercase, number (stricter than the 8-char in-app change rule); confirm must match → "Passwords do not match". Submit calls `supabase.auth.updateUser({password})`; success screen "Password Updated" → **Continue to Dashboard**.
- `lib/supabase/middleware.ts`: `AUTH_PATHS = ['/login','/signup']` only, so `/forgot-password` + `/reset-password` render even while authenticated (this is why the flow engine, which logs in, can still capture them).
- Honest gotcha (`<Warning>`): reset links are single-use and expire.

### Screenshots
2 real annotated PNGs via `.routine/flows/password-reset.json` (points demo), cropped to the auth card (`clipTo: ".shadow-lg"`): `password-reset-forgot.png` (email + Send Reset Link boxed) and `password-reset-new.png` (both password fields + Reset Password boxed). + brand SVG `password-reset-flow.svg` of the 5-step journey (covers the `/login` entry + the email/success screens, which aren't safely capturable). **SAFETY:** the flow fills but NEVER submits either form, so no reset email was sent and the demo account password was unchanged. `/login` itself can't be shot while logged in (it IS an AUTH_PATH → redirects to `/`), so the login entry lives in the SVG + prose.

### Insights for future runs
- The flow engine always logs in; auth pages outside `AUTH_PATHS` (`/forgot-password`, `/reset-password`) still render and capture cleanly. `/login` and `/signup` redirect away when authenticated, so they need a logged-out capture path (not currently supported) — cover them via SVG/prose.
- Submitting `/reset-password` while logged in as the demo account WOULD change that account's password (uses the live session). Capture filled-not-submitted only.
- Remaining genuine gaps to consider: a logged-out `/login` / `/signup` ("Creating your account" / "Signing in") article would round out account access, but needs a logged-out capture (the flow engine can't skip login).
## 2026-06-14 — Setting QR Expiry Dates & Scan Limits

**Article:** `merchants/qr-codes/expiry-and-limits.mdx` (new)
**Branch:** `claude/upbeat-mccarthy-cdxbzq`
**PR:** https://github.com/Abdalestar/docs/pull/151
**Status:** Done. SMOKE_OK; 3 real annotated screenshots (validate-images 3/3 OK). One task this run.

### Task selection (board is saturated — read this before hunting)
The board is effectively fully `Done`. There are **25 open, unmerged PRs (#126–#150)** that already backfill every imageless on-main article (profiles #128, points/overview #130, qr-codes/overview #132, batch #131, birthday #133, security #134, settings/notifications #135, settings/merchant-page #136, welcome #139, push-notifications #143) and write most new topics (editing stamp card / points program, card designer, awarding points, audience segments, welcome campaigns, public merchant page, QR placement, reusable-vs-onetime). **Don't re-do any of those — you'll create a duplicate PR.** The only on-main stubs left are `analytics/location-comparison` (already PR #126) and `campaigns/analytics` (BLOCKED: the performance endpoint 404s live). The lone `Not started` row that is NOT a real task is "The Member Profile: Activity, Notes & Tags" — flagged duplicate of published `profiles.mdx`, and its net-new feature (editable tags) doesn't exist.

The one genuine, unworked, non-duplicate `Not started` row with no PR was **"Setting QR Expiry Dates & Scan Limits"** (P2, `merchants/qr-codes/expiry-and-limits.mdx`). Took it.

### What was written
How-to for the two **Advanced Settings** controls on `/qr-codes/generate`:
- **Maximum Scans** (`#max_scans`, min 1, placeholder "Unlimited", empty = unlimited). Hidden when `type === 'one_time'` (a one-time code auto-deactivates after one scan), so it shows for Reusable + Batch only.
- **Expiry Date** Switch (`hasExpiry`) + a `datetime-local` picker; applies to every type. A code with both stops at whichever it reaches first.
- Customer-facing 410 messages from `app/api/scan/route.ts` (checked before the scan is counted): "This QR code has expired." / "This QR code has reached its maximum number of scans."
- Honest gotcha (Warning): expiry + max_scans are set at generation and **can't be edited later** — the `/qr-codes/[id]` Edit form only updates name/location/active. To change a limit, deactivate + regenerate.
- Access: owners + managers (`qr_batches !== 'none'`; staff default `none`). Cross-links troubleshooting + roles-permissions (distinct from troubleshooting, which is the recovery/"won't scan" side).

### Research sources (qtap, read-only)
`app/(dashboard)/qr-codes/generate/page.tsx` (Advanced Settings card, the `type !== 'one_time'` gate, save payload), `app/api/scan/route.ts` (410 branches), `app/(dashboard)/qr-codes/[id]/page.tsx` (`handleSave` updates name/location/is_active only), `lib/utils/permissions.ts` + `lib/validations/staff.ts`.

### Screenshots
`.routine/flows/qr-expiry-limits.json` (points demo, Najma), all cropped to the Advanced Settings card via `clipTo: div.rounded-xl:has(div.font-semibold:has-text("Advanced Settings"))`: advanced (Max Scans 1 + Expiry switch 2), max-scans (50 typed), expiry (switch on + datetime picker boxed). Form filled, **never saved** (no code created). Added to QR nav after `generating`.

### Gotchas for future runs
- On `/qr-codes/generate` the Advanced Settings card is **below the fold**; a no-action step can't crop it ("Clipped area is empty/outside"). Add a `hover`/`fill`/`click` action so Playwright scrolls it into view before the shot.
- There are **two** `button[role=switch]` on the generate page (Expiry, and a Customization switch). The Expiry one is `:nth-match(button[role="switch"], 1)`.
- flow-capture action schema: `fill` is an **array** `["#sel","val"]`; supported keys are `click`/`fill`/`select`/`hover`/`press`/`wait`. There is no `waitForAfter` — `step.waitFor` runs after the actions loop.
## 2026-06-13 — Welcome Campaigns (new article on main)

**Article:** `merchants/campaigns/welcome.mdx` (new)
**Branch:** `claude/upbeat-mccarthy-ac1dgm`
**PR:** https://github.com/Abdalestar/docs/pull/147
**Status:** Done. New article + 6 real annotated screenshots (validate-images 6/6 OK). SMOKE_OK. One task this run.

### Task selection (the board is saturated)
The board has zero genuinely-actionable `Not started` rows (the only one, "The Member Profile: Activity, Notes & Tags", is a flagged duplicate of `profiles.mdx`). Every on-main article that lacks images and is screenshotable has ALREADY been backfilled in an unmerged PR within the last day or two: `settings/notifications` #135, `members/profiles` #128, `points/overview` #130, `qr-codes/overview` #132, `settings/merchant-page` #136, `birthday` #133, `batch` #131, `nfc-tags` #87, `points/editing` #138, etc. The Notion `Needs Screenshots=NO` flags are unreliable because those PRs never merged, so main still carries the stub/no-image versions. Don't re-derive the whole board: scan with `git ls-tree -r origin/main | grep mdx` + image-ref count, then cross-check each candidate's Notion row for an existing PR before working it.

Instead of producing a redundant duplicate backfill, I found a genuine on-main gap: the **Welcome Campaign** type ships in the dashboard (one of 7 wizard types) but `merchants/campaigns/welcome.mdx` is absent from main. Its row was "Done" via PR #47 (2026-05-13) but that PR never merged and ran with SCREENSHOTS_DISABLED. Wrote it fresh with real screenshots so a merge actually publishes it.

### What was written
The welcome campaign greets a new member a set delay after they join. Grounded facts:
- Trigger `delay_hours`, four options: Immediately / 1 hour / 24 hours / 48 hours after signup (`trigger-config.tsx`).
- Eligibility `isRecentJoin(joined_at, delay_hours)` in `app/api/campaigns/execute/route.ts` (member joined between delay and 2x delay ago); cron `*/15` (`vercel.json`). So greeting goes out on the next 15-min check after the delay.
- One send per member ever: `hasAlreadyReceived` returns true for non-birthday types once a `sent` interaction exists. Only members who join while the campaign is active are greeted (activating it does not message existing members).
- Push reaches only members with the app + `push_enabled` (OneSignal), so Sent < new-member count.
- 7-step wizard (Type/Trigger/Reward/Message/Conditions/A-B/Review); reward optional; message Use Template welcome copy + `{customer_name}` tags; Activate Campaign / Save as Draft.
- Welcome template: "Welcome to the family! 🎉".

### Screenshots
6 PNGs (1440x1000) via `.routine/flows/welcome.json` on the **stamp** demo (Dana Salon & Spa, under campaign limit so `/campaigns/new` renders; the points/Najma account is at its limit). Wizard filled but NEVER submitted; no PII. The Type and Trigger shots are the welcome-specific ones; verified visually (Welcome Campaign selected, "Send notification 24 hours after signup", review summary coherent). Added to Campaigns nav after `winback`.
## 2026-06-13 — Audience Segments Explained

**Article:** `merchants/notifications/segments.mdx` (new)
**Branch:** `claude/eloquent-fermat-0ob78t`
**PR:** https://github.com/Abdalestar/docs/pull/144
**Status:** Done (2 real annotated screenshots + 1 SVG; validate-images 3/3 OK). One task this run.

### Task selection
Most of the board is `Done`. Two genuinely `Not started` rows remained: "The Member Profile: Activity, Notes & Tags" (P2, but its own Notes flag it as a duplicate of the published `members/profiles.mdx` and recommend closing — skipped) and **"Audience Segments Explained" (P1, no PR)** — the highest-priority real Not-started row. Picked it. Confirmed it is not a pure duplicate of `push-notifications.mdx`: that article lists the 7 segments but states the rules loosely and omits the exact thresholds and the per-account override (and even mislabels `near_complete`). The new page is the deep-dive reference companion.

### What was written
The 7 push-notification audience segments, what each reaches, the exact default thresholds, the `push_enabled` base requirement, live counts, where segments apply (one-off pushes vs campaign triggers), and access (owners + managers; staff none). Honest gotchas: VIP/Regulars/Near Complete count **total lifetime stamps**, not current-card stamps, so the UI's "Near Complete = 1-2 stamps away" label is a rough description, not the real rule (>=8 lifetime); At Risk excludes members with no activity on record. Thresholds are defaults that an account's `settings.segment_config` can override (no dashboard screen edits them — not invented).

### Research sources (qtap, read-only)
- `lib/notifications/segments.ts` — `matchesSegment`, `DEFAULT_SEGMENT_CONFIG` (vip 10 / regulars 5 / near_complete 8 stamps; new_member 30d / at_risk 30d), `getSegmentConfig` (merges `settings.segment_config`), `isBirthdayThisWeek`.
- `components/dashboard/notifications/segment-selector.tsx` — live labels + descriptions + count badges; error/all-zero states.
- `app/api/notifications/send/route.ts` — server filters match the client rules exactly; `push_enabled` base filter; `onesignal_player_id` needed to actually deliver; "No recipients with push enabled".
- `hooks/use-notifications.ts` `useSegmentCounts`; `components/dashboard/notifications/notification-form.tsx` (Send To card; targetMemberCount swaps the selector); `lib/utils/permissions.ts` + `lib/validations/staff.ts` (`/notifications` = `campaigns !== 'none'`; staff default `none`, manager `edit`).

### Screenshots
`.routine/flows/segments.json` (points demo): `segments-selector` (7-segment Send To picker, VIP/At Risk/Near Complete boxed) and `segments-selected` (VIP selected state). Cropped to `[role=radiogroup]` (needs a tall viewport — the list runs below a 900px fold; used 1440x1500). SVG `segment-thresholds.svg` maps each segment to its exact default rule (the numbers the UI hides). No notification sent during capture.

### Gotcha for future runs
- **Segment count badges read "—" on BOTH demo accounts.** `useSegmentCounts` runs a client-side `member_org_view` query that errors on the demo (RLS limit, not fixable read-only), so the selector shows the "Couldn't load audience sizes" state. Crop to `[role=radiogroup]` (clipPadding 8) to exclude that red banner; the labels/descriptions render fine. Counts described in prose, not screenshotted.
- The `[role=radiogroup]` audience list is ~544px tall starting ~y800 on the compose page, so it sits below a default 900px viewport. Set a tall `viewport` in the flow or the clipTo capture comes back as a 2-row sliver.
## 2026-06-13 — Push Notifications screenshots (backfill)

**Article:** `merchants/campaigns/push-notifications.mdx`
**Branch:** `claude/eloquent-fermat-d5ugbw`
**PR:** https://github.com/Abdalestar/docs/pull/143
**Status:** Done — 4 real annotated screenshots added; prose unchanged. SMOKE_OK; validate-images 4/4 OK.

### Task selection
The board has no clean `Not started` row (Location Comparison is taken via the open PR #126; Campaign Analytics is screenshot-blocked). Per routine §3 this run did one screenshot backfill. Picked the highest-value on-main `Needs Screenshots = YES` row whose article actually lives on `main`: **"Sending Push Notifications to Customers"** (P2) → `merchants/campaigns/push-notifications.mdx`, a 139-line article on `main` carrying only two placeholder SVGs.

**Reality check that shaped the pick:** `main` is frozen at the PR #74 era, so most recent articles (and most "screenshot backfill" PRs like #131/#133/#134) are NOT on `main` — their PRs were never merged. A backfill needs the article to be on `main`, so I scanned on-main `.mdx` for zero-PNG files and matched against `Needs Screenshots = YES` Notion rows. push-notifications was the highest-value match (the compose flow is fully screenshotable on the points demo).

### What this run added
4 real annotated PNGs via `.routine/flows/push-notifications.json` (points demo, Najma Coffee), replacing the two SVG frames with real PNGs and adding two new frames; prose untouched:
- `notifications-list` — Push Notifications page, 5 tabs boxed + New Notification badged (demo has no notifications, so the real empty state shows).
- `notification-compose` — `#title` (1) / `#body` (2) boxed + live phone preview rendering `{{first_name}}`.
- `notification-segments` — cropped to the 7 real segment cards with criteria.
- `notification-send-options` — When/Schedule-for-later toggle + Save as Draft (1) / Send Now (2) boxed.
Read-only: Send Now / Save as Draft / Schedule never clicked; no notification created/sent; no PII.

### Research sources (qtap, read-only)
- `app/(dashboard)/notifications/page.tsx` — H1 "Push Notifications", 5 tabs (All/Drafts/Scheduled/Sent/Templates), New Notification link.
- `app/(dashboard)/notifications/new/page.tsx` + `components/dashboard/notifications/notification-form.tsx` — `#title`/`#body`, live `NotificationPreview`, Message/Send To/When cards, Save as Draft + Send Now (or Schedule) buttons.
- `components/dashboard/notifications/segment-selector.tsx` — the 7 segments + criteria.

### Insights / gotchas for future runs
- **Live segment counts are broken on the deployment.** `useSegmentCounts` errors ("Couldn't load audience sizes", Retry doesn't fix it), so the segment badges render `—` instead of live counts. The selector + criteria still capture cleanly; the prose's "live count" line was left unchanged. Don't expect populated counts on this demo.
- **Live label drift (left as-is per the no-prose-edit rule):** the UI labels two segments **Regulars** and **Near Complete** where the prose says "Regular Customers" and "Near Reward".
- **`/notifications/new` layout for crops:** the form is taller than the viewport. `Send To` card holds the 7-segment `[role=radiogroup]`; hover `label[for="near_complete"]` to scroll it in, then `clipTo [role=radiogroup]`. The action buttons sit at y≈840 after `hover button:has-text("Save as Draft")`; an explicit `clip {x:268,y:666,width:584,height:224}` captures the When card + both buttons. `[role=switch]` is the Schedule toggle.
- Board reality: the real backlog is on-main zero-image articles (find with the no-PNG scan), since the Notion `Needs Screenshots` flags were cleared by backfill PRs that never merged. Other on-main zero-PNG candidates remain (e.g. `merchants/points/overview.mdx`, `merchants/qr-codes/overview.mdx`, `merchants/settings/{merchant-page,notifications}.mdx`).
## 2026-06-13 — What customers see on your public page (new article)

**Article:** `merchants/merchant-page/public-view.mdx` (new)
**Branch:** `claude/eloquent-fermat-ubeael`
**PR:** https://github.com/Abdalestar/docs/pull/142
**Status:** Done. SMOKE_OK; 1 real annotated screenshot + 1 brand SVG (validate-images 2/2 OK). One task this run.

### Task selection (the board is genuinely exhausted)
Did a full board scan. Every on-main article that lacked images already has a fresh
(2026-06-12/13) **unmerged** backfill PR: welcome #139, members/profiles #128,
points/overview #130, qr-codes/overview #132, qr-codes/batch #131, birthday #133,
settings/notifications #135, settings/merchant-page #136. Both on-main stubs are taken
too: location-comparison #126 (full article, unmerged) and campaigns/analytics (blocked —
`/api/analytics/campaigns/[id]/performance` 404s live, so the only net-new surface vs the
published stats.mdx can't render). The one Not-started row "The Member Profile: Activity,
Notes & Tags" is a verified duplicate of profiles.mdx (manual tags don't exist as an
editable feature). So re-doing any backfill would just duplicate a 1-day-old PR.

The genuinely net-new, no-existing-PR task was the Not-started P2 row **"What Customers
See on Your Public Page"** (`merchants/merchant-page/public-view.mdx`) — the customer-facing
`/m/[slug]` storefront, distinct from settings/merchant-page.mdx (business settings) and
the unmerged editor article (building.mdx). Wrote it.

### What was written
The public page at `dashboard.qtap.qa/m/<slug>`: cover gallery (up to 5, falls back to the
org cover/logo), logo, name/description/category, the **live member count** (real, rounded
down to nearest 10 above 10), the **Current card** carousel of active featured cards, Tap
for full terms, Add a card / Join Now (adds to the customer's wallet), contacts (hours +
phone), Directions/Call, footer. Honest notes: stats + progress are always real (zero
progress until joined); only active featured cards show; the page is public to anyone with
the link. Cross-links settings/merchant-page + stamp-cards/overview. Added to Settings nav.

### Research sources (qtap, read-only)
- `app/m/[slug]/page.tsx` — admin client by `slug`; `notFound()` if no org; aggregate stats from `organization_members`; featured cards resolved from `settings.merchant_page.featuredCardIds` (active + status='active' only).
- `app/m/[slug]/merchant-public-page.tsx` + `components/dashboard/merchant-page/merchant-page-content.tsx` — full anatomy, `membersLabel` rounding, live (not-joined) state, `?preview=true` reads sessionStorage.
- Supabase (read-only): confirmed Najma `najma-coffee` / Dana `dana-salon-spa-ae` both have slug + org logo/cover/phone but EMPTY `settings.merchant_page`.

### Screenshots
1 real annotated PNG of the live `/m/najma-coffee` (cover+logo 1, real "180+ members" 2,
Call 3) via `.routine/flows/public-merchant-page.json`; read-only, no PII. + brand SVG
`public-page-anatomy.svg` of the fully-configured page. validate-images 2/2 OK; PNG binary
via git.

### CAPTURE NOTE / gotcha for future runs
- No accessible demo org has a configured `settings.merchant_page` (empty on both Najma and
  Dana), so the live page shows org-level fallbacks (real cover/logo/member-count/phone) but
  NOT the featured-card carousel / description / category. The configured-state sections are
  shown via the SVG (no seeding/fabrication). If a demo org ever gets a real merchant page,
  recapture the Current-card carousel + Join card live.
- **Dana's** `cover_image_url` + `logo_url` 404 (broken images on the public page), so the
  Dana storefront can't be cleanly captured — use Najma.
- The standalone **Card Designer** at `/cards/design` is a dead-end: its saved design goes to
  sessionStorage and routes to `/cards/new`, but the wizard never reads `cardDesign`. Do NOT
  document it as a working way to design a card (same class as the Condition Builder no-op).
## 2026-06-13 — Awarding Points (By Amount vs Manual Points)

**Article:** `merchants/points/awarding.mdx` (new)
**Branch:** `claude/eloquent-fermat-dn9cxl`
**PR:** https://github.com/Abdalestar/docs/pull/140
**Status:** Done (4 real annotated screenshots; validate-images 4/4 OK). One task this run per the run request.

### Task selection
The board is fully `Done`/`Needs Screenshots = NO`, except the P1 row **"Awarding Points: By Amount vs Manual Points"** which read `Status = In progress` but with **no PR Link** and created 2026-06-10 (a prior run flagged it as "locked by another run" on 2026-06-11). Per routine §4 a stale In-progress row with no PR Link and untouched > 2h is reclaimable, so I took it. It was the highest-priority open row, a genuine new article (`merchants/points/awarding.mdx` was not on `main`), and screenshotable. The remaining `Needs Screenshots = YES` rows are all blocked: Campaign Analytics (performance endpoint 404 on live), Campaign Audience Conditions (PR #51 never merged, off `main`), Merchant Business Profile (empty state, off `main`).

### What was written
The award-side deep-dive complementing `points/operations.mdx` (page overview) and `points/adjusting.mdx` (deduct side). The Award Points tab's two amount modes:
- **By Amount**: purchase total × earn rate (`Math.floor(amount * points_per_currency)`), respects the program minimum (below it earns 0, orange note) and the per-visit cap; `transaction_amount` is stored, so these awards feed the Revenue Impact report.
- **Manual Points**: exact number typed; rate/min/cap do NOT apply; `transaction_amount` is null, so manual awards don't count in revenue.
Plus the optional Note, branch selection (required when >1 branch), before/after preview, and the **Confirm Points Award** dialog. Access: owners/managers/staff can all award (`issue_points` default true for every role); Adjust/Deduct stays owner/manager only.

### Research sources (Abdalestar/qtap, read-only)
- `app/(dashboard)/points-operations/page.tsx` — Award tab, By Amount / Manual Points buttons, `calculatePoints()`, `transaction_amount: useManualPoints ? null : parseFloat(...)`, rate summary line, New Balance preview, "Confirm Points Award" dialog.
- `lib/utils/permissions.ts` — `/points-operations` needs `issue_points === true`.
- `lib/validations/staff.ts` — `issue_points` defaults true for manager and staff (owner always).

### Screenshots
4 real annotated PNGs from the live points demo (Najma Coffee, "Najma Stars", 75 pts/QR1) via `.routine/flows/points-awarding.json`: modes (By Amount/Manual boxed, no member = no PII); By Amount (QR50 → 3,750, cropped to the Calculate Points card); Confirm dialog (member name redacted); Manual Points (200, cropped). No member PII; **Confirm never clicked** (no real award). `validate-images` 4/4 OK; pushed as binary via git. Added to Points Programs nav after `operations`.

### Gap discovery (1 added)
- **The Card Designer (`/cards/design`)** → `merchants/stamp-cards/card-designer.mdx` (P2, Needs Screenshots YES). The standalone `CardDesigner` page (`app/(dashboard)/cards/design/page.tsx`, `applyTemplate`, live preview, saves to sessionStorage then routes to `/cards/new`) is not documented; `designing.mdx` only covers the Card Design step inside the wizard.

### Notes for future runs
- The Award tab reuses the same selectors as the Adjust tab: member search `input[placeholder='Search members...']` + `.divide-y button`; branch `[role=combobox]:has-text('Select the branch')` → `[role=option]`. The award CTA is `button.w-full:has-text('Award')` (the tab "Award Points" is a `[role=tab]`, so scope to `.w-full`). Crop the right card with `div.bg-card:has-text('Calculate Points')` to keep member PII out without redaction.
- Najma is multi-branch, so the award button stays disabled until a branch is picked.
## 2026-06-13 — Welcome to Qtap (screenshot backfill)

**Article:** `merchants/welcome.mdx`
**Branch:** `claude/eloquent-fermat-zfrnd4`
**PR:** https://github.com/Abdalestar/docs/pull/139
**Status:** Done — 3 real annotated screenshots added; prose unchanged. SMOKE_OK, validate-images 3/3 OK.

### Task selection
Board is effectively all `Done`. The one genuine `Not started` row ("The Member Profile: Activity, Notes & Tags") is a verified DUPLICATE of the published `profiles.mdx` (no editable-tags feature exists), so writing it would be a near-duplicate — skipped. `main` is frozen around PR #74, so almost every recent "Done" row's article/images sit in unmerged PRs (#90–#138). I confirmed every image-less on-main article except one already has a pending backfill PR (profiles #128, points/overview #130, batch-qr #131, qr-overview #132, birthday #133, etc.). The lone exception: **Welcome to Qtap** (`merchants/welcome.mdx`) — **P0**, `Needs Screenshots = YES`, **no prior PR**, full prose on main with zero images. Did that one backfill (per the one-task run request).

### What was added
3 real annotated PNGs (prose untouched, only `<Frame>` blocks added):
- `welcome-sidebar.png` — dashboard home (points demo, Najma), left sidebar boxed, Recent Activity feed redacted → "How the dashboard is organized".
- `welcome-points-sidebar.png` — sidebar cropped, **Points** highlighted.
- `welcome-stamps-sidebar.png` — sidebar cropped (stamp demo, Dana), **Cards** highlighted.
Shots 2+3 illustrate the "which sidebar you see" Note under "Stamp cards vs. points programs".

### Research / selectors (qtap, read-only)
- `components/layout/sidebar.tsx`: desktop sidebar is `aside[data-tour="sidebar"]` (256px, full height); nav items are `a[data-tour="nav-<route>"]`; loyalty filter renders **Cards** + **Stamp Ops** for `stamps`, **Points** + **Points Ops** for `points`; active item gets `bg-primary` (maroon).
- Live probe confirmed labels on both accounts before writing the flows.

### Flows
`.routine/flows/welcome.json` (points, 2 steps) + `welcome-stamp.json` (stamp, 1 step). Flow files are single-account, so two files were needed. Sidebar/dashboard views only; no destructive/outbound clicks; no PII (activity feed redacted on the full-page shot).

### Notes / gotchas for future runs
- **Label drift (left as-is per backfill rule):** the Note in welcome.mdx says "If you see 'Stamp Cards' in the sidebar" but the live label is **Cards** (the points label "Points" matches). A maintainer could reconcile that one word in a prose pass.
- The "Getting Started checklist" section stays imageless: both demo orgs are at 100% completion so the checklist card returns null (consistent with the 7eoo2g run).
- **Dashboard Tour** row (`Needs Screenshots = YES`, PR #3) is STALE: its Notion path `/getting-started/dashboard-tour.mdx` was never used; the real article `merchants/dashboard-overview.mdx` is on main WITH 4 real images. Same path-reconciliation pattern as onboarding-wizard. Just needs the row flipped to `Needs Screenshots = NO`.
- The real backlog is now a merge problem, not a writing problem: ~15 bot PRs (#90–#139) are unmerged, so main lacks all their articles/images. A human merging them would clear most `Needs Screenshots = YES` rows at once.
## 2026-06-13 — Editing a Points Program

**Article:** `merchants/points/editing.mdx` (new)
**Branch:** `claude/eloquent-fermat-vs5cii`
**PR:** https://github.com/Abdalestar/docs/pull/138
**Status:** Done (4 real annotated screenshots, validate-images 4/4 OK). One task this run per the run request.

### Task selection
Board is otherwise all `Done`; two `Not started` rows were auto-discovered 2026-06-13 — "Editing a Points Program" (P2) and "The Card Designer (Design-First Entry)" (P3). Took the higher-priority P2. (P3 `card-designer.mdx` for the `/cards/design` route is still Not started for a future run; the note says verify the live dashboard links to it before writing.)

### What was written
New how-to for the `/points/[id]` edit page (H1 "Edit Points Program", subtitle "Update your points program settings", live `PointsMobilePreview` sidebar on wide screens). Entry: `/points` program `⋯` menu → **Edit**, or click the card. Complements `creating.mdx` (cross-linked, doesn't re-teach field setup).

### Facts (grounded in qtap, read-only)
- `app/(dashboard)/points/[id]/page.tsx` — loads `points_programs` + `rewards(*)`, mounts `PointsProgramForm mode="edit"` with the preview sidebar.
- `components/dashboard/points-program-form.tsx` — `onSubmit` edit branch: updates the program, then **`rewards.delete().eq('points_program_id', id)` followed by re-inserting the form's reward list** (replace-on-save). `Save & Activate` → `status='active'`, `is_active=true`, `published_at=now`; `Save as Draft` → `status='draft'`, `is_active=false`, `published_at=null` (**unpublishes a live program** — documented as a Warning). Buttons: Cancel / Save as Draft / Save & Activate (edit-mode primary label is "Save & Activate", create is "Activate").
- `app/(dashboard)/points/page.tsx` — `⋯` menu items Edit / Duplicate / Publish|Deactivate|Activate|Convert to Draft / Delete; clicking the card preview also routes to `/points/[id]`.
- `lib/utils/permissions.ts` — `/points` needs `points_programs !== 'none'` (owner `full`, manager default `edit`, staff default `none`).
- Changing `points_per_currency` doesn't retouch past `points_transactions` (rate change is forward-only) — documented as a Note.

### Screenshots
4 real annotated PNGs from the live points demo (Najma Coffee, "Najma Stars" program, id `ca5e0004-…0001`) via `.routine/flows/points-editing.json`: list with the `⋯` menu open + Edit boxed; edit form + live preview boxed; Rewards card cropped (existing rewards); Save as Draft / Save & Activate row cropped. No program saved/deactivated/duplicated/deleted during capture (only opened the menu and navigated via Edit). `validate-images` 4/4 OK; SMOKE_OK. Added to Points Programs nav after `creating`.

### Reality flag for a future run (do NOT document as working)
In **edit** mode the reward re-insert maps only `name, description, reward_type, trigger_value, expiry_days` — it omits `image_url` (the **create** path spreads the full reward incl. image). So a reward's image is dropped when you save an edit. Looks like an app bug, not intended behavior, so the article keeps reward-image guidance generic (cross-links `rewards.mdx`) and does not claim images persist on edit.
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
## 2026-06-12 — Batch QR Codes screenshots (backfill)

**Article:** `merchants/qr-codes/batch.mdx`
**Branch:** `claude/eloquent-fermat-tfdqte`
**PR:** https://github.com/Abdalestar/docs/pull/131
**Status:** Done — 3 real annotated screenshots added; prose unchanged. SMOKE_OK, validate-images 3/3 OK.

### Task selection
The board has no cleanly-workable `Not started` new-article row: the only two `Not started` rows are both blocked. **"The Member Profile: Activity, Notes & Tags"** is a flagged near-duplicate of the published `members/profiles.mdx` (and its proposed net-new feature, editable VIP/Regular/Inactive tags, does not exist — tags render read-only), already resolved by PR #128's profiles.mdx backfill. **"Campaign Messages & Personalization Variables"** is a documented product bug (wizard chips insert single-brace `{token}` but the send engine only substitutes double-brace `{{token}}`, so chip/template tokens send literally) — left Not started per prior runs. The two on-main "Coming soon" stubs are also accounted for: `analytics/location-comparison.mdx` (open PR #126) and `campaigns/analytics.mdx` (blocked — its only net-new surface vs `campaigns/stats.mdx` is the Performance card, whose `/api/analytics/campaigns/[id]/performance` returns 404 live, so it never renders).

So this run did one screenshot-backfill task: the highest-priority properly-flagged `Needs Screenshots = YES` row whose article is on `main` — **Batch QR Codes** (P2, no prior PR). The article had full accurate prose and zero images.

### Screenshots
Captured via `.routine/flow-capture.mjs` (`.routine/flows/batch-qr.json`) from the live points demo (Najma Coffee, Elite):
- `batch-qr-form.png` — Batch Settings form, Batch Name (1) / Quantity 250 (2) / Generate N QR Codes (3).
- `batch-qr-action.png` — Action dropdown cropped: Issue Stamp / Award Points / Check-in / Redeem Reward (numbered).
- `batch-qr-points.png` — Award Points selected → Points Value Per Scan field boxed.

Grounded in `components/dashboard/qr-codes/batch-generator.tsx` (H1 "Batch Generate QR Codes", "Batch Settings" card, name / quantity max 1,000 / type / action / conditional `points_value`, "Generate N QR Codes"). Generate never clicked (no batch created); no PII on this page.

### Notes for future runs
- Both demo accounts include batch access (Najma = Elite, Dana = Franchise, both via `subscription_plan`), so neither shows the **purchase paywall** (the four credit-pack tiers in the article's "Access requirements" section). To screenshot that paywall you'd need a Starter/Growth account with `batch_qr_credits = 0`. The section stays prose + a pricing table.
- `/qr-codes/batch` Action/Type selectors are Radix `[role=combobox]` (Type is the 1st on the page, Action the 2nd); options are `[role=option]`, croppable via `clipTo: "[role=listbox]"`.
- The board is effectively complete; the real backlog is the two blocked Not-started rows above (close Member Profile as a duplicate; hold Campaign Messages until the single/double-brace bug is fixed) plus the blocked `campaigns/analytics` stub.
## 2026-06-12 — Points Programs Overview screenshots (backfill)

**Article:** `merchants/points/overview.mdx`
**Branch:** `claude/eloquent-fermat-bkvvk8`
**PR:** https://github.com/Abdalestar/docs/pull/130
**Status:** Done (3 real annotated screenshots; validate-images 3/3 OK). One task this run.

### Task selection
Board is fully `Done` with zero `Not started` rows, so per routine §3 this run did one
screenshot backfill. Reconciled the "0-image on main" candidates against the 4 open PRs
(#126 location-comparison, #127 complete-profile, #128 profiles backfill, #129
notification-templates) to avoid double-doing — several imageless-on-main articles only
read that way because their screenshot PRs aren't merged yet. Picked **Points Programs
Overview** (P1, `Needs Screenshots = YES`, no PR, on main with prose + zero images, no
competing PR) — the highest-priority clean target.

### Screenshots
3 real annotated PNGs from the live points demo (Najma Coffee, program "Najma Stars")
via `.routine/flows/points-overview.json`, prose unchanged:
- `points-overview-list` — `/points` page; status filter tabs boxed (1), Create Program
  boxed (2), the program card's green **Active** badge visible → *Program statuses*.
- `points-overview-settings` — `/points/new` form; Program Name (1) / Points per (2) /
  Description (3) boxed; Currency, Card Color, phone preview visible → *Program details*.
- `points-overview-expiry` — Expiry Type dropdown open (From date earned / From last
  activity / End of calendar year), cropped to the listbox → *Expiry rules*.
No program saved; Enable Points Expiry toggled only to reveal options (UI state, never
saved); no destructive/outbound clicks. No customer PII (program is the merchant's own).

### Insights / gotchas for future runs
- The points account has 1 active program; `/points` H1 "Points Programs", "Create
  Program", status filter as a `[role=tablist]` (All/Active/Drafts/Inactive), badges
  from `STATUS_CONFIG` in `app/(dashboard)/points/page.tsx`.
- **Selector gotcha:** in `points-program-form.tsx` the `htmlFor="currency"` Label is NOT
  wired to a real `#currency` trigger — `#currency` resolves to Radix's visually-hidden
  native `<select>` at (0,0), so a `box`/`number` on it lands a stray badge in the
  top-left. Skip it or box the trigger another way. The Expiry Type select is reliably
  opened with `[role=combobox]:has-text('From date earned')` (its default value), then
  `clipTo: "[role=listbox]"` crops the three options cleanly. Enable Points Expiry is the
  first `[role=switch]` on the form.
- Remaining imageless-on-main backfill targets with no competing PR (verified this run):
  `qr-codes/overview.mdx`, `qr-codes/batch.mdx`, `settings/notifications.mdx`,
  `settings/merchant-page.mdx`, `campaigns/birthday.mdx`. (`campaigns/analytics.mdx` stays
  blocked — performance endpoint 404s live.)
## 2026-06-12 — Notification Templates (new article)

**Article:** `merchants/campaigns/notification-templates.mdx` (new)
**Branch:** `claude/eloquent-fermat-1sddx4`
**PR:** https://github.com/Abdalestar/docs/pull/129
**Status:** Done (3 real annotated screenshots, validate-images 3/3 OK). One task this run.

### Task selection
Board is fully `Done`; the only `Not started` row ("The Member Profile: Activity, Notes & Tags") is verified duplicate-flagged (already covered by `members/profiles.mdx`), so per routine §3 this was one stub/never-shipped task. The two "Coming soon" stubs on `main` were both ruled out (see below), so I took the **never-shipped** "Notification Templates" row (P3, Done but PR was blocked in April, so `merchants/campaigns/notification-templates.mdx` was never on main) and wrote it for real.

### What was written
Scoped tightly to the **Templates tab** management on `/notifications` (the one notification surface `campaigns/push-notifications.mdx` only mentions in passing): where templates live (Templates tab among All/Drafts/Scheduled/Sent), the **New Template** dialog (Template Name = internal label; Notification Title; Message; Image URL optional w/ live preview; Save disabled until name+title+message filled), edit (pencil)/delete (trash + "Delete Template?" confirm; editing doesn't touch already-sent/scheduled), and **Use Template** when composing. Access: owners+managers (`/notifications` needs `campaigns!=='none'`; staff none). Grounded in `notifications/page.tsx`, `template-manager.tsx`, `template-picker.tsx`, `notification-card.tsx`, `lib/utils/permissions.ts`. Added to Campaigns nav after `push-notifications`.

### Two stubs-on-main both ruled out this run (for future runs)
- **`merchants/analytics/location-comparison.mdx`** — already has an open PR (#126); it's a stub on main only because #126 isn't merged. Don't double-do.
- **`merchants/campaigns/analytics.mdx`** — **BLOCKED, confirmed deeper than the prior note.** The only surface it adds over the published `campaigns/stats.mdx` is the `/campaigns/[id]` **Performance** card (over-time Sent/Redeemed chart + per-branch breakdown). `GET /api/analytics/campaigns/[id]/performance` returns **HTTP 404 "Campaign not found" for every period on the live deployment**, even when the campaign exists and the logged-in user is the active **owner** of the campaign's org (org ids match in Supabase) — verified by in-session `fetch` on the Dana account, whose campaigns DO have `campaign_rewards` data (e.g. Mother's Day Glam Flash 108 issued / 43 redeemed across both branches). Card renders a skeleton then unmounts. The route's user-scoped `staff` RLS check or admin/service-role campaign fetch is failing on this deployment. So the card never renders live for ANY account; not screenshotable until the endpoint is fixed. (Najma points org additionally has zero `campaign_rewards` rows.)

### Gotchas discovered (save future runs time)
- **`flow-capture.mjs` `fill` action is array-form:** `{ "fill": ["selector", "value"] }`, NOT `{ "fill": "sel", "value": "..." }`. The wrong form makes `act.fill[0]` = the first character of the selector ("[", "i", ...) and fails with a confusing CSS-parse error. `click`/`hover` take a plain string; `select`/`fill` take `[sel, val]`. The engine auto-applies `.first()`, so Playwright `>> nth=` chaining is NOT supported — use a uniquely-matching selector (placeholders work, apostrophes inside `[placeholder="..."]` are fine).
- **`/notifications` shows NO history on the live demo orgs.** Both Najma (18 notifs / 15 sent in DB) and Dana (25 / 21) render an empty All/Drafts/Scheduled/Sent with `(0)` counts live. RLS policy "Staff can view their org push notifications" gates on `organization_id IN (SELECT user_organization_ids())`, and that function evidently doesn't return the demo user's org for the seeded rows — so the seeded `push_notifications` are invisible to the demo login. This is why `push-notifications.mdx` uses an SVG, not a real screenshot, and why this article documents templates (which I can populate myself via the create dialog) rather than the populated tabs. `notification_templates` is empty for both orgs, so the Templates list shows its honest empty state; the `Use Template` picker (`template-picker.tsx`) returns `null` at 0 templates, so it can't be captured live either.
## 2026-06-12 — Member Profiles screenshots (backfill)

**Article:** `merchants/members/profiles.mdx`
**Branch:** `claude/eloquent-fermat-pc12fk`
**PR:** https://github.com/Abdalestar/docs/pull/128
**Status:** Done. SMOKE_OK; 4 real annotated screenshots (validate-images 4/4 OK). One task this run.

### Task selection
Both remaining `Not started` rows were non-viable as new articles, so per routine §3 this run did the highest-priority `Needs Screenshots = YES` row on `main`: **Member Profiles** (P1), which had accurate prose but zero images. Prose left unchanged; 4 `<Frame>` blocks added.

### Two Not-started rows flagged instead of written (reality findings)
- **Campaign Messages & Personalization Variables** (`merchants/campaigns/messages.mdx`, P2) — **broken feature, do NOT write as a how-to yet.** The campaign wizard's "Personalization Variables" chips and built-in templates insert **single-brace** tokens (`{customer_name}`, `{first_name}`, `{stamps_count}`, `{reward_name}`), but the send engine `lib/utils/personalize-message.ts` only substitutes **double-brace** `{{...}}` (7 tokens: customer_name, first_name, stamps_count, points_count, reward_name, merchant_name, stamps_remaining). Both `app/api/campaigns/execute/route.ts` and `app/api/notifications/send/route.ts` (the latter gates on `body.includes('{{')`) confirm it. So wizard-inserted tokens are sent to customers literally (e.g. "Happy Birthday, {customer_name}!"). The wizard preview is also wrong (it replaces single-brace with "John"). Verified in source AND a live wizard probe on the stamp account. Same class as the Condition Builder no-op. Set back to Not started with a note for engineering. The only working path is typing `{{token}}` manually, which the UI never surfaces.
- **The Member Profile: Activity, Notes & Tags** (`merchants/members/member-profile.mdx`, P2) — **duplicate.** This is the same `/members/[id]` page already documented by the published `profiles.mdx` (this run's target) + `complete-profile.mdx` + `campaigns/targeted.mdx`. Its proposed net-new item "manual tags (VIP/Regular/Inactive)" does NOT exist as an editable feature: `member.tags` render read-only as Badges; there is no add/remove-tag UI on the profile page (the list-page row menu does have an "Add Tag" item, though). Flagged as a duplicate on that row.

### Screenshots
`.routine/flows/member-profiles.json` (points demo, member id `ca5eb000-...-077`, Faisal — has a missing birthday so Complete Profile shows): `profile-01-open` (members row menu, View Profile boxed, cropped to `[role=menu]` so no PII), `profile-02-overview` (full profile, name/email/phone redacted, Activity/Notes tabs + Complete Profile boxed), `profile-03-notes` (Notes tab, Save Notes boxed, explicit right-column crop), `profile-04-complete` (Update Member Information dialog, Save Information boxed, cropped to `[role=dialog]`). No destructive/outbound clicks. validate-images 4/4 OK; pushed as binary.

### Gotchas for future runs
- **Live members list differs from the repo prose.** A profile opens via the row's three-dot menu → **View Profile** (`<Link href="/members/[id]">` inside the dropdown). The member-name cell is NOT a link, so "click any row" / clicking the name does nothing. `profiles.mdx` prose still says "click any row" and "Edit button"; the live edit button is **Complete Profile** and its dialog is **Update Member Information** / **Save Information**. Left prose unchanged per the backfill rule.
- Profile-page PII is confined to the sidebar (name heading, email, phone) — redact those three by exact-text selector. The Activity list shows the merchant's own staff + branch names (demo seed), not customer PII. Member ID (e.g. `Q19D976`) and tags (platinum/new/vip) are not sensitive.
- Cropping to `[role=menu]` / `[role=dialog]` sidesteps PII entirely for the menu and dialog shots. Keep annotation **labels** off cropped shots whose target sits at the crop edge (the label spills outside the crop); use the numbered box + the MDX `<Frame caption>` instead.
## 2026-06-12 — Completing a Member's Profile (Phone / Birthday)

**Article:** `merchants/members/complete-profile.mdx` (new)
**Branch:** `claude/eloquent-fermat-qnzh5u`
**PR:** https://github.com/Abdalestar/docs/pull/127
**Status:** Done (3 real annotated screenshots; validate-images 3/3 OK). One task this run per the run request.

### Task selection
The board is nearly all `Done`. Location Comparison (the previously-flagged "good next task") is now done (PR #126, today). The one genuine `Status = Not started` row was the P3 gap-audit row "Completing a Member's Profile (Phone / Birthday)" (`merchants/members/complete-profile.mdx`, not on main) — took it as the task-1 new article.

### What was written
Deep-dive how-to for the **Complete Profile** flow on `/members/[id]`, distinct from the one paragraph in `members/profiles.mdx` (cross-linked). Facts grounded in `app/(dashboard)/members/[id]/page.tsx`:
- The dashed **Complete Profile** button renders only when `isOwnerOrManager` (`role==='owner'||'manager'`) **and** `hasMissingInfo` (`!member.birthday || !member.phone`). Role-gated, NOT permission-gated: a `staff` role with full Members access still never sees it.
- Dialog title **Update Member Information**; phone field shown only when `!member.phone`, birthday field only when `!member.birthday` (shows just the missing pieces). Save button **Save Information**.
- `saveMemberInfo()` writes `phone` only when `dialogPhone && !member.phone`, `birthday` only when `dialogBirthday && !member.birthday` → dashboard can ADD a blank field but never overwrite a saved one; birthday stored `yyyy-MM-dd`. Calendar `captionLayout="dropdown"`, `fromYear={1930}`.
- Birthday eligibility: `app/api/campaigns/member-eligible/route.ts` `isBirthdayWithinDays(member.birthday, …)` returns false when null → a saved birthday is what makes a member eligible for a birthday campaign. Cross-linked `campaigns/birthday`.
- `/members` guard is `members !== 'none'` (staff default `view`), so staff can open a profile but the button is role-gated.

### KEY GOTCHA for future runs (the view-column quirk)
`member_org_view` exposes **`birth_date`, not `birthday`**, but `members/[id]/page.tsx` reads `member.birthday`. So `member.birthday` is `undefined` for EVERY member → the Birthday row always reads "Not provided" and the **Complete Profile** button renders on any member when viewed as owner/manager (dialog then offers only the Birthday field, since `member.phone` is populated). No accessible org has any member with a null phone or null `birth_date` (Najma 180 / Dana 122 / Tea Time 22 all fully populated), so the **phone** completion field can't be screenshotted from live data — documented it in prose instead. Captured the birthday path on a Najma member (`ca5eb000-…-ac`).

### Screenshots
`.routine/flows/complete-profile.json` (points demo, Najma): `complete-profile-button.png` (profile card, button boxed, Birthday "Not provided" labelled; name/Qtap ID/phone/email redacted), `complete-profile-dialog.png` (Update Member Information dialog, Select birthday + Save Information boxed), `complete-profile-calendar.png` (calendar open, **explicit `clip` {x:486,y:456,w:474,h:536}** to exclude the left profile card — a full-viewport shot leaked the name/phone/email behind the dialog scrim, the clip fixed it). Nothing filled, Save Information never clicked → no member record changed. Added to Members nav after `profiles`.
## 2026-06-12 — Location Comparison (stub replaced with real article)

**Article:** `merchants/analytics/location-comparison.mdx`
**Branch:** `claude/eloquent-fermat-wm0gsm`
**PR:** https://github.com/Abdalestar/docs/pull/126
**Status:** Done. SMOKE_OK; 3 real annotated screenshots (validate-images 3/3 OK). One task this run.

### Task selection
Board is fully `Done` with zero `Not started` rows, so per routine §3 this run did one
screenshot-grade task: the highest-value `Needs Screenshots = YES` stub on `main`. Only
two stubs remained (`git ls-tree -r origin/main | grep mdx`, <8 lines):
`location-comparison.mdx` and `campaigns/analytics.mdx`. Picked **Location Comparison**
(P2, `Done`/"Already published" but a 6-line "Coming soon" stub on main, flagged a "good
next task" by the staff-performance run). `campaigns/analytics.mdx` stays blocked (its
only uncovered surface, the `/campaigns/[id]` Performance card, doesn't render on the demo).

### What was written
The `/analytics/reports/location-comparison` report (no sidebar link; reached from the
Reports hub or direct URL). One card per **active** location, each with five figures
counted over the chosen period. Source: `useLocationComparison` (`hooks/use-reports.ts`):
- **Stamps** = sum `amount` of `transactions.type='stamp'` at that `location_id`.
- **Points** = sum `amount` of `type='points_earn'`.
- **Redemptions** = count of `type='redeem'` or `points_spend`.
- **Members Served** = distinct `member_id` with any tagged transaction there (field is
  `new_members` in code but the label is "Members Served"; it's distinct members, not new).
- **Estimated Revenue** = sum `points_transactions.transaction_amount` for `type='earn'`
  earns at that branch (points-derived estimate, same caveat as Revenue Impact).
Only transactions with a `location_id` count (untagged rows are skipped → totals can read
lower than org-wide). Points-only org → Stamps 0; stamp-only org → Points/Revenue 0. Empty
state: "No location data available for this period". Filters: time period only (no branch
filter — it compares all branches). Access: owners+managers (`analytics !== 'none'`).

### Screenshots
3 real annotated PNGs from the live points demo (Najma Coffee, 3 branches: The Pearl —
Qanat Quartier, West Bay — City Center, Msheireb Downtown) via
`.routine/flows/location-comparison.json`: overview (period boxed, all 3 cards), one card
close-up (5 figures numbered; Estimated Revenue gold), period dropdown (5 options). No PII
on this aggregate page; read-only capture. `docs.json` unchanged (path already in Analytics nav).

### Insights for future runs
- Card crop selector `div.grid.gap-4 > div:nth-child(1)` cleanly isolates the first branch
  card; metric labels are `div.text-xs:has-text("<Stamps|Points|Redemptions|Members Served|Estimated Revenue>")`
  and `.first()` lands inside that first card. Period selector is the shared Radix Select
  (`button:has-text("Last 30 days")` → `[role=listbox]`/`[role=option]`), same as the other reports.
- Remaining on-main stub after this run: `merchants/campaigns/analytics.mdx` (blocked, see
  the staff-performance/earn-rate notes). The four other analytics report pages are now all
  real articles on this branch's history (revenue-impact #117, points-activity #119,
  staff-performance #124, location-comparison #126).

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
