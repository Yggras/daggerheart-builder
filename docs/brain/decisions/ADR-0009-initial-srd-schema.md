# ADR-0009: Initial SRD Schema

Status: Accepted
Date: 2026-05-24

## Context

The extraction spike showed that the SRD PDF can be extracted into readable text, but it contains spacing, heading, and table artifacts. Before building a full parser, the project needs a small canonical data shape that can support compendium search, detail views, validation, and later parser output.

## Decision

Use a TypeScript/Zod discriminated union for SRD entries with a shared base shape and kind-specific fields.

Initial entry kinds:

- `rule_reference`
- `class`
- `subclass`
- `domain_card`
- `weapon`

All entries share:

- `id`
- `kind`
- `name`
- `slug`
- `source`
- `review`
- `text`
- `tags`

The source shape stores both PDF page range and printed SRD pages. This is required because extraction tools operate on PDF pages while human review usually references the printed SRD page numbers.

The first fixture lives at `data/srd/fixtures/entries.json` and is validated by `npm run validate:srd`.

## Consequences

- The compendium can search across all entity kinds through shared fields.
- Entity-specific UI can branch on `kind` safely.
- Parser output has a concrete target schema.
- Extracted data must include review metadata before it can become canonical.
- The schema is intentionally provisional and should evolve when the fixture and compendium prototype reveal missing fields.
