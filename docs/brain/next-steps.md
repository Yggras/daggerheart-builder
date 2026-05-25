# Next Steps

Last updated: 2026-05-25

## Current Best Next Step

Plan the first narrow table-extraction parser spike before adding equipment, ancestry, community, or other entity candidates.

## Why This Is Next

All 33 generated `rule_reference` candidates through the page-22 prose slice have been accepted through report-driven manual review. The prose parser is now calibrated enough to pause rule-reference expansion and decide how to approach the first non-prose shape safely. The next SRD pages are equipment tables, which need a different extraction strategy than heading-delimited prose.

## Immediate Tasks

1. Inspect `pdftohtml -xml` output for the first equipment table page and compare it with existing weapon/armor/loot fixture shapes.
2. Decide whether the first table spike should target weapons, armor, or another small table shape.
3. Keep the first table spike narrow and commit only candidate output clearly marked `review.status: "extracted"`.
4. Continue using `data/srd/generated/review-report.md` or a table-specific report to guide cleanup and risk review.
5. Validate fixture data with `npm run validate:srd` after any data/schema change.
6. Validate candidate data with `npm run validate:srd:candidates` after any parser or candidate change.
7. Typecheck with `npm run typecheck` after any code change.

## Do Not Start Yet

- Supabase integration.
- Character builder.
- Campaign play view.
- UI kit/design system selection.
- Inline rich-text links.
- Bulk equipment table extraction before a narrow table spike is planned and validated.
- Entity-specific extraction beyond the chosen first table spike.
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
- Page-22 prose rule-reference slice accepted through report-driven manual review, bringing all 33 generated rule-reference candidates to `reviewed`.

## Open Questions

- Should source page references be shown in the UI permanently or only in review/admin views?
- Should full extraction outputs be committed long-term, or treated as generated artifacts later?
- When should reviewed generated candidates be promoted into canonical app data?

## Handoff Rule

At the start of a future session, read this file first, then check `decision-log.md` and the latest ADRs before implementing new work. Update this file whenever the best next step changes.
