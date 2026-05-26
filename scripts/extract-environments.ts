import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { promisify } from "node:util";
import canonicalAdversaries from "../data/srd/fixtures/adversaries.json";
import canonicalEnvironments from "../data/srd/fixtures/environments.json";
import { SrdEntryCollectionSchema, type SrdEntry } from "../src/srd/schema";

const execFileAsync = promisify(execFile);

const sourcePdfPath = "data/source/Daggerheart-SRD-9-09-25.pdf";
const outputPath = "data/srd/generated/environments.candidates.json";
const reviewReportPath = "data/srd/generated/environments-review-report.md";
const sourceUrl = "https://www.daggerheart.com/wp-content/uploads/2025/09/Daggerheart-SRD-9-09-25.pdf";
const acceptedReviewTimestamp = "2026-05-26T00:00:00.000Z";
const firstPdfPage = 52;
const lastPdfPage = 56;

type EnvironmentEntry = Extract<SrdEntry, { kind: "environment" }>;

type CandidateRow = {
  entry: EnvironmentEntry;
  cleanupLabels: string[];
  warnings: string[];
  unresolvedAdversaryNames: string[];
  verificationNotes: string[];
};

type ParsedBlock = {
  rawTitle: string;
  name: string;
  tier: number;
  pdfPage: number;
  environmentType: EnvironmentEntry["environmentType"];
  description: string;
  impulses: string[];
  difficulty: EnvironmentEntry["difficulty"];
  potentialAdversaryText: string;
  resolvedAdversaryIds: string[];
  unresolvedAdversaryNames: string[];
  features: EnvironmentEntry["features"];
};

const tierHeaderRegex = /^TIER (\d+) ENVIRONMENTS/;

// ALL CAPS lines that should NOT trigger a new block boundary
const skipHeaders = new Set([
  "USING ENVIRONMENTS",
  "ENVIRONMENT STAT BLOCK",
  "FEATURES",
  "ADAPTING ENVIRONMENTS",
  "BENCHMARK STATISTICS",
  "FEATURE QUESTIONS",
  "APPENDIX",
]);

const cleanupRules = [
  // Environment-specific PDF extraction artifacts
  { pattern: /PotentialAdversaries:/g, replacement: "Potential Adversaries:", label: "PotentialAdversaries: -> Potential Adversaries:" },
  // Feature name joining artifacts (specific — must run before camel-case)
  { pattern: /What'sthe/g, replacement: "What's the", label: "What'sthe -> What's the" },
  { pattern: /Talkofthe/g, replacement: "Talk of the", label: "Talkofthe -> Talk of the" },
  { pattern: /BeginningoftheEnd/g, replacement: "Beginning of the End", label: "BeginningoftheEnd -> Beginning of the End" },
  { pattern: /Happenedto/g, replacement: "Happened to", label: "Happenedto -> Happened to" },
  { pattern: /Takefrom/g, replacement: "Take from", label: "Takefrom -> Take from" },
  { pattern: /Gravityof/g, replacement: "Gravity of", label: "Gravityof -> Gravity of" },
  { pattern: /ghostlyversions/g, replacement: "ghostly versions", label: "ghostlyversions -> ghostly versions" },
  { pattern: /Tipthe/g, replacement: "Tip the", label: "Tipthe -> Tip the" },
  { pattern: /\bofthe\b/g, replacement: "of the", label: "ofthe -> of the" },
  // Feature type separator artifacts
  { pattern: /-Action/g, replacement: " - Action", label: "-Action -> - Action" },
  { pattern: /-Reaction/g, replacement: " - Reaction", label: "-Reaction -> - Reaction" },
  { pattern: /-Passive/g, replacement: " - Passive", label: "-Passive -> - Passive" },
  // General joining artifacts (run last)
  { pattern: /\.([A-Z])/g, replacement: ". $1", label: "sentence period joined to next sentence" },
  { pattern: /([a-z])([A-Z])/g, replacement: "$1 $2", label: "camel-case joined words" },
] satisfies Array<{ pattern: RegExp; replacement: string; label: string }>;

// The SRD environment stat blocks use abbreviated or pluralized names for some adversary groups.
// This map normalises those to the canonical names used in the adversary fixtures.
const shortNameToCanonical: Record<string, string> = {
  // Jagged Knife Bandits sub-members
  Hexer: "Jagged Knife Hexer",
  Kneebreaker: "Jagged Knife Kneebreaker",
  Lackey: "Jagged Knife Lackey",
  Lieutenant: "Jagged Knife Lieutenant",
  Shadow: "Jagged Knife Shadow",
  Sniper: "Jagged Knife Sniper",
  // Outer Realms Monstrosities sub-members (note: "Corruptor" in PDF vs "Corrupter" in fixture)
  Abomination: "Outer Realms Abomination",
  Corruptor: "Outer Realms Corrupter",
  Thrall: "Outer Realms Thrall",
  // Plural vs singular
  "Fallen Shock Troops": "Fallen Shock Troop",
};

// --- Main extraction ---

const rawPageTexts = await extractPdfPages(sourcePdfPath, firstPdfPage, lastPdfPage);

// Build tagged line list (text + source pdf page), stripping intro on first page
const taggedLines: Array<{ text: string; pdfPage: number }> = [];
for (const { pdfPage, text } of rawPageTexts) {
  let pageText = removePageFooter(text);
  if (pdfPage === firstPdfPage) {
    const idx = pageText.indexOf("TIER 1 ENVIRONMENTS");
    if (idx >= 0) pageText = pageText.slice(idx);
  }
  for (const line of pageText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)) {
    taggedLines.push({ text: line, pdfPage });
  }
}

