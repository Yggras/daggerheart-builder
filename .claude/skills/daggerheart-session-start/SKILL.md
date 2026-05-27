---
name: daggerheart-session-start
description: Use when starting or resuming a Daggerheart Builder session, including begin session, start session, work yourself into the project, or continue from the brain docs.
---

# Daggerheart Session Start

Use this skill to load Daggerheart Builder project context before implementation.

## Workflow

1. Read `CLAUDE.md` (project root) for a quick orientation: current state, key directories, app routes, commands, and hard constraints.
2. Read `docs/brain/next-steps.md` for the current best next step and completed milestones.
3. Read `docs/brain/decision-log.md`, focusing on the latest 3–4 entries.
4. Check current repository state with `git status --short`.
5. If the session involves a specific product area, read the relevant requirements doc:
   - Compendium work → `docs/brain/requirements/compendium.md`
   - Character builder planning → `docs/brain/requirements/character-builder.md`
   - Campaign play planning → `docs/brain/requirements/campaign-play.md`
6. Read `docs/brain/open-questions.md` for unresolved product and architecture questions.
7. Summarize:
   - current project state (what's built, what's not started)
   - current best next step
   - do-not-start-yet items
   - relevant open questions
   - validation commands for any planned work
   - whether the worktree is clean
8. Do not edit files unless the user explicitly asks to proceed with implementation.
9. Respect the current agent mode. If plan mode is active, only inspect and plan.

## Validation Commands

```bash
npm run validate:srd    # after any data or schema change
npm run typecheck       # after any code change
npm run web             # verify UI changes in the browser
npm run android         # verify UI changes on device
```

## Current Project Priorities

- The SRD data foundation is complete and stable (783 entries, 11 kinds). Do not re-extract unless the SRD PDF changes.
- Build and improve app features (compendium first, then character builder, then campaign play) using the canonical fixture data.
- Preserve all project decisions in `docs/brain/`.
- Do not start Supabase integration, character builder, campaign play, or UI kit selection until explicitly decided.
- Run `validate:srd` and `typecheck` after any data or code change.
