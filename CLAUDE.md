# Qtap Docs Writer — Run Log

---

## 2026-04-29 — Merchant Page Overview

**Article:** `merchants/settings/merchant-page-overview.mdx`
**Branch:** `docs/merchant-page-overview`
**PR:** (pending — see Phase 5 notes)
**Status:** Done (screenshots pending)

### What was written
Article covering the Merchants management view (`/merchants` route). Covers:
- Empty state: "No merchant yet" with Create Merchant button → navigates to /merchant-page editor
- Active state card: logo, name + Active badge, description, category, location, phone, website, Google rating, loyalty card count
- Real-time stats: members, stamps earned, points earned, redemptions (from `organization_members` table; stamps/points/redemptions only shown when > 0)
- Actions: Preview (opens `/m/{slug}?preview=true` in new tab, only when slug set), Edit (→ /merchant-page editor), Delete (with confirmation dialog warning about permanent removal)
- Access control: owner-only (permissions.ts: `/merchants` → `return false` for all non-owners)

Also added `merchants/settings/merchant-page-overview` to the Settings group in `docs.json` (before `merchant-page`).

### Research sources
- `app/(dashboard)/merchants/page.tsx` — full UI: all states, real-time stats query, actions, delete dialog text
- `lib/utils/permissions.ts` — confirms `/merchants` → `return false` for non-owners; owner always true
- `docs/merchants/settings/merchant-page.mdx` — existing editor article; confirmed this new article covers the management view, not the editor form
- `docs/.writing-rules/SKILL.md`, `banned-words`, `content-patterns` — all 4 anti-slop passes applied

### Screenshots / diagrams
- **Screenshots:** NOT captured. Automated run — no user present for `request_access`. `Needs Screenshots` flag left on Notion row.
- **SVG diagram:** `images/merchants/merchant-page-overview-layout.svg` — two-panel layout showing empty state (left) and active profile card with stats and action buttons (right). Uses brand colors (#8E4A63 plum, #F0D793 gold, #423F4C charcoal).

### Anti-slop fixes applied
- No em dashes, no rule-of-three, no contrast framing, no rhetorical transitions
- No banned words (leverage, seamless, enhance, utilize, implement, etc.)
- Delete warning written as plain consequence, not promotional
- Three-action section (Preview/Edit/Delete) uses full paragraphs of varying length, not staccato bullets

### Errors / challenges
- `git stash` failed initially due to stale `.git/index.lock` from prior process. Fixed by deleting the lock file via `del C:\Users\Abdallah\docs\.git\index.lock` in cmd.exe shell.
- Desktop Commander's `read_file` returns only JSON metadata, not file content. Workaround: redirect git output to a temp file and read with `type` command.
- `git` not in Desktop Commander's PowerShell PATH. Solution: use `shell: cmd` parameter in `start_process` — cmd.exe has git in PATH.
- `powershell -Command "..."` fails inside Desktop Commander PowerShell (nested shell). Use bare PowerShell expressions directly.
- Untracked files (MDX, SVG) survive `git stash` without `--include-untracked`, so they persisted correctly when switching branches.
- docs.json edit was stashed with the old branch. Re-applied after creating the new branch.

### Insights for future runs
- `shell: cmd` in Desktop Commander's `start_process` reliably runs git. PowerShell shell does not have git in PATH.
- Redirect git stdout to a temp file and read with `type` to capture output. Direct pipe to `Set-Content` fails with "Cannot run a document in the middle of a pipeline" when using `& $exe` syntax.
- The `/merchants` dashboard route is NOT a franchise feature — it is the single-merchant profile management view for any plan. The "Franchise Merchant Management" Notion task was auto-discovered with wrong assumptions.
- PRs #17 and #29 (both claiming to document the /merchants route) were never merged. The actual docs repo on main did not have merchant-profile.mdx. Always verify file existence in the repo rather than trusting Notion Done status.
- Two Notion tasks described the same /merchants route: "Merchant Page management view" (P2) and "Franchise Merchant Management" (P2). Picked the more accurately described one and marked the other as duplicate.

### Gap discovery (Phase 6)
- "Franchise Merchant Management" (Notion ID: 34f1ae8f) — this task describes the /merchants route incorrectly as a franchise feature. The route is now covered by this article. Task should be marked Done as duplicate.
- "Loyalty Card Detail" (Notion ID: 34d1ae8f-748c-812d) — claimed by agent-k7m3p2 on 2026-04-28, still "In progress" with no PR. May be stale. Recommend Abdalle check and reset if needed.



Automated runs by the Qtap Documentation Writer agent are logged here.

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
