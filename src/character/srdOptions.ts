import { srdEntries } from "../srd/loadFixture";
import type { SrdEntry } from "../srd/schema";

// Memoized selectors over canonical SRD data for the builder's option lists. Computed once at module
// load from the bundled fixtures.

type Of<K extends SrdEntry["kind"]> = Extract<SrdEntry, { kind: K }>;

export type ClassOption = Of<"class">;
export type SubclassOption = Of<"subclass">;
export type AncestryOption = Of<"ancestry">;
export type CommunityOption = Of<"community">;
export type WeaponOption = Of<"weapon">;
export type ArmorOption = Of<"armor">;
export type DomainCardOption = Of<"domain_card">;

const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name);

export const classes = srdEntries.filter((e): e is ClassOption => e.kind === "class").sort(byName);
export const ancestries = srdEntries.filter((e): e is AncestryOption => e.kind === "ancestry").sort(byName);
export const communities = srdEntries.filter((e): e is CommunityOption => e.kind === "community").sort(byName);

const allSubclasses = srdEntries.filter((e): e is SubclassOption => e.kind === "subclass");
const allWeapons = srdEntries.filter((e): e is WeaponOption => e.kind === "weapon");
const allDomainCards = srdEntries.filter((e): e is DomainCardOption => e.kind === "domain_card");

export const tier1PrimaryWeapons = allWeapons
  .filter((w) => w.tier === 1 && w.category === "primary")
  .sort(byName);
export const tier1SecondaryWeapons = allWeapons
  .filter((w) => w.tier === 1 && w.category === "secondary")
  .sort(byName);
export const tier1Armor = srdEntries
  .filter((e): e is ArmorOption => e.kind === "armor" && e.tier === 1)
  .sort(byName);

export function subclassesForClass(classId: string | null): SubclassOption[] {
  if (!classId) return [];
  return allSubclasses.filter((s) => s.classId === classId).sort(byName);
}

// Level-1 domain cards available to a class (its two domains), sorted by domain then name.
export function level1CardsForClass(classDomains: string[]): DomainCardOption[] {
  const domains = new Set(classDomains);
  return allDomainCards
    .filter((c) => c.level === 1 && domains.has(c.domain))
    .sort((a, b) => (a.domain === b.domain ? byName(a, b) : a.domain.localeCompare(b.domain)));
}

const TRAIT_LABELS: Record<string, string> = {
  agility: "Agility",
  strength: "Strength",
  finesse: "Finesse",
  instinct: "Instinct",
  presence: "Presence",
  knowledge: "Knowledge",
};

export function formatWeapon(weapon: WeaponOption): string {
  const trait = weapon.trait === "spellcast" ? "Spellcast" : TRAIT_LABELS[weapon.trait] ?? weapon.trait;
  const burden = weapon.burden === "two_handed" ? "Two-handed" : "One-handed";
  const range = weapon.range.replace(/_/g, " ");
  return `${weapon.damage.dice} ${weapon.damage.type} · ${trait} · ${burden} · ${range}`;
}

export function formatArmor(armor: ArmorOption): string {
  const major = armor.baseThresholds.major ?? "—";
  const severe = armor.baseThresholds.severe ?? "—";
  return `Thresholds ${major}/${severe} · Score ${armor.baseScore}`;
}
