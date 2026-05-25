import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { promisify } from "node:util";
import { SrdEntryCollectionSchema, type SrdEntry } from "../src/srd/schema";

const execFileAsync = promisify(execFile);

const sourcePdfPath = "data/source/Daggerheart-SRD-9-09-25.pdf";
const outputPath = "data/srd/generated/entries.candidates.json";
const reviewReportPath = "data/srd/generated/review-report.md";
const sourceUrl = "https://www.daggerheart.com/wp-content/uploads/2025/09/Daggerheart-SRD-9-09-25.pdf";
const acceptedReviewTimestamp = "2026-05-25T00:00:00.000Z";
const acceptedReviewedIds = new Set([
  "rule.core.hope_fear",
  "rule.core.hope",
  "rule.core.fear",
  "rule.combat.evasion",
  "rule.combat.hit_points_damage_thresholds",
  "rule.combat.stress",
  "rule.combat.damage_types",
  "rule.combat.resistance_immunity_direct_damage",
  "rule.combat.multi_target_attack_rolls",
  "rule.combat.multiple_damage_sources",
  "rule.combat.maps_range_movement",
  "rule.combat.movement_under_pressure",
  "rule.combat.area_of_effect",
  "rule.combat.line_of_sight_cover",
  "rule.combat.conditions",
  "rule.combat.temporary_tags_special_conditions",
]);

type RuleSpec = {
  id: string;
  name: string;
  slug: string;
  category: string;
  heading: string;
  nextHeading?: string;
  pdfPage: number;
  printedPages: number[];
  summary: string;
  tags: string[];
  headings: string[];
  dropLeadingText?: string;
};

type ExtractedRule = {
  entry: SrdEntry;
  appliedCleanupLabels: string[];
  suspiciousTokens: string[];
};

