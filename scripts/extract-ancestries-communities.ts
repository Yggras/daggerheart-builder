import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { promisify } from "node:util";
import { SrdEntryCollectionSchema, type SrdEntry } from "../src/srd/schema";

const execFileAsync = promisify(execFile);

const sourcePdfPath = "data/source/Daggerheart-SRD-9-09-25.pdf";
const ancestryOutputPath = "data/srd/generated/ancestries.candidates.json";
const ancestryReviewReportPath = "data/srd/generated/ancestries-review-report.md";
const communityOutputPath = "data/srd/generated/communities.candidates.json";
const communityReviewReportPath = "data/srd/generated/communities-review-report.md";
const sourceUrl = "https://www.daggerheart.com/wp-content/uploads/2025/09/Daggerheart-SRD-9-09-25.pdf";
const pdfPages = [14, 15, 16, 17, 18] as const;
const acceptedReviewTimestamp = "2026-05-26T00:00:00.000Z";
const acceptedFullAncestryCommunityBatch = true;
const acceptedAncestryEntryCount = 18;
const acceptedCommunityEntryCount = 9;

type AncestryEntry = Extract<SrdEntry, { kind: "ancestry" }>;
type CommunityEntry = Extract<SrdEntry, { kind: "community" }>;

type FeatureSpec = {
  name: string;
  rawName?: string;
};

type AncestrySpec = {
  name: string;
  heading: string;
  nextHeading: string;
  pdfPage: number;
  printedPages: number[];
  tags: string[];
  features: FeatureSpec[];
};

type CommunitySpec = {
  name: string;
  heading: string;
  nextHeading: string;
  pdfPage: number;
  printedPages: number[];
  tags: string[];
  feature: FeatureSpec;
};

type CandidateRow<TEntry extends AncestryEntry | CommunityEntry> = {
  entry: TEntry;
  cleanupLabels: string[];
  warnings: string[];
};

