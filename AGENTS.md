# Qtap Help Center — project instructions

## About this project

- This is the Qtap Help Center: merchant-facing documentation for the Qtap loyalty
  platform. It is built on [Mintlify](https://mintlify.com).
- Pages are MDX files with YAML frontmatter. Navigation, theme, and branding live
  in `docs.json`.
- Run `mint dev` to preview locally and `mint broken-links` to check links.
- House writing rules are in `.writing-rules/`. Screenshot tooling and the
  automated docs-writer routine are in `.routine/` (see `.routine/ROUTINE.md`).

## Terminology

- **Merchant** — the business using the Qtap dashboard. Address them as "you".
- **Member** — an enrolled customer. Use "member", not "user" or "customer".
- **Stamp card** vs **points program** — the two loyalty types. Don't conflate them.
- **Staff** — invited team members with a role (Manager or Staff); the **owner**
  has full access.
- Say "set up" not "configure", "add" not "provision", "choose" not "select".

## Style preferences

- Write for non-technical small-business owners in Qatar. Short, direct sentences.
- Active voice, second person ("you"). Sentence case for headings.
- Bold for UI elements: Click **Settings**. Code formatting for files, commands, paths.
- No AI-slop. Follow `.writing-rules/banned-words` and `.writing-rules/content-patterns`.

## Content boundaries

- Document the merchant dashboard (dashboard.qtap.qa) and the customer app.
- Never invent features. If a claim isn't backed by the app code or the live UI,
  don't make it.
- Screenshots must be real captures of the dashboard (no placeholders). Every
  referenced image must be a valid PNG — validate before opening a PR.
