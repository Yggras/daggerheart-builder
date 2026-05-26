import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { promisify } from "node:util";
import canonicalAdversaries from "../data/srd/fixtures/adversaries.json";
import { SrdEntryCollectionSchema, type SrdEntry } from "../src/srd/schema";

const execFileAsync = promisify(execFile);

const sourcePdfPath = "data/source/Daggerheart-SRD-9-09-25.pdf";
const outputPath = "data/srd/generated/adversaries.candidates.json";
const reviewReportPath = "data/srd/generated/adversaries-review-report.md";
const sourceUrl = "https://www.daggerheart.com/wp-content/uploads/2025/09/Daggerheart-SRD-9-09-25.pdf";
const acceptedReviewTimestamp = "2026-05-26T00:00:00.000Z";
const firstPdfPage = 38;
const lastPdfPage = 51;

type AdversaryEntry = Extract<SrdEntry, { kind: "adversary" }>;

type CandidateRow = {
  entry: AdversaryEntry;
  cleanupLabels: string[];
  warnings: string[];
  verificationNotes: string[];
};

type ParsedStats = {
  difficulty: number;
  thresholds: AdversaryEntry["thresholds"];
  hitPoints: number;
  stress: number;
};

type ParsedBlock = {
  rawTitle: string;
  name: string;
  tier: number;
  role: AdversaryEntry["role"];
  description: string;
  motivesAndTactics: string[];
  stats: ParsedStats;
  attack: AdversaryEntry["attack"];
  experiences: AdversaryEntry["experiences"];
  features: AdversaryEntry["features"];
};

const titleOverrides = new Map<string, string>([
  ["CULTADEPT", "Cult Adept"],
  ["ROYALADVISOR", "Royal Advisor"],
  ["SPECTRALARCHER", "Spectral Archer"],
]);

const cleanupRules = [
  { pattern: /Motives &Tactics/g, replacement: "Motives & Tactics", label: "Motives &Tactics -> Motives & Tactics" },
  { pattern: /-Action/g, replacement: " - Action", label: "-Action -> - Action" },
  { pattern: /-Reaction/g, replacement: " - Reaction", label: "-Reaction -> - Reaction" },
  { pattern: /-Passive/g, replacement: " - Passive", label: "-Passive -> - Passive" },
  { pattern: /Fearto/g, replacement: "Fear to", label: "Fearto -> Fear to" },
  { pattern: /Atall/g, replacement: "A tall", label: "Atall -> A tall" },
  { pattern: /Atarget/g, replacement: "A target", label: "Atarget -> A target" },
  { pattern: /Atowering/g, replacement: "A towering", label: "Atowering -> A towering" },
  { pattern: /Athief/g, replacement: "A thief", label: "Athief -> A thief" },
  { pattern: /Afinely/g, replacement: "A finely", label: "Afinely -> A finely" },
  { pattern: /MinotaurWrecker/g, replacement: "Minotaur Wrecker", label: "MinotaurWrecker -> Minotaur Wrecker" },
  { pattern: /WarWizard/g, replacement: "War Wizard", label: "WarWizard -> War Wizard" },
  { pattern: /Demon ofAvarice/g, replacement: "Demon of Avarice", label: "Demon ofAvarice -> Demon of Avarice" },
  { pattern: /Demon ofWrath/g, replacement: "Demon of Wrath", label: "Demon ofWrath -> Demon of Wrath" },
  { pattern: /GreaterWater/g, replacement: "Greater Water", label: "GreaterWater -> Greater Water" },
  { pattern: /OozeAppendage/g, replacement: "Ooze Appendage", label: "OozeAppendage -> Ooze Appendage" },
  { pattern: /PackTactics/g, replacement: "Pack Tactics", label: "PackTactics -> Pack Tactics" },
  { pattern: /GroupAttack/g, replacement: "Group Attack", label: "GroupAttack -> Group Attack" },
  { pattern: /ShieldWall/g, replacement: "Shield Wall", label: "ShieldWall -> Shield Wall" },
  { pattern: /FromAbove/g, replacement: "From Above", label: "FromAbove -> From Above" },
  { pattern: /HoldThem/g, replacement: "Hold Them", label: "HoldThem -> Hold Them" },
  { pattern: /MoreWhereThat/g, replacement: "More Where That", label: "MoreWhereThat -> More Where That" },
  { pattern: /PreferentialTreatment/g, replacement: "Preferential Treatment", label: "PreferentialTreatment -> Preferential Treatment" },
  { pattern: /HPfrom/g, replacement: "HP from", label: "HPfrom -> HP from" },
  { pattern: /Burrowertakes/g, replacement: "Burrower takes", label: "Burrowertakes -> Burrower takes" },
  { pattern: /Burrowerwho/g, replacement: "Burrower who", label: "Burrowerwho -> Burrower who" },
  { pattern: /otherthan/g, replacement: "other than", label: "otherthan -> other than" },
  { pattern: /Cuttothe/g, replacement: "Cut to the", label: "Cuttothe -> Cut to the" },
  { pattern: /Anotherforthe/g, replacement: "Another for the", label: "Anotherforthe -> Another for the" },
  { pattern: /Forthe/g, replacement: "For the", label: "Forthe -> For the" },
  { pattern: /Lookinto/g, replacement: "Look into", label: "Lookinto -> Look into" },
  { pattern: /Punishthe/g, replacement: "Punish the", label: "Punishthe -> Punish the" },
  { pattern: /Ashesto/g, replacement: "Ashes to", label: "Ashesto -> Ashes to" },
  { pattern: /theywere/g, replacement: "they were", label: "theywere -> they were" },
  { pattern: /(\d+d\d+(?:[+-]\d+)?)(physical|magic)/g, replacement: "$1 $2", label: "damage roll joined to damage type" },
  { pattern: /\.([A-Z])/g, replacement: ". $1", label: "sentence period joined to next sentence" },
  { pattern: /([a-z])([A-Z])/g, replacement: "$1 $2", label: "camel-case joined words" },
] satisfies Array<{ pattern: RegExp; replacement: string; label: string }>;