const ruleSpecs: RuleSpec[] = [
  {
    id: "rule.core.hope_fear",
    name: "Hope & Fear",
    slug: "hope-fear",
    category: "core mechanics",
    heading: "HOPE & FEAR",
    nextHeading: "HOPE",
    pdfPage: 20,
    printedPages: [38, 39],
    summary: "Introduces Hope and Fear as player and GM metacurrencies.",
    tags: ["rule", "core", "hope", "fear", "metacurrency"],
    headings: ["Core Mechanics", "Hope & Fear"],
  },
  {
    id: "rule.core.hope",
    name: "Hope",
    slug: "hope",
    category: "core mechanics",
    heading: "HOPE",
    nextHeading: "FEAR",
    pdfPage: 20,
    printedPages: [38, 39],
    summary: "Player metacurrency used to help allies, use experiences, initiate Tag Team Rolls, and activate Hope Features.",
    tags: ["rule", "core", "hope", "metacurrency"],
    headings: ["Core Mechanics", "Hope & Fear", "Hope"],
  },
  {
    id: "rule.core.fear",
    name: "Fear",
    slug: "fear",
    category: "core mechanics",
    heading: "FEAR",
    nextHeading: "COMBAT",
    pdfPage: 20,
    printedPages: [38, 39],
    summary: "GM metacurrency gained from rolls with Fear and spent on GM moves and Fear Features.",
    tags: ["rule", "core", "fear", "metacurrency"],
    headings: ["Core Mechanics", "Hope & Fear", "Fear"],
  },
  {
    id: "rule.combat.evasion",
    name: "Evasion",
    slug: "evasion",
    category: "combat",
    heading: "EVASION",
    nextHeading: "HIT POINTS & DAMAGE",
    pdfPage: 20,
    printedPages: [39],
    summary: "Defines Evasion as the target difficulty for rolls made against a PC.",
    tags: ["rule", "combat", "evasion", "difficulty"],
    headings: ["Combat", "Evasion"],
  },
  {
    id: "rule.combat.hit_points_damage_thresholds",
    name: "Hit Points & Damage Thresholds",
    slug: "hit-points-damage-thresholds",
    category: "combat",
    heading: "HIT POINTS & DAMAGE",
    nextHeading: "STRESS",
    pdfPage: 20,
    printedPages: [39],
    summary: "Explains how damage thresholds determine marked HP.",
    tags: ["rule", "combat", "hit-points", "damage-thresholds"],
    headings: ["Combat", "Hit Points & Damage Thresholds"],
    dropLeadingText: "THRESHOLDS ",
  },
  {
    id: "rule.combat.stress",
    name: "Stress",
    slug: "stress",
    category: "combat",
    heading: "STRESS",
    nextHeading: "ATTACKING",
    pdfPage: 20,
    printedPages: [39],
    summary: "Tracks mental, physical, and emotional strain and what happens when Stress fills.",
    tags: ["rule", "combat", "stress"],
    headings: ["Combat", "Stress"],
  },
  {
    id: "rule.combat.damage_types",
    name: "Damage Types",
    slug: "damage-types",
    category: "combat",
    heading: "DAMAGETYPES",
    nextHeading: "RESISTANCE, IMMUNITY,AND DIRECT",
    pdfPage: 21,
    printedPages: [40],
    summary: "Defines physical and magic damage types.",
    tags: ["rule", "combat", "damage", "physical", "magic"],
    headings: ["Combat", "Damage Types"],
  },
  {
    id: "rule.combat.resistance_immunity_direct_damage",
    name: "Resistance, Immunity, and Direct Damage",
    slug: "resistance-immunity-direct-damage",
    category: "combat",
    heading: "RESISTANCE, IMMUNITY,AND DIRECT",
    nextHeading: "MULTI-TARGETATTACK ROLLS",
    pdfPage: 21,
    printedPages: [40],
    summary: "Explains resistance, immunity, and direct damage interactions.",
    tags: ["rule", "combat", "resistance", "immunity", "direct-damage"],
    headings: ["Combat", "Resistance, Immunity, and Direct Damage"],
    dropLeadingText: "DAMAGE ",
  },
  {
    id: "rule.combat.multi_target_attack_rolls",
    name: "Multi-Target Attack Rolls",
    slug: "multi-target-attack-rolls",
    category: "combat",
    heading: "MULTI-TARGETATTACK ROLLS",
    nextHeading: "MULTIPLE DAMAGE SOURCES",
    pdfPage: 21,
    printedPages: [40],
    summary: "Explains how one attack and damage roll applies to multiple targets.",
    tags: ["rule", "combat", "attack-rolls", "multi-target"],
    headings: ["Combat", "Multi-Target Attack Rolls"],
  },
  {
    id: "rule.combat.multiple_damage_sources",
    name: "Multiple Damage Sources",
    slug: "multiple-damage-sources",
    category: "combat",
    heading: "MULTIPLE DAMAGE SOURCES",
    nextHeading: "MAPS, RANGE,",
    pdfPage: 21,
    printedPages: [40],
    summary: "Explains that simultaneous damage from multiple sources is totaled before threshold comparison.",
    tags: ["rule", "combat", "damage", "thresholds"],
    headings: ["Combat", "Multiple Damage Sources"],
  },
  {
    id: "rule.combat.maps_range_movement",
    name: "Maps, Range, and Movement",
    slug: "maps-range-movement",
    category: "combat",
    heading: "MAPS, RANGE,",
    nextHeading: "MOVEMENTUNDER PRESSURE",
    pdfPage: 21,
    printedPages: [40],
    summary: "Defines abstract range bands and their optional grid equivalents.",
    tags: ["rule", "combat", "range", "movement", "maps"],
    headings: ["Combat", "Maps, Range, and Movement"],
    dropLeadingText: "AND MOVEMENT ",
  },
  {
    id: "rule.combat.movement_under_pressure",
    name: "Movement Under Pressure",
    slug: "movement-under-pressure",
    category: "combat",
    heading: "MOVEMENTUNDER PRESSURE",
    nextHeading: "AREAOFEFFECT",
    pdfPage: 21,
    printedPages: [40],
    summary: "Explains movement while under pressure or in danger.",
    tags: ["rule", "combat", "movement", "pressure"],
    headings: ["Combat", "Movement Under Pressure"],
  },
  {
    id: "rule.combat.area_of_effect",
    name: "Area of Effect",
    slug: "area-of-effect",
    category: "combat",
    heading: "AREAOFEFFECT",
    nextHeading: "LINE OFSIGHT& COVER",
    pdfPage: 21,
    printedPages: [40],
    summary: "Defines the default origin and grouping requirement for group effects.",
    tags: ["rule", "combat", "area-of-effect", "targeting"],
    headings: ["Combat", "Area of Effect"],
  },
  {
    id: "rule.combat.line_of_sight_cover",
    name: "Line of Sight & Cover",
    slug: "line-of-sight-cover",
    category: "combat",
    heading: "LINE OFSIGHT& COVER",
    nextHeading: "CONDITIONS",
    pdfPage: 21,
    printedPages: [40, 41],
    summary: "Explains line of sight requirements and cover penalties for ranged attacks.",
    tags: ["rule", "combat", "line-of-sight", "cover", "ranged"],
    headings: ["Combat", "Line of Sight & Cover"],
  },
  {
    id: "rule.combat.conditions",
    name: "Conditions",
    slug: "conditions",
    category: "combat",
    heading: "CONDITIONS",
    nextHeading: "TEMPORARY TAGS",
    pdfPage: 21,
    printedPages: [41],
    summary: "Reference entry for standard and special conditions such as Hidden, Restrained, and Vulnerable.",
    tags: ["rule", "combat", "conditions"],
    headings: ["Combat", "Conditions"],
  },
  {
    id: "rule.combat.temporary_tags_special_conditions",
    name: "Temporary Tags & Special Conditions",
    slug: "temporary-tags-special-conditions",
    category: "combat",
    heading: "TEMPORARY TAGS",
    nextHeading: "DOWNTIME",
    pdfPage: 21,
    printedPages: [41],
    summary: "Explains clearing temporary tags and special conditions.",
    tags: ["rule", "combat", "temporary-tags", "conditions"],
    headings: ["Combat", "Temporary Tags & Special Conditions"],
    dropLeadingText: "& SPECIAL CONDITIONS ",
  },
  {
    id: "rule.combat.downtime",
    name: "Downtime",
    slug: "downtime",
    category: "combat",
    heading: "DOWNTIME",
    nextHeading: "DOWNTIME CONSEQUENCES",
    pdfPage: 21,
    printedPages: [41],
    summary: "Explains short rests, long rests, and downtime moves between conflicts.",
    tags: ["rule", "combat", "downtime", "rest"],
    headings: ["Combat", "Downtime"],
  },
  {
    id: "rule.combat.downtime_consequences",
    name: "Downtime Consequences",
    slug: "downtime-consequences",
    category: "combat",
    heading: "DOWNTIME CONSEQUENCES",
    pdfPage: 21,
    printedPages: [41],
    summary: "Explains GM Fear gain and countdown advancement after rests.",
    tags: ["rule", "combat", "downtime", "fear", "countdown"],
    headings: ["Combat", "Downtime Consequences"],
  },
];

