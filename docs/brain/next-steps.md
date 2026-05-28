# Next Steps

Last updated: 2026-05-26

## Current Best Next Step

All structured SRD entity families are extracted, reviewed, and promoted to canonical fixtures. The SRD data foundation is complete. The next focus should be app improvements or new feature planning — likely starting with:

1. Enhance the compendium UI (filters, search, detail rendering for environments/adversaries).
2. Decide whether to add Supabase integration or keep offline-only.
3. Begin character builder planning.

## Why This Is Next

The full SRD data pipeline is done: 783 canonical entries across all entity kinds. No remaining extraction work until the SRD changes or new entity kinds are identified.

## Immediate Tasks

None — the SRD extraction pipeline is complete. Choose a product direction.

1. Validate fixture data with `npm run validate:srd` after any data/schema change.
2. Typecheck with `npm run typecheck` after any code change.

## Do Not Start Yet

- Supabase integration.
- Character builder.
- Campaign play view.
- UI kit/design system selection.
- Full SRD extraction.

## Recent Completed Milestones

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
- Full SRD extraction pipeline completed: all 11 entity kinds extracted, AI-reviewed, and promoted to canonical fixtures (783 total entries). Schema extended for `physical_or_magic` damage and dice-expression attack modifiers.
- AI-assisted source verification accepted as review gate for generated candidates.
- `validate-srd.ts` enhanced to merge fixture context when validating candidate files so cross-kind ID references resolve correctly.
- Compendium UI refactored to nested `[kind]/[id]` routing: overview screen → kind list with text search and kind-specific chip filters → full detail rendering for all 11 kinds. Tested on Android.
- Compendium UI enhanced: centralized theme (`src/theme.ts`), per-kind detail components extracted from monolithic switch, shared `Section`/`KeyValue`/`Feature` components, tag badges, breadcrumbs, clear-all-filters, sort options (A-Z, Z-A, Tier), ranked search with scoring, search result highlighting, and inline rich-text links in rules text (curated allowlist, first-occurrence-only, longest-match-first).

## Open Questions

- Should full extraction outputs be committed long-term, or treated as generated artifacts later?

## Resolved Questions

- Codex grimoire cards are now normalized into one `ability` per sub-spell (resolved 2026-05-28). The domain-card parser splits grimoire bodies via a curated `grimoireSpells` map; the compendium renders each sub-spell as a bold-named feature.

## Review Policy

Generated parser batches may now be accepted through AI-assisted source verification instead of user manual review. Candidates can be marked `reviewed` when schema validation, parser reports, deterministic reruns, and source-PDF verification pass, with evidence recorded in report output or review notes.

## Handoff Rule

At the start of a future session, read this file first, then check `decision-log.md` and the latest ADRs before implementing new work. Update this file whenever the best next step changes.
