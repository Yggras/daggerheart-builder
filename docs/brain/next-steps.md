# Next Steps

Last updated: 2026-05-25

## Current Best Next Step

Manually review `data/srd/generated/entries.candidates.json` against the source PDF, especially spacing artifacts in the generated `rule.core.hope` text, before promoting or expanding parser output.

## Why This Is Next

The first parser automation slice now generates a small `rule_reference` candidate batch for the `Hope & Fear` section. The parser path and candidate validation are proven, but generated entries remain untrusted until manual review against the SRD PDF.

## Immediate Tasks

1. Compare `data/srd/generated/entries.candidates.json` against `data/source/Daggerheart-SRD-9-09-25.pdf`.
2. Decide whether parser cleanup should fix known spacing artifacts such as `anAlly`, `aTagTeam`, and `ifyou`, or leave them for manual review notes.
3. Keep generated entries marked `review.status: "extracted"` until manually reviewed.
4. Validate fixture data with `npm run validate:srd` after any data/schema change.
5. Validate candidate data with `npm run validate:srd:candidates` after any parser or candidate change.
6. Typecheck with `npm run typecheck` after any code change.
7. Do not expand beyond a small next `rule_reference` slice until this candidate batch has been reviewed.

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

## Open Questions

- Should source page references be shown in the UI permanently or only in review/admin views?
- Should full extraction outputs be committed long-term, or treated as generated artifacts later?

## Handoff Rule

At the start of a future session, read this file first, then check `decision-log.md` and the latest ADRs before implementing new work. Update this file whenever the best next step changes.
