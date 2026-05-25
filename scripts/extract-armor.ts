import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { promisify } from "node:util";
import { SrdEntryCollectionSchema, type SrdEntry } from "../src/srd/schema";

const execFileAsync = promisify(execFile);

const sourcePdfPath = "data/source/Daggerheart-SRD-9-09-25.pdf";
const outputPath = "data/srd/generated/armor.candidates.json";
const reviewReportPath = "data/srd/generated/armor-review-report.md";
const sourceUrl = "https://www.daggerheart.com/wp-content/uploads/2025/09/Daggerheart-SRD-9-09-25.pdf";
const pdfPage = 29;
const printedPages = [56, 57];
const acceptedReviewTimestamp = "2026-05-25T00:00:00.000Z";
const acceptedReviewedIds = new Set([
  "armor.tier1.gambeson_armor",
  "armor.tier1.leather_armor",
  "armor.tier1.chainmail_armor",
  "armor.tier1.full_plate_armor",
  "armor.tier2.improved_gambeson_armor",
  "armor.tier2.improved_leather_armor",
  "armor.tier2.improved_chainmail_armor",
  "armor.tier2.improved_full_plate_armor",
  "armor.tier2.elundrian_chain_armor",
  "armor.tier2.harrowbone_armor",
  "armor.tier2.irontree_breastplate_armor",
  "armor.tier2.runetan_floating_armor",
  "armor.tier2.tyris_soft_armor",
  "armor.tier2.rosewild_armor",
  "armor.tier3.advanced_gambeson_armor",
  "armor.tier3.advanced_leather_armor",
  "armor.tier3.advanced_chainmail_armor",
  "armor.tier3.advanced_full_plate_armor",
  "armor.tier3.bellamoi_fine_armor",
  "armor.tier3.dragonscale_armor",
  "armor.tier3.spiked_plate_armor",
  "armor.tier3.bladefare_armor",
  "armor.tier3.monetts_cloak",
  "armor.tier3.runes_of_fortification",
  "armor.tier4.legendary_gambeson_armor",
  "armor.tier4.legendary_leather_armor",
  "armor.tier4.legendary_chainmail_armor",
  "armor.tier4.legendary_full_plate_armor",
  "armor.tier4.dunamis_silkchain",
  "armor.tier4.channeling_armor",
  "armor.tier4.emberwoven_armor",
  "armor.tier4.full_fortified_armor",
  "armor.tier4.veritas_opal_armor",
  "armor.tier4.savior_chainmail",
]);

type ArmorEntry = Extract<SrdEntry, { kind: "armor" }>;

type TextBox = {
  top: number;
  left: number;
  text: string;
};

type ArmorRow = {
  entry: ArmorEntry;
  warnings: string[];
  rowTop: number;
};

const xml = await extractArmorPageXml(sourcePdfPath);
const rows = extractArmorRows(parseTextBoxes(xml));
const entries = rows.map((row) => row.entry);

SrdEntryCollectionSchema.parse(entries);

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(resolve(process.cwd(), outputPath), `${JSON.stringify(entries, null, 2)}\n`, "utf8");
await writeFile(resolve(process.cwd(), reviewReportPath), buildReviewReport(rows), "utf8");

console.log(`Extracted ${entries.length} armor candidate entries to ${outputPath}.`);
console.log(`Wrote armor review report to ${reviewReportPath}.`);

async function extractArmorPageXml(pdfPath: string) {
  const { stdout } = await execFileAsync("pdftohtml", ["-xml", "-f", String(pdfPage), "-l", String(pdfPage), "-stdout", pdfPath]);
  return stdout;
}

function parseTextBoxes(xmlText: string) {
  const boxes: TextBox[] = [];
  const textPattern = /<text\s+top="(?<top>\d+)"\s+left="(?<left>\d+)"[^>]*>(?<text>[\s\S]*?)<\/text>/g;

  for (const match of xmlText.matchAll(textPattern)) {
    const groups = match.groups;
    if (!groups) {
      continue;
    }

    const text = decodeXml(stripTags(groups.text ?? "")).trim();
    if (!text) {
      continue;
    }

    boxes.push({
      top: Number(groups.top),
      left: Number(groups.left),
      text,
    });
  }

  return boxes.sort((a, b) => a.top - b.top || a.left - b.left);
}