const cleanupRules = [
  { pattern: /\banAlly\b/g, replacement: "an Ally", label: "anAlly -> an Ally" },
  { pattern: /\baTagTeam\b/g, replacement: "a Tag Team", label: "aTagTeam -> a Tag Team" },
  { pattern: /\bTagTeam\b/g, replacement: "Tag Team", label: "TagTeam -> Tag Team" },
  { pattern: /\bifyou\b/g, replacement: "if you", label: "ifyou -> if you" },
  { pattern: /\bIfyou\b/g, replacement: "If you", label: "Ifyou -> If you" },
  { pattern: /\bIfyour\b/g, replacement: "If your", label: "Ifyour -> If your" },
  { pattern: /\boryou\b/g, replacement: "or you", label: "oryou -> or you" },
  { pattern: /\bofsight\b/g, replacement: "of sight", label: "ofsight -> of sight" },
  { pattern: /\bofthe\b/g, replacement: "of the", label: "ofthe -> of the" },
  { pattern: /\bVeryClose\b/g, replacement: "Very Close", label: "VeryClose -> Very Close" },
  { pattern: /\bVeryFar\b/g, replacement: "Very Far", label: "VeryFar -> Very Far" },
  { pattern: /\bOut ofRange\b/g, replacement: "Out of Range", label: "Out ofRange -> Out of Range" },
  { pattern: /\bAweapon\b/g, replacement: "A weapon", label: "Aweapon -> A weapon" },
  { pattern: /\bSpecialconditions\b/g, replacement: "Special conditions", label: "Specialconditions -> Special conditions" },
  { pattern: /\bitem\.The\b/g, replacement: "item. The", label: "item.The -> item. The" },
  { pattern: /\btoWounds\b/g, replacement: "to Wounds", label: "toWounds -> to Wounds" },
  { pattern: /\btoAllWounds\b/g, replacement: "to All Wounds", label: "toAllWounds -> to All Wounds" },
  { pattern: /\bforyourself\b/g, replacement: "for yourself", label: "foryourself -> for yourself" },
  { pattern: /\bClearStress\b/g, replacement: "Clear Stress", label: "ClearStress -> Clear Stress" },
  { pattern: /\bClearAll Stress\b/g, replacement: "Clear All Stress", label: "ClearAll Stress -> Clear All Stress" },
  { pattern: /\bRepairArmor\b/g, replacement: "Repair Armor", label: "RepairArmor -> Repair Armor" },
  { pattern: /\bRepairAllArmor\b/g, replacement: "Repair All Armor", label: "RepairAllArmor -> Repair All Armor" },
  { pattern: /\bTierArmor\b/g, replacement: "Tier Armor", label: "TierArmor -> Tier Armor" },
  { pattern: /\bhowyou\b/g, replacement: "how you", label: "howyou -> how you" },
  { pattern: /\bend ofa\b/g, replacement: "end of a", label: "end ofa -> end of a" },
] satisfies Array<{ pattern: RegExp; replacement: string; label: string }>;

