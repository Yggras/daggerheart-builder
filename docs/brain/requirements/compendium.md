# Compendium Requirements

## Purpose

Provide a searchable reference for official Daggerheart SRD content.

## Initial Content Areas

- Spells
- Items
- Equipment
- Classes
- Subclasses
- Domains
- Species
- Backgrounds
- Rules references
- Other SRD entities discovered during data modeling

## Functional Requirements

- Search SRD entries by name and text.
- Filter by normalized fields such as type, domain, tier, tags, category, class, or other relevant metadata.
- Display original SRD wording for rules text.
- Work offline after data is available locally.
- Support links between related rules entries where structured data allows it.

## Current Prototype

The first prototype includes:

- A compendium list screen.
- Local text search over reviewed fixture entries.
- Kind filters for rule references, classes, subclasses, domain cards, and weapons.
- Detail screens for each fixture entry.
- Runtime validation through Zod before entries are exposed to the UI.

The prototype intentionally does not include Supabase, full SRD ingestion, character builder integration, or a UI kit.

## Data Requirements

- Compendium entries must come from reviewed canonical data.
- Records should preserve original display text separately from normalized metadata.
- Extraction mistakes must be fixed as soon as they are found.

## Open Questions

- Should the compendium require login?
- Should source page references be stored for each entry?
- Which content categories should ship first?