const ancestrySpecs: AncestrySpec[] = [
  {
    name: "Clank",
    heading: "CLANK",
    nextHeading: "DRAKONA",
    pdfPage: 14,
    printedPages: [26, 27],
    tags: ["ancestry", "clank", "mechanical"],
    features: [{ name: "Purposeful Design" }, { name: "Efficient" }],
  },
  {
    name: "Drakona",
    heading: "DRAKONA",
    nextHeading: "DWARF",
    pdfPage: 14,
    printedPages: [26, 27],
    tags: ["ancestry", "drakona", "dragon", "elemental"],
    features: [{ name: "Scales" }, { name: "Elemental Breath" }],
  },
  {
    name: "Dwarf",
    heading: "DWARF",
    nextHeading: "ELF",
    pdfPage: 14,
    printedPages: [26, 27],
    tags: ["ancestry", "dwarf", "resilient"],
    features: [{ name: "Thick Skin" }, { name: "Increased Fortitude" }],
  },
  {
    name: "Elf",
    heading: "ELF",
    nextHeading: "FAERIE",
    pdfPage: 15,
    printedPages: [28, 29],
    tags: ["ancestry", "elf", "celestial"],
    features: [{ name: "Quick Reactions" }, { name: "Celestial Trance", rawName: "CelestialTrance" }],
  },
  {
    name: "Faerie",
    heading: "FAERIE",
    nextHeading: "FAUN",
    pdfPage: 15,
    printedPages: [28, 29],
    tags: ["ancestry", "faerie", "winged"],
    features: [{ name: "Luckbender" }, { name: "Wings" }],
  },
  {
    name: "Faun",
    heading: "FAUN",
    nextHeading: "FIRBOLG",
    pdfPage: 15,
    printedPages: [28, 29],
    tags: ["ancestry", "faun", "goat"],
    features: [{ name: "Caprine Leap" }, { name: "Kick" }],
  },
  {
    name: "Firbolg",
    heading: "FIRBOLG",
    nextHeading: "FUNGRIL",
    pdfPage: 15,
    printedPages: [28, 29],
    tags: ["ancestry", "firbolg", "bovine"],
    features: [{ name: "Charge" }, { name: "Unshakable" }],
  },
  {
    name: "Fungril",
    heading: "FUNGRIL",
    nextHeading: "GALAPA",
    pdfPage: 15,
    printedPages: [28, 29],
    tags: ["ancestry", "fungril", "fungal"],
    features: [{ name: "Fungril Network" }, { name: "Death Connection" }],
  },
  {
    name: "Galapa",
    heading: "GALAPA",
    nextHeading: "GIANT",
    pdfPage: 15,
    printedPages: [28, 29],
    tags: ["ancestry", "galapa", "turtle"],
    features: [{ name: "Shell" }, { name: "Retract" }],
  },
  {
    name: "Giant",
    heading: "GIANT",
    nextHeading: "GOBLIN",
    pdfPage: 15,
    printedPages: [28, 29],
    tags: ["ancestry", "giant", "large"],
    features: [{ name: "Endurance" }, { name: "Reach" }],
  },
  {
    name: "Goblin",
    heading: "GOBLIN",
    nextHeading: "HALFLING",
    pdfPage: 15,
    printedPages: [28, 29],
    tags: ["ancestry", "goblin", "perceptive"],
    features: [{ name: "Surefooted" }, { name: "Danger Sense", rawName: "DangerSense" }],
  },
  {
    name: "Halfling",
    heading: "HALFLING",
    nextHeading: "HUMAN",
    pdfPage: 15,
    printedPages: [28, 29],
    tags: ["ancestry", "halfling", "lucky"],
    features: [{ name: "Luckbringer" }, { name: "Internal Compass" }],
  },
  {
    name: "Human",
    heading: "HUMAN",
    nextHeading: "INFERNIS",
    pdfPage: 16,
    printedPages: [30, 31],
    tags: ["ancestry", "human", "adaptable"],
    features: [{ name: "High Stamina" }, { name: "Adaptability" }],
  },
  {
    name: "Infernis",
    heading: "INFERNIS",
    nextHeading: "KATARI",
    pdfPage: 16,
    printedPages: [30, 31],
    tags: ["ancestry", "infernis", "demonic"],
    features: [{ name: "Fearless" }, { name: "Dread Visage", rawName: "DreadVisage" }],
  },
  {
    name: "Katari",
    heading: "KATARI",
    nextHeading: "ORC",
    pdfPage: 16,
    printedPages: [30, 31],
    tags: ["ancestry", "katari", "feline"],
    features: [{ name: "Feline Instincts" }, { name: "Retracting Claws" }],
  },
  {
    name: "Orc",
    heading: "ORC",
    nextHeading: "RIBBET",
    pdfPage: 16,
    printedPages: [30, 31],
    tags: ["ancestry", "orc", "tusks"],
    features: [{ name: "Sturdy" }, { name: "Tusks" }],
  },
  {
    name: "Ribbet",
    heading: "RIBBET",
    nextHeading: "SIMIAH",
    pdfPage: 16,
    printedPages: [30, 31],
    tags: ["ancestry", "ribbet", "amphibious"],
    features: [{ name: "Amphibious" }, { name: "Long Tongue", rawName: "LongTongue" }],
  },
  {
    name: "Simiah",
    heading: "SIMIAH",
    nextHeading: "MIXED ANCESTRY",
    pdfPage: 16,
    printedPages: [30, 31],
    tags: ["ancestry", "simiah", "climber"],
    features: [{ name: "Natural Climber" }, { name: "Nimble" }],
  },
];

