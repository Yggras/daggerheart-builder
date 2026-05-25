import { fixtureEntries } from "./fixtureEntries";
import { SrdEntryCollectionSchema, type SrdEntry } from "./schema";

export const srdEntries = SrdEntryCollectionSchema.parse(fixtureEntries) satisfies SrdEntry[];

export function getSrdEntryById(id: string) {
  return srdEntries.find((entry) => entry.id === id) ?? null;
}

export function getRelatedEntries(entry: SrdEntry) {
  const relatedIds = new Set(entry.relationships.map((relationship) => relationship.targetId));

  if (entry.kind === "class") {
    for (const subclassId of entry.subclassIds) {
      relatedIds.add(subclassId);
    }
  }

  if (entry.kind === "subclass") {
    relatedIds.add(entry.classId);
  }

  return [...relatedIds]
    .map((id) => getSrdEntryById(id))
    .filter((relatedEntry): relatedEntry is SrdEntry => relatedEntry !== null);
}
