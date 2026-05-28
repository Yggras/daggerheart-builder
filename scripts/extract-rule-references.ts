import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { promisify } from "node:util";
import { SrdEntryCollectionSchema, type SrdEntry } from "../src/srd/schema";

const execFileAsync = promisify(execFile);

const sourcePdfPath = "data/source/Daggerheart-SRD-9-09-25.pdf";
const outputPath = "data/srd/generated/entries.candidates.json";
const reviewReportPath = "data/srd/generated/review-report.md";
const sourceUrl = "https://www.daggerheart.com/wp-content/uploads/2025/09/Daggerheart-SRD-9-09-25.pdf";
const acceptedReviewTimestamp = "2026-05-25T00:00:00.000Z";
const mixedAncestryReviewTimestamp = "2026-05-26T00:00:00.000Z";
const acceptedReviewedIds = new Set([
  "rule.character_creation.mixed_ancestry",
  "rule.core.hope_fear",
  "rule.core.hope",
  "rule.core.fear",
  "rule.combat.evasion",
  "rule.combat.hit_points_damage_thresholds",
  "rule.combat.stress",
  "rule.combat.damage_types",
  "rule.combat.resistance_immunity_direct_damage",
  "rule.combat.multi_target_attack_rolls",
  "rule.combat.multiple_damage_sources",
  "rule.combat.maps_range_movement",
  "rule.combat.movement_under_pressure",
  "rule.combat.area_of_effect",
  "rule.combat.line_of_sight_cover",
  "rule.combat.conditions",
  "rule.combat.temporary_tags_special_conditions",
  "rule.combat.downtime",
  "rule.combat.downtime_consequences",
  "rule.combat.death",
  "rule.additional.rounding_up",
  "rule.additional.rerolling_dice",
  "rule.additional.incoming_damage",
  "rule.additional.simultaneous_effects",
  "rule.additional.stacking_effects",
  "rule.additional.ongoing_spell_effects",
  "rule.additional.spending_resources",
  "rule.additional.using_features_after_a_roll",
  "rule.advancement.leveling_up",
  "rule.advancement.tier_achievements",
  "rule.advancement.advancements",
  "rule.advancement.damage_thresholds",
  "rule.advancement.domain_cards",
  "rule.advancement.multiclassing",
]);

type RuleSpec = {
  id: string;
  name: string;
  slug: string;
  category: string;
  heading: string;
  nextHeading?: string;
  pdfPage: number;
  printedPages: number[];
  summary: string;
  tags: string[];
  headings: string[];
  dropLeadingText?: string;
};

type ExtractedRule = {
  entry: SrdEntry;
  appliedCleanupLabels: string[];
  suspiciousTokens: string[];
};

