import type { SrdEntry } from "../srd/schema";

export interface FieldLink {
  entryId: string;
  entryKind: SrdEntry["kind"];
}

const rule = (entryId: string): FieldLink => ({ entryId, entryKind: "rule_reference" });

// Field values map to the rule reference that explains them. Keyed first by the
// semantic field name, then by the normalized value — this disambiguates values
// that mean different things in different fields (e.g. "social" is both an
// adversary role and an environment type). Extend by adding fields/values here.
export const fieldLinks: Record<string, Record<string, FieldLink>> = {
  trait: {
    agility: rule("rule.character_creation.traits"),
    strength: rule("rule.character_creation.traits"),
    finesse: rule("rule.character_creation.traits"),
    instinct: rule("rule.character_creation.traits"),
    presence: rule("rule.character_creation.traits"),
    knowledge: rule("rule.character_creation.traits"),
    spellcast: rule("rule.character_creation.traits"),
  },
  burden: {
    one_handed: rule("rule.equipment.weapon_burden"),
    two_handed: rule("rule.equipment.weapon_burden"),
  },
  category: {
    primary: rule("rule.equipment.weapon_categories"),
    secondary: rule("rule.equipment.weapon_categories"),
  },
  range: {
    melee: rule("rule.combat.maps_range_movement"),
    very_close: rule("rule.combat.maps_range_movement"),
    close: rule("rule.combat.maps_range_movement"),
    far: rule("rule.combat.maps_range_movement"),
    very_far: rule("rule.combat.maps_range_movement"),
  },
  damageType: {
    physical: rule("rule.combat.damage_types"),
    magic: rule("rule.combat.damage_types"),
    physical_or_magic: rule("rule.combat.damage_types"),
  },
  domain: {
    arcana: rule("rule.core.domains"),
    blade: rule("rule.core.domains"),
    bone: rule("rule.core.domains"),
    codex: rule("rule.core.domains"),
    grace: rule("rule.core.domains"),
    midnight: rule("rule.core.domains"),
    sage: rule("rule.core.domains"),
    splendor: rule("rule.core.domains"),
    valor: rule("rule.core.domains"),
  },
  cardType: {
    ability: rule("rule.core.domain_card_types"),
    spell: rule("rule.core.domain_card_types"),
    grimoire: rule("rule.core.domain_card_types"),
  },
  role: {
    bruiser: rule("rule.adversaries.types"),
    horde: rule("rule.adversaries.types"),
    leader: rule("rule.adversaries.types"),
    minion: rule("rule.adversaries.types"),
    ranged: rule("rule.adversaries.types"),
    skulk: rule("rule.adversaries.types"),
    social: rule("rule.adversaries.types"),
    solo: rule("rule.adversaries.types"),
    standard: rule("rule.adversaries.types"),
    support: rule("rule.adversaries.types"),
  },
  environmentType: {
    event: rule("rule.environments.types"),
    exploration: rule("rule.environments.types"),
    social: rule("rule.environments.types"),
    traversal: rule("rule.environments.types"),
  },
  lootType: {
    item: rule("rule.equipment.loot"),
    consumable: rule("rule.equipment.loot"),
  },
};

export function getFieldLink(field: string, value: string): FieldLink | null {
  return fieldLinks[field]?.[value.toLowerCase()] ?? null;
}
