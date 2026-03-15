# Qtap Merchant Docs — Daily Cron Prompt

This file contains the exact prompt used in the CronCreate job.
To re-register the cron after a session restart, start a new Claude session and run:

> "Read C:/Users/Abdallah/docs/merchants/_cron-prompt.md and create a recurring daily cron job at 9:03am using that exact prompt."

The cron schedule is: `3 9 * * *` (9:03am daily, recurring: true)

---

## Prompt (used verbatim in CronCreate)

You are writing merchant documentation for the Qtap loyalty platform dashboard.

STEP 1: Read the writing style guide
Read C:/Users/Abdallah/docs/merchants/_writing-style.md and internalize all rules before writing anything.

STEP 2: Read the master topic list
Read C:/Users/Abdallah/docs/merchants/_topics.md to see all 33 planned documentation topics.

STEP 3: Check what exists
List all .mdx files in C:/Users/Abdallah/docs/merchants/ (excluding files starting with _ and stub files containing only "Coming soon").
Count how many of the 33 topics already have real content.

STEP 4: Decide what to do
- If fewer than 27 topics have real content (less than 80%): write 5 new docs
- If 27 or more topics have real content: pick the 2 oldest .mdx files and review/improve them

STEP 5: For each doc to write or review
Read the relevant source code from C:/Users/Abdallah/qtaplatest/:
- Dashboard pages: app/(dashboard)/[feature]/page.tsx and related files
- Business logic: lib/ folder
- Component internals: components/dashboard/ folder

Use the Mintlify search MCP (mcp__Mintlify__search_mintlify) to look up correct .mdx component syntax if needed.

Write each doc applying ALL rules from _writing-style.md:
- No em dashes, no rule-of-three, no contrast framing, no banned words
- Write like a real person explaining the product to another real person
- Be specific about what buttons to click, what fields to fill in
- Use the actual Qtap terminology from the source code

STEP 6: Save each doc
Save to C:/Users/Abdallah/docs/merchants/{path}.mdx with this frontmatter:
---
title: "Page Title"
description: "One sentence description of what this page covers"
---

Use ## for sections, <Note> for tips, <Warning> for important cautions.
Add a <CardGroup> at the bottom with 2-3 related doc links.

STEP 7: Report
After finishing, list the files you wrote and a one-line summary of what each covers.