const ruleSpecs: RuleSpec[] = [
  {
    id: "rule.character_creation.mixed_ancestry",
    name: "Mixed Ancestry",
    slug: "mixed-ancestry",
    category: "character creation",
    heading: "MIXED ANCESTRY",
    pdfPage: 16,
    printedPages: [30, 31],
    summary: "Explains how to represent characters descended from multiple ancestries.",
    tags: ["rule", "character-creation", "ancestry", "mixed-ancestry"],
    headings: ["Character Creation", "Ancestries", "Mixed Ancestry"],
  },
  {
    id: "rule.core.hope_fear",
    name: "Hope & Fear",
    slug: "hope-fear",
    category: "core mechanics",
    heading: "HOPE & FEAR",
    nextHeading: "HOPE",
    pdfPage: 20,
    printedPages: [38, 39],
    summary: "Introduces Hope and Fear as player and GM metacurrencies.",
    tags: ["rule", "core", "hope", "fear", "metacurrency"],
    headings: ["Core Mechanics", "Hope & Fear"],
  },
  {
    id: "rule.core.hope",
    name: "Hope",
    slug: "hope",
    category: "core mechanics",
    heading: "HOPE",
    nextHeading: "FEAR",
    pdfPage: 20,
    printedPages: [38, 39],
    summary: "Player metacurrency used to help allies, use experiences, initiate Tag Team Rolls, and activate Hope Features.",
    tags: ["rule", "core", "hope", "metacurrency"],
    headings: ["Core Mechanics", "Hope & Fear", "Hope"],
  },
  {
    id: "rule.core.fear",
    name: "Fear",
    slug: "fear",
    category: "core mechanics",
    heading: "FEAR",
    nextHeading: "COMBAT",
    pdfPage: 20,
    printedPages: [38, 39],
    summary: "GM metacurrency gained from rolls with Fear and spent on GM moves and Fear Features.",
    tags: ["rule", "core", "fear", "metacurrency"],
    headings: ["Core Mechanics", "Hope & Fear", "Fear"],
  },
  {
    id: "rule.combat.evasion",
    name: "Evasion",
    slug: "evasion",
    category: "combat",
    heading: "EVASION",
    nextHeading: "HIT POINTS & DAMAGE",
    pdfPage: 20,
    printedPages: [39],
    summary: "Defines Evasion as the target difficulty for rolls made against a PC.",
    tags: ["rule", "combat", "evasion", "difficulty"],
    headings: ["Combat", "Evasion"],
  },
  {
    id: "rule.combat.hit_points_damage_thresholds",
    name: "Hit Points & Damage Thresholds",
    slug: "hit-points-damage-thresholds",
    category: "combat",
    heading: "HIT POINTS & DAMAGE",
    nextHeading: "STRESS",
    pdfPage: 20,
    printedPages: [39],
    summary: "Explains how damage thresholds determine marked HP.",
    tags: ["rule", "combat", "hit-points", "damage-thresholds"],
    headings: ["Combat", "Hit Points & Damage Thresholds"],
    dropLeadingText: "THRESHOLDS ",
  },
  {
    id: "rule.combat.stress",
    name: "Stress",
    slug: "stress",
    category: "combat",
    heading: "STRESS",
    nextHeading: "ATTACKING",
    pdfPage: 20,
    printedPages: [39],
    summary: "Tracks mental, physical, and emotional strain and what happens when Stress fills.",
    tags: ["rule", "combat", "stress"],
    headings: ["Combat", "Stress"],
  },
  {
    id: "rule.combat.damage_types",
    name: "Damage Types",
    slug: "damage-types",
    category: "combat",
    heading: "DAMAGETYPES",
    nextHeading: "RESISTANCE, IMMUNITY,AND DIRECT",
    pdfPage: 21,
    printedPages: [40],
    summary: "Defines physical and magic damage types.",
    tags: ["rule", "combat", "damage", "physical", "magic"],
    headings: ["Combat", "Damage Types"],
  },
  {
    id: "rule.combat.resistance_immunity_direct_damage",
    name: "Resistance, Immunity, and Direct Damage",
    slug: "resistance-immunity-direct-damage",
    category: "combat",
    heading: "RESISTANCE, IMMUNITY,AND DIRECT",
    nextHeading: "MULTI-TARGETATTACK ROLLS",
    pdfPage: 21,
    printedPages: [40],
    summary: "Explains resistance, immunity, and direct damage interactions.",
    tags: ["rule", "combat", "resistance", "immunity", "direct-damage"],
    headings: ["Combat", "Resistance, Immunity, and Direct Damage"],
    dropLeadingText: "DAMAGE ",
  },
  {
    id: "rule.combat.multi_target_attack_rolls",
    name: "Multi-Target Attack Rolls",
    slug: "multi-target-attack-rolls",
    category: "combat",
    heading: "MULTI-TARGETATTACK ROLLS",
    nextHeading: "MULTIPLE DAMAGE SOURCES",
    pdfPage: 21,
    printedPages: [40],
    summary: "Explains how one attack and damage roll applies to multiple targets.",
    tags: ["rule", "combat", "attack-rolls", "multi-target"],
    headings: ["Combat", "Multi-Target Attack Rolls"],
  },
  {
    id: "rule.combat.multiple_damage_sources",
    name: "Multiple Damage Sources",
    slug: "multiple-damage-sources",
    category: "combat",
    heading: "MULTIPLE DAMAGE SOURCES",
    nextHeading: "MAPS, RANGE,",
    pdfPage: 21,
    printedPages: [40],
    summary: "Explains that simultaneous damage from multiple sources is totaled before threshold comparison.",
    tags: ["rule", "combat", "damage", "thresholds"],
    headings: ["Combat", "Multiple Damage Sources"],
  },
  {
    id: "rule.combat.maps_range_movement",
    name: "Maps, Range, and Movement",
    slug: "maps-range-movement",
    category: "combat",
    heading: "MAPS, RANGE,",
    nextHeading: "MOVEMENTUNDER PRESSURE",
    pdfPage: 21,
    printedPages: [40],
    summary: "Defines abstract range bands and their optional grid equivalents.",
    tags: ["rule", "combat", "range", "movement", "maps"],
    headings: ["Combat", "Maps, Range, and Movement"],
    dropLeadingText: "AND MOVEMENT ",
  },
  {
    id: "rule.combat.movement_under_pressure",
    name: "Movement Under Pressure",
    slug: "movement-under-pressure",
    category: "combat",
    heading: "MOVEMENTUNDER PRESSURE",
    nextHeading: "AREAOFEFFECT",
    pdfPage: 21,
    printedPages: [40],
    summary: "Explains movement while under pressure or in danger.",
    tags: ["rule", "combat", "movement", "pressure"],
    headings: ["Combat", "Movement Under Pressure"],
  },
  {
    id: "rule.combat.area_of_effect",
    name: "Area of Effect",
    slug: "area-of-effect",
    category: "combat",
    heading: "AREAOFEFFECT",
    nextHeading: "LINE OFSIGHT& COVER",
    pdfPage: 21,
    printedPages: [40],
    summary: "Defines the default origin and grouping requirement for group effects.",
    tags: ["rule", "combat", "area-of-effect", "targeting"],
    headings: ["Combat", "Area of Effect"],
  },
  {
    id: "rule.combat.line_of_sight_cover",
    name: "Line of Sight & Cover",
    slug: "line-of-sight-cover",
    category: "combat",
    heading: "LINE OFSIGHT& COVER",
    nextHeading: "CONDITIONS",
    pdfPage: 21,
    printedPages: [40, 41],
    summary: "Explains line of sight requirements and cover penalties for ranged attacks.",
    tags: ["rule", "combat", "line-of-sight", "cover", "ranged"],
    headings: ["Combat", "Line of Sight & Cover"],
  },
  {
    id: "rule.combat.conditions",
    name: "Conditions",
    slug: "conditions",
    category: "combat",
    heading: "CONDITIONS",
    nextHeading: "TEMPORARY TAGS",
    pdfPage: 21,
    printedPages: [41],
    summary: "Reference entry for standard and special conditions such as Hidden, Restrained, and Vulnerable.",
    tags: ["rule", "combat", "conditions"],
    headings: ["Combat", "Conditions"],
  },
  {
    id: "rule.combat.temporary_tags_special_conditions",
    name: "Temporary Tags & Special Conditions",
    slug: "temporary-tags-special-conditions",
    category: "combat",
    heading: "TEMPORARY TAGS",
    nextHeading: "DOWNTIME",
    pdfPage: 21,
    printedPages: [41],
    summary: "Explains clearing temporary tags and special conditions.",
    tags: ["rule", "combat", "temporary-tags", "conditions"],
    headings: ["Combat", "Temporary Tags & Special Conditions"],
    dropLeadingText: "& SPECIAL CONDITIONS ",
  },
  {
    id: "rule.combat.downtime",
    name: "Downtime",
    slug: "downtime",
    category: "combat",
    heading: "DOWNTIME",
    nextHeading: "DOWNTIME CONSEQUENCES",
    pdfPage: 21,
    printedPages: [41],
    summary: "Explains short rests, long rests, and downtime moves between conflicts.",
    tags: ["rule", "combat", "downtime", "rest"],
    headings: ["Combat", "Downtime"],
  },
  {
    id: "rule.combat.downtime_consequences",
    name: "Downtime Consequences",
    slug: "downtime-consequences",
    category: "combat",
    heading: "DOWNTIME CONSEQUENCES",
    pdfPage: 21,
    printedPages: [41],
    summary: "Explains GM Fear gain and countdown advancement after rests.",
    tags: ["rule", "combat", "downtime", "fear", "countdown"],
    headings: ["Combat", "Downtime Consequences"],
  },
  {
    id: "rule.combat.death",
    name: "Death",
    slug: "death",
    category: "combat",
    heading: "DEATH",
    nextHeading: "ADDITIONAL RULES",
    pdfPage: 22,
    printedPages: [42, 43],
    summary: "Explains death moves and what happens when a PC marks their last Hit Point.",
    tags: ["rule", "combat", "death", "hit-points"],
    headings: ["Combat", "Death"],
  },
  {
    id: "rule.additional.rounding_up",
    name: "Rounding Up",
    slug: "rounding-up",
    category: "additional rules",
    heading: "ROUNDING UP",
    nextHeading: "REROLLING DICE",
    pdfPage: 22,
    printedPages: [42, 43],
    summary: "Explains rounding and resolving ambiguity in favor of the PCs.",
    tags: ["rule", "additional-rules", "rounding"],
    headings: ["Additional Rules", "Rounding Up"],
  },
  {
    id: "rule.additional.rerolling_dice",
    name: "Rerolling Dice",
    slug: "rerolling-dice",
    category: "additional rules",
    heading: "REROLLING DICE",
    nextHeading: "INCOMING DAMAGE",
    pdfPage: 22,
    printedPages: [42, 43],
    summary: "Explains that rerolled dice use the new result unless stated otherwise.",
    tags: ["rule", "additional-rules", "dice", "reroll"],
    headings: ["Additional Rules", "Rerolling Dice"],
  },
  {
    id: "rule.additional.incoming_damage",
    name: "Incoming Damage",
    slug: "incoming-damage",
    category: "additional rules",
    heading: "INCOMING DAMAGE",
    nextHeading: "SIMULTANEOUS EFFECTS",
    pdfPage: 22,
    printedPages: [42, 43],
    summary: "Defines incoming damage before Armor Slots are marked.",
    tags: ["rule", "additional-rules", "damage", "armor"],
    headings: ["Additional Rules", "Incoming Damage"],
  },
  {
    id: "rule.additional.simultaneous_effects",
    name: "Simultaneous Effects",
    slug: "simultaneous-effects",
    category: "additional rules",
    heading: "SIMULTANEOUS EFFECTS",
    nextHeading: "STACKING EFFECTS",
    pdfPage: 22,
    printedPages: [42, 43],
    summary: "Explains who decides unclear resolution order for simultaneous effects.",
    tags: ["rule", "additional-rules", "effects", "resolution-order"],
    headings: ["Additional Rules", "Simultaneous Effects"],
  },
  {
    id: "rule.additional.stacking_effects",
    name: "Stacking Effects",
    slug: "stacking-effects",
    category: "additional rules",
    heading: "STACKING EFFECTS",
    nextHeading: "ONGOING SPELLEFFECTS",
    pdfPage: 22,
    printedPages: [42, 43],
    summary: "Explains which effects can stack unless stated otherwise.",
    tags: ["rule", "additional-rules", "effects", "stacking"],
    headings: ["Additional Rules", "Stacking Effects"],
  },
  {
    id: "rule.additional.ongoing_spell_effects",
    name: "Ongoing Spell Effects",
    slug: "ongoing-spell-effects",
    category: "additional rules",
    heading: "ONGOING SPELLEFFECTS",
    nextHeading: "SPENDING RESOURCES",
    pdfPage: 22,
    printedPages: [42, 43],
    summary: "Explains when spell effects without listed mechanical expiration end.",
    tags: ["rule", "additional-rules", "spell", "effects"],
    headings: ["Additional Rules", "Ongoing Spell Effects"],
  },
  {
    id: "rule.additional.spending_resources",
    name: "Spending Resources",
    slug: "spending-resources",
    category: "additional rules",
    heading: "SPENDING RESOURCES",
    nextHeading: "USING FEATURESAFTERAROLL",
    pdfPage: 22,
    printedPages: [42, 43],
    summary: "Explains limits on spending Hope or marking Stress repeatedly on the same feature.",
    tags: ["rule", "additional-rules", "hope", "stress", "resources"],
    headings: ["Additional Rules", "Spending Resources"],
  },
  {
    id: "rule.additional.using_features_after_a_roll",
    name: "Using Features After a Roll",
    slug: "using-features-after-a-roll",
    category: "additional rules",
    heading: "USING FEATURESAFTERAROLL",
    nextHeading: "LEVELING UP",
    pdfPage: 22,
    printedPages: [42, 43],
    summary: "Explains when features that affect a roll after totaling can be used.",
    tags: ["rule", "additional-rules", "features", "rolls"],
    headings: ["Additional Rules", "Using Features After a Roll"],
  },
  {
    id: "rule.advancement.leveling_up",
    name: "Leveling Up",
    slug: "leveling-up",
    category: "character advancement",
    heading: "LEVELING UP",
    nextHeading: "STEP ONE",
    pdfPage: 22,
    printedPages: [42, 43],
    summary: "Explains milestone leveling, level tiers, and what tier affects.",
    tags: ["rule", "advancement", "leveling", "tiers"],
    headings: ["Leveling Up"],
  },
  {
    id: "rule.advancement.tier_achievements",
    name: "Tier Achievements",
    slug: "tier-achievements",
    category: "character advancement",
    heading: "STEP ONE",
    nextHeading: "STEP TWO",
    pdfPage: 22,
    printedPages: [42, 43],
    summary: "Lists level-based tier achievements for levels 2, 5, and 8.",
    tags: ["rule", "advancement", "leveling", "tiers", "experience", "proficiency"],
    headings: ["Leveling Up", "Step One", "Tier Achievements"],
    dropLeadingText: "TIER ACHIEVEMENTS ",
  },
  {
    id: "rule.advancement.advancements",
    name: "Advancements",
    slug: "advancements",
    category: "character advancement",
    heading: "STEP TWO",
    nextHeading: "STEP THREE",
    pdfPage: 22,
    printedPages: [42, 43],
    summary: "Explains choosing level-up advancements and the available advancement options.",
    tags: ["rule", "advancement", "leveling", "domain-cards", "subclass", "multiclass"],
    headings: ["Leveling Up", "Step Two", "Advancements"],
    dropLeadingText: "ADVANCEMENTS ",
  },
  {
    id: "rule.advancement.damage_thresholds",
    name: "Damage Thresholds",
    slug: "damage-thresholds",
    category: "character advancement",
    heading: "STEP THREE",
    nextHeading: "STEP FOUR",
    pdfPage: 22,
    printedPages: [42, 43],
    summary: "Explains increasing all damage thresholds during level up.",
    tags: ["rule", "advancement", "leveling", "damage-thresholds"],
    headings: ["Leveling Up", "Step Three", "Damage Thresholds"],
    dropLeadingText: "DAMAGE THRESHOLDS ",
  },
  {
    id: "rule.advancement.domain_cards",
    name: "Domain Cards",
    slug: "domain-cards",
    category: "character advancement",
    heading: "STEP FOUR",
    nextHeading: "MULTICLASSING",
    pdfPage: 22,
    printedPages: [42, 43],
    summary: "Explains acquiring or exchanging domain cards during level up.",
    tags: ["rule", "advancement", "leveling", "domain-cards", "loadout", "vault"],
    headings: ["Leveling Up", "Step Four", "Domain Cards"],
    dropLeadingText: "DOMAIN CARDS ",
  },
  {
    id: "rule.advancement.multiclassing",
    name: "Multiclassing",
    slug: "multiclassing",
    category: "character advancement",
    heading: "MULTICLASSING",
    pdfPage: 22,
    printedPages: [42, 43],
    summary: "Explains multiclassing, subclass foundation cards, and multiclass domain card limits.",
    tags: ["rule", "advancement", "multiclass", "domains", "subclass"],
    headings: ["Leveling Up", "Multiclassing"],
  },
];