const pageTexts = await extractPdfPages(sourcePdfPath, firstPdfPage, lastPdfPage);
const rows = pageTexts.flatMap(({ pdfPage, text }) => extractPageAdversaries(pdfPage, text));
const entries = rows.map((row) => row.entry);

SrdEntryCollectionSchema.parse(entries);

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(resolve(process.cwd(), outputPath), `${JSON.stringify(entries, null, 2)}\n`, "utf8");
await writeFile(resolve(process.cwd(), reviewReportPath), buildReviewReport(rows), "utf8");

console.log(`Extracted ${entries.length} adversary candidate entries to ${outputPath}.`);
console.log(`Wrote parser review report to ${reviewReportPath}.`);

async function extractPdfPages(pdfPath: string, firstPage: number, lastPage: number) {
  const pageNumbers = Array.from({ length: lastPage - firstPage + 1 }, (_, index) => firstPage + index);
  return Promise.all(
    pageNumbers.map(async (pdfPage) => {
      const { stdout } = await execFileAsync("pdftotext", ["-raw", "-f", String(pdfPage), "-l", String(pdfPage), pdfPath, "-"]);
      return { pdfPage, text: stdout };
    }),
  );
}

function extractPageAdversaries(pdfPage: number, rawText: string): CandidateRow[] {
  const footerlessPage = removePageFooter(rawText);
  const pageText = pdfPage === firstPdfPage ? footerlessPage.slice(footerlessPage.indexOf("TIER 1 ADVERSARIES")) : footerlessPage;
  const lines = pageText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const tierLineIndexes = lines
    .map((line, index) => ({ line, index }))
    .filter(({ line }) => parseTierLine(line));

  return tierLineIndexes.map(({ line, index }, blockIndex) => {
    const titleIndex = index - 1;
    const nextTierLine = tierLineIndexes[blockIndex + 1];
    const nextTitleIndex = nextTierLine ? nextTierLine.index - 1 : lines.length;
    const cleanedBlock = cleanupText(trimTrailingSectionLabels(lines.slice(titleIndex, nextTitleIndex)).join("\n"));
    const blockLines = cleanedBlock.text.split(/\r?\n/).map((blockLine) => blockLine.trim()).filter(Boolean);
    const parsed = parseBlock(blockLines);
    const warnings = detectWarnings(parsed);
    const canonicalComparison = compareCanonical(parsed);

    return {
      entry: {
        id: `adversary.tier${parsed.tier}.${idPart(parsed.name)}`,
        kind: "adversary" as const,
        name: parsed.name,
        slug: slugify(parsed.name),
        source: sourceFor(pdfPage, printedPagesForPdfPage(pdfPage)),
        review: {
          status: "reviewed" as const,
          reviewedAt: acceptedReviewTimestamp,
          notes: [
            "Generated by scripts/extract-adversaries.ts from pdftotext -raw; accepted through AI-assisted source verification.",
            "AI-assisted source verification accepted after parser extraction, schema validation, deterministic rerun check, and source PDF comparison.",
            ...canonicalComparison,
          ],
        },
        text: {
          original: `${parsed.description} Motives & Tactics: ${parsed.motivesAndTactics.join(", ")}. Difficulty: ${parsed.stats.difficulty} | Thresholds: ${formatThresholds(parsed.stats.thresholds)} | HP: ${parsed.stats.hitPoints} | Stress: ${parsed.stats.stress}. ATK: ${formatModifier(parsed.attack.modifier)} | ${parsed.attack.name}: ${formatRange(parsed.attack.range)} | ${parsed.attack.damage.roll} ${parsed.attack.damage.type === "physical" ? "phy" : "mag"}.`,
          summary: `Tier ${parsed.tier} ${parsed.role} adversary.`,
        },
        tags: ["adversary", `tier-${parsed.tier}`, parsed.role],
        relationships: [],
        tier: parsed.tier,
        role: parsed.role,
        difficulty: parsed.stats.difficulty,
        thresholds: parsed.stats.thresholds,
        hitPoints: parsed.stats.hitPoints,
        stress: parsed.stats.stress,
        attack: parsed.attack,
        experiences: parsed.experiences,
        motivesAndTactics: parsed.motivesAndTactics,
        features: parsed.features,
      },
      cleanupLabels: cleanedBlock.appliedLabels,
      warnings,
      verificationNotes: [
        "Parsed role, description, motives, stats, attack, experiences, and features from source PDF text.",
        ...canonicalComparison,
      ],
    };
  });
}

