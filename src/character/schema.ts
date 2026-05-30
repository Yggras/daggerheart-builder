import { z } from "zod";

// User-owned character model for the builder wizard. See
// docs/brain/requirements/character-builder-wizard-spec.md §5.
//
// The model separates the static `definition` (build choices — the only part the v1 builder writes)
// from a reserved `playState` (live-session values, unused in v1) (CBW-15). Choices store SRD IDs;
// the rules engine recomputes derived values from `definition` + SRD data (CBW-16), so derived
// numbers are never persisted here.
//
// Because drafts are autosaved continuously (CBW-24), selection fields are nullable and collections
// start empty — a partially-built character is always serializable. Completion is enforced
// separately (the wizard's per-step validity) before status flips to "complete" (CBW-2). New
// characters/definitions are built with the factory helpers at the bottom of this file.

export const CHARACTER_SCHEMA_VERSION = 2;

export const TRAIT_NAMES = ["agility", "strength", "finesse", "instinct", "presence", "knowledge"] as const;
export type TraitName = (typeof TRAIT_NAMES)[number];

// The fixed trait-assignment array every PC distributes at creation (SRD Step 3).
export const TRAIT_ARRAY = [2, 1, 1, 0, 0, -1] as const;

const idRef = z.string().min(1);

const IdentitySchema = z.object({
  name: z.string().default(""),
  pronouns: z.string().default(""),
  description: z.string().default(""),
});

const TraitsSchema = z.object(
  Object.fromEntries(TRAIT_NAMES.map((trait) => [trait, z.number().int().nullable()])) as Record<
    TraitName,
    z.ZodNullable<z.ZodNumber>
  >,
);

const AncestrySelectionSchema = z.object({
  mode: z.enum(["single", "mixed"]),
  primaryId: idRef.nullable(),
  // Mixed Ancestry: top feature of primary + bottom feature of secondary (CBW-7).
  secondaryId: idRef.nullable(),
});

const HeritageSchema = z.object({
  communityId: idRef.nullable(),
  ancestry: AncestrySelectionSchema,
});

const InventoryItemSchema = z
  .object({
    srdId: idRef.optional(), // canonical loot id (potions, etc.)
    label: z.string().min(1).optional(), // custom / non-canonical item (torch, rope, …)
    qty: z.number().int().positive().default(1),
  })
  .refine((item) => Boolean(item.srdId) || Boolean(item.label), {
    message: "Inventory item needs an srdId or a label.",
  });

const GoldSchema = z.object({
  handfuls: z.number().int().nonnegative(),
  bags: z.number().int().nonnegative(),
  chests: z.number().int().nonnegative(),
});

const EquipmentSchema = z.object({
  primaryWeaponId: idRef.nullable(),
  secondaryWeaponId: idRef.nullable(), // only when primary is one-handed
  armorId: idRef.nullable(),
  chosenClassItemId: idRef.nullable(), // pick 1 of the class's 2 items
  potion: z.enum(["minor_health", "minor_stamina"]).nullable(),
});

const ExperienceSchema = z.object({
  id: idRef,
  text: z.string().default(""),
  modifier: z.number().int().default(2), // base +2 (static effects applied by the engine, not stored)
});

const DomainCardRefSchema = z.object({
  cardId: idRef,
  location: z.enum(["loadout", "vault"]).default("loadout"),
});

// A free-text answer to a class background/connection question. `questionId` links to the SRD
// question when answering a provided prompt; custom/edited questions omit it and carry `prompt`.
const QuestionAnswerSchema = z.object({
  id: idRef,
  questionId: idRef.optional(),
  prompt: z.string().default(""),
  answer: z.string().default(""),
});

const CompanionSchema = z.object({
  name: z.string().default(""),
  animalKind: z.string().default(""),
  evasion: z.number().int().default(10), // SRD: companion Evasion starts at 10
  experiences: z.array(ExperienceSchema).default([]),
  attack: z.object({
    description: z.string().default(""),
    range: z.enum(["melee", "very_close", "close", "far", "very_far"]).default("melee"),
    damageDie: z.string().default("d6"), // L1 companion damage die
    damageType: z.enum(["physical", "magic"]).nullable().default(null),
  }),
});

