# Schema Notes

## Current Status

Canonical SRD data should be stored as reviewed versioned JSON and validated with Zod. The initial schema lives in `src/srd/schema.ts` and the first fixture lives in `data/srd/fixtures/entries.json`.

Validate fixtures with:

```bash
npm run validate:srd
```

## Initial Requirements

The schema should support:

- Stable IDs
- Original SRD display text
- Normalized names and slugs
- Categories and subcategories
- Tags
- Relationships between entries
- Review state
- Source information, including page references where available

## Extraction Spike Implications

The 2026-05-24 extraction spike suggests the first schema should account for:

- `source.page` because Poppler extraction is page-aware and manual review benefits from page references.
- `review.status` because spacing, headings, and table rows require correction.
- Separate entity shapes for prose rules, classes, subclasses, equipment, and domain cards.
- Preserved original text plus normalized fields.
- Table-derived records with fields for wrapped names and wrapped feature text.

## Initial Entity Kinds

The first schema is a discriminated union over `kind`.

Current kinds:

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

Kind-specific fields are added for class domains/features, subclass features, domain card level/type/recall cost, weapon stats, and rule categories/headings.

## Source References

Each entry stores both PDF page range and printed SRD pages:

- `source.pdf.pageStart`
- `source.pdf.pageEnd`
- `source.printedPages`

PDF pages are useful for extraction tooling. Printed pages are useful for manual review and user-facing references.

## Candidate Record Shape

```json
{
  "id": "spell.example-name",
  "type": "spell",
  "name": "Example Name",
  "slug": "example-name",
  "source": {
    "document": "Daggerheart SRD",
    "version": "1.0-2025-09-09",
    "pdf": {
      "path": "data/source/Daggerheart-SRD-9-09-25.pdf",
      "pageStart": 1,
      "pageEnd": 1
    },
    "printedPages": [1],
    "url": "https://www.daggerheart.com/wp-content/uploads/2025/09/Daggerheart-SRD-9-09-25.pdf"
  },
  "review": {
    "status": "extracted",
    "reviewedAt": null,
    "notes": []
  },
  "text": {
    "original": "Original SRD wording goes here."
  },
  "metadata": {
    "tags": []
  },
  "relationships": []
}
```

## Open Questions

- Should each SRD entity live in its own file or in grouped files?
- Should source page references be mandatory?
- Which fields are missing once the first compendium UI is built?
- How should relationships between entries be represented beyond tags and IDs?
