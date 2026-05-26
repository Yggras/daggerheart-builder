# Next Steps

Last updated: 2026-05-26

## Current Best Next Step

All structured SRD entity families are extracted, reviewed, and promoted to canonical fixtures. The SRD data foundation is complete. The next focus should be app improvements or new feature planning — likely starting with:

1. Enhance the compendium UI (filters, search, detail rendering for environments/adversaries).
2. Decide whether to add Supabase integration or keep offline-only.
3. Begin character builder planning.

## Why This Is Next

The full SRD data pipeline is done: 783 canonical entries across all entity kinds. No remaining extraction work until the SRD changes or new entity kinds are identified.

## Immediate Tasks

None — the SRD extraction pipeline is complete. Choose a product direction.

1. Validate fixture data with `npm run validate:srd` after any data/schema change.
2. Typecheck with `npm run typecheck` after any code change.

## Do Not Start Yet

- Supabase integration.
- Character builder.
- Campaign play view.
- UI kit/design system selection.
- Inline rich-text links.
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
- `Mixed Ancestry` modeled as a reviewed `rule_reference` through the existing rule-reference parser and promoted into canonical fixtures.
- Full class/subclass parser family added, AI-verified, and promoted into canonical split fixtures.
- Full domain-card parser family added, AI-verified, and promoted into canonical split fixtures.
- Full adversary parser family added (129 adversaries, tiers 1–4, all roles), AI-verified, and promoted into canonical split fixtures. Schema extended for `physical_or_magic` damage and dice-expression attack modifiers.
- Full environment parser family added (19 environments, tiers 1–4, all types), AI-verified, and promoted into canonical split fixtures. Adversary name normalization handles abbreviated/pluralized group member names. Total canonical fixture count: 783 entries across 11 kinds.
- `validate-srd.ts` enhanced: when validating a specific candidates file, it now merges with fixture context so cross-kind ID references resolve correctly.

## Open Questions

- Should full extraction outputs be committed long-term, or treated as generated artifacts later?
- Should Codex grimoire cards be normalized into multiple `abilities`, or is preserving the full card text as one ability sufficient until the app needs sub-spell rendering?

## Review Policy

Generated parser batches may now be accepted through AI-assisted source verification instead of user manual review. Candidates can be marked `reviewed` when schema validation, parser reports, deterministic reruns, and source-PDF verification pass, with evidence recorded in report output or review notes.

## Handoff Rule

At the start of a future session, read this file first, then check `decision-log.md` and the latest ADRs before implementing new work. Update this file whenever the best next step changes.
