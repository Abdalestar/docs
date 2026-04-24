# Qtap Docs Writer — Run Log

Automated runs by the Qtap Documentation Writer agent are logged here.

---

## 2026-04-24 — API Endpoints Reference

**Article:** `api-reference/endpoints.mdx`
**Branch:** `docs/api-endpoints-reference`
**PR:** (see below)
**Status:** Done

### What was written
Full endpoint reference covering all 14 Qtap API endpoints, grouped into four sections: QR & Scan, Campaigns & Rewards, Members, and Analytics. No screenshots needed (reference documentation). Does not duplicate content from the overview article (auth, base URL, error format stay in overview). Each endpoint shows: auth level, request parameters table, curl example, success response JSON, and error table.

Endpoints covered:
- POST /api/scan (public)
- GET /api/qr-codes/[code]/details (public)
- GET /api/campaigns/active (auth)
- GET /api/campaigns/member-eligible (auth)
- POST /api/campaigns/[id]/track-open (auth)
- POST /api/campaigns/[id]/track-click (auth)
- POST /api/campaigns/rewards/issue (auth)
- GET /api/campaigns/rewards/member/[memberId] (auth)
- POST /api/campaigns/rewards/[code]/redeem (auth)
- GET /api/campaigns/rewards/validate/[code] (public)
- POST /api/members/[id]/push-token (auth)
- GET /api/members/[id]/campaign-eligibility (auth)
- POST /api/analytics/track-event (auth)
- GET /api/analytics/campaigns/[id]/performance (auth)

### Research sources
- `API_DOCUMENTATION.md` in app repo — full endpoint list with request/response shapes (975 lines)
- `api-reference/overview.mdx` — reviewed to avoid duplication

### Anti-slop fixes applied
- Em dash in intro: "session cookie — pass it with" → replaced with comma + restructured sentence
- No rule-of-three in prose: scan description originally had 3-item list, rewritten to avoid listing
- No banned words found
- No self-narration phrases found

### Screenshots
None needed. API reference article.

### Errors / challenges
- `sed -i` failed with "couldn't open temporary file" (permission denied for temp file in CWD); fixed by using Python in bash sandbox to strip conflict markers from docs.json instead
- docs.json stash-pop conflict (same as previous runs): trailing newlines in stash vs. clean main; resolved by stripping bytes after `<<<<<<< Updated upstream` marker using Python
- `mcp__Desktop_Commander__read_file` returns `{"fileType":"unsupported"}` for .bat files — content not readable that way; use bash sandbox to read instead
- grep detects docs.json as binary when conflict markers present — use `cat -A` to inspect line endings instead

### Insights for future runs
- Python in bash sandbox (`python3 -c "..."`) is the most reliable way to fix docs.json conflict markers (avoids sed -i permission issues, avoids Windows PowerShell path issues)
- docs.json stash-pop conflict will recur every run as long as prior branches left stashed changes; consider clearing old stashes at start of each run with `git stash clear`
- `api-reference/endpoints.mdx` is the LAST article in the Notion board with Status = Not started (all others were marked "Already published" or "Done")
- After this PR: check for screenshot-refresh tasks (Done = YES, Needs Screenshots = YES, Notes does NOT contain "screenshots added")

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
