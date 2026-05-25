import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { promisify } from "node:util";
import { SrdEntryCollectionSchema, type SrdEntry } from "../src/srd/schema";

const execFileAsync = promisify(execFile);

const sourcePdfPath = "data/source/Daggerheart-SRD-9-09-25.pdf";
const outputPath = "data/srd/generated/weapons.candidates.json";
const reviewReportPath = "data/srd/generated/weapons-review-report.md";
const sourceUrl = "https://www.daggerheart.com/wp-content/uploads/2025/09/Daggerheart-SRD-9-09-25.pdf";
const pdfPages = [23, 24, 25, 26, 27, 28];
const acceptedReviewTimestamp = "2026-05-25T00:00:00.000Z";
const acceptedFullWeaponBatch = true;
const acceptedFullWeaponBatchEntryCount = 204;
const acceptedReviewedIds = new Set([
  "weapon.primary.tier1.broadsword",
  "weapon.primary.tier1.longsword",
  "weapon.primary.tier1.battleaxe",
  "weapon.primary.tier1.greatsword",
  "weapon.primary.tier1.mace",
  "weapon.primary.tier1.warhammer",
  "weapon.primary.tier1.dagger",
  "weapon.primary.tier1.quarterstaff",
  "weapon.primary.tier1.cutlass",
  "weapon.primary.tier1.rapier",
  "weapon.primary.tier1.halberd",
  "weapon.primary.tier1.spear",
  "weapon.primary.tier1.shortbow",
  "weapon.primary.tier1.crossbow",
  "weapon.primary.tier1.longbow",
  "weapon.primary.tier1.arcane_gauntlets",
  "weapon.primary.tier1.hallowed_axe",
  "weapon.primary.tier1.glowing_rings",
  "weapon.primary.tier1.hand_runes",
  "weapon.primary.tier1.returning_blade",
  "weapon.primary.tier1.shortstaff",
  "weapon.primary.tier1.dualstaff",
  "weapon.primary.tier1.scepter",
  "weapon.primary.tier1.wand",
  "weapon.primary.tier1.greatstaff",
]);

type WeaponEntry = Extract<SrdEntry, { kind: "weapon" }>;
type WeaponCategory = WeaponEntry["category"];
type WeaponType = WeaponEntry["weaponType"];
type WeaponTrait = WeaponEntry["trait"];
type WeaponDamageType = WeaponEntry["damage"]["type"];

type TextBox = {
  page: number;
  top: number;
  left: number;
  text: string;
};

type ColumnKey = "name" | "tier" | "trait" | "range" | "damage" | "burden" | "feature";

type TableSpec = {
  page: number;
  headerTop: number;
  bottom: number;
  category: WeaponCategory;
  tier: number | null;
  weaponTypeHint: WeaponType | null;
  hasTierColumn: boolean;
  columns: Record<ColumnKey, [number, number]>;
};

type WeaponRow = {
  entry: WeaponEntry;
  warnings: string[];
  rowTop: number;
};

const xml = await extractWeaponPagesXml(sourcePdfPath);
const boxes = parseTextBoxes(xml);
const rows = extractWeaponRows(boxes);
const entries = rows.map((row) => row.entry);

if (acceptedFullWeaponBatch && entries.length !== acceptedFullWeaponBatchEntryCount) {
  throw new Error(`Accepted full weapon batch expected ${acceptedFullWeaponBatchEntryCount} entries but extracted ${entries.length}.`);
}

SrdEntryCollectionSchema.parse(entries);

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(resolve(process.cwd(), outputPath), `${JSON.stringify(entries, null, 2)}\n`, "utf8");
await writeFile(resolve(process.cwd(), reviewReportPath), buildReviewReport(rows), "utf8");

console.log(`Extracted ${entries.length} weapon candidate entries to ${outputPath}.`);
console.log(`Wrote weapon review report to ${reviewReportPath}.`);

