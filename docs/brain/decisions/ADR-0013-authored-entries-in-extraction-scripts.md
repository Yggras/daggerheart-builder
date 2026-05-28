# ADR-0013: Authored Entries In Extraction Scripts

Status: Accepted
Date: 2026-05-28

## Context

The SRD extraction scripts under `scripts/` extract canonical content from the source PDF by locating headings and capturing the text between them (the "section-boundary" model). Their output goes to `data/srd/generated/*.candidates.json`; reviewed candidates are then promoted by hand into the canonical `data/srd/fixtures/*.json` files the app loads. Re-running a script never touches fixtures directly.

While adding rule references for game terms (Character Traits, Weapon Burden, Weapon Categories) we hit content the section-boundary model cannot produce:

- **Synthesized entries** drawn from several scattered PDF locations (e.g., Weapon Burden combines the weapon-table Burden column, the character-creation weapon-selection step, and the Combat Wheelchair burden section). There is no single heading span to capture.
- **Reformatted entries** where the desired canonical text differs from the raw PDF flow (e.g., a bulleted list authored with `•` markers for readable rendering).

These were first added only to the fixtures. That created a latent hazard: the generating script did not know about them, so a future rebuild of fixtures from a fresh extraction (e.g., when the SRD PDF updates) would silently drop them. This is a recurring need — future work (domains, adversary roles, environment types, loot types, armor score, and other linked field values) will require the same kind of hand-authored or synthesized entries.

## Decision

Each extraction script is the single source of truth for **all** entries of its kind, carrying two clearly separated sets:

1. **PDF-extracted entries** — produced by the existing section-boundary machinery (e.g., the `ruleSpecs` array + `pdftotext`). Unchanged.
2. **Authored entries** — an `authoredRules`-style array of fully-specified `SrdEntry` objects that bypass PDF section extraction entirely. Used for synthesized or reformatted content that cannot be cleanly section-captured.

Both sets are concatenated, validated together with `SrdEntryCollectionSchema.parse(...)` (which enforces unique IDs/slugs), and written to the same `*.candidates.json` output. The script's review report lists authored entries in a dedicated section, and each authored entry's `review.notes` records the exact source pages and any synthesis so the wording stays verifiable against the PDF.

The reference implementation is `scripts/extract-rule-references.ts` (`authoredRules` array). Apply the same pattern to any other extraction script (`extract-weapons.ts`, `extract-classes-subclasses.ts`, etc.) when it needs authored content.

### How to add an authored entry (recipe)

1. Author the entry in the relevant extraction script's authored-entries array as a complete `SrdEntry` (id, slug, `source` with `pageStart`/`pageEnd`/`printedPages`, `review.status: "reviewed"` + dated `reviewedAt` + `notes` citing source pages, `text.original` and `summary`, `tags`, `category`/kind-specific fields).
2. Run the script (`npm run extract:srd:<kind>`) to regenerate the candidates file.
3. Promote into the matching `data/srd/fixtures/*.json` and confirm the generated and fixture copies match byte-for-byte.
4. Validate: `npm run validate:srd:candidates*` and `npm run validate:srd`.

Authored entries must **never** live only in fixtures.

## Consequences

- `npm run extract:srd:<kind>` always reproduces the complete canonical set for that kind, so fixtures stay regeneration-safe across SRD updates.
- PDF-extracted vs. hand-authored content stays visibly separated within each script, and authored content remains auditable via `review.notes` and the review report.
- There is a small duplication cost: an authored entry exists both in the script and (after promotion) in the fixture. The byte-for-byte promotion check keeps them in sync; a future helper could automate the diff.
- This pattern is the standard answer whenever new linked field values (per ADR's sibling field-link work) require rule references or other entries that aren't clean PDF sections — add them to the script's authored array, not just the fixtures.