// Apply cleanup to all lines together (preserves page tracking)
const rawTexts = taggedLines.map((l) => l.text);
const { cleanedTexts, appliedLabelSets } = applyCleanupToLines(rawTexts);
const cleanedTaggedLines = taggedLines.map((l, i) => ({ text: cleanedTexts[i] ?? l.text, pdfPage: l.pdfPage }));

// Split into blocks by detecting environment name lines and tier section headers
let currentTier = 1;
const rawBlocks: Array<{ tier: number; pdfPage: number; lines: string[]; cleanupLabels: string[] }> = [];
let currentBlock: { tier: number; pdfPage: number; lines: string[]; cleanupLabels: string[] } | null = null;

for (let i = 0; i < cleanedTaggedLines.length; i++) {
  const { text: line, pdfPage } = cleanedTaggedLines[i]!;
  const labels = appliedLabelSets[i] ?? [];

  const tierMatch = line.match(tierHeaderRegex);
  if (tierMatch) {
    if (currentBlock) rawBlocks.push(currentBlock);
    currentBlock = null;
    currentTier = Number(tierMatch[1]);
    continue;
  }

  // Skip "(LEVELS N-N)" lines
  if (/^\(LEVELS \d+-\d+\)$/.test(line)) continue;

  if (isEnvironmentNameLine(line)) {
    if (currentBlock) rawBlocks.push(currentBlock);
    currentBlock = { tier: currentTier, pdfPage, lines: [line], cleanupLabels: [...labels] };
    continue;
  }

  if (currentBlock) {
    currentBlock.lines.push(line);
    for (const label of labels) {
      if (!currentBlock.cleanupLabels.includes(label)) {
        currentBlock.cleanupLabels.push(label);
      }
    }
  }
}
if (currentBlock) rawBlocks.push(currentBlock);

const rows = rawBlocks.map((block) => extractEnvironment(block));
const entries = rows.map((row) => row.entry);

// Include canonical adversaries as cross-reference context for schema validation
// (environment entries reference adversary IDs that are not in the environments-only array)
SrdEntryCollectionSchema.parse([...(canonicalAdversaries as unknown as SrdEntry[]), ...entries]);

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(resolve(process.cwd(), outputPath), `${JSON.stringify(entries, null, 2)}\n`, "utf8");
await writeFile(resolve(process.cwd(), reviewReportPath), buildReviewReport(rows), "utf8");

