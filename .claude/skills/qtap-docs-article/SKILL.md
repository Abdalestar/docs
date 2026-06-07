---
name: qtap-docs-article
description: >-
  Write or update an article in the Qtap Help Center (the Mintlify docs in this
  repo: merchants/*, customer-app/*, support/* MDX files). Use whenever creating
  a new docs page, rewriting one, or backfilling screenshots into an existing
  page. Enforces the house writing rules, real annotated screenshot flows
  captured from the live dashboard, and the image-validation gate before a PR.
---

# Writing a Qtap Help Center article

Qtap is a B2B loyalty platform for merchants in Qatar (stamp cards + points, QR/NFC,
campaigns, analytics, staff). The audience for these docs is non-technical small
business owners. Follow this workflow every time you write or update an article.

## 1. Load the house writing rules (always)

Read and apply these before drafting prose. They are authoritative; do not skip them.

- `.writing-rules/SKILL.md`
- `.writing-rules/banned-words`
- `.writing-rules/content-patterns`

Style in short: short, direct sentences; address the reader as "you"; 300–800 words;
say "set up" not "configure", "add" not "provision", "choose" not "select"; no
AI-slop; mention gotchas honestly. Brand palette: plum `#8E4A63`, gold `#F0D793`,
charcoal `#423F4C`.

## 2. Research before you claim anything

Ground every statement in a real source. If you didn't verify it, don't write it.

- **App code** (`Abdalestar/qtap` if reachable) — follow imports to learn how the
  feature actually works.
- **Supabase** (read-only via MCP) — tables, columns, RLS. Never write.
- **Live dashboard** (`dashboard.qtap.qa`) — confirm labels, button text, and that
  the feature renders. The verified route map and test accounts are in
  `.routine/ROUTINE.md`.
- **Existing docs** (Mintlify search) — cross-link neighbouring articles.

## 3. Capture screenshots as FLOWS, not single shots

A how-to needs the whole journey, not one hero image. For a feature like "set up
staff", capture: the section page → open the invite dialog (filled) → the row menu →
the permissions dialog — one screenshot per meaningful step. Use the flow engine:

```bash
node .routine/flow-capture.mjs .routine/flows/<task>.json   # see flows/staff.json
node .routine/optimize.mjs images/<section>                 # optional 1200px -final
```

Each step can navigate, `click`/`fill`/`select`/`hover`/`press`, then capture with:
- **annotations** drawn in the brand palette and removed after the shot — `box`
  (add `number` for a step badge), `arrow`, `label` (callout chip), `caption`
  (bottom bar; only on full-page shots), and `redact` (cover real customer PII);
- **cropping** — `clipTo: "[role=dialog]"` (auto bbox + padding) or explicit `clip`
  for dialogs and menus.

Rules: discover real selectors first with a throwaway probe; **never** click
destructive or outbound actions while capturing (no Send Invite / Save / Remove /
Delete — fill the form and capture the filled state). Credentials come from the
environment (`QTAP_EMAIL`/`QTAP_PASSWORD` for the points demo account,
`QTAP_STAMP_EMAIL`/`QTAP_STAMP_PASSWORD` for the stamp-card one) — never hardcode
them; this repo is public. Use the points account for most pages and the stamp
account for stamp-card pages. Plain single-page shots (`.routine/screenshot.mjs`)
are fine for overview pages that aren't a procedure.

Draw an SVG (brand palette, `viewBox`, system font) only to show what a screenshot
can't — a flow, state machine, relationship, or comparison. An SVG never replaces
the screenshots a how-to needs.

## 4. Validate images (hard gate)

```bash
node .routine/validate-images.mjs <article>.mdx   # must exit 0
```

This asserts every referenced `.png` is a real image (PNG magic bytes, > 5 KB, real
dimensions). **Never** commit base64/data-URI text in a `.png`, a placeholder, or a
truncated file — that was the historical failure that made articles useless.

## 5. Write, wire up, and open a PR

- Frontmatter: `title`, optional `sidebarTitle`, `description`.
- Reference images with `<Frame caption="…"><img src="/images/<section>/<name>.png" alt="…" /></Frame>`.
- Add the page to `docs.json` navigation if it's new.
- Commit with **`git push`** (handles binary PNGs correctly). Do **not** use the
  GitHub MCP `push_files`/`create_or_update_file` for images — it stores base64
  text, not binary. Open the PR with the GitHub MCP (`create_pull_request`,
  base `main`).

## Hard rules

- Real binary screenshots for how-tos, captured as annotated flows. No placeholders,
  no base64-as-png, no SVG-only substitute.
- `validate-images.mjs` must pass before the PR.
- Never invent features. Never modify `.writing-rules/`. Supabase is read-only.
- The full pipeline, test accounts, route map, and flow-config format live in
  `.routine/ROUTINE.md`.
