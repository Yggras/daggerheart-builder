import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { promisify } from "node:util";
import { SrdEntryCollectionSchema, type SrdEntry } from "../src/srd/schema";

const execFileAsync = promisify(execFile);

const sourcePdfPath = "data/source/Daggerheart-SRD-9-09-25.pdf";
const outputPath = "data/srd/generated/loot.candidates.json";
const reviewReportPath = "data/srd/generated/loot-review-report.md";
const sourceUrl = "https://www.daggerheart.com/wp-content/uploads/2025/09/Daggerheart-SRD-9-09-25.pdf";
const pdfPages = [30, 31, 32] as const;
const acceptedReviewTimestamp = "2026-05-26T00:00:00.000Z";
const acceptedFullLootBatch = true;
const acceptedFullLootBatchEntryCount = 120;

type LootEntry = Extract<SrdEntry, { kind: "loot" }>;
type LootType = LootEntry["lootType"];

type TextBox = {
  page: number;
  top: number;
  left: number;
  text: string;
};

type TableSegment = {
  name: string;
  page: number;
  printedPage: number;
  top: number;
  bottom: number;
  rollRange: [number, number];
  nameRange: [number, number];
  descriptionRange: [number, number];
  lootType: LootType;
};

type LootRow = {
  entry: LootEntry;
  warnings: string[];
  rowTop: number;
  roll: number;
  segmentName: string;
};

const tableSegments: TableSegment[] = [
  {
    name: "Items left table",
    page: 30,
    printedPage: 58,
    top: 238,
    bottom: 1085,
    rollRange: [100, 130],
    nameRange: [140, 240],
    descriptionRange: [240, 820],
    lootType: "item",
  },
  {
    name: "Items right table",
    page: 30,
    printedPage: 59,
    top: 90,
    bottom: 1085,
    rollRange: [1038, 1068],
    nameRange: [1075, 1180],
    descriptionRange: [1180, 1765],
    lootType: "item",
  },
  {
    name: "Items continuation",
    page: 31,
    printedPage: 60,
    top: 90,
    bottom: 540,
    rollRange: [100, 130],
    nameRange: [140, 240],
    descriptionRange: [240, 820],
    lootType: "item",
  },
  {
    name: "Consumables left table",
    page: 31,
    printedPage: 60,
    top: 730,
    bottom: 1085,
    rollRange: [100, 130],
    nameRange: [140, 240],
    descriptionRange: [238, 430],
    lootType: "consumable",
  },
  {
    name: "Consumables middle table",
    page: 31,
    printedPage: 60,
    top: 724,
    bottom: 1085,
    rollRange: [470, 500],
    nameRange: [510, 610],
    descriptionRange: [610, 820],
    lootType: "consumable",
  },
  {
    name: "Consumables right table",
    page: 31,
    printedPage: 61,
    top: 90,
    bottom: 1085,
    rollRange: [1038, 1068],
    nameRange: [1075, 1175],
    descriptionRange: [1175, 1395],
    lootType: "consumable",
  },
  {
    name: "Consumables far-right table",
    page: 31,
    printedPage: 61,
    top: 90,
    bottom: 1085,
    rollRange: [1410, 1440],
    nameRange: [1448, 1548],
    descriptionRange: [1548, 1765],
    lootType: "consumable",
  },
  {
    name: "Consumables continuation",
    page: 32,
    printedPage: 62,
    top: 90,
    bottom: 810,
    rollRange: [100, 130],
    nameRange: [140, 240],
    descriptionRange: [238, 450],
    lootType: "consumable",
  },
];

const xml = await extractLootPagesXml(sourcePdfPath);
const boxes = parseTextBoxes(xml);
const rows = addCrossRowWarnings(extractLootRows(boxes));
const entries = rows.map((row) => row.entry);

if (acceptedFullLootBatch && entries.length !== acceptedFullLootBatchEntryCount) {
  throw new Error(`Accepted full loot batch expected ${acceptedFullLootBatchEntryCount} entries but extracted ${entries.length}.`);
}

ensureExpectedRollCoverage(rows);
SrdEntryCollectionSchema.parse(entries);

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(resolve(process.cwd(), outputPath), `${JSON.stringify(entries, null, 2)}\n`, "utf8");
await writeFile(resolve(process.cwd(), reviewReportPath), buildReviewReport(rows), "utf8");

