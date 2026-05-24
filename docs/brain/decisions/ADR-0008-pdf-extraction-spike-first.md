# ADR-0008: PDF Extraction Spike First

Status: Accepted
Date: 2026-05-24

## Context

The official Daggerheart SRD source is a PDF, which makes extraction quality a major project risk. Starting with only handcrafted data could hide extraction problems too long. Starting with a full parser could waste effort before the app's target schema and compendium needs are understood.

## Decision

Perform a limited PDF extraction spike before building the first compendium prototype, but do not build the full parser yet.

Use this order:

1. Obtain and record the exact SRD PDF version.
2. Run a small extraction spike on representative PDF sections.
3. Inspect extraction quality and compare viable extraction tools.
4. Define an initial JSON schema informed by both app needs and PDF reality.
5. Create a tiny fixture dataset using that schema.
6. Build the first offline compendium prototype against the fixture.
7. Build the full ingestion pipeline only after the schema and prototype are proven.

Representative extraction sections should include:

- A class-like section
- A spell/domain/card-like section
- An equipment or table-heavy section
- A general rules text section

## Consequences

- PDF risk is tested early.
- The schema is not designed in isolation from extraction reality.
- The parser is still guided by app data needs instead of raw PDF quirks.
- The full parser is delayed until there is a concrete target JSON shape.
- The first compendium prototype can validate schema, search, detail views, and offline loading before full SRD ingestion.
