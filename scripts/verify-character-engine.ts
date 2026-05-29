import { deriveCharacter } from "../src/character/engine";
import { CLANK_EXPERIENCE_CHOICE_KEY } from "../src/character/effects";
import { createEmptyDefinition, type CharacterDefinition } from "../src/character/schema";

// Verifies the pure rules engine against sample definitions (repo convention: tsx script, no test
// runner). Run via `npm run verify:engine`. Exits non-zero on the first failed assertion.

let failures = 0;
function check(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) {
    failures += 1;
    console.error(`✗ ${label}\n    expected: ${JSON.stringify(expected)}\n    actual:   ${JSON.stringify(actual)}`);
  } else {
    console.log(`✓ ${label}`);
  }
}

function def(mutate: (d: CharacterDefinition) => void): CharacterDefinition {
  const d = createEmptyDefinition();
  mutate(d);
  return d;
}

// --- Base Bard: constants + class-derived values ---
const bard = deriveCharacter(def((d) => void (d.classId = "class.bard")));
check("Bard Evasion = 10", bard.evasion, 10);
check("Bard HP max = 5", bard.hpMax, 5);
check("Stress slots = 6", bard.stressSlots, 6);
check("Hope = 2", bard.hope, 2);
check("Proficiency = 1", bard.proficiency, 1);

// --- Simiah single ancestry: Nimble (+1 Evasion) is active ---
const simiahSingle = deriveCharacter(
  def((d) => {
    d.classId = "class.bard";
    d.heritage.ancestry = { mode: "single", primaryId: "ancestry.simiah", secondaryId: null };
  }),
);
check("Simiah single Evasion = 11", simiahSingle.evasion, 11);
check("Simiah applied effect recorded", simiahSingle.appliedEffects, [
  { sourceId: "ancestry.simiah", target: "evasion", value: 1, label: "Simiah: Nimble" },
]);

// --- Mixed Ancestry slot awareness: Nimble is the BOTTOM feature ---
const simiahPrimaryMixed = deriveCharacter(
  def((d) => {
    d.classId = "class.bard";
    d.heritage.ancestry = { mode: "mixed", primaryId: "ancestry.simiah", secondaryId: "ancestry.clank" };
  }),
);
check("Simiah as PRIMARY in mixed → top feature only, no Evasion bonus = 10", simiahPrimaryMixed.evasion, 10);

const simiahSecondaryMixed = deriveCharacter(
  def((d) => {
    d.classId = "class.bard";
    d.heritage.ancestry = { mode: "mixed", primaryId: "ancestry.clank", secondaryId: "ancestry.simiah" };
  }),
);
check("Simiah as SECONDARY in mixed → bottom feature (Nimble) active = 11", simiahSecondaryMixed.evasion, 11);

// --- Stalwart (Guardian) + Gambeson armor: +1 to both thresholds ---
const stalwart = deriveCharacter(
  def((d) => {
    d.classId = "class.guardian";
    d.subclassId = "subclass.guardian.stalwart";
    d.equipment.armorId = "armor.tier1.gambeson_armor";
  }),
);
check("Guardian Evasion = 9", stalwart.evasion, 9);
check("Stalwart Major threshold = 5 + 1 (level) + 1 (Unwavering) = 7", stalwart.thresholds.major, 7);
check("Stalwart Severe threshold = 11 + 1 + 1 = 13", stalwart.thresholds.severe, 13);
check("Armor Score = 3", stalwart.armorScore, 3);

// --- Damage roll: proficiency scales dice count only ---
const weapons = deriveCharacter(
  def((d) => {
    d.classId = "class.bard";
    d.traits.agility = 1;
    d.equipment.primaryWeaponId = "weapon.primary.tier1.broadsword"; // d8, agility, one-handed
  }),
);
check("Broadsword damage roll = 1d8", weapons.attacks[0]?.damageRoll, "1d8");
check("Broadsword attack trait = agility", weapons.attacks[0]?.attackTrait, "agility");
check("Broadsword attack modifier from Agility = 1", weapons.attacks[0]?.attackModifier, 1);

const longsword = deriveCharacter(
  def((d) => {
    d.classId = "class.bard";
    d.equipment.primaryWeaponId = "weapon.primary.tier1.longsword"; // d10+3
  }),
);
check("Longsword damage roll keeps flat mod = 1d10+3", longsword.attacks[0]?.damageRoll, "1d10+3");

// --- Spellcast weapon uses the subclass Spellcast trait modifier ---
const spellcaster = deriveCharacter(
  def((d) => {
    d.classId = "class.bard";
    d.subclassId = "subclass.bard.troubadour"; // Spellcast trait: presence
    d.traits.presence = 1;
    d.equipment.primaryWeaponId = "weapon.primary.tier1.arcane_frame_wheelchair"; // trait: spellcast
  }),
);
check("Spellcast weapon attack trait = spellcast", spellcaster.attacks[0]?.attackTrait, "spellcast");
check("Spellcast weapon modifier uses Presence = 1", spellcaster.attacks[0]?.attackModifier, 1);
check("Troubadour Spellcast = presence@1", spellcaster.spellcast, { trait: "presence", modifier: 1 });

// --- Clank "Purposeful Design": +1 to the chosen Experience ---
const clank = deriveCharacter(
  def((d) => {
    d.classId = "class.bard";
    d.heritage.ancestry = { mode: "single", primaryId: "ancestry.clank", secondaryId: null };
    d.experiences = [
      { id: "exp-1", text: "Bounty Hunter", modifier: 2 },
      { id: "exp-2", text: "Bookworm", modifier: 2 },
    ];
    d.featureChoices[CLANK_EXPERIENCE_CHOICE_KEY] = "exp-1";
  }),
);
check("Clank chosen Experience modifier = 3", clank.experiences.find((e) => e.id === "exp-1")?.modifier, 3);
check("Clank other Experience modifier = 2", clank.experiences.find((e) => e.id === "exp-2")?.modifier, 2);
check("Clank Evasion unaffected = 10", clank.evasion, 10);

// --- Companion (Beastbound): damage uses PC proficiency × companion die ---
const withCompanion = deriveCharacter(
  def((d) => {
    d.classId = "class.ranger";
    d.subclassId = "subclass.ranger.beastbound";
    d.companion = {
      name: "Rook",
      animalKind: "Hawk",
      evasion: 10,
      experiences: [],
      attack: { description: "Talons", range: "melee", damageDie: "d6", damageType: "physical" },
    };
  }),
);
check("Companion Evasion = 10", withCompanion.companion?.evasion, 10);
check("Companion damage roll = 1d6", withCompanion.companion?.attack.damageRoll, "1d6");

if (failures > 0) {
  console.error(`\n${failures} engine assertion(s) failed.`);
  process.exit(1);
}
console.log("\nAll engine assertions passed.");
