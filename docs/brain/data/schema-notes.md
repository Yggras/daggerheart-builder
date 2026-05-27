# Schema Notes

## Current Status

The SRD schema is final and production-tested. All 11 entity kinds have been extracted, reviewed, and loaded in the app. The schema lives in `src/srd/schema.ts` and uses a Zod discriminated union. Canonical fixtures live in kind-specific JSON files under `data/srd/fixtures/` and are validated at app startup.

Validate fixtures with:

```bash
npm run validate:srd
```

## Requirements

The schema supports:

- Stable IDs
- Original SRD display text
- Normalized names and slugs
- Categories and subcategories
- Tags
- Relationships between entries
- Review state (`extracted`, `reviewed`, `corrected`)
- Source information, including PDF page references

## Entity Kinds

The schema is a discriminated union over `kind`.

All 11 current kinds:

- `rule_reference`
- `class`
- `subclass`
- `domain_card`
- `weapon`
- `ancestry`
- `community`
- `armor`
- `loot`
- `adversary`
- `environment`

All entries share:

- `id`, `kind`, `name`, `slug`
- `source` (document, version, PDF page range, printed pages)
- `review` (status, reviewedAt, notes)
- `text` (original, summary)
- `tags`
- `relationships`

## Kind-Specific Notes

**Environment** — `difficulty` may be a positive integer or `"special"` when the SRD lists `Difficulty: Special`. Special difficulty details are preserved in `text.original` and feature text.

**Domain cards** — extracted as one entry per card with `domain`, `level`, `cardType`, `recallCost`, and at least one `abilities` item. Codex grimoire cards currently preserve full card text as one ability item; splitting into sub-spell abilities is deferred until the app needs it.

**Weapons** — traits include the six base traits plus `spellcast` for Arcane-Frame Wheelchair rows. Damage type may be `physical`, `magic`, or `physical_or_magic` (Ghostblade).

**Adversaries** — attack damage type also supports `physical_or_magic` (SRD `phy/mag`). Attack modifiers may be a numeric integer or a dice expression string (e.g. `+2d4`).

## Relationships

SRD entries link to other entries through the `relationships` field.

Relationship fields: `type`, `targetId`, `label`.

Current relationship types: `class`, `subclass`, `rule`, `domain_card`, `weapon`, `ancestry`, `community`, `armor`, `loot`, `adversary`, `environment`, `related`.

Validation requires every relationship target to exist in the combined entry collection. Mechanical references (`class.subclassIds`, `subclass.classId`, `environment.potentialAdversaryIds`) are preserved in parallel; the UI derives related-entry navigation from both.

## Source References

Each entry stores both PDF and printed page references:

- `source.pdf.pageStart` / `source.pdf.pageEnd` — 1-based physical PDF page indexes used by extraction tools.
- `source.printedPages` — printed SRD page numbers used for human review.

Source references are stored in fixtures but not shown in the compendium UI. They are available for review and admin tooling.

## Future: Mechanical Effects

The character builder will eventually need some feature text as processable data. Keep preserved SRD text as the source-of-truth field; later add optional normalized mechanical effects for simple static modifiers (Evasion, trait, Spellcast Roll bonuses). Do not model a full rules engine yet.

## Open Questions

- Should bulk generated extraction outputs remain committed long-term, or become regenerated artifacts when the SRD changes?
- Should Codex grimoire cards be split into separate ability records per sub-spell, or is full-card text sufficient until sub-spell rendering is needed?