console.log(`Extracted ${entries.length} loot candidate entries to ${outputPath}.`);
console.log(`Wrote loot review report to ${reviewReportPath}.`);

async function extractLootPagesXml(pdfPath: string) {
  const { stdout } = await execFileAsync("pdftohtml", [
    "-xml",
    "-f",
    String(Math.min(...pdfPages)),
    "-l",
    String(Math.max(...pdfPages)),
    "-stdout",
    pdfPath,
  ]);
  return stdout;
}

function parseTextBoxes(xmlText: string) {
  const boxes: TextBox[] = [];
  const pagePattern = /<page\s+number="(?<page>\d+)"[^>]*>(?<body>[\s\S]*?)<\/page>/g;
  const textPattern = /<text\s+top="(?<top>\d+)"\s+left="(?<left>\d+)"[^>]*>(?<text>[\s\S]*?)<\/text>/g;

  for (const pageMatch of xmlText.matchAll(pagePattern)) {
    const pageGroups = pageMatch.groups;
    if (!pageGroups) {
      continue;
    }

    for (const textMatch of (pageGroups.body ?? "").matchAll(textPattern)) {
      const textGroups = textMatch.groups;
      if (!textGroups) {
        continue;
      }

      const text = decodeXml(stripTags(textGroups.text ?? "")).replace(/\u00a0/g, " ");
      if (!text.trim()) {
        continue;
      }

      boxes.push({
        page: Number(pageGroups.page),
        top: Number(textGroups.top),
        left: Number(textGroups.left),
        text,
      });
    }
  }

  return boxes.sort((a, b) => a.page - b.page || a.top - b.top || a.left - b.left);
}

function extractLootRows(boxes: TextBox[]) {
  const rows: LootRow[] = [];

  for (const segment of tableSegments) {
    const pageBoxes = boxes.filter((box) => box.page === segment.page);
    const rowStarts = pageBoxes.filter(
      (box) =>
        box.top > segment.top &&
        box.top < segment.bottom &&
        box.left >= segment.rollRange[0] &&
        box.left <= segment.rollRange[1] &&
        /^\d{2}$/.test(box.text.trim()),
    );

    for (const [index, rowStart] of rowStarts.entries()) {
      const nextRowTop = Math.min(rowStarts[index + 1]?.top ?? segment.bottom, segment.bottom);
      const rollText = extractColumnText(pageBoxes, rowStart.top, nextRowTop, segment.rollRange);
      const name = extractColumnText(pageBoxes, rowStart.top, nextRowTop, segment.nameRange);
      const description = extractColumnText(pageBoxes, rowStart.top, nextRowTop, segment.descriptionRange);
      const roll = Number(rollText);
      const id = `loot.${segment.lootType}.${toIdPart(name)}`;
      const accepted = acceptedFullLootBatch;
      const warnings = detectWarnings({ rollText, roll, name, description, segment });

      rows.push({
        entry: {
          id,
          kind: "loot",
          name,
          slug: toSlug(name),
          source: {
            document: "Daggerheart SRD",
            version: "1.0-2025-09-09",
            pdf: {
              path: sourcePdfPath,
              pageStart: segment.page,
              pageEnd: segment.page,
            },
            printedPages: [segment.printedPage],
            url: sourceUrl,
          },
          review: {
            status: accepted ? "reviewed" : "extracted",
            reviewedAt: accepted ? acceptedReviewTimestamp : null,
            notes: [
              "Generated by scripts/extract-loot.ts from pdftohtml -xml; review row values against the source PDF.",
              ...(accepted ? ["Risk-based manual review accepted on 2026-05-26 with no flaws found and no parser warnings."] : []),
            ],
          },
          text: {
            original: description,
            summary: previewText(description),
          },
          tags: ["loot", segment.lootType],
          relationships: [],
          lootType: segment.lootType,
          roll,
          maxQuantity: segment.lootType === "consumable" ? 5 : null,
        },
        warnings,
        rowTop: segment.page * 10_000 + rowStart.top,
        roll,
        segmentName: segment.name,
      });
    }
  }

  return rows.sort((a, b) => sortLoot(a.entry, b.entry) || a.roll - b.roll || a.rowTop - b.rowTop || a.entry.name.localeCompare(b.entry.name));
}

