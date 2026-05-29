// Curated, source-verified static "always-on" feature effects that the rules engine auto-applies
// so character-sheet numbers are fully correct (CBW-20/21). Kept here in the character module rather
// than in canonical SRD fixtures. See spec §4.1.
//
// The entire SRD has only THREE static creation-time effects. Everything else with a number is
// conditional/in-play and stays as feature text (no static sheet value).
//
// Ancestry effects carry the feature `slot` they come from, because a Mixed Ancestry takes only the
// TOP feature of the primary + the BOTTOM feature of the secondary (CBW-7). Verified slots:
//   - Simiah "Nimble" (+1 Evasion) is the BOTTOM feature.
//   - Clank "Purposeful Design" (+1 to a chosen Experience) is the TOP feature.
// Subclass effects (Stalwart "Unwavering") come from the foundation feature, which is always taken.

export type StaticEffectTarget =
  | "evasion"
  | "majorThreshold"
  | "severeThreshold"
  | "armorScore"
  | "experience";

export type StaticEffect = {
  target: StaticEffectTarget;
  op: "add";
  value: number;
  /** For ancestry-feature effects: which feature slot grants this (gates Mixed Ancestry). */
  ancestrySlot?: "top" | "bottom";
  /** Experience effects apply to the player-chosen Experience (Clank). */
  experienceRef?: "chosen";
  /** Human-readable provenance, e.g. shown as "Evasion 11 (+1 Simiah: Nimble)". */
  label: string;
};

// featureChoices key holding the Experience id that Clank's "Purposeful Design" boosts.
export const CLANK_EXPERIENCE_CHOICE_KEY = "ancestry.clank.purposeful_design";

export const STATIC_EFFECTS: Record<string, StaticEffect[]> = {
  "ancestry.simiah": [{ target: "evasion", op: "add", value: 1, ancestrySlot: "bottom", label: "Simiah: Nimble" }],
  "ancestry.clank": [
    {
      target: "experience",
      op: "add",
      value: 1,
      ancestrySlot: "top",
      experienceRef: "chosen",
      label: "Clank: Purposeful Design",
    },
  ],
  "subclass.guardian.stalwart": [
    { target: "majorThreshold", op: "add", value: 1, label: "Stalwart: Unwavering" },
    { target: "severeThreshold", op: "add", value: 1, label: "Stalwart: Unwavering" },
  ],
};