function extractArmorRows(boxes: TextBox[]) {
  const tierHeadings = boxes.filter((box) => /^TIER \d/.test(box.text));
  const nameBoxes = boxes.filter((box) => isNameBox(box));
  const rows: ArmorRow[] = [];

  for (const [index, nameBox] of nameBoxes.entries()) {
    const column = nameBox.left < 900 ? "left" : "right";
    const nextNameTop = nameBoxes.find((box, nextIndex) => nextIndex > index && isSameColumn(box, column))?.top ?? Number.POSITIVE_INFINITY;
    const nextTierTop = tierHeadings.find((heading) => heading.top > nameBox.top && isSameColumn(heading, column))?.top ?? Number.POSITIVE_INFINITY;
    const rowEndTop = Math.min(nextNameTop, nextTierTop, column === "left" ? 1000 : 800);
    const tier = tierForBox(nameBox, tierHeadings);
    const thresholdBox = findNearbyBox(boxes, nameBox, column === "left" ? [285, 330] : [1228, 1272]);
    const scoreBox = findNearbyBox(boxes, nameBox, column === "left" ? [386, 405] : [1328, 1345]);
    const featureText = extractFeatureText(boxes, nameBox, rowEndTop, column);
    const warnings = detectWarnings(nameBox, tier, thresholdBox, scoreBox, featureText);
    const thresholds = parseThresholds(thresholdBox?.text ?? "");
    const score = Number(scoreBox?.text ?? Number.NaN);
    const feature = parseFeature(featureText);
    const name = nameBox.text;
    const id = `armor.tier${tier}.${toIdPart(name)}`;
    const accepted = acceptedReviewedIds.has(id);

    rows.push({
      entry: {
        id,
        kind: "armor",
        name,
        slug: toSlug(name),
        source: {
          document: "Daggerheart SRD",
          version: "1.0-2025-09-09",
          pdf: {
            path: sourcePdfPath,
            pageStart: pdfPage,
            pageEnd: pdfPage,
          },
          printedPages,
          url: sourceUrl,
        },
        review: {
          status: accepted ? "reviewed" : "extracted",
          reviewedAt: accepted ? acceptedReviewTimestamp : null,
          notes: [
            "Generated by scripts/extract-armor.ts from pdftohtml -xml; review row values against the source PDF.",
            ...(accepted ? ["Risk-based manual review accepted on 2026-05-25 with no flaws found in spot-checked rows and no parser warnings."] : []),
          ],
        },
        text: {
          original: `${name} ${thresholds.major} / ${thresholds.severe} ${score} ${featureText}`,
          summary: `Tier ${tier} armor with ${thresholds.major}/${thresholds.severe} base thresholds and base score ${score}.`,
        },
        tags: ["armor", `tier-${tier}`, ...(feature ? [toSlug(feature.name)] : [])],
        relationships: [],
        tier,
        levelRange: levelRangeForTier(tier),
        baseThresholds: thresholds,
        baseScore: score,
        feature,
      },
      warnings,
      rowTop: nameBox.top,
    });
  }

  return rows.sort((a, b) => a.entry.tier - b.entry.tier || a.rowTop - b.rowTop || a.entry.name.localeCompare(b.entry.name));
}

function isNameBox(box: TextBox) {
  const inLeftTableNames = box.left >= 85 && box.left <= 240 && box.top > 490 && box.top < 1000;
  const inRightTableNames = box.left >= 1025 && box.left <= 1180 && box.top > 140 && box.top < 800;
  return (inLeftTableNames || inRightTableNames) && !isIgnoredTableLabel(box.text);
}

function isIgnoredTableLabel(text: string) {
  return text === "Name" || text === "Base" || text === "Thresholds" || text === "Score" || text === "Feature" || /^TIER /.test(text);
}

function isSameColumn(box: TextBox, column: "left" | "right") {
  return column === "left" ? box.left < 900 : box.left >= 900;
}

function tierForBox(box: TextBox, tierHeadings: TextBox[]) {
  const columnHeadings = tierHeadings.filter((heading) => (box.left < 900 ? heading.left < 900 : heading.left >= 900));
  const heading = columnHeadings.filter((candidate) => candidate.top < box.top).at(-1);
  const tier = heading?.text.match(/^TIER (?<tier>\d)/)?.groups?.tier;

  if (!tier) {
    throw new Error(`Could not determine tier for armor row: ${box.text}`);
  }

  return Number(tier);
}

function findNearbyBox(boxes: TextBox[], rowStart: TextBox, leftRange: [number, number]) {
  return boxes.find(
    (box) => box.top >= rowStart.top - 2 && box.top <= rowStart.top + 4 && box.left >= leftRange[0] && box.left <= leftRange[1],
  );
}

