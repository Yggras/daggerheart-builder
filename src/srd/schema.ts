import { z } from "zod";

const SourceSchema = z.object({
  document: z.literal("Daggerheart SRD"),
  version: z.string().min(1),
  pdf: z.object({
    path: z.string().min(1),
    pageStart: z.number().int().positive(),
    pageEnd: z.number().int().positive(),
  }),
  printedPages: z.array(z.number().int().positive()).min(1),
  url: z.string().url(),
});

const ReviewSchema = z.object({
  status: z.enum(["extracted", "reviewed", "corrected"]),
  reviewedAt: z.string().datetime().nullable(),
  notes: z.array(z.string()),
});

const TextSchema = z.object({
  original: z.string().min(1),
  summary: z.string().optional(),
});

const RelationshipSchema = z.object({
  type: z.enum([
    "class",
    "subclass",
    "rule",
    "domain_card",
    "weapon",
    "ancestry",
    "community",
    "armor",
    "loot",
    "adversary",
    "environment",
    "related",
  ]),
  targetId: z.string().regex(/^[a-z0-9]+(?:[._-][a-z0-9]+)*$/),
  label: z.string().min(1),
});

const BaseEntrySchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:[._-][a-z0-9]+)*$/),
  name: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  source: SourceSchema,
  review: ReviewSchema,
  text: TextSchema,
  tags: z.array(z.string().regex(/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/)),
  relationships: z.array(RelationshipSchema).default([]),
});

const TraitSchema = z.enum([
  "agility",
  "strength",
  "finesse",
  "instinct",
  "presence",
  "knowledge",
]);

const RangeSchema = z.enum(["melee", "very_close", "close", "far", "very_far"]);

const DamageTypeSchema = z.enum(["physical", "magic"]);

const BurdenSchema = z.enum(["one_handed", "two_handed"]);

const DamageRollSchema = z.string().regex(/^(?:(?:\d+)?d\d+(?:[+-]\d+)?|\d+)$/);

const LevelRangeSchema = z.object({
  min: z.number().int().positive(),
  max: z.number().int().positive(),
});

const FeatureSchema = z.object({
  name: z.string().min(1),
  text: z.string().min(1),
});

const StatThresholdsSchema = z.object({
  major: z.number().int().positive().nullable(),
  severe: z.number().int().positive().nullable(),
});

export const RuleReferenceEntrySchema = BaseEntrySchema.extend({
  kind: z.literal("rule_reference"),
  category: z.string().min(1),
  headings: z.array(z.string().min(1)),
});

export const ClassEntrySchema = BaseEntrySchema.extend({
  kind: z.literal("class"),
  domains: z.array(z.string().min(1)).min(1),
  startingEvasion: z.number().int().nonnegative(),
  startingHitPoints: z.number().int().positive(),
  classItems: z.array(z.string().min(1)),
  hopeFeature: FeatureSchema,
  classFeatures: z.array(FeatureSchema).min(1),
  subclassIds: z.array(z.string()).min(1),
});

export const SubclassEntrySchema = BaseEntrySchema.extend({
  kind: z.literal("subclass"),
  classId: z.string().min(1),
  spellcastTrait: TraitSchema.nullable(),
  features: z.object({
    foundation: z.array(FeatureSchema).min(1),
    specialization: z.array(FeatureSchema).min(1),
    mastery: z.array(FeatureSchema).min(1),
  }),
});

export const DomainCardEntrySchema = BaseEntrySchema.extend({
  kind: z.literal("domain_card"),
  domain: z.string().min(1),
  level: z.number().int().min(1).max(10),
  cardType: z.enum(["ability", "spell", "grimoire"]),
  recallCost: z.number().int().nonnegative(),
  abilities: z.array(FeatureSchema).min(1),
});

export const WeaponEntrySchema = BaseEntrySchema.extend({
  kind: z.literal("weapon"),
  category: z.enum(["primary", "secondary"]),
  tier: z.number().int().min(1).max(4),
  levelRange: LevelRangeSchema,
  weaponType: z.enum(["physical", "magic"]),
  requiresSpellcastTrait: z.boolean(),
  trait: TraitSchema,
  range: RangeSchema,
  damage: z.object({
    dice: z.string().regex(/^d\d+(?:[+-]\d+)?$/),
    type: DamageTypeSchema,
  }),
  burden: BurdenSchema,
  feature: FeatureSchema.nullable(),
});

export const AncestryEntrySchema = BaseEntrySchema.extend({
  kind: z.literal("ancestry"),
  features: z.array(FeatureSchema).min(1),
});

export const CommunityEntrySchema = BaseEntrySchema.extend({
  kind: z.literal("community"),
  adjectives: z.array(z.string().min(1)).min(1),
  feature: FeatureSchema,
});

