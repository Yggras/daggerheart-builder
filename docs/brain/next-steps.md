# Next Steps

Last updated: 2026-05-30

## Latest: Supabase Slices 1–2 Implemented (auth + continuous character sync)

The character builder v1 is **merged to `main`** (PR #1). Supabase integration is underway on branch
`feat/supabase-auth`:

- **Slice 1 — auth foundation:** `@supabase/supabase-js` client with AsyncStorage session
  persistence, config via `app.config.ts` + `.env`, an `AuthProvider` (`src/auth/`), a login-only
  screen (admin-managed email/password per ADR-0007), and a root route guard.
- **Slice 2 — continuous character cloud sync:** characters now sync automatically across a user's
  devices (no manual "Sync now"). A `characters` table (RLS + `data` JSONB + realtime publication,
  see `supabase/schema.sql`), `meta.ownerId` + `schemaVersion` 2, a store change-emitter, and a sync
  engine (`src/character/sync/`) with a persisted offline retry queue, Supabase Realtime inbound, and
  last-write-wins on `meta.updatedAt`. Hard-delete of the remote row on local delete.

Gates green: `typecheck`, `verify:engine` (25), `validate:srd` (791). **Live verification still
needed:** apply `supabase/schema.sql` in the dashboard, then test cross-device sync, offline queue
flush, and RLS with a real project.

## Current Best Next Step

Two viable directions — pick one:

1. **Supabase Slice 3 — live-play `playState` on the existing sync engine** (HP/stress/hope live
   counters). The engine and `playState` boundary were designed for this; note campaign play remains
   gated, so this would be solo live-play state only.
2. **Character-builder UI/UX pass** (function-first v1 needs polish): long option lists
   (28 tier-1 weapons, 18 ancestries, 27 domain cards) need search/filter/grouping; step-flow
   validation feedback + progress indicator; live summary bar polish; Traits remaining-pool
   indicator; equipment grouping; domain-card ability text; Beastbound companion layout; empty
   states; keyboard handling; visual hierarchy/theming.

Later follow-ups (still gated): level-up/advancement (model is designed for it), campaign play.

## Why This Is Next

The SRD data pipeline (791 entries, 11 kinds) and compendium are complete and stable. The character
builder is functionally complete and now cloud-synced; remaining work is either extending live state
onto the new sync engine or polishing the builder UX.

## Immediate Tasks

None — the SRD extraction pipeline and current compendium enhancement pass are complete. Choose a product direction before starting new feature work.

1. Validate fixture data with `npm run validate:srd` after any data/schema change.
2. Typecheck with `npm run typecheck` after any code change.

## Do Not Start Yet

- Campaign play view.
- UI kit/design system selection.
- Re-running full SRD extraction unless the SRD PDF changes or a new entity kind is identified.

(Lifted: the character builder is merged to `main`; Supabase integration has started with the auth
foundation slice.)

## Recent Completed Milestones

- Supabase continuous character sync (slice 2): `characters` table + RLS + realtime
  (`supabase/schema.sql`), `meta.ownerId` + schemaVersion 2, store change-emitter, sync engine
  (`src/character/sync/`) with persisted offline queue, Realtime inbound, and last-write-wins.
- Supabase auth foundation (slice 1): client + session persistence, `app.config.ts`/`.env` config,
  `AuthProvider`, login-only screen (ADR-0007), and root route guard.
- Second brain created.
- Official SRD PDF downloaded and recorded.
- PDF extraction spike completed (Poppler-based).
- Initial Zod SRD schema created with discriminated union over 11 entity kinds.
- Fixture validation added (`npm run validate:srd`).
- Expo Router app shell created with home and compendium routes.
- Offline compendium prototype created with local fixture data, text search, kind filters, and detail screens.
- Related-entry linking system added (generic `relationships` field + mechanical references like `classId`).
- SRD terminology alignment: all entity names follow official SRD wording.
- Canonical fixture data split into kind-specific JSON files under `data/srd/fixtures/`.
- Full SRD extraction pipeline completed: all 11 entity kinds extracted, AI-reviewed, and promoted to canonical fixtures. The current canonical set has 791 total entries, including 42 rule references. Schema extended for `physical_or_magic` damage and dice-expression attack modifiers.
- AI-assisted source verification accepted as review gate for generated candidates.
- `validate-srd.ts` enhanced to merge fixture context when validating candidate files so cross-kind ID references resolve correctly.
- Compendium UI refactored to nested `[kind]/[id]` routing: overview screen → kind list with text search and kind-specific chip filters → full detail rendering for all 11 kinds. Tested on Android.
- Compendium UI enhanced: centralized theme (`src/theme.ts`), per-kind detail components extracted from monolithic switch, shared `Section`/`KeyValue`/`Feature` components, tag badges, breadcrumbs, clear-all-filters, sort options (A-Z, Z-A, Tier), ranked search with scoring, search result highlighting, and inline rich-text links in rules text (curated allowlist, first-occurrence-only, longest-match-first).
- Field-value rule links scaled across enum fields for weapons, classes, domain cards, subclasses, adversaries, environments, and loot. Subclasses are intentionally reachable through class navigation rather than a separate overview card.
- Ancestry compendium art added through optimized bundled WebP assets. Source PNGs live only in ignored `art-source/`; bundled files are generated into `assets/compendium/ancestries/` with `npm run optimize:images:ancestries` and rendered on ancestry detail pages.
- Ancestry summaries now use the first descriptive SRD prose sentence instead of generic "A Daggerheart ancestry with..." feature-list summaries.

## Open Questions

- Should full extraction outputs be committed long-term, or treated as generated artifacts later?

## Resolved Questions

- Codex grimoire cards are now normalized into one `ability` per sub-spell (resolved 2026-05-28). The domain-card parser splits grimoire bodies via a curated `grimoireSpells` map; the compendium renders each sub-spell as a bold-named feature.
- Related entries are shown both as explicit related-entry sections and inline links in rules text where the curated linker finds safe matches (resolved 2026-05-27).

## Review Policy

Generated parser batches may now be accepted through AI-assisted source verification instead of user manual review. Candidates can be marked `reviewed` when schema validation, parser reports, deterministic reruns, and source-PDF verification pass, with evidence recorded in report output or review notes.

## Handoff Rule

At the start of a future session, read this file first, then check `decision-log.md` and the latest ADRs before implementing new work. Update this file whenever the best next step changes.
