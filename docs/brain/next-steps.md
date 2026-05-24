# Next Steps

Last updated: 2026-05-24

## Current Best Next Step

Expand the compendium data model and fixture coverage before building parser automation or character builder features.

## Why This Is Next

The app shell, fixture validation, search, filters, detail pages, and related-entry navigation now work. Before extracting the full SRD, we need broader fixture coverage to prove the schema handles more SRD entity types.

## Immediate Tasks

1. Add fixture/schema support for ancestry/species.
2. Add fixture/schema support for community/background.
3. Add fixture/schema support for armor.
4. Add fixture/schema support for consumables/loot.
5. Add fixture/schema support for adversaries.
6. Add fixture/schema support for environments.
7. Add related-entry links for the new fixture entries.
8. Validate with `npm run validate:srd`.
9. Typecheck with `npm run typecheck`.
10. Run `npx expo-doctor`.

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

## Open Questions

- Should `species` be named `ancestry` in the app to match SRD wording?
- Should `background` be modeled separately from `community`, or is `community` the correct SRD entity?
- Should source page references be shown in the UI permanently or only in review/admin views?
- Should full extraction outputs be committed long-term, or treated as generated artifacts later?

## Handoff Rule

At the start of a future session, read this file first, then check `decision-log.md` and the latest ADRs before implementing new work. Update this file whenever the best next step changes.