const communitySpecs: CommunitySpec[] = [
  {
    name: "Highborne",
    heading: "HIGHBORNE",
    nextHeading: "LOREBORNE",
    pdfPage: 17,
    printedPages: [32],
    tags: ["community", "highborne", "social", "wealth"],
    feature: { name: "Privilege" },
  },
  {
    name: "Loreborne",
    heading: "LOREBORNE",
    nextHeading: "ORDERBORNE",
    pdfPage: 17,
    printedPages: [32],
    tags: ["community", "loreborne", "knowledge", "politics"],
    feature: { name: "Well-Read" },
  },
  {
    name: "Orderborne",
    heading: "ORDERBORNE",
    nextHeading: "RIDGEBORNE",
    pdfPage: 17,
    printedPages: [32],
    tags: ["community", "orderborne", "discipline", "faith"],
    feature: { name: "Dedicated" },
  },
  {
    name: "Ridgeborne",
    heading: "RIDGEBORNE",
    nextHeading: "SEABORNE",
    pdfPage: 17,
    printedPages: [33],
    tags: ["community", "ridgeborne", "mountains", "survival"],
    feature: { name: "Steady" },
  },
  {
    name: "Seaborne",
    heading: "SEABORNE",
    nextHeading: "SLYBORNE",
    pdfPage: 17,
    printedPages: [33],
    tags: ["community", "seaborne", "water", "sailing"],
    feature: { name: "Know the Tide", rawName: "KnowtheTide" },
  },
  {
    name: "Slyborne",
    heading: "SLYBORNE",
    nextHeading: "UNDERBORNE",
    pdfPage: 17,
    printedPages: [33],
    tags: ["community", "slyborne", "criminal", "stealth"],
    feature: { name: "Scoundrel" },
  },
  {
    name: "Underborne",
    heading: "UNDERBORNE",
    nextHeading: "WANDERBORNE",
    pdfPage: 17,
    printedPages: [33],
    tags: ["community", "underborne", "subterranean", "engineering"],
    feature: { name: "Low-Light Living" },
  },
  {
    name: "Wanderborne",
    heading: "WANDERBORNE",
    nextHeading: "WILDBORNE",
    pdfPage: 18,
    printedPages: [34],
    tags: ["community", "wanderborne", "nomad", "travel"],
    feature: { name: "Nomadic Pack" },
  },
  {
    name: "Wildborne",
    heading: "WILDBORNE",
    nextHeading: "CORE MECHANICS",
    pdfPage: 18,
    printedPages: [34],
    tags: ["community", "wildborne", "forest", "nature"],
    feature: { name: "Lightfoot" },
  },
];

const cleanupRules = [
  { pattern: /\bancestryfeatures\b/g, replacement: "ancestry features", label: "ancestryfeatures -> ancestry features" },
  { pattern: /\bafteryou\b/g, replacement: "after you", label: "afteryou -> after you" },
  { pattern: /\bforyour\b/g, replacement: "for your", label: "foryour -> for your" },
  { pattern: /\borVery\b/g, replacement: "or Very", label: "orVery -> or Very" },
  { pattern: /\bmanyvarieties\b/g, replacement: "many varieties", label: "manyvarieties -> many varieties" },
  { pattern: /\bincrediblyvaried\b/g, replacement: "incredibly varied", label: "incrediblyvaried -> incredibly varied" },
  { pattern: /\beithervibrant\b/g, replacement: "either vibrant", label: "eithervibrant -> either vibrant" },
  { pattern: /\bAtypical\b/g, replacement: "A typical", label: "Atypical -> A typical" },
  { pattern: /\bAgilityRoll\b/g, replacement: "Agility Roll", label: "AgilityRoll -> Agility Roll" },
  { pattern: /\bhighlyvalue\b/g, replacement: "highly value", label: "highlyvalue -> highly value" },
  { pattern: /\borvalues\b/g, replacement: "or values", label: "orvalues -> or values" },
  { pattern: /\btheirvillages\b/g, replacement: "their villages", label: "theirvillages -> their villages" },
] satisfies Array<{ pattern: RegExp; replacement: string; label: string }>;

const rawText = await extractPdfText(sourcePdfPath);
const normalizedText = normalizeRawText(rawText);
const ancestryRows = addCrossEntryWarnings(ancestrySpecs.map((spec) => extractAncestry(spec, normalizedText)));
const communityRows = addCrossEntryWarnings(communitySpecs.map((spec) => extractCommunity(spec, normalizedText)));
const ancestryEntries = ancestryRows.map((row) => row.entry);
const communityEntries = communityRows.map((row) => row.entry);

if (acceptedFullAncestryCommunityBatch && ancestryEntries.length !== acceptedAncestryEntryCount) {
  throw new Error(`Accepted ancestry batch expected ${acceptedAncestryEntryCount} entries but extracted ${ancestryEntries.length}.`);
}