// Hand-authored rule references that cannot be cleanly section-extracted by the
// heading-boundary model above. Weapon Burden and Weapon Categories are
// synthesized from multiple PDF locations; Character Traits is a bulleted list.
// These are merged into the output verbatim so `npm run extract:srd:rules`
// reproduces the full set and keeps the fixtures regeneration-safe.
const authoredRules: SrdEntry[] = [
  {
    id: "rule.character_creation.traits",
    kind: "rule_reference",
    name: "Character Traits",
    slug: "character-traits",
    source: {
      document: "Daggerheart SRD",
      version: "1.0-2025-09-09",
      pdf: {
        path: sourcePdfPath,
        pageStart: 3,
        pageEnd: 3,
      },
      printedPages: [4],
      url: sourceUrl,
    },
    review: {
      status: "reviewed",
      reviewedAt: "2026-05-28T00:00:00.000Z",
      notes: [
        "Authored from the Character Creation Step 3 (Assign Character Traits) section on printed page 4; wording transcribed from the source PDF.",
      ],
    },
    text: {
      original:
        "Your character has six traits that represent their physical, mental, and social aptitude. • Agility (Use it to Sprint, Leap, Maneuver, etc.): A high Agility means you're fast on your feet, nimble on difficult terrain, and quick to react to danger. You'll make an Agility Roll to scurry up a rope, sprint to cover, or bound from rooftop to rooftop. • Strength (Use it to Lift, Smash, Grapple, etc.): A high Strength means you're better at feats that test your physical prowess and stamina. You'll make a Strength Roll to break through a door, lift heavy objects, or hold your ground against a charging foe. • Finesse (Use it to Control, Hide, Tinker, etc.): A high Finesse means you're skilled at tasks that require accuracy, stealth, or the utmost control. You'll make a Finesse Roll to use fine tools, escape notice, or strike with precision. • Instinct (Use it to Perceive, Sense, Navigate, etc.): A high Instinct means you have a keen sense of your surroundings and a natural intuition. You'll make an Instinct Roll to sense danger, notice details in the world around you, or track an elusive foe. • Presence (Use it to Charm, Perform, Deceive, etc.): A high Presence means you have a strong force of personality and a facility for social situations. You'll make a Presence Roll to plead your case, intimidate a foe, or capture the attention of a crowd. • Knowledge (Use it to Recall, Analyze, Comprehend, etc.): A high Knowledge means you know information others don't and understand how to apply your mind through deduction and inference. You'll make a Knowledge Roll to interpret facts, see the patterns clearly, or remember important information. When you \"roll with a trait,\" that trait's modifier is added to the roll's total. Assign the modifiers +2, +1, +1, +0, +0, -1 to your character's traits in any order you wish.",
      summary:
        "The six traits — Agility, Strength, Finesse, Instinct, Presence, and Knowledge — represent a character's physical, mental, and social aptitude. Each trait's modifier is added to rolls using that trait.",
    },
    tags: ["rule", "character-creation", "traits", "agility", "strength", "finesse", "instinct", "presence", "knowledge"],
    relationships: [],
    category: "character creation",
    headings: ["Character Creation", "Assign Character Traits"],
  },
  {
    id: "rule.equipment.weapon_burden",
    kind: "rule_reference",
    name: "Weapon Burden",
    slug: "weapon-burden",
    source: {
      document: "Daggerheart SRD",
      version: "1.0-2025-09-09",
      pdf: {
        path: sourcePdfPath,
        pageStart: 3,
        pageEnd: 3,
      },
      printedPages: [5],
      url: sourceUrl,
    },
    review: {
      status: "reviewed",
      reviewedAt: "2026-05-28T00:00:00.000Z",
      notes: [
        "Synthesized from the weapon tables' Burden column, the Character Creation Step 5 weapon-selection text on printed page 5, and the Combat Wheelchair Burden section on printed page 54. Definition verified against the source PDF.",
      ],
    },
    text: {
      original:
        "A weapon's Burden indicates how many hands it occupies when equipped. One-Handed weapons occupy one hand, and Two-Handed weapons occupy both hands. Your character's maximum burden is two hands, so you can equip either a single two-handed weapon or two one-handed weapons. At character creation you select from the Tier 1 Weapon Tables: either a two-handed primary weapon, or a one-handed primary weapon and a one-handed secondary weapon.",
      summary:
        "Burden indicates how many hands a weapon requires — one-handed or two-handed. A character can equip up to two hands of weapons total.",
    },
    tags: ["rule", "equipment", "weapon", "burden", "one-handed", "two-handed"],
    relationships: [],
    category: "equipment",
    headings: ["Equipment", "Weapons", "Burden"],
  },
  {
    id: "rule.equipment.weapon_categories",
    kind: "rule_reference",
    name: "Weapon Categories",
    slug: "weapon-categories",
    source: {
      document: "Daggerheart SRD",
      version: "1.0-2025-09-09",
      pdf: {
        path: sourcePdfPath,
        pageStart: 3,
        pageEnd: 3,
      },
      printedPages: [5],
      url: sourceUrl,
    },
    review: {
      status: "reviewed",
      reviewedAt: "2026-05-28T00:00:00.000Z",
      notes: [
        "Authored from the Character Creation Step 5 weapon-selection text on printed page 5 and the Secondary Weapon Tables introduction on printed page 26. Wording verified against the source PDF.",
      ],
    },
    text: {
      original:
        "A weapon's category specifies whether it is a Primary or Secondary weapon. Your character can only equip up to one weapon of each category at a time. At character creation, select from the Tier 1 Weapon Tables: either a two-handed primary weapon, or a one-handed primary weapon and a one-handed secondary weapon. Players can choose one Tier 1 secondary weapon during character creation. The GM can make other weapons available throughout the campaign as the PCs level up.",
      summary: "Weapons are either Primary or Secondary. A character can equip one of each category at a time.",
    },
    tags: ["rule", "equipment", "weapon", "category", "primary", "secondary"],
    relationships: [],
    category: "equipment",
    headings: ["Equipment", "Weapons", "Categories"],
  },
  {
    id: "rule.core.domains",
    kind: "rule_reference",
    name: "Domains",
    slug: "domains",
    source: {
      document: "Daggerheart SRD",
      version: "1.0-2025-09-09",
      pdf: {
        path: sourcePdfPath,
        pageStart: 4,
        pageEnd: 4,
      },
      printedPages: [6, 7],
      url: sourceUrl,
    },
    review: {
      status: "reviewed",
      reviewedAt: "2026-05-28T00:00:00.000Z",
      notes: [
        'Authored from the Core Materials "Domains" section on printed pages 6-7; descriptions transcribed from the source PDF.',
      ],
    },
    text: {
      original:
        "The Daggerheart core set includes 9 Domain Decks, each comprising a collection of cards granting features or special abilities expressing a particular theme. Each class grants access to two domains. The 9 Domains are: • Arcana: the domain of innate and instinctual magic. Those who choose this path tap into the raw, enigmatic forces of the realms to manipulate both their own energy and the elements. Accessed by the Druid and Sorcerer classes. • Blade: the domain of weapon mastery. Whether by steel, bow, or a more specialized arm, those who follow this path have the skill to cut short the lives of others. Accessed by the Guardian and Warrior classes. • Bone: the domain of tactics and the body. Practitioners have an uncanny control over their own physical abilities and an eye for predicting the behaviors of others in combat. Accessed by the Ranger and Warrior classes. • Codex: the domain of intensive magical study. Those who seek magical knowledge turn to the equations of power recorded in books, on scrolls, etched into walls, or tattooed on bodies. Accessed by the Bard and Wizard classes. • Grace: the domain of charisma. Through rapturous storytelling, charming spells, or a shroud of lies, those who channel this power define the realities of their adversaries, bending perception to their will. Accessed by the Bard and Rogue classes. • Midnight: the domain of shadows and secrecy. Whether by clever tricks, deft magic, or the cloak of night, those who channel these forces practice the art of obscurity and can uncover sequestered treasures. Accessed by the Rogue and Sorcerer classes. • Sage: the domain of the natural world. Those who walk this path tap into the unfettered power of the earth and its creatures to unleash raw magic. Accessed by the Druid and Ranger classes. • Splendor: the domain of life. Through this magic, followers gain the ability to heal and, to an extent, control death. Accessed by the Seraph and Wizard classes. • Valor: the domain of protection. Whether through attack or defense, those who choose this discipline channel formidable strength to protect their allies in battle. Accessed by the Guardian and Seraph classes.",
      summary:
        "The nine domains — Arcana, Blade, Bone, Codex, Grace, Midnight, Sage, Splendor, and Valor — are themed card decks. Each class grants access to two of them.",
    },
    tags: ["rule", "domains", "arcana", "blade", "bone", "codex", "grace", "midnight", "sage", "splendor", "valor"],
    relationships: [],
    category: "core materials",
    headings: ["Core Materials", "Domains"],
  },
  {
    id: "rule.core.domain_card_types",
    kind: "rule_reference",
    name: "Domain Card Types",
    slug: "domain-card-types",
    source: {
      document: "Daggerheart SRD",
      version: "1.0-2025-09-09",
      pdf: {
        path: sourcePdfPath,
        pageStart: 5,
        pageEnd: 5,
      },
      printedPages: [8, 9],
      url: sourceUrl,
    },
    review: {
      status: "reviewed",
      reviewedAt: "2026-05-28T00:00:00.000Z",
      notes: [
        'Authored from the "Domain Card Anatomy" section on printed pages 8-9; wording transcribed from the source PDF.',
      ],
    },
    text: {
      original:
        "A domain card's type is listed in the center above the title. There are three types of domain cards: • Abilities: typically non-magical in nature. • Spells: magical in nature. • Grimoires: unique to the Codex domain, granting access to a collection of less potent spells. Some game mechanics only apply to certain types of cards.",
      summary:
        "Domain cards are one of three types: abilities (non-magical), spells (magical), or grimoires (Codex-only collections of lesser spells).",
    },
    tags: ["rule", "domain-card", "ability", "spell", "grimoire"],
    relationships: [],
    category: "core materials",
    headings: ["Core Materials", "Domain Cards", "Domain Card Anatomy"],
  },
  {
    id: "rule.adversaries.types",
    kind: "rule_reference",
    name: "Adversary Types",
    slug: "adversary-types",
    source: {
      document: "Daggerheart SRD",
      version: "1.0-2025-09-09",
      pdf: {
        path: sourcePdfPath,
        pageStart: 36,
        pageEnd: 36,
      },
      printedPages: [70, 71],
      url: sourceUrl,
    },
    review: {
      status: "reviewed",
      reviewedAt: "2026-05-28T00:00:00.000Z",
      notes: [
        'Authored from the "Using Adversaries" stat block TYPE section on printed pages 70-71; type definitions transcribed from the source PDF.',
      ],
    },
    text: {
      original:
        "An adversary's type appears alongside their tier and represents the role they play in a conflict. The adversary types are: • Bruisers: tough; deliver powerful attacks. • Hordes: groups of identical creatures acting together as a single unit. • Leaders: command and summon other adversaries. • Minions: easily dispatched but dangerous in numbers. • Ranged: fragile in close encounters but deal high damage at range. • Skulks: maneuver and exploit opportunities to ambush opponents. • Socials: present challenges around conversation instead of combat. • Solos: present a formidable challenge to a whole party, with or without support. • Standards: representative of their fictional group. • Supports: enhance their allies and disrupt their opponents.",
      summary:
        "An adversary's type (role) — Bruiser, Horde, Leader, Minion, Ranged, Skulk, Social, Solo, Standard, or Support — represents the role it plays in a conflict.",
    },
    tags: ["rule", "adversary", "type", "role"],
    relationships: [],
    category: "adversaries",
    headings: ["Adversaries and Environments", "Using Adversaries", "Adversary Stat Blocks", "Type"],
  },
  {
    id: "rule.environments.types",
    kind: "rule_reference",
    name: "Environment Types",
    slug: "environment-types",
    source: {
      document: "Daggerheart SRD",
      version: "1.0-2025-09-09",
      pdf: {
        path: sourcePdfPath,
        pageStart: 52,
        pageEnd: 52,
      },
      printedPages: [102, 103],
      url: sourceUrl,
    },
    review: {
      status: "reviewed",
      reviewedAt: "2026-05-28T00:00:00.000Z",
      notes: [
        'Authored from the "Using Environments" stat block TYPE section on printed pages 102-103; type definitions transcribed from the source PDF.',
      ],
    },
    text: {
      original:
        "An environment's type indicates the kind of scene it most easily supports: • Explorations: wondrous locations with mysteries and marvels to discover. • Socials: locations that primarily present interpersonal challenges. • Traversals: dangerous locations where movement through and around the space itself is a challenge. • Events: special activities or occurrences (rather than physical spaces).",
      summary:
        "An environment's type — Exploration, Social, Traversal, or Event — indicates the kind of scene it most easily supports.",
    },
    tags: ["rule", "environment", "type", "exploration", "social", "traversal", "event"],
    relationships: [],
    category: "environments",
    headings: ["Adversaries and Environments", "Using Environments", "Environment Stat Block", "Type"],
  },
  {
    id: "rule.equipment.loot",
    kind: "rule_reference",
    name: "Loot",
    slug: "loot",
    source: {
      document: "Daggerheart SRD",
      version: "1.0-2025-09-09",
      pdf: {
        path: sourcePdfPath,
        pageStart: 30,
        pageEnd: 31,
      },
      printedPages: [58, 59],
      url: sourceUrl,
    },
    review: {
      status: "reviewed",
      reviewedAt: "2026-05-28T00:00:00.000Z",
      notes: [
        'Authored from the "Loot" and "Consumables" sections on printed pages 58-59; wording transcribed from the source PDF.',
      ],
    },
    text: {
      original:
        "Loot comprises any consumables or reusable items the party acquires. • Items: reusable loot that can be used until sold, discarded, or lost. • Consumables: loot that can only be used once. You can hold up to five of each consumable at a time, and using a consumable doesn't require a roll unless required by the GM or the demands of the fiction.",
      summary: "Loot is either a reusable item or a single-use consumable.",
    },
    tags: ["rule", "equipment", "loot", "item", "consumable"],
    relationships: [],
    category: "equipment",
    headings: ["Loot"],
  },
];

