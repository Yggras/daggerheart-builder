# SRD Ingestion Plan

Status: Complete — all 783 canonical entries ingested, reviewed, and promoted.

## Source Document

Use the official Daggerheart SRD PDF from Critical Role/Darrington Press as the primary data source. The Darrington Press Community Gaming License governs usage; exact obligations remain an open question and must be verified before any distribution.

Current accepted source:

- Source page: https://www.daggerheart.com/srd/
- Direct PDF URL: https://www.daggerheart.com/wp-content/uploads/2025/09/Daggerheart-SRD-9-09-25.pdf
- Local path: `data/source/Daggerheart-SRD-9-09-25.pdf`
- Source label: Daggerheart System Reference Document v1.0
- Changelog label: Daggerheart SRD September-9
- Downloaded: 2026-05-24
- SHA256: `39c5981ebfc85db071e5fdcebfda3add6c5eaf3d078fb1fd0b3790c912338687`

## Guiding Rules

These rules apply to any future re-extraction (e.g. if the SRD PDF updates):

- Do not parse the PDF at runtime.
- Extract SRD content into structured project-owned data.
- Preserve original SRD wording for display text.
- Normalize metadata for search, filters, rules logic, and relationships.
- Treat extracted data as untrusted until reviewed.
- Fix extraction mistakes immediately when found.

## Completed Workflow

1. ✅ Obtained and recorded the SRD PDF version (Sep 9, 2025).
2. ✅ Ran a limited extraction spike on representative PDF sections using Poppler.
3. ✅ Defined the JSON schema (`src/srd/schema.ts`) using a Zod discriminated union over 11 entity kinds.
4. ✅ Created a small fixture dataset to prove schema shape and validation.
5. ✅ Built the first offline compendium against the fixture.
6. ✅ Drafted and reviewed the parser automation plan.
7. ✅ Built parser automation in validated slices (one script per entity kind).
8. ✅ Extracted all 11 entity kinds from the SRD PDF.
9. ✅ Reviewed all generated candidates through risk-based and AI-assisted source verification.
10. ✅ Promoted all reviewed candidates to canonical split fixtures under `data/srd/fixtures/`.

See `docs/brain/data/parser-automation-plan.md` for extraction script details and fixture counts.

## Validation

```bash
npm run validate:srd    # validate all canonical fixtures
npm run typecheck       # TypeScript check
```

## Spike Findings

Poppler was confirmed as a suitable extraction foundation. Full notes in `docs/brain/data/extraction-spike-2026-05-24.md`.

## Open Questions

- Should bulk generated extraction outputs remain committed long-term, or become regenerated artifacts when the SRD changes?
- If the SRD PDF updates, which entity kinds are most likely to have changed content and need re-extraction?
