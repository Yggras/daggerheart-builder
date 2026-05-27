# Daggerheart Builder — Claude Code Quick Reference

A personal-use Daggerheart TTRPG companion app (iOS / Android / web) built with Expo + React Native + TypeScript. Inspired by D&D Beyond.

## Current State

- **SRD data extraction is complete**: 783 canonical entries across 11 entity kinds, all reviewed and validated.
- **Compendium UI is working** (tested on Android): overview → kind list with search + chip filters → entry detail view.
- **Not yet started**: Supabase integration, character builder, campaign play.

## Second Brain

All project decisions, plans, and history live in `docs/brain/`. Read before starting any session:

- `docs/brain/next-steps.md` — current best next step and completed milestones
- `docs/brain/decision-log.md` — chronological decisions
- `docs/brain/decisions/` — ADRs for durable architectural decisions

Use the `/daggerheart-session-start` skill at the start of any session for full context.

## Key Directories

| Path | Contents |
|------|----------|
| `app/` | Expo Router screens |
| `src/srd/` | Zod schema, fixture loader, fixture entry index |
| `src/compendium/` | Display formatting and client-side search/filter logic |
| `data/srd/fixtures/` | 11 kind-specific canonical JSON files (783 entries total) |
| `data/srd/generated/` | Parser output — candidate data, not canonical |
| `data/source/` | Official SRD PDF |
| `scripts/` | SRD extraction scripts (one per entity kind) |
| `docs/brain/` | Project second brain |

## App Routes

```
/                          → home screen
/compendium                → kind overview (one card per entity kind)
/compendium/[kind]         → kind list with text search and chip filters
/compendium/[kind]/[id]    → entry detail screen
```

## Commands

```bash
npm run validate:srd    # validate all canonical fixtures against the Zod schema
npm run typecheck       # TypeScript check
npm run web             # web dev server
npm run android         # Android dev build
```

Always run `validate:srd` and `typecheck` after any data or schema change.

## Hard Constraints

**Do not start** any of these until explicitly decided:
- Supabase integration (auth, database, realtime)
- Character builder
- Campaign play view
- UI kit / design system selection

**Do not:**
- Parse the SRD PDF at runtime — data is bundled as reviewed canonical JSON.
- Promote extracted candidates to `data/srd/fixtures/` without review validation.
- Treat `data/srd/generated/` files as canonical.

## Conventions

- **SRD terminology**: use official SRD wording in all names, IDs, and UI labels (`ancestry`, `community`, `domain_card`, etc.).
- **Canonical data**: split kind-specific JSON files under `data/srd/fixtures/`.
- **Review states**: `extracted` (untrusted) → `reviewed` → `corrected`.
- **Source page references** (`source.pdf.pageStart`, `source.printedPages`) are stored in entries but intentionally **not shown** in the compendium UI.
- **Zod first**: validate all runtime data (fixtures, candidates, future sync payloads) with the Zod schema before use.

## SRD Entity Kinds (11 total)

`rule_reference` · `class` · `subclass` · `domain_card` · `weapon` · `ancestry` · `community` · `armor` · `loot` · `adversary` · `environment`

## Tech Stack

| Layer | Choice |
|-------|--------|
| App framework | Expo ^56 + React Native ^0.85 + React 19 |
| Routing | Expo Router ^56 |
| Language | TypeScript ~6 |
| Runtime validation | Zod ^4 |
| Backend (not integrated yet) | Supabase (auth, Postgres, Realtime, RLS) |
| Canonical SRD data | Local versioned JSON, no runtime PDF parsing |
| Extraction tooling | Poppler (`pdftotext -raw` for prose, `pdftohtml -xml` for tables) |
