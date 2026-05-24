# SRD Ingestion Plan

## Source

Use the official Daggerheart SRD PDF from Critical Role/Darrington Press as the primary data source.

The relevant license basis is the Darrington Press Community Gaming License. Exact obligations remain an open question and must be verified.

Current accepted source document:

- Source page: https://www.daggerheart.com/srd/
- Direct PDF URL: https://www.daggerheart.com/wp-content/uploads/2025/09/Daggerheart-SRD-9-09-25.pdf
- Local path: `data/source/Daggerheart-SRD-9-09-25.pdf`
- Source label: Daggerheart System Reference Document v1.0
- Changelog label on source page: Daggerheart SRD September-9
- Downloaded: 2026-05-24
- SHA256: `39c5981ebfc85db071e5fdcebfda3add6c5eaf3d078fb1fd0b3790c912338687`

## Guiding Rules

- Do not parse the PDF at runtime.
- Extract SRD content into structured project-owned data.
- Preserve original SRD wording for display text.
- Normalize metadata for search, filters, rules logic, and relationships.
- Treat extracted data as untrusted until reviewed.
- Fix extraction mistakes immediately when found.

## Proposed Workflow

1. Obtain and record the exact SRD PDF version.
2. Run a limited extraction spike on representative PDF sections.
3. Compare extraction quality across viable tools if needed.
4. Define an initial JSON schema informed by app needs and extraction reality.
5. Create a tiny fixture dataset using that schema.
6. Build the first offline compendium prototype against the fixture.
7. Build the full extraction pipeline once the schema and prototype are proven.
8. Extract text and tables into entity candidates using selected tooling.
9. Normalize fields such as names, categories, domains, tiers, tags, and mechanics.
10. Mark all extracted records as unreviewed.
11. Manually review records against the SRD PDF.
12. Correct extraction errors immediately.
13. Promote reviewed records to canonical data.
14. Build compendium and builder features from canonical data only.

## Extraction Spike Scope

The initial spike should be small and representative. It should test extraction quality for:

- A class-like section
- A spell/domain/card-like section
- An equipment or table-heavy section
- A general rules text section

The spike should produce notes about extraction quality, tool limitations, and likely cleanup requirements. It should not attempt to parse the entire SRD.

## Current Spike Findings

The 2026-05-24 extraction spike found Poppler suitable as the initial extraction foundation:

- `pdftotext -raw` is useful for prose-first extraction.
- `pdftohtml -xml` is useful for page-aware coordinates, table reconstruction, and column boundaries.
- `pdftotext -layout` is useful as a human-debugging artifact, but is not ideal as the only parser input.

Full notes live in `docs/brain/data/extraction-spike-2026-05-24.md`.

## Initial Schema And Fixture

The initial SRD schema lives in `src/srd/schema.ts` and uses a Zod discriminated union over these kinds:

- `rule_reference`
- `class`
- `subclass`
- `domain_card`
- `weapon`

The first fixture lives in `data/srd/fixtures/entries.json` and can be validated with:

```bash
npm run validate:srd
```

The fixture is intentionally small. It exists to prove schema shape, validation, and future compendium behavior before building a full parser.

## Validation Rules

- No unreviewed data should be treated as canonical.
- Original wording should be preserved unless a correction is needed to match the SRD.
- Normalized fields should not alter the displayed rules text.
- Any ambiguous extraction should remain flagged until resolved.

## Open Questions

- Should Poppler remain the only extraction dependency, or should future parser work compare PyMuPDF/pdfplumber as well?
- What schema should canonical data use?
- How will review state be tracked in files?
- Are page references required or merely helpful?