if (acceptedFullAncestryCommunityBatch && communityEntries.length !== acceptedCommunityEntryCount) {
  throw new Error(`Accepted community batch expected ${acceptedCommunityEntryCount} entries but extracted ${communityEntries.length}.`);
}

SrdEntryCollectionSchema.parse(ancestryEntries);
SrdEntryCollectionSchema.parse(communityEntries);

await mkdir(dirname(ancestryOutputPath), { recursive: true });
await writeFile(resolve(process.cwd(), ancestryOutputPath), `${JSON.stringify(ancestryEntries, null, 2)}\n`, "utf8");
await writeFile(resolve(process.cwd(), ancestryReviewReportPath), buildAncestryReviewReport(ancestryRows), "utf8");
await writeFile(resolve(process.cwd(), communityOutputPath), `${JSON.stringify(communityEntries, null, 2)}\n`, "utf8");
await writeFile(resolve(process.cwd(), communityReviewReportPath), buildCommunityReviewReport(communityRows), "utf8");

console.log(`Extracted ${ancestryEntries.length} ancestry candidate entries to ${ancestryOutputPath}.`);
console.log(`Wrote ancestry review report to ${ancestryReviewReportPath}.`);
console.log(`Extracted ${communityEntries.length} community candidate entries to ${communityOutputPath}.`);
console.log(`Wrote community review report to ${communityReviewReportPath}.`);

async function extractPdfText(pdfPath: string) {
  const { stdout } = await execFileAsync("pdftotext", [
    "-raw",
    "-f",
    String(Math.min(...pdfPages)),
    "-l",
    String(Math.max(...pdfPages)),
    pdfPath,
    "-",
  ]);
  return stdout;
}

function extractAncestry(spec: AncestrySpec, text: string): CandidateRow<AncestryEntry> {
  const rawSection = extractSection(text, spec.heading, spec.nextHeading);
  const section = applyCleanup(rawSection);
  const split = splitAtMarker(section.text, /ANCESTRY\s*FEATURES?/);
  const featureResults = spec.features.map((feature, index) => {
    const nextFeature = spec.features[index + 1];
    return extractFeature(split.afterMarker, feature, nextFeature);
  });
  const cleanupLabels = unique([...section.appliedLabels, ...featureResults.flatMap((feature) => feature.cleanupLabels)]);
  const description = split.beforeMarker;
  const features = featureResults.map((feature) => feature.feature);
  const warnings = detectEntryWarnings({ description, features, expectedFeatureCount: spec.features.length, markerFound: split.markerFound });

  return {
    entry: {
      id: `ancestry.${toIdPart(spec.name)}`,
      kind: "ancestry",
      name: spec.name,
      slug: toSlug(spec.name),
      source: sourceFor(spec.pdfPage, spec.printedPages),
      review: reviewFor("scripts/extract-ancestries-communities.ts", cleanupLabels, warnings),
      text: {
        original: description,
        summary: `A Daggerheart ancestry with ${features.map((feature) => feature.name).join(" and ")} features.`,
      },
      tags: spec.tags,
      relationships: [],
      features,
    },
    cleanupLabels,
    warnings,
  };
}

function extractCommunity(spec: CommunitySpec, text: string): CandidateRow<CommunityEntry> {
  const rawSection = extractSection(text, spec.heading, spec.nextHeading);
  const section = applyCleanup(rawSection);
  const split = splitAtMarker(section.text, /COMMUNITY\s*FEATURE/);
  const adjectiveResult = extractCommunityAdjectives(spec.name, split.beforeMarker);
  const featureResult = extractFeature(split.afterMarker, spec.feature);
  const cleanupLabels = unique([...section.appliedLabels, ...adjectiveResult.cleanupLabels, ...featureResult.cleanupLabels]);
  const warnings = detectEntryWarnings({
    description: adjectiveResult.description,
    features: [featureResult.feature],
    expectedFeatureCount: 1,
    markerFound: split.markerFound,
  });

  if (adjectiveResult.adjectives.length !== 6) {
    warnings.push(`Expected 6 community adjectives; extracted ${adjectiveResult.adjectives.length}.`);
  }

  return {
    entry: {
      id: `community.${toIdPart(spec.name)}`,
      kind: "community",
      name: spec.name,
      slug: toSlug(spec.name),
      source: sourceFor(spec.pdfPage, spec.printedPages),
      review: reviewFor("scripts/extract-ancestries-communities.ts", cleanupLabels, warnings),
      text: {
        original: adjectiveResult.description,
        summary: `A Daggerheart community associated with ${adjectiveResult.adjectives.slice(0, 3).join(", ")}, and related traits.`,
      },
      tags: spec.tags,
      relationships: [],
      adjectives: adjectiveResult.adjectives,
      feature: featureResult.feature,
    },
    cleanupLabels,
    warnings,
  };
}