export const ArmorEntrySchema = BaseEntrySchema.extend({
  kind: z.literal("armor"),
  tier: z.number().int().min(1).max(4),
  levelRange: LevelRangeSchema,
  baseThresholds: StatThresholdsSchema,
  baseScore: z.number().int().nonnegative(),
  feature: FeatureSchema.nullable(),
});

export const LootEntrySchema = BaseEntrySchema.extend({
  kind: z.literal("loot"),
  lootType: z.enum(["item", "consumable"]),
  roll: z.number().int().positive(),
  maxQuantity: z.number().int().positive().nullable(),
});

export const AdversaryEntrySchema = BaseEntrySchema.extend({
  kind: z.literal("adversary"),
  tier: z.number().int().min(1).max(4),
  role: z.enum(["bruiser", "horde", "leader", "minion", "ranged", "skulk", "social", "solo", "standard", "support"]),
  difficulty: z.number().int().positive(),
  thresholds: StatThresholdsSchema,
  hitPoints: z.number().int().positive(),
  stress: z.number().int().positive(),
  attack: z.object({
    modifier: z.number().int(),
    name: z.string().min(1),
    range: RangeSchema,
    damage: z.object({
      roll: DamageRollSchema,
      type: DamageTypeSchema,
    }),
  }),
  experiences: z.array(
    z.object({
      name: z.string().min(1),
      modifier: z.number().int(),
    }),
  ),
  motivesAndTactics: z.array(z.string().min(1)).min(1),
  features: z.array(FeatureSchema).min(1),
});

export const EnvironmentEntrySchema = BaseEntrySchema.extend({
  kind: z.literal("environment"),
  tier: z.number().int().min(1).max(4),
  environmentType: z.enum(["event", "exploration", "social", "traversal"]),
  difficulty: z.number().int().positive(),
  impulses: z.array(z.string().min(1)).min(1),
  potentialAdversaryIds: z.array(z.string()),
  features: z.array(FeatureSchema).min(1),
});

export const SrdEntrySchema = z.discriminatedUnion("kind", [
  RuleReferenceEntrySchema,
  ClassEntrySchema,
  SubclassEntrySchema,
  DomainCardEntrySchema,
  WeaponEntrySchema,
  AncestryEntrySchema,
  CommunityEntrySchema,
  ArmorEntrySchema,
  LootEntrySchema,
  AdversaryEntrySchema,
  EnvironmentEntrySchema,
]);

export const SrdEntryCollectionSchema = z.array(SrdEntrySchema).superRefine((entries, ctx) => {
  const ids = new Set<string>();
  const slugsByKind = new Set<string>();

  for (const [index, entry] of entries.entries()) {
    if (ids.has(entry.id)) {
      ctx.addIssue({
        code: "custom",
        message: `Duplicate id: ${entry.id}`,
        path: [index, "id"],
      });
    }

    ids.add(entry.id);

    const slugKey = `${entry.kind}:${entry.slug}`;
    if (slugsByKind.has(slugKey)) {
      ctx.addIssue({
        code: "custom",
        message: `Duplicate slug for kind: ${slugKey}`,
        path: [index, "slug"],
      });
    }

    slugsByKind.add(slugKey);

    if (entry.source.pdf.pageEnd < entry.source.pdf.pageStart) {
      ctx.addIssue({
        code: "custom",
        message: "PDF page end must be greater than or equal to page start",
        path: [index, "source", "pdf", "pageEnd"],
      });
    }
  }

  for (const [index, entry] of entries.entries()) {
    for (const [relationshipIndex, relationship] of entry.relationships.entries()) {
      if (!ids.has(relationship.targetId)) {
        ctx.addIssue({
          code: "custom",
          message: `Relationship target does not exist: ${relationship.targetId}`,
          path: [index, "relationships", relationshipIndex, "targetId"],
        });
      }
    }

    if (entry.kind === "class") {
      for (const [subclassIndex, subclassId] of entry.subclassIds.entries()) {
        if (!ids.has(subclassId)) {
          ctx.addIssue({
            code: "custom",
            message: `Subclass target does not exist: ${subclassId}`,
            path: [index, "subclassIds", subclassIndex],
          });
        }
      }
    }

    if (entry.kind === "subclass" && !ids.has(entry.classId)) {
      ctx.addIssue({
        code: "custom",
        message: `Class target does not exist: ${entry.classId}`,
        path: [index, "classId"],
      });
    }

    if (entry.kind === "environment") {
      for (const [adversaryIndex, adversaryId] of entry.potentialAdversaryIds.entries()) {
        if (!ids.has(adversaryId)) {
          ctx.addIssue({
            code: "custom",
            message: `Potential adversary target does not exist: ${adversaryId}`,
            path: [index, "potentialAdversaryIds", adversaryIndex],
          });
        }
      }
    }
  }
});

export type SrdEntry = z.infer<typeof SrdEntrySchema>;
export type SrdEntryCollection = z.infer<typeof SrdEntryCollectionSchema>;
