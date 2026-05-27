# Parser Automation — Completed Reference

Status: Complete
Last updated: 2026-05-26

All 11 entity kind parsers have been implemented and all generated candidates have been reviewed and promoted to canonical fixtures. This document is retained as a reference for re-extraction if the SRD PDF updates.

## Canonical Fixture Counts

| File | Entries |
|------|---------|
| `data/srd/fixtures/rule-references.json` | 34 |
| `data/srd/fixtures/armor.json` | 34 |
| `data/srd/fixtures/weapons.json` | 204 |
| `data/srd/fixtures/loot.json` | 120 |
| `data/srd/fixtures/ancestries.json` | 18 |
| `data/srd/fixtures/communities.json` | 9 |
| `data/srd/fixtures/classes.json` | 9 |
| `data/srd/fixtures/subclasses.json` | 18 |
| `data/srd/fixtures/domain-cards.json` | 189 |
| `data/srd/fixtures/adversaries.json` | 129 |
| `data/srd/fixtures/environments.json` | 19 |
| **Total** | **783** |

## Extraction Scripts

One script per entity kind under `scripts/`:

- `extract-rule-references.ts` — prose rules (pdftotext -raw)
- `extract-armor.ts` — armor tables (pdftohtml -xml)
- `extract-weapons.ts` — weapon tables (pdftohtml -xml)
- `extract-loot.ts` — loot/consumable tables (pdftohtml -xml)
- `extract-ancestries-communities.ts` — ancestry/community sections (pdftotext -raw)
- `extract-classes-subclasses.ts` — class/subclass sections (pdftotext -raw)
- `extract-domain-cards.ts` — domain card sections (pdftotext -raw)
- `extract-adversaries.ts` — adversary stat blocks (pdftotext -raw)
- `extract-environments.ts` — environment stat blocks (pdftotext -raw)

## Tooling

Use Poppler as the extraction foundation:

- `pdftotext -raw` — prose-first extraction and section segmentation.
- `pdftohtml -xml` — page-aware coordinates for table reconstruction.

Do not introduce another PDF library unless Poppler cannot reliably extract a required SRD shape.

Source PDF: `data/source/Daggerheart-SRD-9-09-25.pdf`

## Validation Commands

Run after any data or schema change:

```bash
npm run validate:srd
npm run typecheck
```

Individual candidate validation: `npm run validate:srd:candidates:<kind>` (run only for files changed in the current slice).

## Review Policy

Generated candidates are marked `review.status: "extracted"` until accepted. Review may be completed through AI-assisted source verification when schema validation, parser reports, deterministic reruns, and source-PDF verification pass. Evidence must be recorded in `review.notes`. Promotion to canonical fixtures requires `reviewed` or `corrected` status.

## Output Model

Parser scripts write to `data/srd/generated/` — candidate data is never canonical until explicitly promoted. Each parser also writes a review report (e.g. `data/srd/generated/adversaries-review-report.md`) with cleanup notes, warnings, and text previews.

## Parser Implementation Notes

- Keep parser code separate from app runtime code.
- Prefer deterministic scripts that can be rerun against the same source PDF.
- Use conservative cleanup rules for clear extraction artifacts; preserve typographic punctuation when it matches the SRD PDF.
- Treat relationship inference conservatively; broken relationships should fail validation.
- Preserve official SRD terminology in IDs, kinds, UI labels, and docs.