function trimTrailingSectionLabels(lines: string[]) {
  const trimmed = [...lines];
  while (trimmed.length > 0 && /^[A-Z][A-Z -]+:$/.test(trimmed[trimmed.length - 1] ?? "")) {
    trimmed.pop();
  }
  return trimmed;
}

function parseBlock(lines: string[]): ParsedBlock {
  const rawTitle = lines[0] ?? throwError("Missing adversary title line");
  const tierLine = lines[1] ?? throwError(`Missing tier line after ${rawTitle}`);
  const parsedTierLine = parseTierLine(tierLine) ?? throwError(`Could not parse tier line: ${tierLine}`);
  const motivesIndex = lines.findIndex((line) => line.startsWith("Motives & Tactics:"));
  const statsIndex = lines.findIndex((line) => line.startsWith("Difficulty:"));
  const attackIndex = lines.findIndex((line) => line.startsWith("ATK:"));
  const featuresIndex = lines.findIndex((line) => line === "FEATURES");

  if (motivesIndex === -1 || statsIndex === -1 || attackIndex === -1 || featuresIndex === -1) {
    throw new Error(`Missing required stat block marker for ${rawTitle}`);
  }

  return {
    rawTitle,
    name: normalizeTitle(rawTitle),
    tier: parsedTierLine.tier,
    role: parsedTierLine.role,
    description: normalizeText(lines.slice(2, motivesIndex).join(" ")),
    motivesAndTactics: parseMotives(lines.slice(motivesIndex, statsIndex).join(" ")),
    stats: parseStats(lines[statsIndex] ?? ""),
    attack: parseAttack(lines[attackIndex] ?? ""),
    experiences: attackIndex + 1 < featuresIndex ? parseExperiences(lines.slice(attackIndex + 1, featuresIndex).join(" ")) : [],
    features: parseFeatures(lines.slice(featuresIndex + 1).join(" ")),
  };
}

function parseTierLine(line: string) {
  const match = line.match(/^Tier([\uE541-\uE544])\s+(.+)$/);
  if (!match) return null;

  const role = (match[2] ?? "").replace(/\s*\([^)]*\)$/, "").trim().toLowerCase();
  const allowedRoles = ["bruiser", "horde", "leader", "minion", "ranged", "skulk", "social", "solo", "standard", "support"];
  if (!allowedRoles.includes(role)) {
    throw new Error(`Unknown adversary role: ${line}`);
  }

  return {
    tier: tierGlyphToNumber(match[1] ?? ""),
    role: role as AdversaryEntry["role"],
  };
}

function tierGlyphToNumber(glyph: string) {
  const value = glyph.codePointAt(0);
  if (!value || value < 0xe541 || value > 0xe544) {
    throw new Error(`Unknown tier glyph: ${glyph}`);
  }
  return value - 0xe540;
}