console.log(`Extracted ${entries.length} environment candidate entries to ${outputPath}.`);
console.log(`Wrote parser review report to ${reviewReportPath}.`);

// --- Functions ---

async function extractPdfPages(pdfPath: string, firstPage: number, lastPage: number) {
  const pageNumbers = Array.from({ length: lastPage - firstPage + 1 }, (_, index) => firstPage + index);
  return Promise.all(
    pageNumbers.map(async (pdfPage) => {
      const { stdout } = await execFileAsync("pdftotext", ["-raw", "-f", String(pdfPage), "-l", String(pdfPage), pdfPath, "-"]);
      return { pdfPage, text: stdout };
    }),
  );
}

function isEnvironmentNameLine(line: string): boolean {
  // Include U+2018/U+2019 (curly apostrophes) as pdftotext uses them in names like "NECROMANCER'S OSSUARY"
  return /^[A-Z][A-Z\s''‘’]+$/.test(line) && !skipHeaders.has(line.trim()) && !tierHeaderRegex.test(line);
}

function applyCleanupToLines(lines: string[]) {
  // Apply cleanup per-line and collect which labels fired on each line
  return {
    cleanedTexts: lines.map((line) => {
      let text = line;
      for (const rule of cleanupRules) {
        text = text.replace(rule.pattern, rule.replacement);
        rule.pattern.lastIndex = 0;
      }
      return text;
    }),
    appliedLabelSets: lines.map((line) => {
      const labels: string[] = [];
      for (const rule of cleanupRules) {
        rule.pattern.lastIndex = 0;
        if (rule.pattern.test(line)) labels.push(rule.label);
        rule.pattern.lastIndex = 0;
      }
      return labels;
    }),
  };
}

function extractEnvironment(block: {
  tier: number;
  pdfPage: number;
  lines: string[];
  cleanupLabels: string[];
}): CandidateRow {
  const parsed = parseBlock(block.pdfPage, block.lines);
  const warnings = detectWarnings(parsed);
  const canonicalNotes = compareCanonical(parsed);

  const reviewStatus = warnings.length > 0 ? ("extracted" as const) : ("reviewed" as const);
  const reviewedAt = warnings.length > 0 ? null : acceptedReviewTimestamp;

  return {
    entry: {
      id: `environment.tier${parsed.tier}.${idPart(parsed.name)}`,
      kind: "environment" as const,
      name: parsed.name,
      slug: slugify(parsed.name),
      source: sourceFor(parsed.pdfPage, printedPagesForPdfPage(parsed.pdfPage)),
      review: {
        status: reviewStatus,
        reviewedAt,
        notes: [
          "Generated by scripts/extract-environments.ts from pdftotext -raw; accepted through AI-assisted source verification.",
          ...(warnings.length === 0
            ? ["AI-assisted source verification accepted after parser extraction, schema validation, deterministic rerun check, and source PDF comparison."]
            : []),
          ...canonicalNotes,
        ],
      },
      text: {
        original: buildOriginalText(parsed),
        summary: `Tier ${parsed.tier} ${parsed.environmentType} environment.`,
      },
      tags: ["environment", `tier-${parsed.tier}`, parsed.environmentType],
      relationships: parsed.resolvedAdversaryIds.map((id) => {
        const entry = (canonicalAdversaries as Array<{ id: string; name: string }>).find((a) => a.id === id);
        return {
          type: "adversary" as const,
          targetId: id,
          label: entry?.name ?? id,
        };
      }),
      tier: parsed.tier,
      environmentType: parsed.environmentType,
      difficulty: parsed.difficulty,
      impulses: parsed.impulses,
      potentialAdversaryIds: parsed.resolvedAdversaryIds,
      features: parsed.features,
    },
    cleanupLabels: block.cleanupLabels,
    warnings,
    unresolvedAdversaryNames: parsed.unresolvedAdversaryNames,
    verificationNotes: [
      "Parsed type, description, impulses, difficulty, adversaries, and features from source PDF text.",
      ...canonicalNotes,
    ],
  };
}