function extractFeatureText(boxes: TextBox[], rowStart: TextBox, nextNameTop: number, column: "left" | "right") {
  const [minLeft, maxLeft] = column === "left" ? [430, 820] : [1370, 1760];
  const featureBoxes = boxes.filter(
    (box) => box.top >= rowStart.top - 2 && box.top < nextNameTop - 2 && box.left >= minLeft && box.left <= maxLeft,
  );
  const lines = new Map<number, TextBox[]>();

  for (const box of featureBoxes) {
    const lineTop = [...lines.keys()].find((top) => Math.abs(top - box.top) <= 2) ?? box.top;
    lines.set(lineTop, [...(lines.get(lineTop) ?? []), box]);
  }

  const text = [...lines.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, lineBoxes]) =>
      lineBoxes
        .sort((a, b) => a.left - b.left)
        .map((box) => box.text)
        .join("")
        .trim(),
    )
    .join(" ")
    .replace(/\s+/g, " ")
    .replace(/:\s*/g, ": ");

  return text || "—";
}

function parseThresholds(text: string) {
  const match = text.match(/^(?<major>\d+)\s*\/\s*(?<severe>\d+)$/);
  if (!match?.groups) {
    return { major: 1, severe: 1 };
  }

  return { major: Number(match.groups.major), severe: Number(match.groups.severe) };
}

function parseFeature(text: string) {
  if (text === "—") {
    return null;
  }

  const colonIndex = text.indexOf(":");
  if (colonIndex === -1) {
    return { name: "Feature", text };
  }

  return {
    name: text.slice(0, colonIndex).trim(),
    text: text.slice(colonIndex + 1).trim(),
  };
}

function detectWarnings(nameBox: TextBox, tier: number, thresholdBox: TextBox | undefined, scoreBox: TextBox | undefined, featureText: string) {
  const warnings: string[] = [];

  if (!Number.isInteger(tier) || tier < 1 || tier > 4) {
    warnings.push("Invalid tier detected.");
  }

  if (!thresholdBox || !/^\d+\s*\/\s*\d+$/.test(thresholdBox.text)) {
    warnings.push("Missing or malformed threshold cell.");
  }

  if (!scoreBox || !/^\d+$/.test(scoreBox.text)) {
    warnings.push("Missing or malformed base score cell.");
  }

  if (featureText !== "—" && !featureText.includes(":")) {
    warnings.push("Feature text does not contain a feature name separator.");
  }

  if (/\b[a-z]{2,}(?:Armor|Slot|Stress|Evasion|Point|You|your)\b/.test(`${nameBox.text} ${featureText}`)) {
    warnings.push("Potential joined-word artifact remains.");
  }

  if (featureText.length > 220) {
    warnings.push("Long feature text; review wrapped lines.");
  }

  if (featureText.includes("Daggerheart SRD")) {
    warnings.push("Page footer leaked into feature text.");
  }

  return warnings;
}

function levelRangeForTier(tier: number) {
  switch (tier) {
    case 1:
      return { min: 1, max: 1 };
    case 2:
      return { min: 2, max: 4 };
    case 3:
      return { min: 5, max: 7 };
    case 4:
      return { min: 8, max: 10 };
    default:
      throw new Error(`Unsupported tier: ${tier}`);
  }
}

function buildReviewReport(rows: ArmorRow[]) {
  const lines = [
    "# Armor Candidate Review Report",
    "",
    "Generated by `npm run extract:srd:armor`.",
    "",
    "## Summary",
    "",
    `- Candidate entries: ${rows.length}`,
    `- Entries with warnings: ${rows.filter((row) => row.warnings.length > 0).length}`,
    "",
    "## Entries",
    "",
  ];

  for (const row of rows) {
    lines.push(`### ${row.entry.id}`);
    lines.push("");
    lines.push(`- Name: ${row.entry.name}`);
    lines.push(`- Tier: ${row.entry.tier}`);
    lines.push(`- Physical PDF page: ${row.entry.source.pdf.pageStart}`);
    lines.push(`- Printed SRD pages: ${row.entry.source.printedPages.join(", ")}`);
    lines.push(`- Review status: ${row.entry.review.status}`);
    lines.push(`- Thresholds: ${row.entry.baseThresholds.major}/${row.entry.baseThresholds.severe}`);
    lines.push(`- Base score: ${row.entry.baseScore}`);
    lines.push(`- Feature: ${row.entry.feature ? `${row.entry.feature.name}: ${row.entry.feature.text}` : "none"}`);
    lines.push(`- Warnings: ${row.warnings.length > 0 ? row.warnings.join("; ") : "none"}`);
    lines.push("");
  }

  lines.push("## Review Guidance");
  lines.push("");
  lines.push("- Fully review rows with warnings before promotion.");
  lines.push("- Spot-check clean rows against the source table.");
  lines.push("- Keep armor candidates separate from canonical fixtures until accepted.");
  lines.push("");

  return `${lines.join("\n")}\n`;
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
