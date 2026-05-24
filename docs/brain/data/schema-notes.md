# Schema Notes

## Current Status

Canonical SRD data should be stored as reviewed versioned JSON and validated with Zod. The exact schema is not final yet.

## Initial Requirements

The schema should support:

- Stable IDs
- Original SRD display text
- Normalized names and slugs
- Categories and subcategories
- Tags
- Relationships between entries
- Review state
- Source information where available

## Candidate Record Shape

```json
{
  "id": "spell.example-name",
  "type": "spell",
  "name": "Example Name",
  "slug": "example-name",
  "source": {
    "document": "Daggerheart SRD",
    "page": null
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
- How strict should schema validation be during early extraction?
- Should source page references be mandatory?