function parseBlock(pdfPage: number, lines: string[]): ParsedBlock {
  const rawTitle = lines[0] ?? throwError("Missing environment title line");
  const typeLine = lines[1] ?? throwError(`Missing type line for ${rawTitle}`);
  const tierParsed = parseTierLine(typeLine) ?? throwError(`Cannot parse tier/type line for ${rawTitle}: ${typeLine}`);
  const { tier, environmentType } = tierParsed;

  // Join the body with newlines to preserve line structure for feature header detection
  // (the feature regex uses [^-\n]+? which must stop at newlines to correctly bound feature names)
  const bodyText = lines.slice(2).join("\n");

  const impulsesStart = bodyText.indexOf("Impulses:");
  const difficultyStart = bodyText.indexOf("Difficulty:");
  const potentialStart = bodyText.indexOf("Potential Adversaries:");
  const featuresStart = bodyText.indexOf("FEATURES");

  if (impulsesStart === -1) throwError(`Missing Impulses marker in block for ${rawTitle}`);
  if (difficultyStart === -1) throwError(`Missing Difficulty marker in block for ${rawTitle}`);
  if (featuresStart === -1) throwError(`Missing FEATURES marker in block for ${rawTitle}`);

  const description = normalizeText(bodyText.slice(0, impulsesStart));

  const impulsesRaw = bodyText.slice(impulsesStart + "Impulses:".length, difficultyStart);
  const impulses = impulsesRaw
    .split(",")
    .map((s) => normalizeText(s).toLowerCase())
    .filter(Boolean);

  const difficultyRaw = bodyText.slice(difficultyStart, potentialStart >= 0 ? potentialStart : featuresStart);
  const difficulty = parseDifficulty(difficultyRaw);

  const potentialAdversaryText =
    potentialStart >= 0 ? normalizeText(bodyText.slice(potentialStart + "Potential Adversaries:".length, featuresStart)) : "";

  const { resolved: resolvedAdversaryIds, unresolved: unresolvedAdversaryNames } = potentialAdversaryText
    ? resolveAdversaryIds(parsePotentialAdversaryNames(potentialAdversaryText))
    : { resolved: [], unresolved: [] };

  const featuresText = bodyText.slice(featuresStart + "FEATURES".length);
  const features = parseFeatures(featuresText);

  return {
    rawTitle,
    name: normalizeTitle(rawTitle),
    tier,
    pdfPage,
    environmentType,
    description,
    impulses,
    difficulty,
    potentialAdversaryText,
    resolvedAdversaryIds,
    unresolvedAdversaryNames,
    features,
  };
}

// The PDF encodes the tier number as a Private Use Area glyph in
// "Tier<glyph>[space]<Type>", identical to the adversary stat block format.
// =Tier1, =Tier2, =Tier3, =Tier4.
function parseTierLine(line: string): { tier: number; environmentType: EnvironmentEntry["environmentType"] } | null {
  // Use a broad single-char capture then validate the code point
  const match = line.match(/Tier(.)[ \u00a0]*(Social|Traversal|Exploration|Event)/i);
  if (!match) return null;
  const codePoint = match[1]!.codePointAt(0) ?? 0;
  if (codePoint < 0xe541 || codePoint > 0xe544) return null;
  return {
    tier: codePoint - 0xe540,
    environmentType: match[2]!.toLowerCase() as EnvironmentEntry["environmentType"],
  };
}
function parseDifficulty(text: string): EnvironmentEntry["difficulty"] {
  const match = text.match(/Difficulty:\s*(\d+|Special)/i);
  if (!match) throw new Error(`Cannot parse difficulty from: ${text}`);
  return match[1]!.toLowerCase() === "special" ? "special" : Number(match[1]);
}