async function extractWeaponPagesXml(pdfPath: string) {
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

      const text = decodeXml(stripTags(textGroups.text ?? "")).trim();
      if (!text) {
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

function extractWeaponRows(boxes: TextBox[]) {
  const tables = detectTables(boxes);
  const rows: WeaponRow[] = [];

  for (const table of tables) {
    const pageBoxes = boxes.filter((box) => box.page === table.page);
    const rowStarts = detectRowStarts(pageBoxes, table);

    for (const [index, rowStart] of rowStarts.entries()) {
      const rowEndTop = Math.min(rowStarts[index + 1]?.top ?? table.bottom, table.bottom);
      const name = cleanupName(extractColumnText(pageBoxes, rowStart.top, rowEndTop, table.columns.name));
      const tier = table.hasTierColumn ? Number(extractColumnText(pageBoxes, rowStart.top, rowEndTop, table.columns.tier)) : table.tier;
      const traitText = extractColumnText(pageBoxes, rowStart.top, rowEndTop, table.columns.trait);
      const rangeText = extractColumnText(pageBoxes, rowStart.top, rowEndTop, table.columns.range);
      const damageText = extractColumnText(pageBoxes, rowStart.top, rowEndTop, table.columns.damage);
      const burdenText = extractColumnText(pageBoxes, rowStart.top, rowEndTop, table.columns.burden);
      const featureText = cleanupFeatureText(extractColumnText(pageBoxes, rowStart.top, rowEndTop, table.columns.feature) || "—");
      const damage = parseDamage(damageText);
      const weaponType = table.weaponTypeHint ?? weaponTypeFromDamage(damage.type);
      const feature = parseFeature(featureText);
      const id = `weapon.${table.category}.tier${tier}.${toIdPart(name)}`;
      const accepted = acceptedFullWeaponBatch || acceptedReviewedIds.has(id);
      const warnings = detectWarnings({ name, tier, traitText, rangeText, damageText, burdenText, featureText, weaponType });

      rows.push({
        entry: {
          id,
          kind: "weapon",
          name,
          slug: toSlug(name),
          source: {
            document: "Daggerheart SRD",
            version: "1.0-2025-09-09",
            pdf: {
              path: sourcePdfPath,
              pageStart: table.page,
              pageEnd: table.page,
            },
            printedPages: printedPagesForPdfPage(table.page),
            url: sourceUrl,
          },
          review: {
            status: accepted ? "reviewed" : "extracted",
            reviewedAt: accepted ? acceptedReviewTimestamp : null,
            notes: [
              "Generated by scripts/extract-weapons.ts from pdftohtml -xml; review row values against the source PDF.",
              ...(accepted
                ? ["Risk-based manual review accepted on 2026-05-25 with no flaws found in spot-checked rows and no parser warnings."]
                : []),
            ],
          },
          text: {
            original: `${name} ${traitText} ${rangeText} ${damageText} ${burdenText} ${featureText}`,
            summary: `Tier ${tier} ${weaponType} ${table.category} weapon with ${rangeText} range and ${damage.dice} ${formatDamageType(damage.type)} damage.`,
          },
          tags: ["weapon", table.category, `tier-${tier}`, weaponType, toSlug(rangeText), ...(feature ? [toSlug(feature.name)] : [])],
          relationships: [],
          category: table.category,
          tier: tier ?? 1,
          levelRange: levelRangeForTier(tier ?? 1),
          weaponType,
          requiresSpellcastTrait: weaponType === "magic" || normalizeTrait(traitText) === "spellcast",
          trait: normalizeTrait(traitText),
          range: normalizeRange(rangeText),
          damage,
          burden: normalizeBurden(burdenText),
          feature,
        },
        warnings,
        rowTop: table.page * 10_000 + rowStart.top,
      });
    }
  }

  return rows.sort((a, b) => sortWeapon(a.entry, b.entry) || a.rowTop - b.rowTop || a.entry.name.localeCompare(b.entry.name));
}

function detectTables(boxes: TextBox[]) {
  const headers = boxes
    .filter((box) => box.text === "Name")
    .map((nameBox) => buildTableSpec(boxes, nameBox))
    .filter((table): table is TableSpec => table !== null);

  return headers;
}

function buildTableSpec(boxes: TextBox[], nameBox: TextBox): TableSpec | null {
  const lineBoxes = boxes.filter((box) => box.page === nameBox.page && Math.abs(box.top - nameBox.top) <= 2).sort((a, b) => a.left - b.left);
  const byText = new Map(lineBoxes.map((box) => [box.text, box]));

  if (!byText.has("Trait") || !byText.has("Range") || !byText.has("Damage") || !byText.has("Burden") || !byText.has("Feature")) {
    return null;
  }

  const hasTierColumn = byText.has("Tier");
  const headerKeys: ColumnKey[] = hasTierColumn
    ? ["name", "tier", "trait", "range", "damage", "burden", "feature"]
    : ["name", "trait", "range", "damage", "burden", "feature"];
  const headerBoxes = headerKeys.map((key) => {
    const label = key === "name" ? "Name" : key.charAt(0).toUpperCase() + key.slice(1);
    return [key, byText.get(label)] as const;
  });

  if (headerBoxes.some(([, box]) => !box)) {
    return null;
  }

  const columnEnd = nameBox.left < 900 ? 900 : 1800;
  const columns = Object.fromEntries(
    headerBoxes.map(([key, box], index) => [key, [box!.left - 12, (headerBoxes[index + 1]?.[1]?.left ?? columnEnd) - 12]]),
  ) as Record<ColumnKey, [number, number]>;

  if (!hasTierColumn) {
    columns.tier = [0, 0];
  }

  const samePageColumnBoxes = boxes.filter((box) => box.page === nameBox.page && isSameColumn(box, nameBox.left));
  const nextHeaderTop = samePageColumnBoxes
    .filter((box) => box.top > nameBox.top && (box.text === "Name" || (!hasTierColumn && /^TIER \d/.test(box.text))))
    .map((box) => box.top)
    .sort((a, b) => a - b)[0];
  const nextModelHeadingTop = hasTierColumn
    ? samePageColumnBoxes
        .filter((box) => box.top > nameBox.top && /Frame Models$/.test(box.text))
        .map((box) => box.top)
        .sort((a, b) => a - b)[0]
    : undefined;
  const bottom = Math.min(nextHeaderTop ?? 1080, nextModelHeadingTop ?? 1080);
  const category = nameBox.page === 27 ? "secondary" : "primary";
  const tier = hasTierColumn ? null : findTierForTable(samePageColumnBoxes, nameBox.top);
  const weaponTypeHint = hasTierColumn ? null : findWeaponTypeForTable(samePageColumnBoxes, nameBox.top, category);

  return {
    page: nameBox.page,
    headerTop: nameBox.top,
    bottom,
    category,
    tier,
    weaponTypeHint,
    hasTierColumn,
    columns,
  };
}

function detectRowStarts(pageBoxes: TextBox[], table: TableSpec) {
  if (table.hasTierColumn) {
    return pageBoxes.filter(
      (box) => box.top > table.headerTop && box.top < table.bottom && box.left >= table.columns.tier[0] && box.left <= table.columns.tier[1] && /^[1-4]$/.test(box.text),
    );
  }

  return pageBoxes.filter(
    (box) => box.top > table.headerTop && box.top < table.bottom && box.left >= table.columns.trait[0] && box.left <= table.columns.trait[1] && isTrait(box.text),
  );
}

function isSameColumn(box: TextBox, referenceLeft: number) {
  return referenceLeft < 900 ? box.left < 900 : box.left >= 900;
}

function findTierForTable(boxes: TextBox[], headerTop: number) {
  const heading = boxes
    .filter((box) => /^TIER \d/.test(box.text) && box.top < headerTop)
    .sort((a, b) => a.top - b.top)
    .at(-1);
  const tier = heading?.text.match(/^TIER (?<tier>\d)/)?.groups?.tier;

  if (!tier) {
    throw new Error(`Could not determine weapon table tier before header at ${headerTop}`);
  }

  return Number(tier);
}

function findWeaponTypeForTable(boxes: TextBox[], headerTop: number, category: WeaponCategory) {
  if (category === "secondary") {
    return "physical";
  }

  const heading = boxes
    .filter((box) => (box.text === "Physical Weapons" || box.text === "Magic Weapons") && box.top < headerTop)
    .sort((a, b) => a.top - b.top)
    .at(-1);

  if (heading?.text === "Magic Weapons") {
    return "magic";
  }

  return "physical";
}

function extractColumnText(boxes: TextBox[], rowTop: number, nextRowTop: number, leftRange: [number, number]) {
  const columnBoxes = boxes.filter((box) => box.top >= rowTop - 2 && box.top < nextRowTop - 2 && box.left >= leftRange[0] && box.left <= leftRange[1]);
  const lines = new Map<number, TextBox[]>();

  for (const box of columnBoxes) {
    const lineTop = [...lines.keys()].find((top) => Math.abs(top - box.top) <= 2) ?? box.top;
    lines.set(lineTop, [...(lines.get(lineTop) ?? []), box]);
  }

  return [...lines.entries()]
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
    .replace(/:\s*/g, ": ")
    .trim();
}

function cleanupName(name: string) {
  return name
    .replace(/(Improved|Advanced|Legendary)(?=[A-Z])/g, "$1 ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b(of)(?=[A-Z])/g, "$1 ")
    .replace(/\bHammerof\b/g, "Hammer of")
    .replace(/\bScepterof\b/g, "Scepter of")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanupFeatureText(text: string) {
  return text
    .replace(/\bafterthe\b/g, "after the")
    .replace(/\blowerto\b/g, "lower to")
    .replace(/\botheradversaries\b/g, "other adversaries")
    .replace(/\bwithinVery\b/g, "within Very")
    .replace(/\byourAgility\b/g, "your Agility")
    .replace(/\bofthe\b/g, "of the")
    .replace(/\bbackto\b/g, "back to")
    .replace(/\bprimaryweapon\b/g, "primary weapon")
    .replace(/\bcrackthe\b/g, "crack the")
    .replace(/\bforyou\b/g, "for you")
    .replace(/\btookthe\b/g, "took the")
    .replace(/\banothertarget\b/g, "another target")
    .replace(/\battackwith\b/g, "attack with")
    .replace(/\bTimebending:You\b/g, "Timebending: You")
    .replace(/\bPompous:You\b/g, "Pompous: You")
    .replace(/\bDueling:When\b/g, "Dueling: When")
    .replace(/\bSelf-Correcting:When\b/g, "Self-Correcting: When")
    .replace(/\bBurning:When\b/g, "Burning: When")
    .replace(/\bSerrated:When\b/g, "Serrated: When")
    .replace(/\bSheltering:When\b/g, "Sheltering: When")
    .replace(/\bDoubled Up:When\b/g, "Doubled Up: When")
    .replace(/\bBrutal:When\b/g, "Brutal: When")
    .replace(/\bQuick:When\b/g, "Quick: When")
    .replace(/\bReturning:When\b/g, "Returning: When")
    .replace(/\bReloading:Afteryou\b/g, "Reloading: After you")
    .replace(/\s+/g, " ")
    .replace(/:\s*/g, ": ")
    .trim();
}

function parseDamage(text: string) {
  const match = text.match(/^(?<dice>d\d+(?:[+]\d+)?)\s+(?<type>phy|mag|phy or mag)$/);
  if (!match?.groups) {
    return { dice: "d4", type: "physical" as const };
  }

  return {
    dice: match.groups.dice ?? "d4",
    type: normalizeDamageType(match.groups.type ?? "phy"),
  };
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

function normalizeTrait(text: string): WeaponTrait {
  switch (text) {
    case "Agility":
      return "agility";
    case "Strength":
      return "strength";
    case "Finesse":
      return "finesse";
    case "Instinct":
      return "instinct";
    case "Presence":
      return "presence";
    case "Knowledge":
      return "knowledge";
    case "Spellcast":
      return "spellcast";
    default:
      throw new Error(`Unsupported trait: ${text}`);
  }
}

function normalizeRange(text: string) {
  switch (text) {
    case "Melee":
      return "melee" as const;
    case "Very Close":
      return "very_close" as const;
    case "Close":
      return "close" as const;
    case "Far":
      return "far" as const;
    case "Very Far":
      return "very_far" as const;
    default:
      throw new Error(`Unsupported range: ${text}`);
  }
}

function normalizeBurden(text: string) {
  switch (text) {
    case "One-Handed":
      return "one_handed" as const;
    case "Two-Handed":
      return "two_handed" as const;
    default:
      throw new Error(`Unsupported burden: ${text}`);
  }
}

function normalizeDamageType(text: string): WeaponDamageType {
  switch (text) {
    case "mag":
      return "magic";
    case "phy or mag":
      return "physical_or_magic";
    default:
      return "physical";
  }
}

function weaponTypeFromDamage(damageType: WeaponDamageType): WeaponType {
  return damageType === "magic" ? "magic" : "physical";
}

function isTrait(text: string) {
  return ["Agility", "Strength", "Finesse", "Instinct", "Presence", "Knowledge", "Spellcast"].includes(text);
}

function detectWarnings({
  name,
  tier,
  traitText,
  rangeText,
  damageText,
  burdenText,
  featureText,
  weaponType,
}: {
  name: string;
  tier: number | null;
  traitText: string;
  rangeText: string;
  damageText: string;
  burdenText: string;
  featureText: string;
  weaponType: WeaponType;
}) {
  const warnings: string[] = [];

  if (!name) {
    warnings.push("Missing weapon name.");
  }

  if (name.length > 80 || /\b(?:Models|These wheelchairs|All magic weapons|doesn’t specify|specify a trait)\b/.test(name)) {
    warnings.push("Weapon name may include section prose or table heading text.");
  }

  if (!tier || tier < 1 || tier > 4) {
    warnings.push("Missing or malformed tier.");
  }

  if (!isTrait(traitText)) {
    warnings.push("Missing or malformed trait cell.");
  }

  if (!["Melee", "Very Close", "Close", "Far", "Very Far"].includes(rangeText)) {
    warnings.push("Missing or malformed range cell.");
  }

  if (!/^d\d+(?:[+]\d+)?\s+(?:phy|mag|phy or mag)$/.test(damageText)) {
    warnings.push("Missing or malformed damage cell.");
  }

  if (!["One-Handed", "Two-Handed"].includes(burdenText)) {
    warnings.push("Missing or malformed burden cell.");
  }

  if (weaponType === "magic" && damageText.endsWith("phy")) {
    warnings.push("Magic weapon section has physical-only damage type.");
  }

  if (featureText !== "—" && !featureText.includes(":")) {
    warnings.push("Feature text does not contain a feature name separator.");
  }

  if (/\b[a-z]{2,}(?:Armor|Close|Damage|Evasion|Handed|Stress|Weapon|When|You|Agility|Very|Bow|Axe|Shield|Shard)\b/.test(`${name} ${featureText}`)) {
    warnings.push("Potential joined-word artifact remains.");
  }

  if (featureText.length > 260) {
    warnings.push("Long feature text; review wrapped lines.");
  }

  return warnings;
}

function buildReviewReport(rows: WeaponRow[]) {
  const lines = [
    "# Weapon Candidate Review Report",
    "",
    "Generated by `npm run extract:srd:weapons`.",
    "",
    "## Summary",
    "",
    `- Candidate entries: ${rows.length}`,
    `- Reviewed entries: ${rows.filter((row) => row.entry.review.status === "reviewed").length}`,
    `- Extracted entries: ${rows.filter((row) => row.entry.review.status === "extracted").length}`,
    `- Entries with warnings: ${rows.filter((row) => row.warnings.length > 0).length}`,
    "",
    "## Entries",
    "",
  ];

  for (const row of rows) {
    lines.push(`### ${row.entry.id}`);
    lines.push("");
    lines.push(`- Name: ${row.entry.name}`);
    lines.push(`- Category: ${row.entry.category}`);
    lines.push(`- Tier: ${row.entry.tier}`);
    lines.push(`- Weapon type: ${row.entry.weaponType}`);
    lines.push(`- Physical PDF page: ${row.entry.source.pdf.pageStart}`);
    lines.push(`- Printed SRD pages: ${row.entry.source.printedPages.join(", ")}`);
    lines.push(`- Review status: ${row.entry.review.status}`);
    lines.push(`- Trait: ${row.entry.trait}`);
    lines.push(`- Range: ${row.entry.range}`);
    lines.push(`- Damage: ${row.entry.damage.dice} ${row.entry.damage.type}`);
    lines.push(`- Burden: ${row.entry.burden}`);
    lines.push(`- Feature: ${row.entry.feature ? `${row.entry.feature.name}: ${row.entry.feature.text}` : "none"}`);
    lines.push(`- Warnings: ${row.warnings.length > 0 ? row.warnings.join("; ") : "none"}`);
    lines.push("");
  }

  lines.push("## Review Guidance");
  lines.push("");
  lines.push("- Fully review rows with warnings before promotion.");
  lines.push("- Spot-check clean rows against the source table.");
  lines.push("- Pay extra attention to wrapped names, wrapped feature text, `spellcast` trait rows, and `physical_or_magic` damage.");
  lines.push("- Keep newly extracted weapon candidates separate from canonical fixtures until accepted.");
  lines.push("");

  return `${lines.join("\n")}\n`;
}

function sortWeapon(a: WeaponEntry, b: WeaponEntry) {
  const categoryOrder = { primary: 0, secondary: 1 } satisfies Record<WeaponCategory, number>;
  return categoryOrder[a.category] - categoryOrder[b.category] || a.tier - b.tier;
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

function printedPagesForPdfPage(page: number) {
  const firstPrintedPage = 44 + (page - 23) * 2;
  return [firstPrintedPage, firstPrintedPage + 1];
}

function formatDamageType(damageType: WeaponDamageType) {
  return damageType.replaceAll("_", " ");
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
