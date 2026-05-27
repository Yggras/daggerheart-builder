import type { SrdEntry } from "../srd/schema";

// ---------------------------------------------------------------------------
// Kind filter (used by overview navigation)
// ---------------------------------------------------------------------------

export const srdKinds: SrdEntry["kind"][] = [
  "adversary",
  "environment",
  "class",
  "subclass",
  "domain_card",
  "ancestry",
  "community",
  "weapon",
  "armor",
  "loot",
  "rule_reference",
];

// ---------------------------------------------------------------------------
// Sub-filter option constants (per kind)
// ---------------------------------------------------------------------------

export const adversaryTiers = [1, 2, 3, 4] as const;
export const adversaryRoles = [
  "bruiser",
  "horde",
  "leader",
  "minion",
  "ranged",
  "skulk",
  "social",
  "solo",
  "standard",
  "support",
] as const;
export const environmentTypes = ["event", "exploration", "social", "traversal"] as const;
export const weaponCategories = ["primary", "secondary"] as const;
export const domainCardDomains = [
  "arcana",
  "blade",
  "bone",
  "codex",
  "grace",
  "midnight",
  "sage",
  "splendor",
  "valor",
] as const;
export const lootTypes = ["item", "consumable"] as const;

// ---------------------------------------------------------------------------
// Filters interface
// ---------------------------------------------------------------------------

export interface CompendiumFilters {
  kind: SrdEntry["kind"];
  tier?: number | "all";
  role?: string | "all";
  environmentType?: string | "all";
  category?: string | "all";
  domain?: string | "all";
  lootType?: string | "all";
}

// ---------------------------------------------------------------------------
// Sort
// ---------------------------------------------------------------------------

export type SortOption = "name_asc" | "name_desc" | "tier_asc" | "tier_desc";

function getEntryTier(entry: SrdEntry): number {
  if ("tier" in entry && typeof entry.tier === "number") return entry.tier;
  return 0;
}

export function sortResults(entries: SrdEntry[], sort: SortOption): SrdEntry[] {
  const sorted = [...entries];
  switch (sort) {
    case "name_asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "name_desc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case "tier_asc":
      return sorted.sort((a, b) => getEntryTier(a) - getEntryTier(b) || a.name.localeCompare(b.name));
    case "tier_desc":
      return sorted.sort((a, b) => getEntryTier(b) - getEntryTier(a) || a.name.localeCompare(b.name));
  }
}

// ---------------------------------------------------------------------------
// Scoring (used for ranked search results)
// ---------------------------------------------------------------------------

function scoreEntry(entry: SrdEntry, normalizedQuery: string): number {
  const nameLower = entry.name.toLowerCase();

  if (nameLower === normalizedQuery) return 100;
  if (nameLower.startsWith(normalizedQuery)) return 80;

  const wordBoundary = new RegExp(`\\b${escapeRegex(normalizedQuery)}`);
  if (wordBoundary.test(nameLower)) return 60;
  if (nameLower.includes(normalizedQuery)) return 40;

  const summaryTags = [entry.text.summary ?? "", entry.tags.join(" ")].join(" ").toLowerCase();
  if (summaryTags.includes(normalizedQuery)) return 20;

  if (entry.text.original.toLowerCase().includes(normalizedQuery)) return 10;

  return 0;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ---------------------------------------------------------------------------
// Family search (used on per-kind list screens)
// ---------------------------------------------------------------------------

export function searchFamily(entries: SrdEntry[], query: string, filters: CompendiumFilters): SrdEntry[] {
  const normalizedQuery = query.trim().toLowerCase();

  const filtered = entries.filter((entry) => {
    if (entry.kind !== filters.kind) return false;

    if (entry.kind === "adversary") {
      if (filters.tier !== undefined && filters.tier !== "all" && entry.tier !== filters.tier) return false;
      if (filters.role !== undefined && filters.role !== "all" && entry.role !== filters.role) return false;
    }

    if (entry.kind === "environment") {
      if (filters.tier !== undefined && filters.tier !== "all" && entry.tier !== filters.tier) return false;
      if (
        filters.environmentType !== undefined &&
        filters.environmentType !== "all" &&
        entry.environmentType !== filters.environmentType
      )
        return false;
    }

    if (entry.kind === "weapon") {
      if (filters.tier !== undefined && filters.tier !== "all" && entry.tier !== filters.tier) return false;
      if (filters.category !== undefined && filters.category !== "all" && entry.category !== filters.category) return false;
    }

    if (entry.kind === "armor") {
      if (filters.tier !== undefined && filters.tier !== "all" && entry.tier !== filters.tier) return false;
    }

    if (entry.kind === "domain_card") {
      if (filters.domain !== undefined && filters.domain !== "all" && entry.domain !== filters.domain) return false;
    }

    if (entry.kind === "loot") {
      if (filters.lootType !== undefined && filters.lootType !== "all" && entry.lootType !== filters.lootType) return false;
    }

    if (!normalizedQuery) return true;

    return scoreEntry(entry, normalizedQuery) > 0;
  });

  if (normalizedQuery) {
    filtered.sort((a, b) => {
      const scoreA = scoreEntry(a, normalizedQuery);
      const scoreB = scoreEntry(b, normalizedQuery);
      if (scoreB !== scoreA) return scoreB - scoreA;
      return a.name.localeCompare(b.name);
    });
  }

  return filtered;
}
