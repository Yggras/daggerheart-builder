# Data Model Notes

## Principles

- Canonical SRD data should be structured and reviewed.
- Original SRD wording should be preserved for display.
- Normalized metadata should support search, filters, rules logic, and relationships.
- User-owned data should reference canonical SRD entity IDs where possible.
- Derived character values should be reproducible from stored choices where feasible.

## Entity Categories

Initial expected SRD entity categories include:

- Classes
- Subclasses
- Domains
- Spells
- Loot
- Equipment, including weapons and armor
- Ancestries
- Communities
- Adversaries
- Environments
- Rules references

This list is provisional and should be updated after SRD analysis.

## Review State

Extracted data should include review state, such as:

- `extracted`: raw or automatically parsed, not trusted
- `reviewed`: manually checked against the SRD
- `corrected`: reviewed and fixed after an extraction error

Canonical app data must be reviewed before use in production features.

## Open Modeling Questions

- What stable ID format should canonical entities use?
- Should source page references be required?
- How should reusable mechanics be represented?
- How should prerequisites and selection constraints be modeled?
- How should rule text links be represented?
