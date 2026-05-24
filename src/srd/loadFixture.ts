import fixtureEntries from "../../data/srd/fixtures/entries.json";
import { SrdEntryCollectionSchema, type SrdEntry } from "./schema";

export const srdEntries = SrdEntryCollectionSchema.parse(fixtureEntries) satisfies SrdEntry[];

export function getSrdEntryById(id: string) {
  return srdEntries.find((entry) => entry.id === id) ?? null;
}
