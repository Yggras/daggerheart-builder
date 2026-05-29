import { getSrdEntryById } from "../srd/loadFixture";
import type { SrdEntry } from "../srd/schema";
import { CLANK_EXPERIENCE_CHOICE_KEY, STATIC_EFFECTS, type StaticEffect, type StaticEffectTarget } from "./effects";
import type { CharacterDefinition, TraitName } from "./schema";

// Pure rules engine: derive a character's sheet values from its build choices + canonical SRD data.
// Recomputed on load, never persisted (CBW-16). See spec §4.

export const STRESS_SLOTS_AT_CREATION = 6;
export const HOPE_AT_CREATION = 2;
export const PROFICIENCY_AT_LEVEL_1 = 1;

type ClassEntry = Extract<SrdEntry, { kind: "class" }>;
type SubclassEntry = Extract<SrdEntry, { kind: "subclass" }>;
type WeaponEntry = Extract<SrdEntry, { kind: "weapon" }>;
type ArmorEntry = Extract<SrdEntry, { kind: "armor" }>;

export type SrdLookup = (id: string) => SrdEntry | null;

export type AppliedEffect = {
  sourceId: string;
  target: StaticEffectTarget;
  value: number;
  label: string;
};

export type AttackLine = {
  weaponId: string;
  slot: "primary" | "secondary";
  attackTrait: TraitName | "spellcast";
  attackModifier: number | null;
  damageRoll: string | null;
  damageType: WeaponEntry["damage"]["type"];
};

export type DerivedExperience = { id: string; text: string; modifier: number };

export type DerivedStats = {
  traits: Record<TraitName, number | null>;
  evasion: number | null;
  hpMax: number | null;
  stressSlots: number;
  hope: number;
  proficiency: number;
  attacks: AttackLine[];
  armorScore: number | null;
  thresholds: { major: number | null; severe: number | null };
  spellcast: { trait: TraitName; modifier: number | null } | null;
  experiences: DerivedExperience[];
  appliedEffects: AppliedEffect[];
  companion?: {
    evasion: number;
    attack: { damageRoll: string | null; damageType: "physical" | "magic" | null; range: string };
  };
};

export function deriveCharacter(definition: CharacterDefinition, lookup: SrdLookup = getSrdEntryById): DerivedStats {
  const classEntry = byKind(lookup, definition.classId, "class");
  const subclassEntry = byKind(lookup, definition.subclassId, "subclass");
  const armorEntry = byKind(lookup, definition.equipment.armorId, "armor");
  const proficiency = PROFICIENCY_AT_LEVEL_1;

  const collected = collectEffects(definition);
  const appliedEffects: AppliedEffect[] = [];
  const numericEffects = collected.filter(({ effect }) => effect.target !== "experience");
  for (const { sourceId, effect } of numericEffects) {
    appliedEffects.push({ sourceId, target: effect.target, value: effect.value, label: effect.label });
  }

  const evasion =
    classEntry === null ? null : classEntry.startingEvasion + sumTarget(numericEffects, "evasion");
  const armorScore = armorEntry === null ? null : armorEntry.baseScore + sumTarget(numericEffects, "armorScore");
  const major =
    armorEntry === null || armorEntry.baseThresholds.major === null
      ? null
      : armorEntry.baseThresholds.major + definition.level + sumTarget(numericEffects, "majorThreshold");
  const severe =
    armorEntry === null || armorEntry.baseThresholds.severe === null
      ? null
      : armorEntry.baseThresholds.severe + definition.level + sumTarget(numericEffects, "severeThreshold");

  const spellcast =
    subclassEntry && subclassEntry.spellcastTrait
      ? { trait: subclassEntry.spellcastTrait, modifier: definition.traits[subclassEntry.spellcastTrait] ?? null }
      : null;

  const attacks: AttackLine[] = [];
  const primary = buildAttack(lookup, definition, "primary", definition.equipment.primaryWeaponId, proficiency, spellcast);
  if (primary) attacks.push(primary);
  const secondary = buildAttack(lookup, definition, "secondary", definition.equipment.secondaryWeaponId, proficiency, spellcast);
  if (secondary) attacks.push(secondary);

  const experiences = deriveExperiences(definition, collected, appliedEffects);

  const stats: DerivedStats = {
    traits: { ...definition.traits },
    evasion,
    hpMax: classEntry?.startingHitPoints ?? null,
    stressSlots: STRESS_SLOTS_AT_CREATION,
    hope: HOPE_AT_CREATION,
    proficiency,
    attacks,
    armorScore,
    thresholds: { major, severe },
    spellcast,
    experiences,
    appliedEffects,
  };

  if (definition.companion) {
    stats.companion = {
      evasion: definition.companion.evasion,
      attack: {
        damageRoll: buildDamageRoll(definition.companion.attack.damageDie, proficiency),
        damageType: definition.companion.attack.damageType,
        range: definition.companion.attack.range,
      },
    };
  }

  return stats;
}