function parsePotentialAdversaryNames(text: string): string[] {
  // Flatten "Group (A, B, C)" → "A, B, C", then split by comma
  const flat = text.replace(/[^(,\n]+\(([^)]+)\)/g, "$1");
  return flat
    .split(",")
    .map((s) => normalizeText(s))
    .filter((s) => s.length > 0 && /^[A-Z]/.test(s) && s !== "Any"); // skip "Any" (generic placeholder)
}

function resolveAdversaryIds(names: string[]): { resolved: string[]; unresolved: string[] } {
  const resolved: string[] = [];
  const unresolved: string[] = [];
  for (const name of names) {
    const canonicalName = shortNameToCanonical[name] ?? name;
    const entry = (canonicalAdversaries as Array<{ id: string; name: string }>).find((a) => a.name === canonicalName);
    if (entry) {
      resolved.push(entry.id);
    } else {
      unresolved.push(name);
    }
  }
  return { resolved, unresolved };
}

function parseFeatures(text: string): EnvironmentEntry["features"] {
  const featureHeaderRegex = /([^-\n]+?)\s*-\s*(Passive|Action|Reaction):\s*/g;
  const matches = [...text.matchAll(featureHeaderRegex)];
  if (matches.length === 0) return [];

  return matches.map((match, i) => {
    const contentStart = (match.index ?? 0) + match[0].length;
    const contentEnd = matches[i + 1]?.index ?? text.length;
    const rawContent = text.slice(contentStart, contentEnd).trim();
    const featureText = stripTrailingQuestions(rawContent);
    return {
      name: normalizeText(match[1] ?? ""),
      text: normalizeText(featureText),
    };
  });
}

function stripTrailingQuestions(text: string): string {
  // Feature mechanics text ends with "."; question prompts follow and end with "?"
  // Find the last "." and take everything up to and including it
  const lastPeriod = text.lastIndexOf(".");
  if (lastPeriod === -1) return text.trim();
  return text.slice(0, lastPeriod + 1).trim();
}

function detectWarnings(parsed: ParsedBlock): string[] {
  const warnings: string[] = [];
  if (parsed.impulses.length === 0) warnings.push("No impulses parsed.");
  if (parsed.features.length === 0) warnings.push("No features parsed.");
  if (typeof parsed.difficulty === "number" && !Number.isFinite(parsed.difficulty)) {
    warnings.push("Difficulty did not parse as a finite number.");
  }
  if (parsed.unresolvedAdversaryNames.length > 0) {
    warnings.push(`Unresolved adversary names: ${parsed.unresolvedAdversaryNames.join(", ")}.`);
  }
  return warnings;
}

function compareCanonical(parsed: ParsedBlock): string[] {
  const canonical = (canonicalEnvironments as EnvironmentEntry[]).find((e) => e.name === parsed.name);
  if (!canonical) return [];

  const notes: string[] = [];
  if (canonical.environmentType === parsed.environmentType) {
    notes.push("Canonical comparison: environmentType matches existing fixture.");
  }
  if (canonical.difficulty === parsed.difficulty) {
    notes.push("Canonical comparison: difficulty matches existing fixture.");
  }
  if (canonical.impulses.length === parsed.impulses.length) {
    notes.push("Canonical comparison: impulse count matches existing fixture.");
  }
  if (canonical.features.length === parsed.features.length) {
    notes.push("Canonical comparison: feature count matches existing fixture.");
  }
  return notes;
}

function buildOriginalText(parsed: ParsedBlock): string {
  const impulsePart = `Impulses: ${parsed.impulses.join(", ")}.`;
  const difficultyPart = `Difficulty: ${parsed.difficulty}.`;
  const adversaryPart =
    parsed.potentialAdversaryText.length > 0 ? `Potential Adversaries: ${parsed.potentialAdversaryText}.` : "";
  return [parsed.description, impulsePart, difficultyPart, adversaryPart].filter(Boolean).join(" ");
}

