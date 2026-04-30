# Qtap Docs Writer — Run Log

---

## 2026-04-30 — Managing Stamp Cards

**Article:** `merchants/stamp-cards/managing.mdx`
**Branch:** `docs/stamp-cards-managing`
**PR:** (see below)
**Status:** Done (screenshots pending)

### What was written
Article covering the Stamp Cards list page (`/cards` route). Covers:
- The card grid: visual card previews (CardPreview component) showing name, description, stamps, colors/icons
- Status badge per card: Draft (amber), Active (green), Inactive (gray)
- Status filter tabs: All, Active, Drafts, Inactive with counts (only shown when cards exist)
- Card actions via three-dot menu: Edit, Duplicate, status changes, Delete
- Status transitions: Draft → Publish → Active; Active → Deactivate → Inactive; Inactive → Activate → Active or Convert to Draft → Draft
- Duplicate behavior: copies all settings + rewards, "(Copy)" appended to name, starts as draft
- Delete: permanent, includes confirmation dialog, cannot be undone
- Empty state: "No stamp cards yet" with Create Your First Card button → `/cards/new`
- Access control: owners always; managers default `stamp_cards: 'edit'`; staff blocked (`stamp_cards: 'none'`)

Also added `merchants/stamp-cards/managing` to the Stamp Cards group in `docs.json` (after overview).

**Clarification note:** The Notion task ("Loyalty Cards List") described this route as showing "stamp cards and points programs together." The source code shows it is stamp cards only. Points programs have a separate `/points` route. Article written to reflect what the page actually does.

### Research sources
- `app/(dashboard)/cards/page.tsx` — full UI: tabs, grid, status config, all dropdown actions, empty states, delete dialog text
- `lib/utils/permissions.ts` — confirms `/cards` → `perms.stamp_cards !== 'none'`; owner always true
- `lib/validations/staff.ts` — confirms manager `stamp_cards: 'edit'`, staff `stamp_cards: 'none'`
- `docs/.writing-rules/SKILL.md`, `banned-words`, `content-patterns` — all 4 anti-slop passes applied

### Screenshots / diagrams
- **Screenshots:** NOT captured. Automated run — user not present for `request_access`. `Needs Screenshots` flag left on Notion row.
- **SVG diagram:** `images/stamp-cards/managing-status-flow.svg` — status transition diagram showing Draft→Active→Inactive and reverse paths. Uses brand colors (#8E4A63 plum, #F0D793 gold, #423F4C charcoal).

### Anti-slop fixes applied
- Em dash on "creates a copy of the card — same name" → split to two sentences
- Em dash on "Staff members cannot — they see" → rewritten to active construction
- 3-item bullet list for status states → converted to flowing prose paragraph
- No banned words (leverage, seamless, enhance, utilize, implement, etc.)
- No contrast framing, no rule-of-three decorative groupings

### Errors / challenges
- Bash sandbox cannot remove `.git/index.lock` on the Windows mount (permission denied). Fixed using Desktop Commander `del` in cmd shell — but in this run the lock file wasn't present on the Windows side.
- `git checkout main` from bash sandbox fails when docs.json was modified (would be overwritten). Fixed: `git stash` first, then checkout, create branch, `git stash pop`.
- Desktop Commander cmd.exe syntax: `del "path"` with double-quoted paths fails when path contains colons (drive letter). Use `del path` without quotes, or `git -C path command` form.

### Insights for future runs
- The `/cards` route is stamp cards only. Do not confuse with a "loyalty cards" overview. Points programs are at `/points`. The Notion task auto-discovered this incorrectly.
- `git -C C:\path command` in Desktop Commander cmd shell works for git without `cd` needing quotes around the path.
- Status transitions for stamp cards: Draft can only Publish. Active can only Deactivate. Inactive can Activate or Convert to Draft. No other transitions exist in the UI.
- `CardPreview` component renders the card's visual appearance (colors, stamp slots, icons) — the list page is primarily a visual gallery, not a data table.

### Gap discovery (Phase 6)
- `/cards/[id]` (Notion ID: 34d1ae8f-748c-812d) — the card detail/edit page after clicking a card. Already tracked in Notion as "Loyalty Card Detail" with Status "In progress" (stale claim by agent-k7m3p2 since 2026-04-28). Recommend resetting to "Not started".
- `/cards/new` — the card creation form. Covered by existing `merchants/stamp-cards/creating.mdx` (confirmed from docs.json and file existence). No gap.
- `/cards/design` — found in `app/(dashboard)/cards/design/` subdirectory. May be the stamp card visual designer (separate from the creation wizard). Already tracked as "Stamp Card Visual Designer" (PR #27, Done).

---

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
