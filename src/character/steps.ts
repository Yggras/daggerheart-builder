import { CLANK_EXPERIENCE_CHOICE_KEY } from "./effects";
import { TRAIT_ARRAY, TRAIT_NAMES, type CharacterDefinition } from "./schema";

// Wizard step model: order, titles, per-step completion + lock rules. Navigation between unlocked
// steps is always allowed (linear Back/Next + hub jumps); "Complete" is gated on every step being
// complete (CBW-2/3). Step bodies are rendered by the step host. See spec §12.

// featureChoices key holding the Wizard "Strange Patterns" chosen number (1–12) (CBW-13).
export const WIZARD_STRANGE_PATTERNS_KEY = "class.wizard.strange_patterns";

export const STEP_SLUGS = [
  "class",
  "heritage",
  "traits",
  "equipment",
  "background",
  "experiences",
  "domains",
  "connections",
] as const;

export type StepSlug = (typeof STEP_SLUGS)[number];

export type WizardStep = {
  slug: StepSlug;
  title: string;
  /** Short hint shown in the hub. */
  blurb: string;
  isComplete: (definition: CharacterDefinition) => boolean;
  isLocked: (definition: CharacterDefinition) => boolean;
  /** Optional steps don't block "Complete" (narrative, "answer any") but still show progress. */
  optional?: boolean;
};

export type WizardStepStatus = "locked" | "complete" | "optional_unanswered" | "incomplete";

export function isTraitArrayComplete(definition: CharacterDefinition): boolean {
  const values = TRAIT_NAMES.map((trait) => definition.traits[trait]);
  if (values.some((value) => value === null)) return false;
  const sorted = [...(values as number[])].sort((a, b) => a - b);
  const expected = [...TRAIT_ARRAY].sort((a, b) => a - b);
  return sorted.length === expected.length && sorted.every((value, index) => value === expected[index]);
}

function isClassComplete(definition: CharacterDefinition): boolean {
  if (!definition.classId || !definition.subclassId) return false;
  if (definition.classId === "class.wizard" && definition.featureChoices[WIZARD_STRANGE_PATTERNS_KEY] == null) {
    return false;
  }
  if (definition.subclassId === "subclass.ranger.beastbound") {
    if (!definition.companion || !definition.companion.name.trim()) return false;
  }
  return true;
}

function isHeritageComplete(definition: CharacterDefinition): boolean {
  const { communityId, ancestry } = definition.heritage;
  if (!communityId || !ancestry.primaryId) return false;
  if (ancestry.mode === "mixed") {
    return Boolean(ancestry.secondaryId) && ancestry.secondaryId !== ancestry.primaryId;
  }
  return true;
}

function isEquipmentComplete(definition: CharacterDefinition): boolean {
  const { primaryWeaponId, armorId, chosenClassItemId, potion } = definition.equipment;
  return Boolean(primaryWeaponId && armorId && chosenClassItemId && potion);
}

function areExperiencesComplete(definition: CharacterDefinition): boolean {
  return definition.experiences.length === 2 && definition.experiences.every((experience) => experience.text.trim().length > 0);
}

function hasQuestionAnswers(definition: CharacterDefinition, kind: "background" | "connections"): boolean {
  return definition[kind].answers.some((answer) => answer.answer.trim().length > 0);
}

export const WIZARD_STEPS: WizardStep[] = [
  {
    slug: "class",
    title: "Class & Subclass",
    blurb: "Choose your class and one subclass.",
    isComplete: isClassComplete,
    isLocked: () => false,
  },
  {
    slug: "heritage",
    title: "Heritage",
    blurb: "Pick an ancestry and a community.",
    isComplete: isHeritageComplete,
    isLocked: () => false,
  },
  {
    slug: "traits",
    title: "Traits",
    blurb: "Assign +2, +1, +1, +0, +0, −1.",
    isComplete: isTraitArrayComplete,
    isLocked: () => false,
  },
  {
    slug: "equipment",
    title: "Equipment",
    blurb: "Weapons, armor, class item, potion.",
    isComplete: isEquipmentComplete,
    isLocked: (definition) => !definition.classId,
  },
  {
    slug: "background",
    title: "Background",
    blurb: "Answer your background questions.",
    isComplete: () => true,
    isLocked: (definition) => !definition.classId,
    optional: true,
  },
  {
    slug: "experiences",
    title: "Experiences",
    blurb: "Create two Experiences (+2 each).",
    isComplete: areExperiencesComplete,
    isLocked: () => false,
  },
  {
    slug: "domains",
    title: "Domain Cards",
    blurb: "Choose two level-1 domain cards.",
    isComplete: (definition) => definition.domainCards.length === 2,
    isLocked: (definition) => !definition.classId,
  },
  {
    slug: "connections",
    title: "Connections",
    blurb: "Answer your connection questions.",
    isComplete: () => true,
    isLocked: (definition) => !definition.classId,
    optional: true,
  },
];

