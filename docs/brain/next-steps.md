# Next Steps

Last updated: 2026-05-26

## Current Best Next Step

Plan the next parser slice for ancestries and communities.

## Why This Is Next

The full loot/consumable parser batch was accepted with no flaws detected, and the reviewed 120-entry batch has been promoted into canonical split fixtures. With rule references, armor, weapons, and loot now promoted, the next safest parser target is ancestries and communities because representative fixtures already exist and the slice should be narrower than classes, domain cards, adversaries, or environments.

## Immediate Tasks

1. Inspect the SRD ancestry and community sections and compare their structure against the current canonical fixtures.
2. Decide whether ancestry/community extraction should start with prose-first `pdftotext -raw`, table-aware `pdftohtml -xml`, or a mixed approach.
3. Add a separate ancestry/community parser slice that writes kind-specific candidate data and a review report.
4. Keep newly generated ancestry/community candidates marked `review.status: "extracted"` until reviewed.
5. Validate fixture data with `npm run validate:srd` after any data/schema change.
6. Validate loot candidates with `npm run validate:srd:candidates:loot` after loot parser or candidate changes.
7. Validate rule-reference candidates with `npm run validate:srd:candidates` after rule parser or candidate changes.
8. Validate armor candidates with `npm run validate:srd:candidates:armor` after armor parser or candidate changes.
9. Validate weapon candidates with `npm run validate:srd:candidates:weapons` after weapon parser or candidate changes.
10. Typecheck with `npm run typecheck` after any code change.

## Do Not Start Yet

- Supabase integration.
- Character builder.
- Campaign play view.
- UI kit/design system selection.
- Inline rich-text links.
- Other entity-specific extraction beyond ancestries/communities before the ancestry/community parser shape is reviewed.
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
- Reviewed rule-reference candidates promoted into canonical split fixtures.
- Armor table parser batch accepted through risk-based review and promoted into canonical split fixtures.
- First weapon table parser spike added for 25 Tier 1 primary weapons with separate candidate data and review report.
- Tier 1 primary weapon parser batch accepted through risk-based review and promoted into canonical split fixtures.
- Weapon parser expanded to full weapon-table extraction with 204 candidates total: 25 reviewed and 179 extracted.
- Full weapon parser batch accepted through risk-based review and promoted into canonical split fixtures.
- First loot/consumable parser slice added for physical PDF pages 30-32 with separate candidate data and review report.
- Loot/consumable parser generated 120 extracted candidates: 60 reusable items and 60 consumables.
- Loot/consumable parser batch accepted through risk-based review and promoted into canonical split fixtures.

## Open Questions

- Should full extraction outputs be committed long-term, or treated as generated artifacts later?

## Handoff Rule

At the start of a future session, read this file first, then check `decision-log.md` and the latest ADRs before implementing new work. Update this file whenever the best next step changes.
