import type { SrdEntry } from "../srd/schema";

export interface FieldLink {
  entryId: string;
  entryKind: SrdEntry["kind"];
}

const rule = (entryId: string): FieldLink => ({ entryId, entryKind: "rule_reference" });

// Map from normalized field value → rule reference that explains it.
// Extend this registry as new rule references are added for other field values
// (domains, adversary roles, environment types, etc.).
export const fieldLinks: Record<string, FieldLink> = {
  // Traits
  agility: rule("rule.character_creation.traits"),
  strength: rule("rule.character_creation.traits"),
  finesse: rule("rule.character_creation.traits"),
  instinct: rule("rule.character_creation.traits"),
  presence: rule("rule.character_creation.traits"),
  knowledge: rule("rule.character_creation.traits"),
  spellcast: rule("rule.character_creation.traits"),
  // Burden
  one_handed: rule("rule.equipment.weapon_burden"),
  two_handed: rule("rule.equipment.weapon_burden"),
  // Categories
  primary: rule("rule.equipment.weapon_categories"),
  secondary: rule("rule.equipment.weapon_categories"),
  // Range
  melee: rule("rule.combat.maps_range_movement"),
  very_close: rule("rule.combat.maps_range_movement"),
  close: rule("rule.combat.maps_range_movement"),
  far: rule("rule.combat.maps_range_movement"),
  very_far: rule("rule.combat.maps_range_movement"),
  // Damage types
  physical: rule("rule.combat.damage_types"),
  magic: rule("rule.combat.damage_types"),
  physical_or_magic: rule("rule.combat.damage_types"),
};

export function getFieldLink(value: string): FieldLink | null {
  return fieldLinks[value.toLowerCase()] ?? null;
}
