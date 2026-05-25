# Next Steps

Last updated: 2026-05-25

## Current Best Next Step

Continue expanding the compendium data model and fixture coverage before building parser automation or character builder features.

## Why This Is Next

The app shell, fixture validation, search, filters, detail pages, and related-entry navigation now work. Before extracting the full SRD, we need broader fixture coverage to prove the schema handles more SRD entity types.

## Immediate Tasks

1. Add fixture/schema support for armor.
2. Add fixture/schema support for consumables/loot.
3. Add fixture/schema support for adversaries.
4. Add fixture/schema support for environments.
5. Add related-entry links for the new fixture entries.
6. Validate with `npm run validate:srd`.
7. Typecheck with `npm run typecheck`.
8. Run `npx expo-doctor`.

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

## Open Questions

- Should source page references be shown in the UI permanently or only in review/admin views?
- Should full extraction outputs be committed long-term, or treated as generated artifacts later?

## Handoff Rule

At the start of a future session, read this file first, then check `decision-log.md` and the latest ADRs before implementing new work. Update this file whenever the best next step changes.
