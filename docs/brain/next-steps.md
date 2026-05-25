# Next Steps

Last updated: 2026-05-25

## Current Best Next Step

Manually review the expanded fixture coverage in the web app, then decide whether the schema is ready for parser automation planning.

## Why This Is Next

The app shell, fixture validation, search, filters, detail pages, and related-entry navigation now work. The representative fixture coverage now spans the major SRD entry families needed to evaluate whether the schema is ready for parser automation.

## Immediate Tasks

1. Manually review the expanded fixture entries with `npm run web`.
2. Decide whether the current schema is sufficient for parser automation planning.
3. If sufficient, write the parser automation plan before implementing the full parser.
4. If insufficient, add another small fixture/schema slice for the missing SRD shape.
5. Validate with `npm run validate:srd` after any data/schema change.
6. Typecheck with `npm run typecheck` after any code change.
7. Run `npx expo-doctor` after dependency or Expo config changes.

## Do Not Start Yet

- Full PDF parser automation.
- Supabase integration.
- Character builder.
- Campaign play view.
- UI kit/design system selection.
- Inline rich-text links.

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

## Open Questions

- Should source page references be shown in the UI permanently or only in review/admin views?
- Should full extraction outputs be committed long-term, or treated as generated artifacts later?

## Handoff Rule

At the start of a future session, read this file first, then check `decision-log.md` and the latest ADRs before implementing new work. Update this file whenever the best next step changes.