function extractColumnText(boxes: TextBox[], rowTop: number, nextRowTop: number, leftRange: [number, number]) {
  const columnBoxes = boxes.filter(
    (box) => box.top >= rowTop - 2 && box.top < nextRowTop - 2 && box.left >= leftRange[0] && box.left <= leftRange[1],
  );
  const lines = new Map<number, TextBox[]>();

  for (const box of columnBoxes) {
    const lineTop = [...lines.keys()].find((top) => Math.abs(top - box.top) <= 2) ?? box.top;
    lines.set(lineTop, [...(lines.get(lineTop) ?? []), box]);
  }

  return [...lines.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, lineBoxes]) => joinFragments(lineBoxes.sort((a, b) => a.left - b.left).map((box) => box.text)))
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectWarnings({
  rollText,
  roll,
  name,
  description,
  segment,
}: {
  rollText: string;
  roll: number;
  name: string;
  description: string;
  segment: TableSegment;
}) {
  const warnings: string[] = [];

  if (!/^\d{2}$/.test(rollText)) {
    warnings.push("Missing or malformed roll cell.");
  }

  if (!Number.isInteger(roll) || roll < 1 || roll > 60) {
    warnings.push("Roll is outside the expected 1-60 range.");
  }

  if (!name) {
    warnings.push("Missing loot name.");
  }

  if (!description) {
    warnings.push("Missing loot description.");
  }

  if (/\b(?:ROLL|Loot|LOOT|description|Consumables|GOLD|RUNNING AN ADVENTURE|GM GUIDANCE)\b/.test(`${name} ${description}`)) {
    warnings.push("Table heading or unrelated section text leaked into row data.");
  }

  if (/Daggerheart SRD/.test(description)) {
    warnings.push("Page footer leaked into description.");
  }

  if (/\b[a-z]{2,}(?:Armor|Close|Damage|Far|Fear|GM|HP|Hope|Hidden|Knowledge|Loot|Potion|Roll|Slots|Spellcast|Stress|Very|Vulnerable)\b/.test(`${name} ${description}`)) {
    warnings.push("Potential joined-word artifact remains.");
  }

  if (description.length > (segment.lootType === "item" ? 320 : 260)) {
    warnings.push("Long description; review wrapped lines.");
  }

  return warnings;
}

function addCrossRowWarnings(rows: LootRow[]) {
  const idCounts = countValues(rows.map((row) => row.entry.id));
  const slugCounts = countValues(rows.map((row) => row.entry.slug));
  const rollCounts = new Map<LootType, Map<number, number>>();

  for (const row of rows) {
    const countsForType = rollCounts.get(row.entry.lootType) ?? new Map<number, number>();
    countsForType.set(row.roll, (countsForType.get(row.roll) ?? 0) + 1);
    rollCounts.set(row.entry.lootType, countsForType);
  }

  return rows.map((row) => {
    const warnings = [...row.warnings];

    if ((idCounts.get(row.entry.id) ?? 0) > 1) {
      warnings.push("Duplicate generated id.");
    }

    if ((slugCounts.get(row.entry.slug) ?? 0) > 1) {
      warnings.push("Duplicate generated slug.");
    }

    if ((rollCounts.get(row.entry.lootType)?.get(row.roll) ?? 0) > 1) {
      warnings.push("Duplicate roll within loot type.");
    }

    return {
      ...row,
      warnings: unique(warnings),
    };
  });
}

function ensureExpectedRollCoverage(rows: LootRow[]) {
  for (const lootType of ["item", "consumable"] satisfies LootType[]) {
    const rolls = rows.filter((row) => row.entry.lootType === lootType).map((row) => row.roll);
    const missingRolls = range(1, 60).filter((roll) => !rolls.includes(roll));
    const duplicateRolls = [...new Set(rolls.filter((roll, index) => rolls.indexOf(roll) !== index))].sort((a, b) => a - b);

    if (rolls.length !== 60 || missingRolls.length > 0 || duplicateRolls.length > 0) {
      throw new Error(
        `Expected 60 ${lootType} rows with rolls 1-60; extracted ${rolls.length} rows, missing [${missingRolls.join(", ")}], duplicates [${duplicateRolls.join(", ")}].`,
      );
    }
  }
}