export const CharacterDefinitionSchema = z.object({
  identity: IdentitySchema,
  level: z.literal(1), // creation only; advancement layered on later (CBW-9)
  classId: idRef.nullable(),
  subclassId: idRef.nullable(),
  // Generic home for all creation-time feature selections (Wizard "Strange Patterns" number,
  // Clank "Purposeful Design" target Experience id, Elemental Origin element, …) — CBW-13/20.
  featureChoices: z.record(z.string(), z.union([z.string(), z.number()])),
  heritage: HeritageSchema,
  traits: TraitsSchema,
  equipment: EquipmentSchema,
  inventory: z.array(InventoryItemSchema),
  gold: GoldSchema,
  background: z.object({ answers: z.array(QuestionAnswerSchema) }),
  experiences: z.array(ExperienceSchema), // exactly 2 when complete
  domainCards: z.array(DomainCardRefSchema), // exactly 2 (loadout) when complete
  connections: z.object({ answers: z.array(QuestionAnswerSchema) }),
  companion: CompanionSchema.nullable(), // Ranger Beastbound only (CBW-6)
});

// Reserved live-session shape. NOT written by the v1 builder (CBW-15); defined to fix the boundary.
const PlayStateSchema = z
  .object({
    currentHp: z.number().int().nonnegative().optional(),
    markedStress: z.number().int().nonnegative().optional(),
    currentHope: z.number().int().nonnegative().optional(),
    goldSpent: GoldSchema.optional(),
    domainCardMoves: z.array(z.string()).optional(),
    companion: z.object({ markedStress: z.number().int().nonnegative() }).optional(),
  })
  .optional();

const MetaSchema = z.object({
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  status: z.enum(["draft", "complete"]),
  schemaVersion: z.number().int().positive(),
  srdVersion: z.string().min(1), // detect drift if SRD data changes (CBW-16)
  // Supabase auth user that owns this character. Optional so pre-sync (schemaVersion 1) characters
  // still validate; the sync engine backfills it on first push.
  ownerId: z.string().uuid().optional(),
});

export const CharacterSchema = z.object({
  id: idRef,
  meta: MetaSchema,
  definition: CharacterDefinitionSchema,
  playState: PlayStateSchema,
});

export type Character = z.infer<typeof CharacterSchema>;
export type CharacterDefinition = z.infer<typeof CharacterDefinitionSchema>;
export type CharacterTraits = z.infer<typeof TraitsSchema>;
export type Experience = z.infer<typeof ExperienceSchema>;
export type DomainCardRef = z.infer<typeof DomainCardRefSchema>;
export type InventoryItem = z.infer<typeof InventoryItemSchema>;
export type QuestionAnswer = z.infer<typeof QuestionAnswerSchema>;
export type Companion = z.infer<typeof CompanionSchema>;

// ---- Factories: construct a fully-formed empty draft (drafts are always complete objects) ----

export function createEmptyDefinition(): CharacterDefinition {
  return {
    identity: { name: "", pronouns: "", description: "" },
    level: 1,
    classId: null,
    subclassId: null,
    featureChoices: {},
    heritage: { communityId: null, ancestry: { mode: "single", primaryId: null, secondaryId: null } },
    traits: { agility: null, strength: null, finesse: null, instinct: null, presence: null, knowledge: null },
    equipment: {
      primaryWeaponId: null,
      secondaryWeaponId: null,
      armorId: null,
      chosenClassItemId: null,
      potion: null,
    },
    inventory: [],
    gold: { handfuls: 0, bags: 0, chests: 0 },
    background: { answers: [] },
    experiences: [],
    domainCards: [],
    connections: { answers: [] },
    companion: null,
  };
}

export function createCharacter(params: {
  id: string;
  srdVersion: string;
  ownerId?: string;
  now?: string;
}): Character {
  const timestamp = params.now ?? new Date().toISOString();
  return {
    id: params.id,
    meta: {
      createdAt: timestamp,
      updatedAt: timestamp,
      status: "draft",
      schemaVersion: CHARACTER_SCHEMA_VERSION,
      srdVersion: params.srdVersion,
      ownerId: params.ownerId,
    },
    definition: createEmptyDefinition(),
  };
}
