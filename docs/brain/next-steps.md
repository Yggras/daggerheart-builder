# Next Steps

Last updated: 2026-05-25

## Current Best Next Step

Use `data/srd/generated/review-report.md` to spot-check the generated rule-reference candidates against the source PDF before promoting or expanding parser output.

## Why This Is Next

The parser now generates 8 `rule_reference` candidates across the `Hope & Fear` and adjacent combat rules sections, applies conservative cleanup for known extraction artifacts, and writes a review report. Candidate validation is proven, but generated entries remain untrusted until review.

## Immediate Tasks

1. Review `data/srd/generated/review-report.md`.
2. Spot-check entries with parser cleanup: `rule.core.hope`, `rule.combat.hit_points_damage_thresholds`, and `rule.combat.conditions`.
3. Spot-check at least one candidate without cleanup to verify parser boundaries remain sound.
4. Keep generated entries marked `review.status: "extracted"` until manually reviewed or promoted.
5. Validate fixture data with `npm run validate:srd` after any data/schema change.
6. Validate candidate data with `npm run validate:srd:candidates` after any parser or candidate change.
7. Typecheck with `npm run typecheck` after any code change.
8. Do not expand beyond another small `rule_reference` slice until this report-driven review pass is accepted.

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

## Open Questions

- Should source page references be shown in the UI permanently or only in review/admin views?
- Should full extraction outputs be committed long-term, or treated as generated artifacts later?

## Handoff Rule

At the start of a future session, read this file first, then check `decision-log.md` and the latest ADRs before implementing new work. Update this file whenever the best next step changes.