function buildReviewReport(rows: LootRow[]) {
  const itemRows = rows.filter((row) => row.entry.lootType === "item");
  const consumableRows = rows.filter((row) => row.entry.lootType === "consumable");
  const lines = [
    "# Loot Candidate Review Report",
    "",
    "Generated by `npm run extract:srd:loot`.",
    "",
    "## Summary",
    "",
    `- Candidate entries: ${rows.length}`,
    `- Reviewed entries: ${rows.filter((row) => row.entry.review.status === "reviewed").length}`,
    `- Extracted entries: ${rows.filter((row) => row.entry.review.status === "extracted").length}`,
    `- Item entries: ${itemRows.length}`,
    `- Consumable entries: ${consumableRows.length}`,
    `- Entries with warnings: ${rows.filter((row) => row.warnings.length > 0).length}`,
    "",
    "## Entries",
    "",
  ];

  for (const row of rows) {
    lines.push(`### ${row.entry.id}`);
    lines.push("");
    lines.push(`- Name: ${row.entry.name}`);
    lines.push(`- Loot type: ${row.entry.lootType}`);
    lines.push(`- Roll: ${row.entry.roll}`);
    lines.push(`- Max quantity: ${row.entry.maxQuantity ?? "none"}`);
    lines.push(`- Source segment: ${row.segmentName}`);
    lines.push(`- Physical PDF page: ${row.entry.source.pdf.pageStart}`);
    lines.push(`- Printed SRD pages: ${row.entry.source.printedPages.join(", ")}`);
    lines.push(`- Review status: ${row.entry.review.status}`);
    lines.push(`- Text preview: ${previewText(row.entry.text.original)}`);
    lines.push(`- Warnings: ${row.warnings.length > 0 ? row.warnings.join("; ") : "none"}`);
    lines.push("");
  }

  lines.push("## Review Guidance");
  lines.push("");
  lines.push("- Fully review rows with warnings before promotion.");
  lines.push("- Spot-check the first and last row of each table segment.");
  lines.push("- Pay extra attention to wrapped names, wrapped descriptions, and the page-31 section boundary between items and consumables.");
  lines.push("- Confirm the page-32 left-column continuation does not pick up Gold or GM guidance text.");
  lines.push("- Keep generated loot candidates separate from canonical fixtures until accepted.");
  lines.push("");

  return `${lines.join("\n")}\n`;
}

function sortLoot(a: LootEntry, b: LootEntry) {
  const lootTypeOrder = { item: 0, consumable: 1 } satisfies Record<LootType, number>;
  return lootTypeOrder[a.lootType] - lootTypeOrder[b.lootType];
}

function joinFragments(fragments: string[]) {
  let result = "";

  for (const fragment of fragments.map((value) => value.trim()).filter(Boolean)) {
    if (!result) {
      result = fragment;
      continue;
    }

    result += needsSpace(result, fragment) ? ` ${fragment}` : fragment;
  }

  return result.replace(/\s+/g, " ").trim();
}

function needsSpace(current: string, next: string) {
  const previousCharacter = current.at(-1) ?? "";
  const nextCharacter = next[0] ?? "";

  if (!previousCharacter || !nextCharacter) {
    return false;
  }

  if (/^[,.;:!?%\]\)}’”]|^[–—-]/.test(nextCharacter)) {
    return false;
  }

  if (/[\s([{"'“‘/+\-]$/.test(previousCharacter)) {
    return false;
  }

  return true;
}

function previewText(text: string) {
  return text.length > 180 ? `${text.slice(0, 180)}...` : text;
}

function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function countValues(values: string[]) {
  return values.reduce((counts, value) => counts.set(value, (counts.get(value) ?? 0) + 1), new Map<string, number>());
}

function unique<T>(values: T[]) {
  return [...new Set(values)];
}

function stripTags(text: string) {
  return text.replace(/<[^>]*>/g, "");
}

function decodeXml(text: string) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function toIdPart(value: string) {
  return value
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