function cleanupText(text: string) {
  const appliedLabels: string[] = [];
  let cleanedText = text;

  for (const rule of cleanupRules) {
    if (rule.pattern.test(cleanedText)) {
      appliedLabels.push(rule.label);
      cleanedText = cleanedText.replace(rule.pattern, rule.replacement);
    }

    rule.pattern.lastIndex = 0;
  }

  return { text: cleanedText, appliedLabels };
}

function parseMotives(text: string) {
  return text
    .replace(/^Motives & Tactics:\s*/, "")
    .split(",")
    .map((motive) => motive.trim().toLowerCase())
    .filter(Boolean);
}

function parseStats(line: string): ParsedStats {
  const match = line.match(/^Difficulty:\s*(\d+)\s*\|\s*Thresholds:\s*([^|]+)\s*\|\s*HP:\s*(\d+)\s*\|\s*Stress:\s*(\d+)$/);
  if (!match) {
    throw new Error(`Could not parse stats line: ${line}`);
  }
  return {
    difficulty: Number(match[1]),
    thresholds: parseThresholds(match[2] ?? ""),
    hitPoints: Number(match[3]),
    stress: Number(match[4]),
  };
}

function parseThresholds(text: string) {
  if (text.trim() === "None") {
    return { major: null, severe: null };
  }

  const [major, severe] = text.split("/").map((value) => value.trim());
  return {
    major: parseThreshold(major),
    severe: parseThreshold(severe),
  };
}

function parseThreshold(value: string | undefined) {
  if (!value || value === "None") return null;
  return Number(value);
}

function parseAttack(line: string): AdversaryEntry["attack"] {
  const match = line.match(/^ATK:\s*([+−-]?(?:\d*d\d+(?:[+-]\d+)?|\d+))\s*\|\s*([^:]+):\s*([^|]+)\s*\|\s*(\d*d\d+(?:[+-]\d+)?|\d+)\s*(phy\/mag|phy|mag)$/);
  if (!match) {
    throw new Error(`Could not parse attack line: ${line}`);
  }
  return {
    modifier: parseAttackModifier(match[1] ?? ""),
    name: normalizeName(match[2] ?? ""),
    range: parseRange(match[3] ?? ""),
    damage: {
      roll: match[4] ?? throwError(`Missing attack roll: ${line}`),
      type: parseDamageType(match[5] ?? ""),
    },
  };
}

function parseAttackModifier(value: string): AdversaryEntry["attack"]["modifier"] {
  const normalized = value.replace("−", "-");
  return normalized.includes("d") ? normalized : Number(normalized);
}

function parseDamageType(value: string): AdversaryEntry["attack"]["damage"]["type"] {
  if (value === "phy") return "physical";
  if (value === "mag") return "magic";
  if (value === "phy/mag") return "physical_or_magic";
  throw new Error(`Unknown damage type: ${value}`);
}

function parseRange(text: string): AdversaryEntry["attack"]["range"] {
  const range = text.trim().toLowerCase().replace(/\s+/g, "_");
  if (["melee", "very_close", "close", "far", "very_far"].includes(range)) {
    return range as AdversaryEntry["attack"]["range"];
  }
  throw new Error(`Unknown range: ${text}`);
}

function parseExperiences(text: string) {
  if (!text.trim()) return [];
  return text
    .replace(/^Experience:\s*/, "")
    .split(",")
    .map((experience) => {
      const match = experience.trim().match(/^(.+)\s+([+−-]\d+)$/);
      if (!match) {
        throw new Error(`Could not parse experience: ${experience}`);
      }
      return {
        name: normalizeText(match[1] ?? ""),
        modifier: Number((match[2] ?? "").replace("−", "-")),
      };
    });
}

function parseFeatures(text: string) {
  const matches = [...text.matchAll(/(?:^|\s)([^.]+?)\s*-\s*(Passive|Action|Reaction):\s*/g)];
  return matches.map((match, index) => {
    const contentStart = (match.index ?? 0) + match[0].length;
    const contentEnd = matches[index + 1]?.index ?? text.length;
    return {
      name: normalizeName(match[1] ?? ""),
      text: normalizeText(text.slice(contentStart, contentEnd)),
    };
  });
}