const pageTexts = await extractPdfPages(sourcePdfPath, unique(ruleSpecs.map((spec) => spec.pdfPage)));
const extractedRules = ruleSpecs.map((spec) => extractRule(spec, pageTexts.get(spec.pdfPage) ?? ""));
const entries = extractedRules.map((rule) => rule.entry);

SrdEntryCollectionSchema.parse(entries);

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(resolve(process.cwd(), outputPath), `${JSON.stringify(entries, null, 2)}\n`, "utf8");
await writeFile(resolve(process.cwd(), reviewReportPath), buildReviewReport(extractedRules), "utf8");

console.log(`Extracted ${entries.length} rule_reference candidate entries to ${outputPath}.`);
console.log(`Wrote parser review report to ${reviewReportPath}.`);

function extractRule(spec: RuleSpec, rawText: string): ExtractedRule {
  const rawSection = extractSection(rawText, spec.heading, spec.nextHeading);
  const normalizedSection = dropLeadingText(rawSection, spec.dropLeadingText);
  const cleaned = applyCleanup(normalizedSection.text);
  const appliedCleanupLabels = [...normalizedSection.appliedLabels, ...cleaned.appliedLabels];
  const suspiciousTokens = detectSuspiciousTokens(cleaned.text);
  const accepted = acceptedReviewedIds.has(spec.id);
  const notes = [
    "Generated by scripts/extract-rule-references.ts from pdftotext -raw; review wording against the source PDF.",
    ...(accepted ? ["Report-driven manual review accepted on 2026-05-25 with no flaws found."] : []),
    ...appliedCleanupLabels.map((label) => `Parser cleanup applied: ${label}.`),
    ...suspiciousTokens.map((token) => `Potential joined-word artifact remains: ${token}.`),
  ];

  return {
    entry: {
      id: spec.id,
      kind: "rule_reference" as const,
      name: spec.name,
      slug: spec.slug,
      source: {
        document: "Daggerheart SRD" as const,
        version: "1.0-2025-09-09",
        pdf: {
          path: sourcePdfPath,
          pageStart: spec.pdfPage,
          pageEnd: spec.pdfPage,
        },
        printedPages: spec.printedPages,
        url: sourceUrl,
      },
      review: {
        status: accepted ? "reviewed" : "extracted",
        reviewedAt: accepted ? acceptedReviewTimestamp : null,
        notes,
      },
      text: {
        original: cleaned.text,
        summary: spec.summary,
      },
      tags: spec.tags,
      relationships: [],
      category: spec.category,
      headings: spec.headings,
    },
    appliedCleanupLabels,
    suspiciousTokens,
  };
}

