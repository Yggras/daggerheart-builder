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
// Family search (used on per-kind list screens)
// ---------------------------------------------------------------------------

export function searchFamily(entries: SrdEntry[], query: string, filters: CompendiumFilters): SrdEntry[] {
  const normalizedQuery = query.trim().toLowerCase();

  return entries.filter((entry) => {
    // Always filter to the selected kind
    if (entry.kind !== filters.kind) return false;

    // Kind-specific sub-filters (TypeScript narrows entry.kind inside each block)
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

    // Text search
    if (!normalizedQuery) return true;

    const searchableText = [entry.name, entry.text.original, entry.text.summary ?? "", entry.tags.join(" ")]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedQuery);
  });
}