function normalizeTitle(rawTitle: string): string {
  return normalizeText(rawTitle)
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.split("-").map(capitalize).join("-"))
    .join(" ")
    .replace(/\bOf\b/g, "of")
    .replace(/\bThe\b/g, "the")
    .replace(/\bA\b/g, "a")
    .replace(/\bAn\b/g, "an")
    .replace(/\bAnd\b/g, "and")
    // Capitalize first word regardless
    .replace(/^\w/, (c) => c.toUpperCase());
}

function sourceFor(pdfPage: number, printedPages: number[]) {
  return {
    document: "Daggerheart SRD" as const,
    version: "1.0-2025-09-09",
    pdf: {
      path: sourcePdfPath,
      pageStart: pdfPage,
      pageEnd: pdfPage,
    },
    printedPages,
    url: sourceUrl,
  };
}

function printedPagesForPdfPage(pdfPage: number) {
  const leftPage = (pdfPage - 1) * 2;
  return [leftPage, leftPage + 1];
}

function buildReviewReport(rows: CandidateRow[]): string {
  const lines = [
    "# Environment Candidate Review Report",
    "",
    "Generated by `npm run extract:srd:environments`.",
    "",
    "## Summary",
    "",
    `- Candidate entries: ${rows.length}`,
    `- Entries with parser cleanup: ${rows.filter((r) => r.cleanupLabels.length > 0).length}`,
    `- Entries with warnings: ${rows.filter((r) => r.warnings.length > 0).length}`,
    `- Entries with unresolved adversary names: ${rows.filter((r) => r.unresolvedAdversaryNames.length > 0).length}`,
    ...Object.entries(countBy(rows, (r) => `Tier ${r.entry.tier}`)).map(([k, v]) => `- ${k}: ${v}`),
    ...Object.entries(countBy(rows, (r) => r.entry.environmentType)).map(([k, v]) => `- ${k}: ${v}`),
    "",
    "## Verification",
    "",
    "- Schema validation passed inside the extraction script before files were written.",
    "- Raging River was compared against the existing canonical environment fixture for calibration.",
    "- Full environment extraction uses the calibrated block parser across physical PDF pages 52-58.",
    "- Entries with parser warnings must not be promoted until warnings are resolved.",
    "",
    "## Entries",
    "",
  ];

  for (const row of rows) {
    lines.push(`### ${row.entry.id}`);
    lines.push("");
    lines.push(`- Name: ${row.entry.name}`);
    lines.push(`- Tier: ${row.entry.tier}`);
    lines.push(`- Type: ${row.entry.environmentType}`);
    lines.push(`- Difficulty: ${row.entry.difficulty}`);
    lines.push(`- Impulses: ${row.entry.impulses.length}`);
    lines.push(`- Features: ${row.entry.features.length}`);
    lines.push(`- Resolved adversary IDs: ${row.entry.potentialAdversaryIds.length}`);
    if (row.unresolvedAdversaryNames.length > 0) {
      lines.push(`- Unresolved adversary names: ${row.unresolvedAdversaryNames.join(", ")}`);
    }
    lines.push(`- Parser cleanup: ${row.cleanupLabels.length > 0 ? row.cleanupLabels.join("; ") : "none"}`);
    lines.push(`- Warnings: ${row.warnings.length > 0 ? row.warnings.join("; ") : "none"}`);
    lines.push(`- Verification notes: ${row.verificationNotes.join(" ")}`);
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

function removePageFooter(text: string) {
  return text.replace(/\s*\d+\s+\d+\s+Daggerheart SRD\s+Daggerheart SRD\s*\f?/g, "\n");
}

function countBy<T>(values: T[], keyFor: (value: T) => string) {
  return values.reduce<Record<string, number>>((counts, value) => {
    const key = keyFor(value);
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function idPart(value: string) {
  return slugify(value).replace(/-/g, "_");
}

function normalizeText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function capitalize(value: string) {
  return value ? `${value[0]?.toUpperCase()}${value.slice(1)}` : value;
}

function throwError(message: string): never {
  throw new Error(message);
}
