# Qtap Docs Writer — Run Log

Automated runs by the Qtap Documentation Writer agent are logged here.

---

## 2026-04-23 — API Overview & Authentication

**Article:** `api-reference/overview.mdx`
**Branch:** `docs/api-overview-auth`
**PR:** https://github.com/Abdalestar/docs/pull/22
**Status:** Done

### What was written
Article covering the API Overview & Authentication for the Qtap platform API. The file existed with content from a prior incomplete run; this run reviewed it, applied 4 anti-slop passes, fixed two em dashes, fixed a rule-of-three, and delivered the polished article. Covers:
- Base URL (from `NEXT_PUBLIC_API_URL` env var)
- Two-tier authentication: public endpoints (no auth) vs. protected (Supabase session cookie)
- Public endpoint list: `POST /api/scan`, `GET /api/qr-codes/[code]/details`, `GET /api/campaigns/rewards/validate/[code]`
- How to pass session token in cookie header for authenticated requests
- Token expiry reminder (1 hour default, must handle refresh)
- Full error status code table (200, 400, 401, 404, 409, 410, 429, 500)
- Narrative overview of 4 API areas: QR/scan, campaigns/rewards, members, analytics

Also added "API Reference" group to `docs.json` nav with `api-reference/overview` and `api-reference/endpoints`. Fixed a merge conflict (git markers) left in docs.json from a prior stash operation.

### Research sources
- `app/api/scan/route.ts` — public endpoint, no auth check, uses `createAdminClient()`
- `app/api/nfc/tap/route.ts` — public endpoint, same pattern
- `app/api/rewards/redeem/route.ts` — authenticated endpoint, uses `createClient()` + explicit auth check
- `app/api/rewards/initiate-redemption/route.ts` — public (no server auth check, member_id in body)
- `API_DOCUMENTATION.md` — comprehensive endpoint list with auth requirements per endpoint
- `MOBILE_INTEGRATION_GUIDE.md` — mobile SDK integration patterns and cookie-based auth example

