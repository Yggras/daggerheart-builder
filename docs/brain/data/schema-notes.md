# Schema Notes

## Current Status

Canonical SRD data should be stored as reviewed versioned JSON and validated with Zod. The initial schema lives in `src/srd/schema.ts` and the first fixture lives in `data/srd/fixtures/entries.json`.

The representative schema/fixture spike passed automated validation and manual web review on 2026-05-25. The schema is sufficient to begin parser automation planning, while remaining provisional as full extraction reveals edge cases.

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
- `ancestry`
- `community`
- `armor`
- `loot`
- `adversary`
- `environment`

All entries share:

- `id`
- `kind`
- `name`
- `slug`
- `source`
- `review`
- `text`
- `tags`
- `relationships`

Kind-specific fields are added for class domains/features, subclass features, domain card level/type/recall cost, weapon stats, ancestry features, community adjectives/features, armor thresholds/score, loot type/roll data, adversary stat blocks, environment stat blocks, and rule categories/headings.

## Relationships

SRD entries can link to other entries through `relationships`.

Relationship fields:

- `type`
- `targetId`
- `label`

Current relationship types:

- `class`
- `subclass`
- `rule`
- `domain_card`
- `weapon`
- `ancestry`
- `community`
- `armor`
- `loot`
- `adversary`
- `environment`
- `related`

Validation requires every relationship target to exist in the same entry collection. Mechanical references are still preserved, such as `class.subclassIds` and `subclass.classId`; the UI derives related-entry navigation from both explicit relationships and these mechanical references.

## Source References

Each entry stores both PDF page range and printed SRD pages:

- `source.pdf.pageStart`
- `source.pdf.pageEnd`
- `source.printedPages`

`source.pdf.pageStart` and `source.pdf.pageEnd` are 1-based physical PDF page indexes used by extraction tools such as Poppler. They are not the same as the printed SRD page numbers visible in the document layout or some PDF viewers.

`source.printedPages` stores the printed SRD page numbers used for human review and likely user-facing references.

For example, physical PDF page 20 contains the spread with printed SRD pages 38 and 39.

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
  "relationships": [
    {
      "type": "rule",
      "targetId": "rule.core.hope",
      "label": "Hope"
    }
  ]
}
```

## Open Questions

- Should each SRD entity live in its own file or in grouped files?
- Should source page references be mandatory for all generated candidates?
- Which fields are missing once parser-generated candidates cover the full SRD?
- How should relationships between entries be represented beyond tags and IDs?
