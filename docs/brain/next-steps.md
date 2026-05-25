# Next Steps

Last updated: 2026-05-25

## Current Best Next Step

Review the dedicated `Downtime` rule-reference parser slice with `data/srd/generated/review-report.md` before expanding beyond prose rules.

## Why This Is Next

Both earlier generated `rule_reference` batches have been accepted through report-driven manual review. The parser now generates 18 candidates total: 16 reviewed entries plus 2 extracted Downtime entries. Downtime is large and list-heavy, so it should be reviewed before moving to tables, classes, domain cards, or other harder SRD shapes.

## Immediate Tasks

1. Review `rule.combat.downtime` against physical PDF page 21 / printed page 41.
2. Review `rule.combat.downtime_consequences` against physical PDF page 21 / printed page 41.
3. Focus on parser cleanup listed in `data/srd/generated/review-report.md` for the list-heavy Downtime entry.
4. Keep Downtime entries marked `review.status: "extracted"` until manually reviewed.
5. Validate fixture data with `npm run validate:srd` after any data/schema change.
6. Validate candidate data with `npm run validate:srd:candidates` after any parser or candidate change.
7. Typecheck with `npm run typecheck` after any code change.

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
- Downtime parser slice added as 2 extracted candidates with conservative cleanup and report output.

## Open Questions

- Should source page references be shown in the UI permanently or only in review/admin views?
- Should full extraction outputs be committed long-term, or treated as generated artifacts later?
- When should reviewed generated candidates be promoted into canonical app data?

## Handoff Rule

At the start of a future session, read this file first, then check `decision-log.md` and the latest ADRs before implementing new work. Update this file whenever the best next step changes.