const cleanupRules = [
  { pattern: /\banAlly\b/g, replacement: "an Ally", label: "anAlly -> an Ally" },
  { pattern: /\baTagTeam\b/g, replacement: "a Tag Team", label: "aTagTeam -> a Tag Team" },
  { pattern: /\bTagTeam\b/g, replacement: "Tag Team", label: "TagTeam -> Tag Team" },
  { pattern: /\bifyou\b/g, replacement: "if you", label: "ifyou -> if you" },
  { pattern: /\bIfyou\b/g, replacement: "If you", label: "Ifyou -> If you" },
  { pattern: /\bIfyour\b/g, replacement: "If your", label: "Ifyour -> If your" },
  { pattern: /\boryou\b/g, replacement: "or you", label: "oryou -> or you" },
  { pattern: /\bofsight\b/g, replacement: "of sight", label: "ofsight -> of sight" },
  { pattern: /\bofthe\b/g, replacement: "of the", label: "ofthe -> of the" },
  { pattern: /\bVeryClose\b/g, replacement: "Very Close", label: "VeryClose -> Very Close" },
  { pattern: /\bVeryFar\b/g, replacement: "Very Far", label: "VeryFar -> Very Far" },
  { pattern: /\bOut ofRange\b/g, replacement: "Out of Range", label: "Out ofRange -> Out of Range" },
  { pattern: /\bAweapon\b/g, replacement: "A weapon", label: "Aweapon -> A weapon" },
  { pattern: /\bSpecialconditions\b/g, replacement: "Special conditions", label: "Specialconditions -> Special conditions" },
  { pattern: /\bitem\.The\b/g, replacement: "item. The", label: "item.The -> item. The" },
  { pattern: /\btoWounds\b/g, replacement: "to Wounds", label: "toWounds -> to Wounds" },
  { pattern: /\btoAllWounds\b/g, replacement: "to All Wounds", label: "toAllWounds -> to All Wounds" },
  { pattern: /\bforyourself\b/g, replacement: "for yourself", label: "foryourself -> for yourself" },
  { pattern: /\bClearStress\b/g, replacement: "Clear Stress", label: "ClearStress -> Clear Stress" },
  { pattern: /\bClearAll Stress\b/g, replacement: "Clear All Stress", label: "ClearAll Stress -> Clear All Stress" },
  { pattern: /\bRepairArmor\b/g, replacement: "Repair Armor", label: "RepairArmor -> Repair Armor" },
  { pattern: /\bRepairAllArmor\b/g, replacement: "Repair All Armor", label: "RepairAllArmor -> Repair All Armor" },
  { pattern: /\bTierArmor\b/g, replacement: "Tier Armor", label: "TierArmor -> Tier Armor" },
  { pattern: /\bhowyou\b/g, replacement: "how you", label: "howyou -> how you" },
  { pattern: /\bend ofa\b/g, replacement: "end of a", label: "end ofa -> end of a" },
  { pattern: /\bofGlory\b/g, replacement: "of Glory", label: "ofGlory -> of Glory" },
  { pattern: /\bAfteryour\b/g, replacement: "After your", label: "Afteryour -> After your" },
  { pattern: /\bItAll\b/g, replacement: "It All", label: "ItAll -> It All" },
  { pattern: /\bhoweveryou’d\b/g, replacement: "however you’d", label: "howeveryou’d -> however you’d" },
  { pattern: /\bincreasetwo\b/g, replacement: "increase two", label: "increasetwo -> increase two" },
  { pattern: /\bormore\b/g, replacement: "or more", label: "ormore -> or more" },
  { pattern: /\bincreaseyourExperience\b/g, replacement: "increase your Experience", label: "increaseyourExperience -> increase your Experience" },
  { pattern: /\byoutake\b/g, replacement: "you take", label: "youtake -> you take" },
  { pattern: /\bincreaseyourEvasion\b/g, replacement: "increase your Evasion", label: "increaseyourEvasion -> increase your Evasion" },
  { pattern: /\bforyour\b/g, replacement: "for your", label: "foryour -> for your" },
  { pattern: /\bincreaseyourProficiency\b/g, replacement: "increase your Proficiency", label: "increaseyourProficiency -> increase your Proficiency" },
  { pattern: /\borvault\b/g, replacement: "or vault", label: "orvault -> or vault" },
  { pattern: /\byourvault\b/g, replacement: "your vault", label: "yourvault -> your vault" },
  { pattern: /\bWheneveryou\b/g, replacement: "Whenever you", label: "Wheneveryou -> Whenever you" },
  { pattern: /\bDetermineAncestryCombination\b/g, replacement: "Determine Ancestry Combination", label: "DetermineAncestryCombination -> Determine Ancestry Combination" },
  { pattern: /\bChooseAncestryFeatures\b/g, replacement: "Choose Ancestry Features", label: "ChooseAncestryFeatures -> Choose Ancestry Features" },
  { pattern: /\bancestryyou\b/g, replacement: "ancestry you", label: "ancestryyou -> ancestry you" },
  { pattern: /the“/g, replacement: "the “", label: "the“ -> the “" },
  { pattern: /and“/g, replacement: "and “", label: "and“ -> and “" },
  { pattern: /”and/g, replacement: "” and", label: "”and -> ” and" },
  { pattern: /”features/g, replacement: "” features", label: "”features -> ” features" },
] satisfies Array<{ pattern: RegExp; replacement: string; label: string }>;

