# Compendium Requirements

## Purpose

Provide a searchable reference for official Daggerheart SRD content.

## Content Areas

- Rules references
- Classes and subclasses
- Domain cards
- Weapons and armor
- Loot (items and consumables)
- Ancestries and communities
- Adversaries
- Environments

## Functional Requirements

- Search SRD entries by name and text.
- Filter by normalized fields such as type, domain, tier, tags, category, class, or other relevant metadata.
- Display original SRD wording for rules text.
- Work offline after data is available locally.
- Support navigation between related rules entries where structured data allows it.

## Current Implementation

The compendium is working and tested on Android. It includes:

- A kind overview screen with top-level kind cards and entry counts. Subclasses are intentionally grouped under class navigation instead of having a separate overview card.
- A kind list screen with text search and kind-specific chip filters:
  - Adversaries: tier + role
  - Environments: tier + environment type
  - Weapons: tier + category
  - Armor: tier
  - Domain cards: domain + level
  - Loot: loot type
- Entry detail screens for all 11 entity kinds with full kind-specific field rendering.
- Related-entry navigation (class ↔ subclass, environment → adversaries, rule links).
- Inline rich-text links in rules text where curated matching can safely link to entries.
- Tappable enum field values for linked game terms such as domains, weapon range, weapon burden, adversary roles, environment types, and loot types.
- Runtime Zod validation before entries are exposed to the UI.

Source page references are stored in fixture data but intentionally not shown in the compendium UI. They are available for review/admin tooling.

## Data Requirements

- Compendium entries must come from reviewed canonical data (`data/srd/fixtures/`).
- Records must preserve original display text separately from normalized metadata.
- Extraction mistakes must be fixed as soon as they are found.

## Open Questions

- Should the compendium require login?
- Should source page references ever be surfaced to users, or remain admin-only?