export function getStep(slug: string): WizardStep | undefined {
  return WIZARD_STEPS.find((step) => step.slug === slug);
}

export function stepIndex(slug: StepSlug): number {
  return WIZARD_STEPS.findIndex((step) => step.slug === slug);
}

export function adjacentStep(slug: StepSlug, direction: 1 | -1): WizardStep | undefined {
  return WIZARD_STEPS[stepIndex(slug) + direction];
}

export function adjacentUnlockedStep(
  slug: StepSlug,
  direction: 1 | -1,
  definition: CharacterDefinition,
): WizardStep | undefined {
  const start = stepIndex(slug);
  for (let index = start + direction; index >= 0 && index < WIZARD_STEPS.length; index += direction) {
    const step = WIZARD_STEPS[index];
    if (step && !step.isLocked(definition)) return step;
  }
  return undefined;
}

export function getStepStatus(step: WizardStep, definition: CharacterDefinition): WizardStepStatus {
  if (step.isLocked(definition)) return "locked";
  if (step.slug === "background") return hasQuestionAnswers(definition, "background") ? "complete" : "optional_unanswered";
  if (step.slug === "connections") return hasQuestionAnswers(definition, "connections") ? "complete" : "optional_unanswered";
  return step.isComplete(definition) ? "complete" : "incomplete";
}

export function getStepMissingReason(step: WizardStep, definition: CharacterDefinition): string {
  if (step.isLocked(definition)) return "Choose a class first.";

  switch (step.slug) {
    case "class":
      if (!definition.classId) return "Choose a class.";
      if (!definition.subclassId) return "Choose a subclass.";
      if (definition.classId === "class.wizard" && definition.featureChoices[WIZARD_STRANGE_PATTERNS_KEY] == null) {
        return "Choose your Strange Patterns number.";
      }
      if (definition.subclassId === "subclass.ranger.beastbound" && !definition.companion?.name.trim()) {
        return "Name your Beastbound companion.";
      }
      return "Ready.";
    case "heritage":
      if (!definition.heritage.ancestry.primaryId) return "Choose an ancestry.";
      if (definition.heritage.ancestry.mode === "mixed" && !definition.heritage.ancestry.secondaryId) {
        return "Choose a secondary ancestry.";
      }
      if (definition.heritage.ancestry.secondaryId === definition.heritage.ancestry.primaryId) {
        return "Choose two different ancestries.";
      }
      if (!definition.heritage.communityId) return "Choose a community.";
      return "Ready.";
    case "traits": {
      const assigned = TRAIT_NAMES.filter((trait) => definition.traits[trait] !== null).length;
      return assigned < TRAIT_NAMES.length ? `Assign all six traits (${assigned}/6).` : "Use each trait value exactly once.";
    }
    case "equipment": {
      const missing: string[] = [];
      if (!definition.equipment.primaryWeaponId) missing.push("primary weapon");
      if (!definition.equipment.armorId) missing.push("armor");
      if (!definition.equipment.chosenClassItemId) missing.push("class item");
      if (!definition.equipment.potion) missing.push("potion");
      return missing.length > 0 ? `Choose ${missing.join(", ")}.` : "Ready.";
    }
    case "experiences": {
      const complete = definition.experiences.filter((experience) => experience.text.trim().length > 0).length;
      return complete < 2 ? `Create two Experiences (${complete}/2).` : "Ready.";
    }
    case "domains":
      return definition.domainCards.length < 2 ? `Choose two domain cards (${definition.domainCards.length}/2).` : "Ready.";
    case "background":
      return hasQuestionAnswers(definition, "background") ? "Answered." : "Optional: unanswered.";
    case "connections":
      return hasQuestionAnswers(definition, "connections") ? "Answered." : "Optional: unanswered.";
    default:
      return "Ready.";
  }
}

export function isDefinitionComplete(definition: CharacterDefinition): boolean {
  return WIZARD_STEPS.every((step) => step.optional || step.isComplete(definition));
}