const pageTexts = await extractPdfPages(sourcePdfPath, unique(ruleSpecs.map((spec) => spec.pdfPage)));
const extractedRules = ruleSpecs.map((spec) => extractRule(spec, pageTexts.get(spec.pdfPage) ?? ""));
const entries = [...extractedRules.map((rule) => rule.entry), ...authoredRules];

SrdEntryCollectionSchema.parse(entries);

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(resolve(process.cwd(), outputPath), `${JSON.stringify(entries, null, 2)}\n`, "utf8");
await writeFile(resolve(process.cwd(), reviewReportPath), buildReviewReport(extractedRules, authoredRules), "utf8");

console.log(
  `Extracted ${extractedRules.length} PDF-section rule_reference entries and ${authoredRules.length} authored entries (${entries.length} total) to ${outputPath}.`,
);
console.log(`Wrote parser review report to ${reviewReportPath}.`);

function extractRule(spec: RuleSpec, rawText: string): ExtractedRule {
  const rawSection = extractSection(rawText, spec.heading, spec.nextHeading);
  const normalizedSection = dropLeadingText(rawSection, spec.dropLeadingText);
  const cleaned = applyCleanup(normalizedSection.text);
  const appliedCleanupLabels = [...normalizedSection.appliedLabels, ...cleaned.appliedLabels];
  const suspiciousTokens = detectSuspiciousTokens(cleaned.text);
  const accepted = acceptedReviewedIds.has(spec.id);
  const reviewedAt = spec.id === "rule.character_creation.mixed_ancestry" ? mixedAncestryReviewTimestamp : acceptedReviewTimestamp;
  const notes = [
    "Generated by scripts/extract-rule-references.ts from pdftotext -raw; review wording against the source PDF.",
    ...(accepted ? [`Report-driven manual review accepted on ${reviewDateLabel(reviewedAt)} with no flaws found.`] : []),
    ...appliedCleanupLabels.map((label) => `Parser cleanup applied: ${label}.`),
    ...suspiciousTokens.map((token) => `Potential joined-word artifact remains: ${token}.`),
  ];

  return {
    entry: {
      id: spec.id,
      kind: "rule_reference" as const,
      name: spec.name,
      slug: spec.slug,
      source: {
        document: "Daggerheart SRD" as const,
        version: "1.0-2025-09-09",
        pdf: {
          path: sourcePdfPath,
          pageStart: spec.pdfPage,
          pageEnd: spec.pdfPage,
        },
        printedPages: spec.printedPages,
        url: sourceUrl,
      },
      review: {
        status: accepted ? "reviewed" : "extracted",
        reviewedAt: accepted ? reviewedAt : null,
        notes,
      },
      text: {
        original: cleaned.text,
        summary: spec.summary,
      },
      tags: spec.tags,
      relationships: [],
      category: spec.category,
      headings: spec.headings,
    },
    appliedCleanupLabels,
    suspiciousTokens,
  };
}