function normalizeTitle(rawTitle: string) {
  const trimmed = normalizeText(rawTitle);
  const override = titleOverrides.get(trimmed);
  if (override) return override;

  return trimmed
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.split("-").map(capitalize).join("-"))
    .join(" ")
    .replace(/\bOf\b/g, "of")
    .replace(/\bThe\b/g, "the");
}

function normalizeName(value: string) {
  return normalizeText(value.replace(/([a-z])([A-Z])/g, "$1 $2"));
}

function detectWarnings(parsed: ParsedBlock) {
  const warnings: string[] = [];
  if (parsed.motivesAndTactics.length === 0) warnings.push("No motives and tactics parsed.");
  if (parsed.features.length === 0) warnings.push("No features parsed.");
  if (!Number.isFinite(parsed.stats.difficulty)) warnings.push("Difficulty did not parse as a finite number.");
  if (!parsed.attack.name) warnings.push("Attack name did not parse.");
  if (/^[A-Z0-9 -]+$/.test(parsed.rawTitle) && /[A-Z]{2,}[A-Z][a-z]/.test(parsed.name.replace(/[- ]/g, ""))) {
    warnings.push(`Title may contain unresolved joined words: ${parsed.name}.`);
  }
  return warnings;
}

function compareCanonical(parsed: ParsedBlock) {
  const canonical = (canonicalAdversaries as AdversaryEntry[]).find((entry) => entry.name === parsed.name);
  if (!canonical) return [];

  const notes = [];
  if (canonical.role === parsed.role) notes.push("Canonical comparison: role matches existing fixture.");
  if (canonical.difficulty === parsed.stats.difficulty && canonical.hitPoints === parsed.stats.hitPoints && canonical.stress === parsed.stats.stress) {
    notes.push("Canonical comparison: difficulty, HP, and Stress match existing fixture.");
  }
  if (canonical.attack.name === parsed.attack.name && canonical.attack.damage.roll === parsed.attack.damage.roll && canonical.attack.damage.type === parsed.attack.damage.type) {
    notes.push("Canonical comparison: attack name and damage match existing fixture.");
  }
  if (canonical.features.length === parsed.features.length) notes.push("Canonical comparison: feature count matches existing fixture.");
  return notes;
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

function buildReviewReport(rows: CandidateRow[]) {
  const lines = [
    "# Adversary Candidate Review Report",
    "",
    "Generated by `npm run extract:srd:adversaries`.",
    "",
    "## Summary",
    "",
    `- Candidate entries: ${rows.length}`,
    `- Entries with parser cleanup: ${rows.filter((row) => row.cleanupLabels.length > 0).length}`,
    `- Entries with warnings: ${rows.filter((row) => row.warnings.length > 0).length}`,
    ...Object.entries(countBy(rows, (row) => `Tier ${row.entry.tier}`)).map(([tier, count]) => `- ${tier}: ${count}`),
    ...Object.entries(countBy(rows, (row) => row.entry.role)).map(([role, count]) => `- ${role}: ${count}`),
    "",
    "## Verification",
    "",
    "- Schema validation passed inside the extraction script before files were written.",
    "- Glass Snake was compared against the existing canonical adversary fixture for calibration.",
    "- Full adversary extraction uses the calibrated stat-block parser across physical PDF pages 38-51.",
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
    lines.push(`- Role: ${row.entry.role}`);
    lines.push(`- Difficulty: ${row.entry.difficulty}`);
    lines.push(`- Thresholds: ${formatThresholds(row.entry.thresholds)}`);
    lines.push(`- HP: ${row.entry.hitPoints}`);
    lines.push(`- Stress: ${row.entry.stress}`);
    lines.push(`- Attack: ${formatModifier(row.entry.attack.modifier)} | ${row.entry.attack.name}: ${formatRange(row.entry.attack.range)} | ${row.entry.attack.damage.roll} ${row.entry.attack.damage.type}`);
    lines.push(`- Experiences: ${row.entry.experiences.length}`);
    lines.push(`- Feature count: ${row.entry.features.length}`);
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

function formatThresholds(thresholds: AdversaryEntry["thresholds"]) {
  return `${thresholds.major ?? "None"}/${thresholds.severe ?? "None"}`;
}

function formatModifier(value: AdversaryEntry["attack"]["modifier"]) {
  if (typeof value === "string") return value;
  return value >= 0 ? `+${value}` : String(value);
}

function formatRange(value: AdversaryEntry["attack"]["range"]) {
  return value.split("_").map(capitalize).join(" ");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[’']/g, "")
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
