# Extraction Spike 2026-05-24

## Source

- PDF: `data/source/Daggerheart-SRD-9-09-25.pdf`
- Source page: https://www.daggerheart.com/srd/
- Direct PDF URL: https://www.daggerheart.com/wp-content/uploads/2025/09/Daggerheart-SRD-9-09-25.pdf
- Source label: Daggerheart System Reference Document v1.0

## PDF Metadata

- Pages: 68
- Tagged: no
- Encrypted: no
- Page size: letter
- Creator: Adobe InDesign 20.4 (Windows)
- Producer: GPL Ghostscript 9.55.0
- Creation date: 2025-09-09

The PDF is not tagged, so extraction must rely on text order, layout coordinates, or post-processing heuristics rather than semantic PDF structure.

## Tools Checked

Available locally:

- `pdfinfo`
- `pdftotext`
- `pdftohtml`

Not available locally during this spike:

- PyMuPDF
- pdfplumber
- pypdf

## Generated Spike Files

- `data/extraction-spikes/2026-05-24/poppler-raw.txt`
- `data/extraction-spikes/2026-05-24/poppler-layout.txt`
- `data/extraction-spikes/2026-05-24/poppler-xml.xml`
- `data/extraction-spikes/2026-05-24/sample-class-raw.txt`
- `data/extraction-spikes/2026-05-24/sample-class-layout.txt`
- `data/extraction-spikes/2026-05-24/sample-rules-raw.txt`
- `data/extraction-spikes/2026-05-24/sample-rules-layout.txt`
- `data/extraction-spikes/2026-05-24/sample-equipment-raw.txt`
- `data/extraction-spikes/2026-05-24/sample-equipment-layout.txt`
- `data/extraction-spikes/2026-05-24/sample-domain-cards-raw.txt`
- `data/extraction-spikes/2026-05-24/sample-domain-cards-layout.txt`

## Representative Sections Tested

- Class-like content: PDF pages 5-6, including class overview, Bard, Druid, and subclasses.
- Rules prose: PDF pages 20-21, including Hope, Fear, Combat, HP, damage thresholds, Stress, and Attacking.
- Equipment/table content: PDF pages 23-24, including weapon rules and primary weapon tables.
- Domain card content: PDF pages 60-61, including appendix domain card references.

## Findings

### Raw Text Extraction

`pdftotext -raw` gives readable prose and mostly usable text order. It is the best initial source for prose-heavy sections such as rules, classes, subclasses, and domain cards.

Strengths:

- Keeps prose readable.
- Separates many headings and paragraphs well enough for first-pass segmentation.
- Preserves bullet lists reasonably.
- Produces domain card content in a usable sequential form.

Weaknesses:

- Some words lose spaces, such as `bolsteryour`, `SPELLCASTTRAIT`, `Aweapon`, `afterthe`, and `HallowedAxe`.
- Page footers and page number pairs appear in the text.
- Multi-word names in table-like regions can be split across lines, such as `Arcane` / `Gauntlets` and `Returning` / `Blade`.
- Heading detection will need cleanup rules.

### Layout Text Extraction

`pdftotext -layout` preserves visual columns better, but it can interleave content across columns and pages. It is useful for debugging visual structure, but less ideal as the only parser input.

Strengths:

- Preserves broad layout and table spacing.
- Useful for detecting columns and visual grouping.
- Easier to compare against the PDF visually.

Weaknesses:

- Multi-column pages can be difficult to parse directly.
- Lines may contain unrelated content from separate visual columns.
- Not ideal for simple sequential text parsing.

### XML Extraction

`pdftohtml -xml` exposes coordinates, font IDs, text positions, and page numbers. It is likely useful for table reconstruction and section boundary detection.

Strengths:

- Provides page-aware text coordinates.
- Preserves enough layout metadata to separate columns.
- Can help reconstruct tables and identify headings by font and position.

Weaknesses:

- Requires custom parsing.
- The XML is verbose.
- It still lacks semantic structure; coordinates must be interpreted.

## Early Tooling Recommendation

Use Poppler as the initial extraction foundation:

- Use `pdftotext -raw` for prose-first extraction.
- Use `pdftohtml -xml` for layout-aware parsing, tables, page references, and column boundaries.
- Keep `pdftotext -layout` as a human-debugging artifact.

Do not commit to a final parser yet. The next step is to define the initial JSON schema and fixture using this extraction reality.

## Data Modeling Implications

- Source page references should probably be stored, because the PDF has page-aware extraction and manual review will be easier with page links.
- Records need review state because extraction will produce spacing and table-joining errors.
- Prose sections and structured entities should likely be handled by different extraction strategies.
- Equipment tables need special handling for wrapped names and wrapped feature text.
- Domain cards should model repeated fields: name, level, domain, type, recall cost, and rules text.
- Class records should model class fields separately from subclass fields, background questions, and connections.

## Next Steps

1. Define the first canonical JSON schema for a small set of entity types.
2. Create a tiny fixture dataset from the extracted samples.
3. Validate the fixture with Zod.
4. Use the fixture to build the first offline compendium prototype.
5. Return to parser automation once the schema has proven useful in the app.