async function extractPdfPages(pdfPath: string, pages: number[]) {
  const entries = await Promise.all(pages.map(async (page) => [page, await extractPdfPage(pdfPath, page)] as const));
  return new Map(entries);
}

async function extractPdfPage(pdfPath: string, page: number) {
  const { stdout } = await execFileAsync("pdftotext", ["-raw", "-f", String(page), "-l", String(page), pdfPath, "-"]);
  return stdout;
}

function extractSection(rawText: string, heading: string, nextHeading: string | undefined) {
  const lines = rawText.split(/\r?\n/);
  const startIndex = lines.findIndex((line) => line.trim() === heading);

  if (startIndex === -1) {
    throw new Error(`Could not find heading: ${heading}`);
  }

  const nextIndex = nextHeading ? lines.findIndex((line, index) => index > startIndex && line.trim() === nextHeading) : lines.length;

  if (nextIndex === -1) {
    throw new Error(`Could not find next heading after ${heading}: ${nextHeading}`);
  }

  return removePageFooter(normalizeExtractedLines(lines.slice(startIndex + 1, nextIndex)));
}

function normalizeExtractedLines(lines: string[]) {
  return lines
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ");
}

function applyCleanup(text: string) {
  const appliedLabels: string[] = [];
  let cleanedText = text;

  for (const rule of cleanupRules) {
    if (rule.pattern.test(cleanedText)) {
      appliedLabels.push(rule.label);
      cleanedText = cleanedText.replace(rule.pattern, rule.replacement);
    }

    rule.pattern.lastIndex = 0;
  }

  return { text: cleanedText, appliedLabels };
}

