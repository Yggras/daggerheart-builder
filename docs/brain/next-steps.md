# Next Steps

Last updated: 2026-05-28

## Current Best Next Step

All structured SRD entity families are extracted, reviewed, and promoted to canonical fixtures. The SRD data foundation and current compendium improvement pass are complete. The next focus should be choosing the next product slice:

1. Character builder planning.
2. Supabase/auth/sync planning, if backend work is explicitly approved.
3. A focused compendium follow-up only if there is a concrete usability gap.

## Why This Is Next

The full SRD data pipeline is done: 791 canonical entries across all 11 entity kinds. No remaining extraction work is needed until the SRD changes or new entity kinds are identified. The compendium now has nested routes, ranked search, highlighting, inline text links, field-value links, and per-kind detail rendering.

## Immediate Tasks

None — the SRD extraction pipeline and current compendium enhancement pass are complete. Choose a product direction before starting new feature work.

1. Validate fixture data with `npm run validate:srd` after any data/schema change.
2. Typecheck with `npm run typecheck` after any code change.

## Do Not Start Yet

- Supabase integration.
- Character builder.
- Campaign play view.
- UI kit/design system selection.
- Re-running full SRD extraction unless the SRD PDF changes or a new entity kind is identified.

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
- Full SRD extraction pipeline completed: all 11 entity kinds extracted, AI-reviewed, and promoted to canonical fixtures. The current canonical set has 791 total entries, including 42 rule references. Schema extended for `physical_or_magic` damage and dice-expression attack modifiers.
- AI-assisted source verification accepted as review gate for generated candidates.
- `validate-srd.ts` enhanced to merge fixture context when validating candidate files so cross-kind ID references resolve correctly.
- Compendium UI refactored to nested `[kind]/[id]` routing: overview screen → kind list with text search and kind-specific chip filters → full detail rendering for all 11 kinds. Tested on Android.
- Compendium UI enhanced: centralized theme (`src/theme.ts`), per-kind detail components extracted from monolithic switch, shared `Section`/`KeyValue`/`Feature` components, tag badges, breadcrumbs, clear-all-filters, sort options (A-Z, Z-A, Tier), ranked search with scoring, search result highlighting, and inline rich-text links in rules text (curated allowlist, first-occurrence-only, longest-match-first).
- Field-value rule links scaled across enum fields for weapons, classes, domain cards, subclasses, adversaries, environments, and loot. Subclasses are intentionally reachable through class navigation rather than a separate overview card.

## Open Questions

- Should full extraction outputs be committed long-term, or treated as generated artifacts later?

## Resolved Questions

- Codex grimoire cards are now normalized into one `ability` per sub-spell (resolved 2026-05-28). The domain-card parser splits grimoire bodies via a curated `grimoireSpells` map; the compendium renders each sub-spell as a bold-named feature.
- Related entries are shown both as explicit related-entry sections and inline links in rules text where the curated linker finds safe matches (resolved 2026-05-27).

## Review Policy

Generated parser batches may now be accepted through AI-assisted source verification instead of user manual review. Candidates can be marked `reviewed` when schema validation, parser reports, deterministic reruns, and source-PDF verification pass, with evidence recorded in report output or review notes.

## Handoff Rule

At the start of a future session, read this file first, then check `decision-log.md` and the latest ADRs before implementing new work. Update this file whenever the best next step changes.
