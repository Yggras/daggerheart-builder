# Parser Automation Plan

Status: Draft for review
Date: 2026-05-25

## Purpose

Define the next implementation plan for turning the official SRD PDF into structured candidate JSON without parsing the PDF at runtime.

The parser should produce unreviewed candidate records that match `src/srd/schema.ts`. Reviewed canonical data remains a separate promotion step.

## Current Readiness

The schema/fixture coverage spike is complete and manually reviewed in the web app. Representative fixture coverage now exists for:

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

The current validated fixture lives at `data/srd/fixtures/entries.json`.

## Inputs

- Canonical source PDF: `data/source/Daggerheart-SRD-9-09-25.pdf`
- Current schema: `src/srd/schema.ts`
- Fixture target shape: `data/srd/fixtures/entries.json`
- Extraction spike notes: `docs/brain/data/extraction-spike-2026-05-24.md`

## Tooling Direction

Use Poppler as the initial parser foundation:

- `pdftotext -raw` for prose-first extraction and section segmentation.
- `pdftohtml -xml` for page-aware coordinates, tables, columns, and source page mapping.
- `pdftotext -layout` only as a human debugging artifact.

Do not introduce another PDF library unless Poppler cannot reliably extract a required SRD shape.

## Output Model

The parser should write generated candidate data, not canonical reviewed data.

Recommended generated path:

- `data/srd/generated/entries.candidates.json`

Candidate entries should:

- Match `SrdEntryCollectionSchema`.
- Use stable IDs following the existing fixture pattern.
- Preserve SRD wording in `text.original`.
- Set `review.status` to `extracted`.
- Set `review.reviewedAt` to `null`.
- Include source PDF and printed page references when available.
- Include parser notes in `review.notes` for uncertain extraction choices.

Small generated candidate batches should be committed during parser-slice development so output can be reviewed and compared over time. Bulk generated output can be reconsidered later once full extraction volume and review workflow are known.

Generated review reports should be written alongside candidate data when useful. The current review report path is `data/srd/generated/review-report.md`.

## Extraction Order

Implement extraction in small validated slices:

1. Rules references.
2. Ancestries and communities.
3. Armor, weapons, loot, and consumables.
4. Classes and subclasses.
5. Domain cards.
6. Adversaries.
7. Environments.

This order starts with prose and table shapes that are already represented in fixtures, then moves into larger and more complex sections.

## Recommended First Slice

Start with `rule_reference` extraction from a small SRD rules section.

Initial implementation status: `scripts/extract-rule-references.ts` generates `data/srd/generated/entries.candidates.json` for `Hope & Fear` and adjacent rule references from physical PDF pages 20-22 using `pdftotext -raw`. It also writes `data/srd/generated/review-report.md` with cleanup notes, suspicious tokens, text lengths, and previews. The first 18 generated candidates through Downtime are marked `reviewed`; 15 page-22 prose candidates covering Death, Additional Rules, Leveling Up, and Multiclassing are marked `extracted` pending review.

Reasons:

- Rules references are prose-first, so they exercise `pdftotext -raw` before table reconstruction.
- The current fixture already has multiple rule references for validation comparison.
- Rule references are useful relationship targets for later entity extraction.
- The slice can prove generated candidate validation without touching complex class, adversary, or environment structures.

## Validation Gates

Every parser slice must run:

```bash
npm run validate:srd
npm run validate:srd:candidates
npm run typecheck
```

`npm run validate:srd` validates the reviewed fixture by default. The underlying validator should also accept an arbitrary SRD JSON path so generated candidates can be checked with the same schema logic.

No generated record should be treated as canonical until manually reviewed.

## Review Workflow

1. Parser writes candidate entries with `review.status: "extracted"`.
2. Parser reports cleanup actions and suspicious tokens for risk-based review.
3. Reviewer spot-checks normal entries and fully reviews flagged or high-risk entries against the SRD PDF.
4. Reviewer fixes wording, source references, normalized fields, and relationships.
5. Reviewer changes status to `reviewed` or `corrected`.
6. Reviewed entries can be promoted into canonical app data.

## Parser Implementation Notes

- Keep parser code separate from app runtime code.
- Prefer deterministic scripts that can be rerun against the same source PDF.
- Use conservative cleanup rules for clear extraction artifacts; preserve typographic punctuation in `text.original` when it matches the SRD PDF.
- Treat relationship inference conservatively; broken relationships should fail validation.
- Preserve official SRD terminology in IDs, kinds, UI labels, and docs.
- Keep generated artifacts clearly marked so they are not confused with reviewed fixtures.

## Open Decisions

- Should canonical reviewed data remain one JSON file or be split by entity kind before full extraction?
