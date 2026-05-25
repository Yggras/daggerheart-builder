# Next Steps

Last updated: 2026-05-25

## Current Best Next Step

Review and refine `docs/brain/data/parser-automation-plan.md`, then implement a small `rule_reference` parser slice.

## Why This Is Next

The app shell, fixture validation, search, filters, detail pages, and related-entry navigation now work. The representative schema/fixture spike has passed automated checks and manual web review, so the project is ready to plan parser automation before implementing the full parser.

## Immediate Tasks

1. Review `docs/brain/data/parser-automation-plan.md`.
2. Decide whether generated candidate data should be committed, ignored, or committed only in reviewed batches.
3. Decide whether to validate generated candidate files with a new script or extend `npm run validate:srd`.
4. Implement the first parser automation slice for `rule_reference` entries against a small SRD section.
5. Validate parser output with Zod before using it in the app.
6. Keep generated entries marked `review.status: "extracted"` until manually reviewed.
7. Validate with `npm run validate:srd` after any data/schema change.
8. Typecheck with `npm run typecheck` after any code change.

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

## Open Questions

- Should source page references be shown in the UI permanently or only in review/admin views?
- Should full extraction outputs be committed long-term, or treated as generated artifacts later?
- Should generated candidate validation use a separate script or extend `npm run validate:srd`?

## Handoff Rule

At the start of a future session, read this file first, then check `decision-log.md` and the latest ADRs before implementing new work. Update this file whenever the best next step changes.
