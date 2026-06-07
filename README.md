# Qtap Help Center

Source for the [Qtap](https://dashboard.qtap.qa) Help Center — documentation for
merchants using the Qtap loyalty platform (stamp cards, points programs, QR codes,
NFC, campaigns, analytics, staff, and settings).

The site is built with [Mintlify](https://mintlify.com). Content lives in MDX
files; navigation and branding are configured in `docs.json`.

## Repository layout

| Path             | Contents                                                            |
| ---------------- | ------------------------------------------------------------------- |
| `merchants/`     | Merchant-facing guides, grouped by feature                          |
| `customer-app/`  | Customer mobile app articles                                        |
| `support/`       | FAQ and support content                                             |
| `images/`        | Screenshots and SVG diagrams referenced by articles                 |
| `logo/`, `favicon.png` | Qtap brand assets                                             |
| `docs.json`      | Navigation, theme, colors, navbar, and footer                       |
| `.writing-rules/`| House writing style (anti-slop) rules                               |
| `.routine/`      | Screenshot tooling and the automated docs-writer routine            |

## Preview locally

Install the Mintlify CLI and run the dev server from the repo root (where
`docs.json` lives):

```bash
npm i -g mint
mint dev
```

The preview is served at `http://localhost:3000`.

## Publishing

Changes merged to the default branch deploy automatically. Open a pull request for
review; each PR gets a Mintlify preview.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow and writing guidelines.
