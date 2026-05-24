import type { SrdEntry } from "../srd/schema";

export type CompendiumKindFilter = "all" | SrdEntry["kind"];

export const compendiumKindFilters: CompendiumKindFilter[] = [
  "all",
  "rule_reference",
  "class",
  "subclass",
  "domain_card",
  "weapon",
];

export function searchCompendium(entries: SrdEntry[], query: string, kind: CompendiumKindFilter) {
  const normalizedQuery = query.trim().toLowerCase();

  return entries.filter((entry) => {
    if (kind !== "all" && entry.kind !== kind) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const searchableText = [
      entry.name,
      entry.kind,
      entry.text.original,
      entry.text.summary ?? "",
      entry.tags.join(" "),
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedQuery);
  });
}
