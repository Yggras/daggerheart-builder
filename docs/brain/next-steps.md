# Next Steps

Last updated: 2026-05-25

## Current Best Next Step

Implement a dedicated `Downtime` rule-reference parser slice, then review it with the generated report before expanding beyond prose rules.

## Why This Is Next

Both generated `rule_reference` batches have been accepted through report-driven manual review. The parser now generates 16 reviewed candidates total. `Downtime` is the next useful prose-heavy stress test before moving to tables, classes, domain cards, or other harder SRD shapes.

## Immediate Tasks

1. Add a `rule.combat.downtime` candidate extracted from physical PDF page 21 / printed page 41.
2. Keep `Downtime` as its own slice because it is large and list-heavy.
3. Generate `data/srd/generated/entries.candidates.json` and `data/srd/generated/review-report.md` with `npm run extract:srd:rules`.
4. Validate fixture data with `npm run validate:srd` after any data/schema change.
5. Validate candidate data with `npm run validate:srd:candidates` after any parser or candidate change.
6. Typecheck with `npm run typecheck` after any code change.
7. Review the generated report before marking `Downtime` as reviewed.

## Do Not Start Yet

- Supabase integration.
- Character builder.
- Campaign play view.
- UI kit/design system selection.
- Inline rich-text links.
- Full SRD extraction beyond the first validated parser slice.

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

## Open Questions

- Should source page references be shown in the UI permanently or only in review/admin views?
- Should full extraction outputs be committed long-term, or treated as generated artifacts later?
- When should reviewed generated candidates be promoted into canonical app data?

## Handoff Rule

At the start of a future session, read this file first, then check `decision-log.md` and the latest ADRs before implementing new work. Update this file whenever the best next step changes.