function deriveExperiences(
  definition: CharacterDefinition,
  collected: Array<{ sourceId: string; effect: StaticEffect }>,
  appliedEffects: AppliedEffect[],
): DerivedExperience[] {
  const chosenExperienceId = definition.featureChoices[CLANK_EXPERIENCE_CHOICE_KEY];
  const experienceEffect = collected.find(({ effect }) => effect.target === "experience" && effect.experienceRef === "chosen");

  return definition.experiences.map((experience) => {
    let modifier = experience.modifier;
    if (experienceEffect && chosenExperienceId === experience.id) {
      modifier += experienceEffect.effect.value;
      appliedEffects.push({
        sourceId: experienceEffect.sourceId,
        target: "experience",
        value: experienceEffect.effect.value,
        label: experienceEffect.effect.label,
      });
    }
    return { id: experience.id, text: experience.text, modifier };
  });
}

function buildAttack(
  lookup: SrdLookup,
  definition: CharacterDefinition,
  slot: "primary" | "secondary",
  weaponId: string | null,
  proficiency: number,
  spellcast: { trait: TraitName; modifier: number | null } | null,
): AttackLine | null {
  const weapon = byKind(lookup, weaponId, "weapon");
  if (!weapon || !weaponId) return null;

  const attackModifier =
    weapon.trait === "spellcast" ? spellcast?.modifier ?? null : definition.traits[weapon.trait] ?? null;

  return {
    weaponId,
    slot,
    attackTrait: weapon.trait,
    attackModifier,
    damageRoll: buildDamageRoll(weapon.damage.dice, proficiency),
    damageType: weapon.damage.type,
  };
}

// Proficiency scales the NUMBER of dice only; any flat modifier is unchanged (SRD Step 5).
// "d6" @ prof 1 -> "1d6"; "d10+3" @ prof 2 -> "2d10+3".
export function buildDamageRoll(dice: string, proficiency: number): string | null {
  const match = /^d(\d+)([+-]\d+)?$/.exec(dice);
  if (!match) return null;
  const die = match[1];
  const flat = match[2] ?? "";
  return `${proficiency}d${die}${flat}`;
}

function collectEffects(definition: CharacterDefinition): Array<{ sourceId: string; effect: StaticEffect }> {
  const activeSlots = activeAncestrySlots(definition);
  const sourceIds = [
    definition.subclassId,
    definition.heritage.ancestry.primaryId,
    definition.heritage.ancestry.secondaryId,
  ].filter((id): id is string => Boolean(id));

  const result: Array<{ sourceId: string; effect: StaticEffect }> = [];
  const seen = new Set<string>();
  for (const sourceId of sourceIds) {
    if (seen.has(sourceId)) continue;
    seen.add(sourceId);
    const effects = STATIC_EFFECTS[sourceId];
    if (!effects) continue;
    for (const effect of effects) {
      if (effect.ancestrySlot && !activeSlots.has(`${sourceId}:${effect.ancestrySlot}`)) continue;
      result.push({ sourceId, effect });
    }
  }
  return result;
}

// Which ancestry-feature slots are active: single ancestry takes both; mixed takes the primary's top
// + the secondary's bottom (CBW-7).
function activeAncestrySlots(definition: CharacterDefinition): Set<string> {
  const slots = new Set<string>();
  const ancestry = definition.heritage.ancestry;
  if (!ancestry.primaryId) return slots;
  if (ancestry.mode === "single") {
    slots.add(`${ancestry.primaryId}:top`);
    slots.add(`${ancestry.primaryId}:bottom`);
  } else {
    slots.add(`${ancestry.primaryId}:top`);
    if (ancestry.secondaryId) slots.add(`${ancestry.secondaryId}:bottom`);
  }
  return slots;
}

function sumTarget(effects: Array<{ effect: StaticEffect }>, target: StaticEffectTarget): number {
  return effects.reduce((total, { effect }) => (effect.target === target ? total + effect.value : total), 0);
}

function byKind<K extends SrdEntry["kind"]>(
  lookup: SrdLookup,
  id: string | null,
  kind: K,
): Extract<SrdEntry, { kind: K }> | null {
  if (!id) return null;
  const entry = lookup(id);
  return entry && entry.kind === kind ? (entry as Extract<SrdEntry, { kind: K }>) : null;
}

// Re-exported for callers that need the unused-import guard (e.g. type-only consumers).
export type { ClassEntry, SubclassEntry, WeaponEntry, ArmorEntry };