function normalizeRawText(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\f/g, "\n")
    .replace(/\n\d+\s+\d+\s+Daggerheart SRD\s+Daggerheart SRD\s*(?=\n|$)/g, "\n")
    .replace(/[ \t]+\n/g, "\n");
}

function extractSection(text: string, heading: string, nextHeading: string) {
  const lines = text.split(/\n/);
  const startIndex = lines.findIndex((line) => line.trim() === heading);
  if (startIndex === -1) {
    throw new Error(`Could not find heading: ${heading}`);
  }

  const nextIndex = lines.findIndex((line, index) => index > startIndex && line.trim() === nextHeading);
  if (nextIndex === -1) {
    throw new Error(`Could not find next heading after ${heading}: ${nextHeading}`);
  }

  return normalizeExtractedLines(lines.slice(startIndex + 1, nextIndex));
}

function normalizeExtractedLines(lines: string[]) {
  return lines
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitAtMarker(text: string, marker: RegExp) {
  const match = marker.exec(text);
  marker.lastIndex = 0;

  if (!match) {
    return { beforeMarker: text, afterMarker: "", markerFound: false };
  }

  return {
    beforeMarker: text.slice(0, match.index).trim(),
    afterMarker: text.slice(match.index + match[0].length).trim(),
    markerFound: true,
  };
}

function extractFeature(text: string, feature: FeatureSpec, nextFeature?: FeatureSpec) {
  const rawName = feature.rawName ?? feature.name;
  const startToken = `${rawName}:`;
  const startIndex = text.indexOf(startToken);

  if (startIndex === -1) {
    return {
      feature: { name: feature.name, text: "Missing extracted feature text." },
      cleanupLabels: [],
    };
  }

  const textStart = startIndex + startToken.length;
  const nextToken = nextFeature ? `${nextFeature.rawName ?? nextFeature.name}:` : undefined;
  const endIndex = nextToken ? text.indexOf(nextToken, textStart) : -1;
  const rawFeatureText = text.slice(textStart, endIndex === -1 ? undefined : endIndex).trim();
  const cleaned = applyCleanup(rawFeatureText);

  return {
    feature: {
      name: feature.name,
      text: cleaned.text,
    },
    cleanupLabels: cleaned.appliedLabels,
  };
}

function extractCommunityAdjectives(name: string, text: string) {
  const pattern = new RegExp(`${name} are often (?<adjectives>[^.]+)\\.`);
  const match = text.match(pattern);

  if (!match?.groups) {
    return { description: text, adjectives: [], cleanupLabels: [] };
  }

  const cleanedAdjectives = applyCleanup(match.groups.adjectives ?? "");
  const adjectives = cleanedAdjectives.text
    .replace(/,?\s+and\s+/g, ", ")
    .split(",")
    .map((adjective) => adjective.trim())
    .filter(Boolean);

  return {
    description: text.slice(0, match.index).trim(),
    adjectives,
    cleanupLabels: cleanedAdjectives.appliedLabels,
  };
}

function applyCleanup(text: string) {
  const appliedLabels: string[] = [];
  let cleanedText = text;

  for (const rule of cleanupRules) {
    if (rule.pattern.test(cleanedText)) {
      appliedLabels.push(rule.label);
      cleanedText = cleanedText.replace(rule.pattern, rule.replacement);
    }

    rule.pattern.lastIndex = 0;
  }

  return { text: cleanedText.trim(), appliedLabels };
}

function detectEntryWarnings({
  description,
  features,
  expectedFeatureCount,
  markerFound,
}: {
  description: string;
  features: Array<{ name: string; text: string }>;
  expectedFeatureCount: number;
  markerFound: boolean;
}) {
  const warnings: string[] = [];

  if (!markerFound) {
    warnings.push("Feature heading marker was not found.");
  }

  if (!description) {
    warnings.push("Missing description text.");
  }

  if (features.length !== expectedFeatureCount || features.some((feature) => feature.text === "Missing extracted feature text.")) {
    warnings.push(`Expected ${expectedFeatureCount} feature(s); review extracted feature boundaries.`);
  }

  if (/Daggerheart SRD/.test(`${description} ${features.map((feature) => feature.text).join(" ")}`)) {
    warnings.push("Page footer leaked into extracted text.");
  }

  for (const token of detectSuspiciousTokens(`${description} ${features.map((feature) => `${feature.name} ${feature.text}`).join(" ")}`)) {
    warnings.push(`Potential joined-word artifact remains: ${token}.`);
  }

  return unique(warnings);
}

function addCrossEntryWarnings<TEntry extends AncestryEntry | CommunityEntry>(rows: Array<CandidateRow<TEntry>>) {
  const idCounts = countValues(rows.map((row) => row.entry.id));
  const slugCounts = countValues(rows.map((row) => `${row.entry.kind}:${row.entry.slug}`));

  return rows.map((row) => ({
    ...row,
    warnings: unique([
      ...row.warnings,
      ...((idCounts.get(row.entry.id) ?? 0) > 1 ? ["Duplicate generated id."] : []),
      ...((slugCounts.get(`${row.entry.kind}:${row.entry.slug}`) ?? 0) > 1 ? ["Duplicate generated slug within kind."] : []),
    ]),
  }));
}

function detectSuspiciousTokens(text: string) {
  const matches =
    text.match(
      /\b(?:[a-z]{2,}(?:Ancestry|Breath|Close|Compass|Die|Fear|Feature|Hope|Light|Roll|Skin|Stress|Tide|Tongue|Trance|Very|Visage)|[a-z]{2,}(?:origin|value|you|your|villages))\b/g,
    ) ?? [];
  return unique(matches).sort((a, b) => a.localeCompare(b));
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

function reviewFor(scriptPath: string, cleanupLabels: string[], warnings: string[]) {
  return {
    status: acceptedFullAncestryCommunityBatch ? ("reviewed" as const) : ("extracted" as const),
    reviewedAt: acceptedFullAncestryCommunityBatch ? acceptedReviewTimestamp : null,
    notes: [
      `Generated by ${scriptPath} from pdftotext -raw; review wording against the source PDF.`,
      ...(acceptedFullAncestryCommunityBatch ? ["Report-driven manual review accepted on 2026-05-26 with no flaws found."] : []),
      ...cleanupLabels.map((label) => `Parser cleanup applied: ${label}.`),
      ...warnings.map((warning) => `Parser warning: ${warning}`),
    ],
  };
}

function buildAncestryReviewReport(rows: Array<CandidateRow<AncestryEntry>>) {
  const lines = [
    "# Ancestry Candidate Review Report",
    "",
    "Generated by `npm run extract:srd:ancestries-communities`.",
    "",
    "## Summary",
    "",
    `- Candidate entries: ${rows.length}`,
    `- Reviewed entries: ${rows.filter((row) => row.entry.review.status === "reviewed").length}`,
    `- Extracted entries: ${rows.filter((row) => row.entry.review.status === "extracted").length}`,
    `- Entries with parser cleanup: ${rows.filter((row) => row.cleanupLabels.length > 0).length}`,
    `- Entries with warnings: ${rows.filter((row) => row.warnings.length > 0).length}`,
    "- Mixed Ancestry: not emitted as an ancestry candidate because the current schema models ancestry entries as feature-bearing ancestry cards.",
    "",
    "## Entries",
    "",
  ];

  for (const row of rows) {
    lines.push(`### ${row.entry.id}`);
    lines.push("");
    lines.push(`- Name: ${row.entry.name}`);
    lines.push(`- Physical PDF page: ${row.entry.source.pdf.pageStart}`);
    lines.push(`- Printed SRD pages: ${row.entry.source.printedPages.join(", ")}`);
    lines.push(`- Review status: ${row.entry.review.status}`);
    lines.push(`- Feature count: ${row.entry.features.length}`);
    lines.push(`- Features: ${row.entry.features.map((feature) => feature.name).join("; ")}`);
    lines.push(`- Text length: ${row.entry.text.original.length} characters`);
    lines.push(`- Text preview: ${previewText(row.entry.text.original)}`);
    lines.push(`- Parser cleanup: ${row.cleanupLabels.length > 0 ? row.cleanupLabels.join("; ") : "none"}`);
    lines.push(`- Warnings: ${row.warnings.length > 0 ? row.warnings.join("; ") : "none"}`);
    lines.push("");
  }

  lines.push("## Review Guidance");
  lines.push("");
  lines.push("- Fully review entries with warnings before promotion.");
  lines.push("- Spot-check entries with parser cleanup, especially joined words in feature text.");
  lines.push("- Confirm whether Mixed Ancestry should later become a rule_reference candidate or require a schema change.");
  lines.push("- Keep generated ancestry candidates separate from canonical fixtures until accepted.");
  lines.push("");

  return `${lines.join("\n")}\n`;
}

function buildCommunityReviewReport(rows: Array<CandidateRow<CommunityEntry>>) {
  const lines = [
    "# Community Candidate Review Report",
    "",
    "Generated by `npm run extract:srd:ancestries-communities`.",
    "",
    "## Summary",
    "",
    `- Candidate entries: ${rows.length}`,
    `- Reviewed entries: ${rows.filter((row) => row.entry.review.status === "reviewed").length}`,
    `- Extracted entries: ${rows.filter((row) => row.entry.review.status === "extracted").length}`,
    `- Entries with parser cleanup: ${rows.filter((row) => row.cleanupLabels.length > 0).length}`,
    `- Entries with warnings: ${rows.filter((row) => row.warnings.length > 0).length}`,
    "",
    "## Entries",
    "",
  ];

  for (const row of rows) {
    lines.push(`### ${row.entry.id}`);
    lines.push("");
    lines.push(`- Name: ${row.entry.name}`);
    lines.push(`- Physical PDF page: ${row.entry.source.pdf.pageStart}`);
    lines.push(`- Printed SRD pages: ${row.entry.source.printedPages.join(", ")}`);
    lines.push(`- Review status: ${row.entry.review.status}`);
    lines.push(`- Adjectives: ${row.entry.adjectives.join(", ")}`);
    lines.push(`- Feature: ${row.entry.feature.name}: ${row.entry.feature.text}`);
    lines.push(`- Text length: ${row.entry.text.original.length} characters`);
    lines.push(`- Text preview: ${previewText(row.entry.text.original)}`);
    lines.push(`- Parser cleanup: ${row.cleanupLabels.length > 0 ? row.cleanupLabels.join("; ") : "none"}`);
    lines.push(`- Warnings: ${row.warnings.length > 0 ? row.warnings.join("; ") : "none"}`);
    lines.push("");
  }

  lines.push("## Review Guidance");
  lines.push("");
  lines.push("- Fully review entries with warnings before promotion.");
  lines.push("- Spot-check adjective lists and community feature boundaries against the source PDF.");
  lines.push("- Pay extra attention to the page-18 boundary before Core Mechanics.");
  lines.push("- Keep generated community candidates separate from canonical fixtures until accepted.");
  lines.push("");

  return `${lines.join("\n")}\n`;
}

function previewText(text: string) {
  return text.length > 180 ? `${text.slice(0, 180)}...` : text;
}

function countValues(values: string[]) {
  return values.reduce((counts, value) => counts.set(value, (counts.get(value) ?? 0) + 1), new Map<string, number>());
}

function unique<T>(values: T[]) {
  return [...new Set(values)];
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
