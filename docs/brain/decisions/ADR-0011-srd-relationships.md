# ADR-0011: SRD Relationships

Status: Accepted
Date: 2026-05-24

## Context

The compendium prototype can list, search, filter, and show details for fixture entries. The next important usability gap is navigation between related rules content, such as classes linking to subclasses, subclasses linking back to classes, and entries linking to relevant rule references.

## Decision

Add a generic `relationships` field to the shared SRD entry shape.

Each relationship includes:

- `type`
- `targetId`
- `label`

Supported relationship types for now:

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

The Zod collection validator must verify that every `relationships[].targetId` exists in the same SRD entry collection.

Keep mechanical references such as `class.subclassIds` and `subclass.classId`, but derive related-entry navigation from both explicit relationships and these mechanical references.

## Consequences

- Broken compendium links fail validation.
- Classes can link directly to subclasses and subclasses can link back to their class.
- Entries can link to related rules without needing inline rich-text links yet.
- Inline links inside rules text are deferred until the relationship model and compendium UX are proven.