function removePageFooter(text: string) {
  return text.replace(/\s*\d+\s+\d+\s+Daggerheart SRD\s+Daggerheart SRD\s*$/, "");
}

function dropLeadingText(text: string, leadingText: string | undefined) {
  if (!leadingText || !text.startsWith(leadingText)) {
    return { text, appliedLabels: [] };
  }

  return {
    text: text.slice(leadingText.length),
    appliedLabels: [`dropped heading continuation: ${leadingText.trim()}`],
  };
}

function detectSuspiciousTokens(text: string) {
  const matches =
    text.match(
      /\b(?:[a-z]{2,}(?:Ally|Armor|Close|Damage|Evasion|Experience|Far|Features|Glory|Proficiency|Range|Roll|Sight|Stress|Team|Vault|Weapon|Wounds)[a-z]*|[a-z]{2,}(?:more|two|you|your))\b/g,
    ) ?? [];
  return unique(matches).sort((a, b) => a.localeCompare(b));
}

function reviewDateLabel(timestamp: string) {
  return timestamp.slice(0, 10);
}

function buildReviewReport(extractedRules: ExtractedRule[], authoredRules: SrdEntry[]) {
  const lines = [
    "# SRD Candidate Review Report",
    "",
    "Generated by `npm run extract:srd:rules`.",
    "",
    "## Summary",
    "",
    `- PDF-section candidate entries: ${extractedRules.length}`,
    `- Authored entries: ${authoredRules.length}`,
    `- Total entries: ${extractedRules.length + authoredRules.length}`,
    `- Entries with parser cleanup: ${extractedRules.filter((rule) => rule.appliedCleanupLabels.length > 0).length}`,
    `- Entries with suspicious tokens: ${extractedRules.filter((rule) => rule.suspiciousTokens.length > 0).length}`,
    "",
    "## Entries",
    "",
  ];

  for (const rule of extractedRules) {
    lines.push(`### ${rule.entry.id}`);
    lines.push("");
    lines.push(`- Name: ${rule.entry.name}`);
    lines.push(`- Physical PDF page: ${rule.entry.source.pdf.pageStart}`);
    lines.push(`- Printed SRD pages: ${rule.entry.source.printedPages.join(", ")}`);
    lines.push(`- Review status: ${rule.entry.review.status}`);
    lines.push(`- Text length: ${rule.entry.text.original.length} characters`);
    lines.push(`- Text preview: ${previewText(rule.entry.text.original)}`);
    lines.push(
      `- Parser cleanup: ${rule.appliedCleanupLabels.length > 0 ? rule.appliedCleanupLabels.join("; ") : "none"}`,
    );
    lines.push(`- Suspicious tokens: ${rule.suspiciousTokens.length > 0 ? rule.suspiciousTokens.join(", ") : "none"}`);
    lines.push("");
  }

  lines.push("## Authored Entries");
  lines.push("");
  lines.push("Hand-authored entries that bypass PDF section extraction (synthesized from multiple sections or formatted as bulleted lists). Verify wording against the source PDF.");
  lines.push("");
  for (const entry of authoredRules) {
    lines.push(`### ${entry.id}`);
    lines.push("");
    lines.push(`- Name: ${entry.name}`);
    lines.push(`- Printed SRD pages: ${entry.source.printedPages.join(", ")}`);
    lines.push(`- Review status: ${entry.review.status}`);
    lines.push(`- Text length: ${entry.text.original.length} characters`);
    lines.push(`- Text preview: ${previewText(entry.text.original)}`);
    lines.push(`- Source notes: ${entry.review.notes.join(" ")}`);
    lines.push("");
  }

  lines.push("## Review Guidance");
  lines.push("");
  lines.push("- Spot-check entries with parser cleanup before promotion.");
  lines.push("- Fully review entries with suspicious tokens before promotion.");
  lines.push("- Preserve curly punctuation in `text.original` when it matches the source PDF.");
  lines.push("");

  return `${lines.join("\n")}\n`;
}

function previewText(text: string) {
  return text.length > 180 ? `${text.slice(0, 180)}...` : text;
}

function unique<T>(values: T[]) {
  return [...new Set(values)];
}