### SVG diagram
`images/api-reference/auth-paths.svg` — existed from prior run. Two-panel diagram showing public vs. protected endpoint flows, using brand colors (#8E4A63, #F0D793, #423F4C).

### Anti-slop fixes applied
- Em dash #1: "Tokens expire after one hour by default — your integration needs to handle refresh." → replaced — with ", so"
- Em dash #2: "...returns what happened — stamps earned, points credited, or reward issued." → replaced with colon + rewritten sentence to remove rule-of-three
- CardGroup description had exactly 3 items ("parameters, response fields, and error codes") → changed to 2-item phrase ("All request parameters and response shapes")

### Errors / challenges
- `cmd /c where gh` and PowerShell `Get-Command git` both failed to find executables in PATH; found both by reading existing bat files in the docs repo
- `mcp__Desktop_Commander__start_process` stdout never appears in `read_process_output` (always 0 lines); all output must be redirected to a file with `> file.txt 2>&1`, then read with `mcp__filesystem__read_text_file`
- Branch was `docs/nfc-tag-detail` with modified `docs.json` preventing direct checkout of main; fixed by git stash, checkout main, new branch, stash pop (auto-merge on docs.json succeeded cleanly)
- `where` command unavailable in cmd.exe via Desktop Commander; found gh path by reading existing `create-pr.bat`

### Insights for future runs
- Git: `C:\Program Files\Git\cmd\git.exe` — use bat file with `> file.txt 2>&1` redirects
- gh: `C:\Program Files\GitHub CLI\gh.exe` — use `create-pr.bat` as template
- Always add `set PATH=C:\Program Files\Git\bin;C:\Program Files\Git\cmd;%PATH%` at top of bat files that call git
- `api-reference/endpoints.mdx` is the next P3 task

---

## 2026-04-22 — NFC Tag Detail & Settings

**Article:** `merchants/nfc-tags-detail.mdx`
**Branch:** `docs/nfc-tag-detail`
**PR:** https://github.com/Abdalestar/docs/pull/21
**Status:** Done

### What was written
Article covering the individual NFC tag detail page (`/nfc-tags/[id]` route). This page is linked from the NFC Tags list via "View Details". Covers:
- Four stat cards: total taps, action type, location assignment, status badge
- Tap activity line chart (last 7 days, only shown when tap data exists)
- Read-only Details section: serial number, purchase date, last tapped, created date, points value (if action = points)
- Recent Taps list: last 10 of up to 100 taps, with timestamps and "Member" badge
- Edit form: name, location, action, points value (conditional), active toggle
- Honest callout: stamp card assignment cannot be changed from the detail page
- Deactivating vs. deleting distinction

Also added `merchants/nfc-tags-detail` to the QR Codes & NFC nav group in `docs.json` after `merchants/nfc-tags`.

### Research sources
- `app/(dashboard)/nfc-tags/[id]/page.tsx` — full detail page: NFCTagDetailPage component, edit form fields (`name`, `location_id`, `action`, `points_value`, `is_active` — note: no `stamp_card_id` in update), tap history from `nfc_taps` table, 7-day chart via recharts LineChart
- `app/(dashboard)/nfc-tags/page.tsx` — list page for context (confirmed "View Details" menu item routes to `/nfc-tags/[id]`)
- `types/database.ts` — NFCTag type (id, organization_id, location_id, stamp_card_id, serial_number, name, action, points_value, tap_count, is_active, last_tapped_at, purchased_at, created_at, updated_at)
- `merchants/nfc-tags.mdx` — existing NFC Tags article reviewed to avoid duplication; confirmed detail page was only briefly mentioned

### Anti-slop passes applied
- No em dashes
- Lists: 5-item edit field list (not 3), 2-item CardGroup
- No contrast framing
- No banned words (no leverage, seamless, enhance, utilize, streamline, etc.)
- No self-narration phrases
- "Good for spotting whether a tag you just moved to a new spot is actually being used" — concrete, practical tone
- Honest callout about stamp card limitation (cannot be changed post-creation)

### Screenshots
Not captured. `request_access` times out in automated runs (no user present). Article relies on prose descriptions of the UI.

### Errors / challenges
- `Get-Content ... -Raw` not available in Desktop Commander PowerShell; workaround: omit `-Raw`, use `Out-String` to join
- `Get-Content "...\[id]\page.tsx"` fails silently (PowerShell interprets `[id]` as wildcard); fixed with `-LiteralPath` flag
- Stash pop created a conflict in `docs.json` because main had been updated with 5 new commits (faq.mdx, customer-app/settings-profile.mdx); conflict was trivial (trailing markers only), resolved by stripping conflict markers
- `ORIG_HEAD.lock` file existed from a prior crashed git process; removed manually before git operations

### Insights for future runs
- Always use `-LiteralPath` with `Get-Content` when path contains `[` or `(` characters
- Stashing before switching branches and popping on new branch risks docs.json conflicts if main moved forward; consider using `git diff` to apply changes manually instead
- NFCTag type: `purchased_at` field exists (when the hardware was purchased), separate from `created_at` (when it was registered in dashboard). The detail page shows both.
- The stamp card linked to a tag is stored as `stamp_card_id` on the nfc_tags row and is NOT exposed in the edit form on the detail page. It can only be set on creation.
- NFC taps table is `nfc_taps` (not `nfc_tap_events` or similar). Columns: id, nfc_tag_id, member_id, location_id, tapped_at.

### Gap discovery (Phase 6)
Checked current Notion board against app routes. All remaining Not started items are:
- Payment Gateway Integration (P3 Low) — `/integrations/payment-gateways.mdx` — no code research done this run
- API Overview & Authentication (P3 Low) — `/api-reference/overview.mdx`
- API Endpoints Reference (P3 Low) — `/api-reference/endpoints.mdx`

No new undocumented routes spotted this run.

### Deliverables
- `merchants/nfc-tags-detail.mdx` — new article written
- `docs.json` — QR Codes & NFC nav updated
- `CLAUDE.md` — this entry

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
- `request_access` for computer-use timed out after 60s (user not present). Same result as all previous automated runs. Screenshots deferred.
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
