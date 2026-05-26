# Next Steps

Last updated: 2026-05-26

## Current Best Next Step

Resolve `Mixed Ancestry` handling, then plan the class/subclass parser slice.

## Why This Is Next

The ancestry/community parser batch was accepted with no flaws detected, and the reviewed 18 ancestry candidates and 9 community candidates have been promoted into canonical split fixtures. `Mixed Ancestry` was intentionally skipped because the current ancestry schema models feature-bearing ancestry cards, so that open modeling question should be resolved before moving into larger class/subclass extraction.

## Immediate Tasks

1. Decide whether `Mixed Ancestry` should remain out of structured data, become a `rule_reference` candidate, or require a special ancestry/rule schema change.
2. Inspect the SRD class and subclass sections and compare their structure against the current canonical class/subclass fixtures.
3. Plan a narrow class/subclass parser slice before attempting all classes and subclasses.
4. Keep newly generated class/subclass candidates marked `review.status: "extracted"` until reviewed.
5. Validate fixture data with `npm run validate:srd` after any data/schema change.
6. Validate ancestry candidates with `npm run validate:srd:candidates:ancestries` after ancestry parser or candidate changes.
7. Validate community candidates with `npm run validate:srd:candidates:communities` after community parser or candidate changes.
8. Validate loot candidates with `npm run validate:srd:candidates:loot` after loot parser or candidate changes.
9. Validate rule-reference candidates with `npm run validate:srd:candidates` after rule parser or candidate changes.
10. Validate armor candidates with `npm run validate:srd:candidates:armor` after armor parser or candidate changes.
11. Validate weapon candidates with `npm run validate:srd:candidates:weapons` after weapon parser or candidate changes.
12. Typecheck with `npm run typecheck` after any code change.

## Do Not Start Yet

- Supabase integration.
- Character builder.
- Campaign play view.
- UI kit/design system selection.
- Inline rich-text links.
- Full class/subclass extraction before a narrow class/subclass parser slice is reviewed.
- Domain cards, adversaries, or environments before the next class/subclass direction is decided.
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
- First ancestry/community parser slice added for physical PDF pages 14-18, generating 18 ancestry candidates and 9 community candidates with separate review reports.
- Ancestry/community parser batch accepted through report-driven manual review and promoted into canonical split fixtures.

## Open Questions

- Should full extraction outputs be committed long-term, or treated as generated artifacts later?
- Should `Mixed Ancestry` become a `rule_reference` candidate, a special ancestry shape, or stay out of structured candidate data?

## Handoff Rule

At the start of a future session, read this file first, then check `decision-log.md` and the latest ADRs before implementing new work. Update this file whenever the best next step changes.
