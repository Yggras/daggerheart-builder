# Next Steps

Last updated: 2026-05-25

## Current Best Next Step

Review the expanded page-22 prose `rule_reference` parser slice with `data/srd/generated/review-report.md` before moving into equipment tables or entity-specific extraction.

## Why This Is Next

All 18 generated `rule_reference` candidates through Downtime have been accepted through report-driven manual review. The parser now generates 33 candidates total: 18 reviewed entries plus 15 extracted page-22 entries covering Death, Additional Rules, Leveling Up, and Multiclassing. This is a deliberately larger prose-only slice with review report text lengths and previews, while still avoiding equipment tables and structured entity extraction.

## Immediate Tasks

1. Review the 15 new page-22 entries in `data/srd/generated/entries.candidates.json` against physical PDF page 22 / printed pages 42-43.
2. Fully review entries with parser cleanup in `data/srd/generated/review-report.md`, especially `rule.combat.death` and `rule.advancement.advancements`.
3. Spot-check clean short entries such as rounding, rerolling dice, incoming damage, and simultaneous effects.
4. Keep the page-22 entries marked `review.status: "extracted"` until manually reviewed.
5. Validate fixture data with `npm run validate:srd` after any data/schema change.
6. Validate candidate data with `npm run validate:srd:candidates` after any parser or candidate change.
7. Typecheck with `npm run typecheck` after any code change.

## Do Not Start Yet

- Supabase integration.
- Character builder.
- Campaign play view.
- UI kit/design system selection.
- Inline rich-text links.
- Equipment tables or entity-specific parser extraction until the page-22 prose slice is reviewed.
- Full SRD extraction.

## Recent Completed Milestones

- Second brain created.
- Official SRD PDF downloaded and recorded.
- PDF extraction spike completed.
- Initial Zod SRD schema created.
- Fixture validation added.
- Expo Router app shell created.
- Offline compendium prototype created.
- Related-entry linking system added.
- SRD terminology alignment accepted: app/data entity names should follow official SRD wording.
- Ancestry and community schema support, fixtures, filters, and detail rendering added.
- Armor, loot, adversary, and environment schema support, representative fixtures, filters, and detail rendering added.
- Expanded fixture coverage manually reviewed in the web app with `npm run web`.
- Parser automation plan drafted.
- Small generated candidate batches and reusable SRD validation accepted.
- First `rule_reference` parser slice implemented for the `Hope & Fear` section.
- Risk-based candidate review accepted.
- Rule-reference parser expanded to 8 candidates with conservative cleanup and a generated review report.
- First 8 generated rule-reference candidates accepted through report-driven manual review.
- Rule-reference parser expanded to 16 candidates, leaving the next page-21 prose slice marked `extracted` for review.
- Second 8 generated rule-reference candidates accepted through report-driven manual review.
- Downtime parser slice added as 2 extracted candidates with conservative cleanup and report output.
- Downtime parser slice accepted through report-driven manual review, bringing all 18 generated rule-reference candidates to `reviewed`.
- Rule-reference parser expanded to 33 candidates with 15 extracted page-22 prose entries and enhanced review report previews.

## Open Questions

- Should source page references be shown in the UI permanently or only in review/admin views?
- Should full extraction outputs be committed long-term, or treated as generated artifacts later?
- When should reviewed generated candidates be promoted into canonical app data?

## Handoff Rule

At the start of a future session, read this file first, then check `decision-log.md` and the latest ADRs before implementing new work. Update this file whenever the best next step changes.
