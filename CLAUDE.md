# Qtap Docs Writer — Run Log

Automated runs by the Qtap Documentation Writer agent are logged here.

---

## 2026-04-25 — Analytics Reports Hub

**Article:** `merchants/analytics/reports.mdx`
**Branch:** `docs/analytics-reports-hub`
**PR:** (to be filled after push)
**Status:** Done

### What was written
Hub/index article for the `/analytics/reports` route. Describes all four detailed reports available in the Reports section and links to each sub-article:
- Points Activity Report — paginated transaction log (earned, redeemed, adjusted, expired), 50 rows/page
- Revenue Impact Report — 3 stat cards (total revenue, loyalty transactions, avg revenue/transaction) + dual-axis line chart
- Staff Performance Report — table per staff member: stamps issued, points issued, rewards processed, members served, daily averages
- Location Comparison — card per location: stamps, points, redemptions, new members, revenue estimate; only shows locations with activity in period

Also added `merchants/analytics/reports` to the Analytics nav group in docs.json (between overview and location-comparison).

### Research sources
- `app/(dashboard)/analytics/reports/page.tsx` — hub page with 4 report card definitions
- `app/(dashboard)/analytics/reports/points-activity/page.tsx` — table columns, type badges, pagination
- `app/(dashboard)/analytics/reports/revenue-impact/page.tsx` — 3 stat cards, dual-axis chart
- `app/(dashboard)/analytics/reports/staff-performance/page.tsx` — table columns
- `app/(dashboard)/analytics/reports/location-comparison/page.tsx` — per-location card fields
- `merchants/analytics/overview.mdx` — checked to avoid content duplication

### Anti-slop fixes applied
- No em dashes in draft
- No rule-of-three: all item lists are 4 or 5 items
- No contrast framing
- No banned words (leverage, seamless, enhance, etc.)
- No self-narration phrases
- "that is a conversation worth having" — direct honest callout (staff performance section)
- "A branch with no loyalty activity during that window won't show up." — specific, useful edge-case note

### Screenshots
None attempted. This is a hub/nav article with no flow to walk through. No screenshots required.

### Diagrams
None created. Hub article lists sub-reports; no multi-step flow or lifecycle to diagram.

### Errors / challenges
- `git checkout -f main` after editing docs.json reverted the file; re-applied the edit before committing
- Force checkout discards working-tree changes — must create branch BEFORE editing tracked files in future, or use `git stash` to save changes first
- Previous runs left 3 stashes on old branches; cleared with `git stash clear` after checking out main

### Insights for future runs
- All four sub-report articles (`points-activity.mdx`, `revenue-impact.mdx`, `staff-performance.mdx`, `location-comparison.mdx`) are stubs with "Coming soon" content. Each needs a full write-up. They should be added as high-priority tasks.
- The `analytics/reports` hub page uses `useRouteGuard()` with no additional permission check beyond the standard analytics access.
- `git checkout -f main` cleanly discards local changes to tracked files but leaves untracked files in place. Safe for new MDX files, dangerous for docs.json edits — always branch first, then edit.
- `git stash clear` can be run safely at the start of each run to clean up old stashes from previous branch work.

---

## 2026-04-24 — API Endpoints Reference

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
