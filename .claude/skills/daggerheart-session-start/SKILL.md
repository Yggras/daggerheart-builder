---
name: daggerheart-session-start
description: Use when starting or resuming a Daggerheart Builder session, including begin session, start session, work yourself into the project, or continue from the brain docs.
---

# Daggerheart Session Start

Use this skill to load Daggerheart Builder project context before implementation.

## Workflow

1. Read `docs/brain/README.md`.
2. Read `docs/brain/next-steps.md`.
3. Read `docs/brain/decision-log.md`, focusing on the latest entries.
4. Read the latest relevant ADRs in `docs/brain/decisions/`.
5. Read the relevant current work docs:
   - `docs/brain/data/parser-automation-plan.md`
   - `docs/brain/data/schema-notes.md`
   - `docs/brain/open-questions.md`
6. Check current repository state with `git status --short`.
7. If parser work is current, inspect:
   - `scripts/extract-rule-references.ts`
   - `data/srd/generated/review-report.md`
   - `data/srd/generated/entries.candidates.json`
8. Summarize:
   - current project goal
   - current best next step
   - do-not-start-yet items
   - relevant open questions
   - validation commands to run before or after work
   - whether the worktree is clean
9. Do not edit files unless the user explicitly asks to proceed with implementation.
10. Respect the current agent mode. If plan mode is active, only inspect and plan.

## Validation Commands

Use these when relevant:

```bash
npm run validate:srd
npm run validate:srd:candidates
npm run typecheck
```

## Current Project Priorities

- Preserve project decisions in `docs/brain/`.
- Build a reliable structured SRD data foundation.
- Treat extracted parser output as untrusted until reviewed.
- Keep reviewed generated candidates separate from canonical app fixtures until promotion policy is decided.
- Avoid Supabase, character builder, campaign play, UI kit, inline rich-text links, and full SRD extraction until explicitly started.
