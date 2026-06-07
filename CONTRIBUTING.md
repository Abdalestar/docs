# Contributing to the Qtap Help Center

Thanks for helping improve the Qtap documentation. This guide covers the workflow
and the writing standards we hold every article to.

## How to contribute

### Edit on GitHub

1. Open the page you want to change.
2. Click the pencil (Edit this file) icon.
3. Make your edit and open a pull request.

### Local development

1. Clone the repository and create a branch.
2. Install the Mintlify CLI: `npm i -g mint`
3. Run `mint dev` from the repo root and preview at `http://localhost:3000`.
4. Commit your changes and open a pull request.

Every pull request gets a Mintlify preview so reviewers can see the rendered result.

## Writing guidelines

Articles follow the house rules in [`.writing-rules/`](.writing-rules/). Read them
before writing. In short:

- Write for non-technical merchants in Qatar. Short, direct sentences.
- Address the reader as "you"; use active voice.
- Lead with the goal, then the steps.
- Use consistent terminology and avoid AI-slop phrasing (see the banned-words list).
- Show real screenshots of the dashboard where they help, and mention gotchas honestly.

## Screenshots

Screenshots are captured from the live dashboard with the tooling in
[`.routine/`](.routine/). They must be real, in-focus, and validated as proper
images — never placeholders. See `.routine/ROUTINE.md` for the capture workflow.
