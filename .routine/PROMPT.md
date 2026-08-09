# Qtap Documentation Writer — routine trigger prompt

`.routine/ROUTINE.md` is the authoritative, self-contained pipeline. This file
holds the short trigger prompt to paste into the scheduled routine (Claude Code
on the web), plus the environment the routine needs. The trigger stays short on
purpose: the pipeline evolves in ROUTINE.md without touching the schedule.

## Paste this as the routine's prompt

```
Read .routine/ROUTINE.md in the Abdalestar/docs repository and follow it
exactly, end to end. Abdalestar/docs is your primary repo: you write articles,
commit, and open PRs there.

Also read the Abdalestar/qtap app repository as reference only — never edit,
commit to, or push to it. Before writing any article, explore the relevant
code until you understand how the feature works today (for example, an article
on staff manually issuing stamps or points means reading that staff flow end
to end). Every claim in an article must be backed by something you read.

Screenshots are mandatory. If the smoke test fails, stop and report per
ROUTINE.md §6 — do not write screenshot-less articles.
```

To halve a run, append: `Complete one task this run instead of two.`

## Environment the routine needs (set in the environment config, never in a file)

- **Secrets:** `QTAP_EMAIL` / `QTAP_PASSWORD` (points demo), `QTAP_STAMP_EMAIL`
  / `QTAP_STAMP_PASSWORD` (stamp demo), and optionally `QTAP_NAJMA_EMAIL` /
  `QTAP_NAJMA_PASSWORD` (offers/vouchers/passes). This repo is public — never
  commit credentials.
- **Network policy:** must allow `dashboard.qtap.qa` and `*.supabase.co`, or
  the smoke test can never pass and every run stops at §6.
- **Sources:** `Abdalestar/docs` (write) and `Abdalestar/qtap` (read).
- **Connectors:** Notion (task board), GitHub MCP (PRs), Supabase (read-only
  research), Replicate or Flora (example voucher backgrounds, §8d).

## History

The previous version of this file documented the 2026 screenshot-pipeline
repair (Supabase 401 treated as down, a Vercel-SSO bypass that never existed,
base64 text committed as `.png`). Those fixes are folded into ROUTINE.md §0
and the scripts in this directory; the failure story lives there now.
