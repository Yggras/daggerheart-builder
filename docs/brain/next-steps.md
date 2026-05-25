# Next Steps

Last updated: 2026-05-25

## Current Best Next Step

Review the first armor table candidate output and report before expanding table extraction beyond armor.

## Why This Is Next

Canonical fixtures are now split by entity kind, and the first non-prose parser spike targets armor because the armor table shape is simpler than weapon tables. Generated table data should stay in separate kind-specific candidate files with dedicated review reports until the table parser is calibrated.

## Immediate Tasks

1. Review `data/srd/generated/armor-review-report.md` against physical PDF page 29 / printed pages 56-57.
2. Fully review any armor rows flagged by the report for parse warnings or suspicious cleanup.
3. Spot-check clean armor rows instead of manually reviewing every field with equal depth.
4. Keep armor candidates marked `review.status: "extracted"` until reviewed.
5. Validate fixture data with `npm run validate:srd` after any data/schema change.
6. Validate rule-reference candidates with `npm run validate:srd:candidates` after rule parser or candidate changes.
7. Validate armor candidates with `npm run validate:srd:candidates:armor` after armor parser or candidate changes.
8. Typecheck with `npm run typecheck` after any code change.

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
- Canonical fixture data split by SRD kind.
- First armor table parser spike added with separate candidate data and review report.

## Open Questions

- Should full extraction outputs be committed long-term, or treated as generated artifacts later?
- Which reviewed generated candidate batches should be promoted first after split fixtures are established?

## Handoff Rule

At the start of a future session, read this file first, then check `decision-log.md` and the latest ADRs before implementing new work. Update this file whenever the best next step changes.
