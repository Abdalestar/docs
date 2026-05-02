# Qtap Docs Writer — Run Log

---

## 2026-05-02 — Edit Stamp Card

**Article:** `merchants/stamp-cards/editing.mdx`
**Branch:** `docs/stamp-card-editing`
**PR:** https://github.com/Abdalestar/docs/pull/35
**Status:** Done (screenshots pending)

### What was written
Article covering the stamp card edit page (`/cards/[id]` route). Covers:
- Opening the edit page by clicking any card in the Cards list
- Status badge on the page header (Draft/Active/Inactive)
- 4-step wizard pre-filled with existing card data: Card Design, Rewards, Locations, Review
- Step 1 Advanced Settings panel (collapsible): Stamping Rules (delay, daily cap, multi-stamp toggle), Expiration (stamp expiry days), Bonus Stamps (welcome/birthday sliders 0–10), Redemption (allow partial redemption toggle)
- Live mobile preview sidebar (large screens only, hidden on small)
- Save Draft button available on Steps 1–3 at any time (name required)
- Review step: Save as Draft vs Publish Card, both redirect to /cards
- Post-save behavior: rewards replaced immediately, customer stamp progress preserved
- Error state: "Card not found" with Back to Cards button
- Access control: owners always; managers by default (`stamp_cards: 'edit'`); staff blocked by default

Also added `merchants/stamp-cards/editing` to the Stamp Cards group in `docs.json` (after creating).

### Research sources
- `app/(dashboard)/cards/[id]/page.tsx` — full page: header, status badge, wizard rendering, error state, back button
- `components/dashboard/stamp-card/stamp-card-wizard.tsx` — STEPS config (4 steps), all card/reward/location/advanced state, validation, save logic (draft vs active), redirect to /cards
- `components/dashboard/stamp-card/advanced-settings.tsx` — all advanced settings sections and fields with tooltips
- `lib/utils/permissions.ts` — `/cards` → `stamp_cards !== 'none'`; owner always true
- `docs/.writing-rules/SKILL.md`, `banned-words`, `content-patterns` — all 4 anti-slop passes applied

### Screenshots / diagrams
- **Screenshots:** NOT captured. Automated run — user not present for `request_access`. `Needs Screenshots` flag left on Notion row.
- **SVG diagram:** `images/stamp-cards/edit-wizard-flow.svg` — 4-step wizard flow (Cards list → Design → Rewards → Locations → Review → Save Draft / Publish Card → back to Cards list), Advanced Settings callout box, Live Preview and Save Draft notes panels. Uses brand colors (#8E4A63 plum, #F0D793 gold, #423F4C charcoal).

### Anti-slop fixes applied
- Advanced Settings originally written as three bullet-list-with-inline-headers groups — rewritten as prose paragraphs with natural sentence flow
- "Business name, website URL, and terms and conditions" kept as needed functional triplet (actual fields on card back)
- No em dashes, no contrast framing, no banned words
- Varied sentence rhythm throughout; concrete examples ("30–60 minute delay", "one stamp per item setups")

### Errors / challenges
- `git add` from bash sandbox failed: `.git/index.lock` present. Removed via Desktop Commander PowerShell `Remove-Item`. All git operations then run through Desktop Commander cmd shell.
- `git commit -m "message with spaces"` in CMD splits on spaces. Fixed: `echo message > commit-msg.txt && git commit --file commit-msg.txt`
- `gh pr create --title "title with spaces"` also splits. Fixed: `gh pr create --fill --body-file pr-body.txt --base main` (uses commit message as title)
- `docs.json` had a trailing null byte (0x00) causing `json.decoder.JSONDecodeError: Extra data`. Fixed with Python: `open('docs.json', 'rb').read().rstrip(b'\x00')` then write back.
- Desktop Commander `read_file` on `app/(dashboard)/cards/[id]/page.tsx` returned only `{"fileName":..., "filePath":...}` with no content. Workaround: `Get-Content | Out-File` to temp file then read via bash. Actually the `mcp__filesystem__read_file` tool worked directly.
- Previous agent had the article written but failed to push (GITHUB_TOKEN read-only on Abdalestar/docs). This run had no push issues — the token appears to have been updated.

### Insights for future runs
- `/cards/[id]` uses the same `StampCardWizard` component as creation but with `mode="edit"` and `initialData={card}`. The wizard initializes all state from `initialData` on mount.
- Advanced Settings is a separate `AdvancedSettings` component rendered below the wizard on the design step only (not on other steps). It is collapsible/expandable.
- On save, existing rewards for the card are deleted and re-inserted. This means reward IDs change on every save. Customer stamp progress is NOT affected (stored on `member_stamps` by card ID, not reward ID).
- The `published_at` field is set only when `status === 'active'`. Saving as draft sets `published_at: null`.
- `mcp__filesystem__read_file` works with bracket path names (e.g. `[id]`) without needing `LiteralPath` workarounds. Use it instead of PowerShell `Get-Content`.
- `git -C C:\path` form works in Desktop Commander cmd shell. Avoids `cd` quoting issues.

### Gap discovery (Phase 6)
Scanned remaining Notion tasks:
- **Edit Points Program** (34d1ae8f-748c-8124) — Status: In progress, claimed by another agent today (agent-k3x7qp at 2026-05-02T08:24:00Z). P3 Low. `/merchants/points/edit.mdx`. Not claimed in this run.
- No other "Not started" tasks found. All other tasks are Done.
- No new undocumented routes discovered in this run.

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
