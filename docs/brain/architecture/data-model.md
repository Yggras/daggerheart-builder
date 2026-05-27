# Data Model Notes

## Principles

- Canonical SRD data must be structured, reviewed, and validated before app use.
- Original SRD wording is preserved for display.
- Normalized metadata supports search, filters, rules logic, and relationships.
- User-owned data will reference canonical SRD entity IDs where possible.
- Derived character values should be reproducible from stored choices where feasible.

## SRD Entity Kinds

The current schema (`src/srd/schema.ts`) defines 11 entity kinds as a Zod discriminated union:

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

All entries share base fields: `id`, `kind`, `name`, `slug`, `source`, `review`, `text`, `tags`, `relationships`.

## Review State

Extracted data progresses through these review states:

- `extracted` — raw or automatically parsed, not trusted
- `reviewed` — manually or AI-verified against the SRD
- `corrected` — reviewed and fixed after an extraction error

Canonical app data must be `reviewed` or `corrected` before use.

## ID Format

Entry IDs follow the `kind.slug` pattern, e.g. `adversary.stone-golem`, `domain_card.arcana.strike-the-earth`.

## Open Modeling Questions

These are deferred to the character builder phase:

- **Mechanical effects**: simple static modifiers (Evasion, trait, Spellcast Roll bonuses) should eventually be modeled as optional normalized `effects` on relevant entries. Complex, triggered, or conditional effects remain text-only until the character builder has concrete requirements.
- **Prerequisites and selection constraints**: how class, subclass, domain card, and ancestry selection constraints are modeled for the character builder wizard is not yet decided.
