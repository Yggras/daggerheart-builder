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

The current validated fixtures live as kind-specific JSON files under `data/srd/fixtures/`.

## Inputs

- Canonical source PDF: `data/source/Daggerheart-SRD-9-09-25.pdf`
- Current schema: `src/srd/schema.ts`
- Fixture target shape: split canonical JSON files under `data/srd/fixtures/`
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

Generated review reports should be written alongside candidate data when useful. The current prose rule-reference review report path is `data/srd/generated/review-report.md`; table/entity parser slices may use kind-specific candidate files and reports.

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

Initial implementation status: `scripts/extract-rule-references.ts` generates `data/srd/generated/entries.candidates.json` for `Hope & Fear` and adjacent rule references from physical PDF pages 20-22 using `pdftotext -raw`. It also writes `data/srd/generated/review-report.md` with cleanup notes, suspicious tokens, text lengths, and previews. All 33 generated rule-reference candidates through Death, Additional Rules, Leveling Up, and Multiclassing are marked `reviewed` after report-driven manual review and promoted to canonical split fixtures.

Initial table implementation status: `scripts/extract-armor.ts` generates `data/srd/generated/armor.candidates.json` and `data/srd/generated/armor-review-report.md` from physical PDF page 29 using `pdftohtml -xml`. All 34 armor candidates are marked `reviewed` after risk-based review and promoted to canonical split fixtures.

Initial weapon implementation status: `scripts/extract-weapons.ts` generates `data/srd/generated/weapons.candidates.json` and `data/srd/generated/weapons-review-report.md` from physical PDF page 23 using `pdftohtml -xml`. The first weapon slice covers 25 Tier 1 primary weapons and is marked `reviewed` after risk-based review and promoted to canonical split fixtures.

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
npm run validate:srd:candidates:armor
npm run validate:srd:candidates:weapons
npm run typecheck
```

`npm run validate:srd` validates the reviewed split fixture collection by default. The underlying validator also accepts an arbitrary SRD JSON path so generated candidates can be checked with the same schema logic. Run only the candidate validation commands relevant to files changed in the current slice.

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

- Should bulk generated candidate outputs remain committed long-term, or become regenerated artifacts once extraction volume grows?
