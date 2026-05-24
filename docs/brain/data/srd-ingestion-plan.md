# SRD Ingestion Plan

## Source

Use the official Daggerheart SRD PDF from Critical Role/Darrington Press as the primary data source.

The relevant license basis is the Darrington Press Community Gaming License. Exact obligations remain an open question and must be verified.

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

## Validation Rules

- No unreviewed data should be treated as canonical.
- Original wording should be preserved unless a correction is needed to match the SRD.
- Normalized fields should not alter the displayed rules text.
- Any ambiguous extraction should remain flagged until resolved.

## Open Questions

- Which PDF extraction tool should be used?
- What schema should canonical data use?
- How will review state be tracked in files?
- Are page references required or merely helpful?
- Where will the SRD PDF itself live, if anywhere?