async function extractPdfPages(pdfPath: string, pages: number[]) {
  const entries = await Promise.all(pages.map(async (page) => [page, await extractPdfPage(pdfPath, page)] as const));
  return new Map(entries);
}

async function extractPdfPage(pdfPath: string, page: number) {
  const { stdout } = await execFileAsync("pdftotext", ["-raw", "-f", String(page), "-l", String(page), pdfPath, "-"]);
  return stdout;
}

function extractSection(rawText: string, heading: string, nextHeading: string | undefined) {
  const lines = rawText.split(/\r?\n/);
  const startIndex = lines.findIndex((line) => line.trim() === heading);

  if (startIndex === -1) {
    throw new Error(`Could not find heading: ${heading}`);
  }

  const nextIndex = nextHeading ? lines.findIndex((line, index) => index > startIndex && line.trim() === nextHeading) : lines.length;

  if (nextIndex === -1) {
    throw new Error(`Could not find next heading after ${heading}: ${nextHeading}`);
  }

  return removePageFooter(normalizeExtractedLines(lines.slice(startIndex + 1, nextIndex)));
}

function normalizeExtractedLines(lines: string[]) {
  return lines
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ");
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

  return { text: cleanedText, appliedLabels };
}

function removePageFooter(text: string) {
  return text.replace(/\s*\d+\s+\d+\s+Daggerheart SRD\s+Daggerheart SRD\s*$/, "");
}

function dropLeadingText(text: string, leadingText: string | undefined) {
  if (!leadingText || !text.startsWith(leadingText)) {
    return { text, appliedLabels: [] };
  }

  return {
    text: text.slice(leadingText.length),
    appliedLabels: [`dropped heading continuation: ${leadingText.trim()}`],
  };
}

function detectSuspiciousTokens(text: string) {
  const matches = text.match(/\b[a-z]{2,}(?:Ally|Armor|Close|Damage|Far|Range|Sight|Stress|Team|Wounds)[a-z]*\b/g) ?? [];
  return unique(matches).sort((a, b) => a.localeCompare(b));
}

function buildReviewReport(extractedRules: ExtractedRule[]) {
  const lines = [
    "# SRD Candidate Review Report",
    "",
    "Generated by `npm run extract:srd:rules`.",
    "",
    "## Summary",
    "",
    `- Candidate entries: ${extractedRules.length}`,
    `- Entries with parser cleanup: ${extractedRules.filter((rule) => rule.appliedCleanupLabels.length > 0).length}`,
    `- Entries with suspicious tokens: ${extractedRules.filter((rule) => rule.suspiciousTokens.length > 0).length}`,
    "",
    "## Entries",
    "",
  ];

  for (const rule of extractedRules) {
    lines.push(`### ${rule.entry.id}`);
    lines.push("");
    lines.push(`- Name: ${rule.entry.name}`);
    lines.push(`- Physical PDF page: ${rule.entry.source.pdf.pageStart}`);
    lines.push(`- Printed SRD pages: ${rule.entry.source.printedPages.join(", ")}`);
    lines.push(`- Review status: ${rule.entry.review.status}`);
    lines.push(
      `- Parser cleanup: ${rule.appliedCleanupLabels.length > 0 ? rule.appliedCleanupLabels.join("; ") : "none"}`,
    );
    lines.push(`- Suspicious tokens: ${rule.suspiciousTokens.length > 0 ? rule.suspiciousTokens.join(", ") : "none"}`);
    lines.push("");
  }

  lines.push("## Review Guidance");
  lines.push("");
  lines.push("- Spot-check entries with parser cleanup before promotion.");
  lines.push("- Fully review entries with suspicious tokens before promotion.");
  lines.push("- Preserve curly punctuation in `text.original` when it matches the source PDF.");
  lines.push("");

  return `${lines.join("\n")}\n`;
}

function unique<T>(values: T[]) {
  return [...new Set(values)];
}
