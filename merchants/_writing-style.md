# Writing Style Guide — Qtap Merchant Documentation

This file is used by the daily cron job to maintain consistent, natural-sounding documentation. Read this before writing any doc.

---

## Core Principle

Write like a real person explaining the product to another real person. Not a copywriter. Not a marketer. Not an AI generating generic SaaS documentation.

If you read a sentence and it sounds like it could have been written about any software product, rewrite it to be specifically about Qtap.

---

## Hard Rules (No Exceptions)

### Banned punctuation
- **No em dashes** (— or –). Use commas, periods, or restructure the sentence.
- **No ellipses** (...) for trailing off. If you need a pause, end the sentence.

### Banned sentence patterns

**No rule-of-three lists in prose:**
Bad: "Qtap helps you attract, retain, and reward customers."
Good: "Qtap runs your loyalty program so customers keep coming back."

**No contrast framing ("not X, but Y"):**
Bad: "This isn't just a stamp card. It's a relationship tool."
Good: "Stamp cards track visits and trigger rewards automatically."

**No "Whether you..." openings:**
Bad: "Whether you run a café or a retail chain, Qtap adapts to your business."
Just say what the product does.

**No benefit stacking:**
Bad: "Save time, reduce churn, and grow revenue with automated campaigns."
Good: "Campaigns send automatically when customers hit milestones, so you don't have to remember to follow up."

### Banned words and phrases
- leverage, empower, seamlessly, robust, comprehensive, streamline
- game-changer, unlock, harness, transformative
- "the power of", "at your fingertips", "in real-time" (say "immediately" or "as it happens")
- "easy to use", "intuitive", "user-friendly"
- "best-in-class", "world-class", "cutting-edge"
- "solution", "platform" (use "dashboard", "Qtap", or the specific feature name)
- "journey" (for customer journey — say "how customers interact" or "customer visits")

---

## Tone and Voice

**Direct.** Tell people what to do, what happens, what to expect. Don't hedge.

**Specific.** Name the actual buttons, fields, and menu items. "Click Save" not "complete the setup process."

**Honest about limitations.** If something has a constraint, say so plainly. Don't bury it.

**No aspirational tone.** Don't tell merchants what they *could* do. Tell them what the feature does.

---

## Structure Rules

### Page structure
1. One clear sentence at the top: what this page is about
2. Then get into it — don't restate the title or write an intro paragraph that says nothing
3. Use `##` for sections (never `#` inside a page — the title is already `h1`)
4. Steps should be numbered lists, not prose
5. End with a `<CardGroup>` linking to 2-3 related pages

### Frontmatter
```
---
title: "Exact Page Title"
description: "One sentence that would make sense in a search result preview"
---
```

### Mintlify components to use
- `<Note>` — for tips, clarifications, non-critical extras
- `<Warning>` — for things that will cause problems if ignored
- `<Steps>` — for sequential processes (numbered automatically)
- `<CardGroup cols={2}>` with `<Card>` — for related page links at the bottom

Do not use `<Tip>` (use `<Note>` instead). Do not use `<Info>`.

---

## How to Handle Source Code

When reading qtaplatest source to understand a feature:

1. **Find the page file first** — `app/(dashboard)/[feature]/page.tsx`
2. **Read the component** — what fields does the form have? What does the UI show?
3. **Read any API routes** — `app/api/[feature]/` to understand what data is saved
4. **Use the actual field names and labels** from the UI in your writing

If a field is called "Stamp Goal" in the source code, call it "Stamp Goal" in the doc. Don't rename it to "number of stamps required."

---

## Example: Good vs Bad

**Bad (generic AI doc):**
> Qtap's stamp card feature empowers merchants to build lasting customer relationships through a seamless, intuitive loyalty experience. Whether you run a small café or a multi-location retail chain, stamp cards help you attract, retain, and reward your most loyal customers.

**Good (specific, direct):**
> Stamp cards track customer visits and issue a reward when they reach your stamp goal. You set the goal, design the card, and decide what the reward is. Qtap handles the rest automatically.

---

## Qtap Terminology (Use These Exactly)

- **Stamp card** — not "punch card" or "visit card"
- **Points program** — not "points system" or "loyalty points"
- **Stamp goal** — the number of stamps needed to earn a reward
- **Redemption** — when a customer uses their reward
- **Campaign** — automated message sent to a segment of customers
- **Location** — a physical branch of a merchant's business
- **Staff** — employees who use the dashboard (not "team members" or "users")
- **Member** — a customer enrolled in the loyalty program
- **Dashboard** — the Qtap web interface merchants use
- **QR code** — the scannable code used to stamp or redeem (not "QR")

---

## What Good Documentation Looks Like

A good page:
- Tells the merchant exactly what the feature does in the first 2 sentences
- Walks through how to use it with numbered steps and specific UI labels
- Notes any limits or edge cases plainly
- Links to 2-3 related pages at the bottom

A bad page:
- Starts with marketing language
- Uses vague verbs ("configure", "set up", "manage") without saying what that means
- Doesn't name the actual buttons or fields
- Ends without pointing anywhere
