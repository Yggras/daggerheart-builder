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
2. Extract text and tables using selected tooling.
3. Segment extracted content into entity candidates.
4. Normalize fields such as names, categories, domains, tiers, tags, and mechanics.
5. Mark all extracted records as unreviewed.
6. Manually review records against the SRD PDF.
7. Correct extraction errors immediately.
8. Promote reviewed records to canonical data.
9. Build compendium and builder features from canonical data only.

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
