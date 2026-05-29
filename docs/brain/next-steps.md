# Next Steps

Last updated: 2026-05-29

## Current Best Next Step

**Character builder v1 is implemented** on branch `feat/character-builder` (milestones M1–M6 of the
approved plan at `~/.claude/plans/sunny-waddling-sunset.md`). Spec:
`docs/brain/requirements/character-builder-wizard-spec.md` (CBW-1…25). What shipped:
- SRD data task: per-class background/connection questions on the class schema/fixtures; Experience
  suggestion list.
- `src/character/`: Zod model (definition vs. reserved play-state), pure rules engine + 3 static
  effects, local-first AsyncStorage store with draft autosave.
- Wizard: `/characters` list, per-step Expo Router routes + hub, compact live summary bar, all 9
  step UIs (incl. Mixed Ancestry, nested Beastbound companion, strict trait multiset), review +
  Complete, read-only sheet.
- Gates green: `typecheck`, `verify:engine` (25 assertions), `validate:srd` (791); web export bundles.

**Status:** Android run-through done (no bugs found); PR opened to merge `feat/character-builder`.

**Next action — dedicated UI/UX pass over the character builder.** v1 is functionally complete but
built function-first; it needs a deliberate usability/visual review before it feels polished.
Candidate areas to evaluate (not yet decided):
- Long option lists (28 tier-1 primary weapons, 18 ancestries, 27 domain cards) — add search/filter,
  grouping (e.g. domain cards by domain), or condensed rows; current flat lists are long to scroll.
- Step flow affordances: clearer per-step completion/validation feedback, progress indicator,
  inline "why is Next/Complete unavailable" hints.
- Live summary bar polish (placement, what shows collapsed, spacing on small screens).
- Traits step clarity (remaining-pool indicator), equipment grouping, domain-card detail (show
  ability text), and the Beastbound companion sub-flow layout.
- Empty/placeholder states, keyboard handling on text steps, and overall visual hierarchy/theming.

Later follow-ups (still gated): level-up/advancement (model is designed for it), live play-state,
Supabase sync.

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
