# Character Builder Wizard — Living Specification

> **Status:** v1 **implemented** on branch `feat/character-builder` (milestones M1–M6 per the
> approved plan), pending final Android verification + merge. Design decisions CBW-1…25 below remain
> the source of truth. Gates green: `typecheck`, `verify:engine` (25 assertions), `validate:srd`
> (791 entries); web export bundles cleanly.
> **Last updated:** 2026-05-29
> **Owner:** project
>
> This is a *living* document. Every design decision for the character builder wizard
> is recorded here as it is made, via the interrogation session. Open questions are
> tracked in [§7](#7-open-decisions-interrogation-queue); resolved decisions move to
> [§8](#8-decision-log). When this spec stabilizes, durable choices should be promoted
> to ADRs and `decision-log.md`.

---

## 1. Purpose & Vision

Build a **full guided wizard** for Daggerheart character creation — comparable to D&D
Beyond's character builder — that:

- Walks the user through the SRD's **9-step Character Creation** process.
- **Automates and derives** as much as possible (stats, thresholds, damage, etc.) via a
  rules engine, so the user makes meaningful choices and the app computes consequences.
- Surfaces SRD **background questions** and **connection questions** as part of the flow.
- Produces a structured, re-editable character that can later feed level-up and campaign play.

This is a large feature. It begins with this interrogation + specification phase; no code
is written until the spec is approved.

---

## 2. SRD Grounding — The 9 Steps (canonical)

Source: *Daggerheart SRD v1.0 (2025-09-09)*, "Character Creation", printed pages 4–6.
Players create a PC through a series of guided choices — some purely narrative, some mechanical.
Name, pronouns, and Character Description may be filled in at **any point**.

| # | SRD Step | Player choices | Mechanical consequences (engine-derived) |
|---|----------|----------------|------------------------------------------|
| 1 | **Choose a Class and Subclass** | Pick 1 of 9 classes; resolve any class-feature selections; pick 1 of the class's 2 subclasses (take Foundation feature) | Unlocks 2 domains, class feature(s), Hope feature, starting Evasion/HP, class items, Spellcast trait (from subclass) |
| 2 | **Choose Your Heritage** | Pick an **ancestry** (18 options) + a **community** (9 options). **Mixed Ancestry**: top feature of one ancestry + bottom feature of another | 2 ancestry features + 1 community feature |
| 3 | **Assign Character Traits** | Assign the fixed array **+2, +1, +1, +0, +0, −1** across Agility, Strength, Finesse, Instinct, Presence, Knowledge | Trait modifiers feed all rolls |
| 4 | **Record Additional Information** | (mostly automatic) | Level = 1; **Evasion** from class; **HP** from class; **Stress** = 6 slots; **Hope** = 2 |
| 5 | **Choose Starting Equipment** | Tier-1 weapon(s): either one two-handed primary, OR a one-handed primary + one-handed secondary. One Tier-1 armor set. Inventory: torch, 50ft rope, basic supplies, handful of gold; EITHER Minor Health Potion OR Minor Stamina Potion; one class-specific item (pick 1 of 2); GM-approved extras. *(The SRD's "spell-carrying item" line is a templated leftover — verified absent from this SRD, §3.)* | Proficiency = 1; **damage roll** = proficiency × weapon dice (+ flat mods); **armor thresholds** = base + level; **Armor Score** = base score + bonuses |
| 6 | **Create Your Background** | Answer/modify **background questions** (per-class, 3 each). No mechanical effect | None (narrative) |
| 7 | **Create Your Experiences** | Create **2 Experiences**, each **+2**. Cannot be too broad or grant special abilities | 2 spendable Experience modifiers |
| 8 | **Choose Domain Cards** | Choose **2** level-1 cards from the class's 2 domains (one from each, or two from one) | Initial loadout (max loadout 5) |
| 9 | **Create Your Connections** | Inter-PC relationships: describe PCs to each other; answer **connection questions** (per-class, 3 each); suggest/accept/reject connections | Narrative; inherently multiplayer/table-level |

### 2.1 Companion sub-flow (edge case)
The Ranger **Beastbound** subclass introduces an animal companion with its own creation
steps (name, Evasion, companion Experience, attack/range/damage). This is a nested mini-wizard
triggered conditionally. **In scope for v1** (CBW-6); fields grounded in §5 and flow in §12.6.

---

## 3. Data Inventory & Gaps

### Available in canonical fixtures (`data/srd/fixtures/`)
- ✅ Classes (9) — domains, startingEvasion, startingHitPoints, classItems, hopeFeature, classFeatures, subclassIds
- ✅ Subclasses (18) — spellcast trait, foundation/specialization/mastery features
- ✅ Ancestries (18), Communities (9) — features
- ✅ Domain cards (189) — domain, type, level, recall cost, abilities
- ✅ Weapons (204), Armor (34), Loot (120) — including consumables (potions)
- ✅ Rule references (42)

### Gaps that block the wizard
- ❌ **Background questions** (3 per class) — only in the PDF character guides, *not* extracted.
- ❌ **Connection questions** (3 per class) — only in the PDF character guides, *not* extracted.
- ✅ **Class-feature selections** — audited (CBW-13): only Wizard "Strange Patterns" (choose 1–12)
  is a creation-time choice; stored in `definition.featureChoices`.
- ✅ **Spell-carrying class item** — *verified against the PDF (2026-05-29): does NOT exist in this SRD.*
  "carry your spells" appears once (Step 5) as a templated line from the full core rules; every
  class lists exactly two flavor `CLASS ITEMS` and no implement/focus item. Spells are cast via the
  subclass Spellcast trait + magic weapons. **No spell-focus item is modeled.**
- ❓ **Experiences** — no canonical list (open-ended by design); SRD provides examples only. The
  example list (Backgrounds/Characteristics/Specialties/Skills/Phrases) will be a small authored
  dataset for suggestions (CBW-12).

> Closing the background/connection gap is the **prerequisite data task**, fully scoped in **§11**:
> extend `extract-classes-subclasses.ts` to add `backgroundQuestions` + `connectionQuestions`
> (`{ id, text }`, 3 each) as fields on the class entry (CBW-5/CBW-11/CBW-19).

---

## 4. Rules Engine — Derived Values (scoped)

A pure, side-effect-free function in `src/character/engine.ts` (CBW-14):
`derive(definition, srdIndex) → DerivedStats`. Recomputed on load, **never persisted** (CBW-16).
Field shapes below are confirmed against `src/srd/schema.ts` (2026-05-29).

### 4.1 Core boundary — structured fields + static always-on effects (CBW-20, CBW-21)
Derivations read structured SRD numeric/enum fields (class, subclass, weapon, armor) + the trait
array, **plus a curated set of static, always-on feature effects** that are auto-applied so sheet
numbers are fully correct. Feature numbers fall into two kinds:

- **Static / always-on** (a permanent bonus = a real sheet number) → **auto-applied** via a small
  effects model. The entire SRD has only **3** such creation-time effects:
  - `ancestry.simiah.nimble` → +1 Evasion
  - `subclass.guardian.stalwart`/Unwavering → +1 Major **and** Severe threshold
  - `ancestry.clank.purposeful_design` → +1 to a **player-chosen** Experience (target stored in
    `definition.featureChoices`)
- **Conditional / in-play** (e.g. Faerie *Wings* +2 Evasion only while flying + mark Stress vs. that
  attack; Wayfinder *Ruthless Predator* mark Stress for +1 Proficiency) → **shown as text, not a
  static value.** They cannot collapse into a sheet number and have no v1 application point (no
  live-combat state). May be tagged later for a play-mode helper.

This refines the earlier *"Defer Structured Mechanical Effects"* deferral (decision-log 2026-05-25):
we pull forward a **minimal** effects model for the always-on subset only. Effects live in a curated,
source-verified map **`src/character/effects.ts`** (CBW-21), keyed by feature/ancestry/subclass id —
no changes to canonical fixtures or extraction scripts; promotable to the SRD schema later if the
compendium wants effects too.

```
// src/character/effects.ts (shape)
type StaticEffect = { target: "evasion" | "threshold" | "experience" | "armorScore" | ... ;
                      op: "add"; value: number;
                      experienceRef?: "chosen" };   // Clank: applies to the chosen Experience
const STATIC_EFFECTS: Record<string /*srd id*/, StaticEffect[]>
```

### 4.2 Derivations (level 1)

| Derived value | Formula at L1 | Source field(s) |
|---|---|---|
| Trait modifiers | identity map of the assigned array | `definition.traits` (validate multiset = {+2,+1,+1,+0,+0,−1}) |
| Evasion | `class.startingEvasion + Σ static Evasion effects` | `classId` + `STATIC_EFFECTS` (e.g. Simiah +1) |
| HP max | `class.startingHitPoints` | `classId` |
| Stress slots | `6` (constant) | SRD Step 4 |
| Hope | `2` (constant) | SRD Step 4 |
| Proficiency | `1` (constant at L1) | SRD Step 5 |
| Attack trait modifier (per weapon) | `traits[weapon.trait]`; if `weapon.trait === "spellcast"` → use Spellcast trait modifier | `weapon.trait` + subclass |
| Damage roll (per weapon) | `{proficiency}d{X}{±N}` from `weapon.damage.dice` (proficiency scales **dice count only**, flat mod unchanged) | `equipment.primaryWeaponId`, `secondaryWeaponId?` |
| Damage type (per weapon) | `weapon.damage.type` (`physical` \| `magic` \| `physical_or_magic`) | weapon |
| Armor Score | `armor.baseScore` | `equipment.armorId` |
| Major threshold | `armor.baseThresholds.major + level + Σ static threshold effects` | armor + `STATIC_EFFECTS` (e.g. Stalwart +1) |
| Severe threshold | `armor.baseThresholds.severe + level + Σ static threshold effects` | armor + `STATIC_EFFECTS` |
| Spellcast trait | `subclass.spellcastTrait` (nullable) | `subclassId` |
| Spellcast modifier | `traits[spellcastTrait]` when not null | subclass + traits |
| Experience modifiers | `2 + Σ static Experience effects` per Experience (Clank +1 applies to the chosen one) | `definition.experiences` + `STATIC_EFFECTS` + `featureChoices` |
| Resolved features | 2 ancestry + 1 community + class + subclass-foundation feature objects (display only) | heritage, class, subclass |

**Damage dice parsing:** `/^d(\d+)([+-]\d+)?$/` → `{count: proficiency}d{group1}{group2?}`.
SRD example: `d6+1` @ prof 1 → `1d6+1`; @ prof 2 → `2d6+1` (flat `+1` never multiplies).

### 4.3 Edge cases
- `baseThresholds.major`/`severe` are **nullable** → if null, threshold is null (display "—").
- `physical_or_magic` → display "Physical or Magic".
- **Mixed Ancestry** (CBW-7): resolved features = top feature of primary + bottom feature of
  secondary; no numeric effect at creation.
- **Non-caster subclass**: `spellcastTrait` null → no Spellcast roll surfaced.
- **Secondary weapon** only valid when the primary is `one_handed` (a *validation* rule, upstream of
  the engine — see §4.5), but the engine derives a damage line for each equipped weapon present.
- **Companion** (Beastbound, CBW-6): companion attack damage roll = **PC proficiency** × companion
  damage die (SRD); companion Evasion is its own (starts 10). Derived only when `companion` present.

### 4.4 `DerivedStats` output shape (sketch)
```
DerivedStats {
  traits: { agility, strength, finesse, instinct, presence, knowledge }  // modifiers
  evasion, hpMax, stressSlots, hope, proficiency
  attacks: [ { weaponId, slot: "primary" | "secondary",
               attackTrait, attackModifier, damageRoll, damageType } ]
  armorScore
  thresholds: { major: number | null, severe: number | null }
  spellcast: { trait, modifier } | null
  experiences: [ { text, modifier } ]   // modifier = 2 + any static effect (e.g. Clank +1)
  features: { ancestry: Feature[], community: Feature, class: Feature[], subclassFoundation: Feature[] }
  appliedEffects: [ { sourceId, target, value } ]   // provenance: which features changed which numbers
  companion?: { evasion, attack: { damageRoll, damageType, range } }
}
```

### 4.5 Engine preconditions (validated upstream by the strict wizard, CBW-2)
The engine assumes a legal `definition`; legality is enforced by the wizard/schema, not the engine:
trait multiset exactness; weapon burden combo (one two-handed **or** one-handed primary + one-handed
secondary); armor is Tier-1; domain cards belong to the class's two domains and are level ≤ 1; mixed
ancestry uses two **distinct** ancestries; exactly 2 Experiences. These are listed as the engine's
documented input contract.

---

## 5. Character Data Model (refined; CBW-15…18 resolved)

Lives in a new **`src/character/`** module (CBW-14), Zod-validated. The model separates the static
**`definition`** (all build choices — the only part the v1 builder writes) from a reserved
**`playState`** (mutable live-session values — defined but unused in v1) per CBW-15. Choices store
SRD **IDs**; the engine **recomputes** derived values from `definition` + canonical SRD data on load
(CBW-16) — derived values are never persisted as truth. Strict mode (CBW-2): no manual overrides.

```
Character {
  id                                          // uuid
  meta { createdAt, updatedAt,
         status: "draft" | "complete",         // draft autosave lifecycle (CBW-24)
         schemaVersion,                        // for model migrations
         srdVersion }                          // detect drift if SRD data changes (CBW-16)

  // ---------- DEFINITION — build choices; the ONLY part written in v1 (CBW-15) ----------
  definition {
    identity { name, pronouns, description }   // editable at any step (per SRD)
    level: 1                                    // creation only; advancement layered on later (CBW-9)

    classId, subclassId                         // Step 1
    featureChoices: { [featureKey]: value }     // generic home for ALL creation-time feature selections:
                                                //   Wizard "Strange Patterns" 1–12 (CBW-13);
                                                //   Clank "Purposeful Design" → which Experience gets +1 (CBW-20);
                                                //   Elemental Origin → chosen element; (extends as needed)

    heritage {                                  // Step 2 (CBW-7)
      communityId
      ancestry {
        mode: "single" | "mixed"
        primaryId                               // single: take BOTH features of primary
        secondaryId?                            // mixed: TOP feature of primary + BOTTOM of secondary
      }
    }

    traits { agility, strength, finesse,        // Step 3 — each a modifier from the fixed
             instinct, presence, knowledge }    //          array +2,+1,+1,+0,+0,-1 (engine validates multiset)

    equipment {                                 // Step 5
      primaryWeaponId
      secondaryWeaponId?                         // only when primary is one-handed
      armorId
      chosenClassItemId                          // pick 1 of the class's 2 items (CBW-13)
      // (no spell-focus item: verified absent from this SRD, 2026-05-29 — see §3)
      potion: "minor_health" | "minor_stamina"
    }
    inventory: [ { srdId?, label?, qty } ]       // structured; srdId for canonical loot, label for custom (CBW-17)
    gold { handfuls, bags, chests }              // SRD gold counters (CBW-17)

    background  { answers: [ { id, questionId?, prompt, answer } ] }   // Step 6 — prompt snapshot kept so
                                                                        //          edited/custom questions survive (CBW-11)
    experiences: [ { id, text, modifier },       // Step 7 — two entries, modifier = 2 (CBW-12)
                   { id, text, modifier } ]
    domainCards: [ { cardId, location: "loadout" | "vault" } ]          // Step 8 — creation: 2× loadout (CBW-18)
    connections { answers: [ { id, questionId?, prompt, answer } ] }    // Step 9 — deferred linking (CBW-1)

    companion?: {                                // Ranger Beastbound only (CBW-6); grounded in SRD companion steps
      name, animalKind                           //   Step 1 (description; art deferred)
      evasion                                    //   Step 2 — starts at 10
      experiences: [ { id, text, modifier },     //   Step 3 — two, +2 each
                     { id, text, modifier } ]
      attack { description, range, damageDie,    //   Step 4 — L1: range "Melee", die "d6"
               damageType: "physical" | "magic" }
    }
  }

  // ---------- PLAY-STATE — reserved shape, NOT written by the v1 builder (CBW-15) ----------
  playState?: {
    currentHp, markedStress, currentHope,        // live-session counters
    goldSpent, domainCardMoves,                  // loadout/vault swaps during play
    companion?: { markedStress }
    // fully specified when campaign play is built; here only to reserve the boundary
  }
}
```

**Derived — recomputed by the engine from `definition` + SRD data, never stored as truth (CBW-16; see §4):**
Evasion, HP max, Stress slots (6), Hope (2), Proficiency (1), damage roll, armor thresholds (base+level),
Armor Score, Spellcast trait/roll, trait modifiers, resolved ancestry/community/class/subclass features.

Requirements:
- Reference canonical SRD entity **IDs** for every choice; resolve display data from fixtures.
- Cleanly separate **stored choices** (`definition`) from **derived values** (engine) and **live state** (`playState`).
- Be Zod-validated; `schemaVersion` + `srdVersion` carried for migrations and drift detection.
- Support re-opening/editing and future level-up + live play without reshaping the root model.

---

## 6. Non-Goals (this phase)
- No implementation until the spec is approved.
- No Supabase integration (gated by project constraints). v1 persistence is **local-first** (CBW-4); the model is shaped for future sync.
- No level-up/advancement flow beyond ensuring the model can accommodate it later.
- No campaign-play integration.

---

## 7. Open Decisions (interrogation queue)

Each decision gets an ID (CBW-#). Status: `open` → `resolved` (moves to §8).

| ID | Decision | Status |
|----|----------|--------|
| CBW-1 | Group/connections model: solo-only, solo-with-deferred-connections, or party-aware? | ✅ resolved |
| CBW-2 | Rules-engine strictness: strict SRD enforcement vs. guided-but-overridable (homebrew/manual)? | ✅ resolved |
| CBW-3 | Wizard navigation: strictly linear vs. free navigation / hub with non-linear jumps? | ✅ resolved |
| CBW-4 | Persistence now: local-first storage vs. design model only and defer storage? | ✅ resolved |
| CBW-5 | Background/connection data gap: how to source (PDF extraction vs. author) and where to store? | ✅ resolved (storage shape → CBW-11/CBW-19) |
| CBW-6 | Companion (Beastbound) sub-flow: in scope for v1 or deferred? | ✅ resolved |
| CBW-7 | Mixed Ancestry support: in scope for v1 or deferred? | ✅ resolved |
| CBW-8 | Platform priority for first build: web, Android, or both? | ✅ resolved |
| CBW-9 | Scope of rules engine for v1: full derivation vs. minimal (creation-only values)? | ✅ resolved |
| CBW-10 | Multiple characters per user / character list management? | ✅ resolved |
| CBW-11 | Where to store background/connection questions: fields on class entry vs. new SRD kind? | ✅ resolved |
| CBW-12 | Experiences input: free-text only vs. free-text + suggestion list from SRD examples? | ✅ resolved |
| CBW-13 | Class-feature inline selections (Step 1): which classes have them and how modeled? | ✅ resolved |
| CBW-14 | Character data-model location & validation (e.g. `src/character/`, Zod schema name)? | ✅ resolved |
| CBW-15 | Separate static `definition` from mutable `playState`? | ✅ resolved |
| CBW-16 | Derived values: recompute from choices vs. persist a snapshot? | ✅ resolved |
| CBW-17 | Inventory & gold: structured entries vs. plain strings? | ✅ resolved |
| CBW-18 | Domain cards: model loadout/vault location now vs. flat list? | ✅ resolved |
| CBW-19 | Question storage shape: `{ id, text }` objects vs. plain strings? | ✅ resolved |
| CBW-20 | Engine derivation: structured fields + auto-apply static always-on effects; conditional stays text | ✅ resolved |
| CBW-21 | Static effects data home: curated map in `src/character/effects.ts` vs. SRD feature schema | ✅ resolved |
| CBW-22 | Wizard routing: per-step Expo Router routes vs. single screen + internal state | ✅ resolved |
| CBW-23 | Live derived stats surfacing during the wizard | ✅ resolved |
| CBW-24 | In-progress saving: continuous draft autosave vs. save-at-end | ✅ resolved |
| CBW-25 | Beastbound companion sub-flow placement | ✅ resolved |

*(More decisions will be appended as the interrogation proceeds.)*

---

## 8. Decision Log

*(Resolved decisions recorded here in ascending ID order, with rationale.)*

### CBW-1 — Connections model: **solo creation + deferred connections** (2026-05-29)
Build one PC at a time. Step 9 surfaces the class's connection questions as prompts the user
can answer/record, but there is no live multi-PC linking; connections are finalized later or at
the table. No party/group data model required for v1 (keeps scope off campaign play).

### CBW-2 — Rules-engine strictness: **strict SRD enforcement** (2026-05-29)
Only SRD-legal choices are selectable; derived values are computed and read-only (no manual
override, no homebrew in v1). Guarantees valid characters and a clean rules engine. Homebrew/
override may be revisited post-v1.

### CBW-3 — Wizard navigation: **linear with Back/Next + a step hub** (2026-05-29)
Guided linear order through Steps 1–9 with Back/Next, plus a step overview/hub allowing jumps
to any unlocked/completed step. Name, pronouns, and Character Description are pinned and
editable at any point (per SRD).

### CBW-4 — Persistence: **local-first now** (2026-05-29)
Characters are saved on-device (offline-first, consistent with ADR-0004) using a local store
(e.g. AsyncStorage). The character model is shaped for future Supabase sync, but **no Supabase
calls in v1** (backend remains gated). This lets the builder actually save and reload work.

### CBW-5 — Background/connection questions: **extract via script** (2026-05-29)
Pull the 18 question sets (3 background + 3 connection per class) from the PDF into canonical
fixtures, validated by Zod and `validate:srd`. **Approach finalized in §11: extend the existing
`scripts/extract-classes-subclasses.ts`** (not a new script) — the question blocks live inside the
class sections it already parses. Storage shape resolved as `{ id, text }` fields on the class entry
(CBW-11/CBW-19). **Prerequisite data task before the wizard's Steps 6 & 9 can be fully built.**

### CBW-6 — Beastbound companion: **in scope for v1** (2026-05-29)
When the chosen subclass is Ranger Beastbound, a nested companion mini-wizard (name, Evasion,
companion Experience, attack/range/damage) is triggered. Companion data is part of the character
model. *Data note (done):* companion fields verified against the PDF Beastbound section and grounded
in the model (§5) and flow (§12.6); placement decided in CBW-25.

### CBW-7 — Mixed Ancestry: **in scope for v1** (2026-05-29)
Step 2 supports both single ancestry and Mixed Ancestry (top/first feature of ancestry A +
bottom/second feature of ancestry B). Model must store the two source ancestries and which
feature is taken from each.

### CBW-8 — Platform: **Android first, web secondary** (2026-05-29)
Primary verification on Android device (`npm run android`), matching how the compendium was
tested. Web kept working but secondary.

### CBW-9 — Rules engine scope: **creation-only derivation now, architected for advancement** (2026-05-29)
v1 derives everything needed for a clean level-1 character (Evasion, HP, Stress=6, Hope=2,
Proficiency=1, damage roll, armor thresholds = base+level, Armor Score, Spellcast trait,
trait modifiers, domain loadout). Level-up/advancement math is **out of scope for v1** but
is a **hard future requirement** for live-session play — the character data model and engine
**must be designed so advancement can be layered on later** without a rewrite.
*Rationale (user):* "I want the first iteration of the character builder clean, but level up
and advancements is a must for future live session play."

### CBW-10 — Character management: **list + multiple characters** (2026-05-29)
v1 includes a `/characters` screen listing saved PCs with create/open/delete. Local-first storage
makes multiple characters nearly free, and it's the natural entry point for the builder.

### CBW-11 — Question storage: **fields on the class entry** (2026-05-29)
`backgroundQuestions[]` and `connectionQuestions[]` are added to the existing class schema (1:1
with class, no independent identity). Avoids a 12th entity kind. Populated via the CBW-5
extraction pass and validated by `validate:srd`.

### CBW-12 — Experiences input: **free-text + SRD suggestions** (2026-05-29)
Each of the 2 Experiences is free-text (+2), with the SRD's example list (Backgrounds,
Characteristics, Specialties, Skills, Phrases) shown as tappable suggestions. The example list is
a small static authored dataset to be added (alongside the class-guide extraction). Free-text is
the actual input; suggestions are optional assists. No strict validation of Experience wording in v1.

### CBW-13 — Class-feature creation selections: **only Wizard "Strange Patterns"** (2026-05-29)
Audit of all 9 classes + 18 subclasses found exactly one bespoke creation-time class-feature
selection:
- **Wizard / Strange Patterns** — *choose a number 1–12* (changeable on long rest). The model
  needs a per-character store for this (a generic `featureChoices` map keyed by feature, so future
  classes/level-up selections fit the same shape).

Other "choose" features are **in-play**, not creation, and require no builder prompt: Sorcerer
*Channel Raw Power*, Warrior *Attack of Opportunity*. The standard list-pick selections (subclass,
class item, potion, domain cards) are handled by their respective steps, not as feature choices.

**Data-verification tasks surfaced by this audit (track with the CBW-5 extraction pass):**
- `classItems` currently holds **two** items per class; Step 5 has the player **pick one**. The
  builder must present this as a single-choice (and the model stores the chosen item).
- ~~SRD Step 5 references "the class-specific item you selected to carry your spells"~~ **RESOLVED
  (2026-05-29):** verified against the PDF — no spell-focus item exists in this SRD. "carry your
  spells" is a single templated Step-5 line; every class has only its two flavor items, and spells
  are cast via the subclass Spellcast trait + magic weapons. **No spell-focus item is modeled**,
  and there is no extraction work for it.

### CBW-14 — Character model location: **new `src/character/` module** (2026-05-29)
Create `src/character/` (parallel to `src/srd/` and `src/compendium/`) holding the Zod
character schema, rules-engine derivations, local persistence, and wizard step definitions.
Keeps **mutable user data** distinct from **read-only canonical SRD data** (different lifecycles:
local-first/sync vs. canonical). The character object must be Zod-validated like all runtime data.

### CBW-15 — Build vs. play-state: **separate now, build only `definition` in v1** (2026-05-29)
The character model splits into `definition` (all build choices) and a reserved `playState` (live
counters: current HP, marked Stress, current Hope, gold spent, loadout swaps, companion Stress). v1
only writes `definition`; `playState` is defined to fix the boundary but is unused until campaign
play is built. Directly serves the "architect for live play + level-up" requirement (CBW-9) and
keeps immutable build data cleanly separable for future Supabase sync.

### CBW-16 — Derived values: **recompute + version stamp** (2026-05-29)
Choices in `definition` are the single source of truth; the engine recomputes derived stats from
`definition` + SRD data on load (held in memory, never persisted as truth). Each character stores
`srdVersion` and `schemaVersion` in `meta` to detect drift when SRD data or the model changes.
Avoids stale duplicated state and keeps the model lean.

### CBW-17 — Inventory & gold: **structured entries + gold counters** (2026-05-29)
Inventory items are `{ srdId?, label?, qty }` — `srdId` links canonical loot (potions, etc.), `label`
covers the torch/rope/custom items. Gold uses the SRD's `{ handfuls, bags, chests }` counters. Keeps
the link to canonical data and supports future inventory/equipment management.

### CBW-18 — Domain cards: **model loadout/vault location now** (2026-05-29)
Each held card is `{ cardId, location: "loadout" | "vault" }`. At creation both cards go to the
loadout. The structure is cheap now and is exactly what live play (5-card loadout cap) and level-up
card grants require — avoids a later refactor.

### CBW-19 — Question storage shape: **`{ id, text }` objects with deterministic IDs** (2026-05-29)
Background/connection questions are stored as `{ id, text }` (IDs `class.<slug>.background.<n>` /
`class.<slug>.connection.<n>`), not plain strings. The character model references them via
`answers[].questionId`; IDs are stable across reordering/edits, and custom questions simply omit
`questionId`. Enforced as `z.array(QuestionSchema).length(3)` on `ClassEntrySchema` (see §11.4).

### CBW-20 — Engine derivation: **structured fields + auto-applied static always-on effects** (2026-05-29; refined from initial structured-only stance after discussion)
The engine derives from structured SRD fields + the trait array **and auto-applies a curated set of
static, always-on feature effects** so sheet numbers (Evasion, thresholds, the Clank-boosted
Experience) are fully correct. The whole SRD has only **3** such creation-time effects (Simiah
*Nimble* +1 Evasion; Stalwart *Unwavering* +1 thresholds; Clank *Purposeful Design* +1 to a chosen
Experience). **Conditional / in-play** numeric effects (Faerie *Wings*, Wayfinder *Ruthless
Predator*, Elemental/Primal Origin, etc.) are **not** folded into static numbers — they have no
single sheet value and no v1 application point (no live-combat state); they remain feature text and
may be tagged later for play-mode. `DerivedStats.appliedEffects` records provenance so the UI can
show e.g. "Evasion 11 (+1 Simiah: Nimble)". Refines the *"Defer Structured Mechanical Effects"*
deferral (decision-log 2026-05-25) by pulling forward a minimal always-on effects model.
*Rationale (user):* wants to autocompute as much as possible; the static subset is small, bounded,
and makes the sheet correct, while conditional effects are genuinely not static values.

### CBW-21 — Static effects data home: **curated map in `src/character/effects.ts`** (2026-05-29)
The static-effect data lives in a small, source-verified `Record<srdId, StaticEffect[]>` in the
character engine — not in canonical SRD fixtures. Avoids touching fixtures + extraction scripts for
3 entries; keeps "how an effect modifies a character" with the builder. Promotable to an SRD
`FeatureSchema.effects` field later if the compendium needs to display effects.

### CBW-22 — Wizard routing: **per-step Expo Router routes** (2026-05-29)
Each step is its own route under `/characters/[id]/build/[step]`, backed by the autosaved draft in
the local store; a hub at `/characters/[id]/build` allows jumps. Chosen over single-screen-with-state
so the Android hardware Back button (primary platform, CBW-8) moves between steps correctly and
resume/deep-linking works; also matches the compendium's nested-route style.

### CBW-23 — Live derived stats: **compact, collapsed-by-default sticky summary** (2026-05-29)
A single-line summary bar of key derived values, expandable on tap to a full provenance breakdown.
Must keep a minimal footprint and not take space from step content (user constraint) — collapsed by
default, hideable when space is tight. Makes the rules engine's automation visible during the flow.

### CBW-24 — In-progress saving: **continuous draft autosave** (2026-05-29)
"New" creates a `status: "draft"` character in the local store, autosaved (debounced) on every
change; resumable after app close; shown as "Draft" in `/characters`. Review's "Complete" flips
`status` to `"complete"`. Adds `meta.status` to the model.

### CBW-25 — Beastbound companion sub-flow: **nested after the subclass pick** (2026-05-29)
When subclass = Beastbound, the `class` step expands inline into the companion mini-flow (name/animal,
Evasion 10, two +2 Experiences, attack), then continues. Adjacent to the choice that creates it;
hidden for all other subclasses.

---

## 9. Build Sequencing (proposed, for the design/approval gate)

A suggested order once implementation is approved. **Not started.**

1. **Prerequisite data task — fully scoped in §11**: extend `extract-classes-subclasses.ts` to add
   `backgroundQuestions` + `connectionQuestions` (3 each) to the class schema + fixtures.
   (Class-item "pick one" already supported; spell-focus item verified non-existent — see §3.)
   Separately, author the static Experience-suggestions list (CBW-12). Run `validate:srd` + `typecheck`.
2. **Character schema** (`src/character/schema.ts`): Zod model per §5 + `schemaVersion`.
3. **Rules engine** (`src/character/engine.ts`): creation-only derivations per §4 (pure functions),
   plus the curated static-effects map (`src/character/effects.ts`, 3 entries — CBW-20/21) summed
   into Evasion/thresholds/Experience with `appliedEffects` provenance.
4. **Local store** (`src/character/store.ts`): offline persistence + character list CRUD (CBW-10).
5. **Wizard shell** (§12): `/characters` list, `/characters/[id]/build` hub, per-step routes
   (CBW-22), `StepFooter`/`StepHub`/`StatSummaryBar` components, compact live summary (CBW-23),
   draft autosave (CBW-24), pinned identity.
6. **Steps 1–9** as per-step route screens (§12.3), strict selection (CBW-2), incl. Mixed Ancestry
   (CBW-7) and the nested Beastbound companion sub-flow (CBW-6/CBW-25).
7. **Review screen** + Complete; read-only `/characters/[id]` sheet.
8. Verify on **Android** (CBW-8), web secondary.

## 10. Still To Decide (design/implementation time — not blocking)
- Exact Zod field names/enums and validation messages.
- Shared form primitives / visual styling within each step (no UI kit — project constraint).
- Trait-assignment input affordance (steppers vs. dropdowns vs. drag).
- Domain-card picker detail UX (filter to the class's 2 domains, level ≤ 1).

*(Resolved during scoping: live-stats presentation → CBW-23; companion fields → grounded in §5/§12.6;
wizard component set → §12.7.)*

---

## 11. Prerequisite Data Task — Background & Connection Questions (extraction scope)

Closes the only remaining data gap (CBW-5) so wizard Steps 6 & 9 have real SRD prompts. **This is
step 1 of the build sequence (§9) and the only one that touches SRD data; it must land before
the wizard's Background/Connections steps.** No app code involved.

### 11.1 Verified source facts (2026-05-29, against the SRD PDF)
- Exactly **9 `BACKGROUND QUESTIONS` blocks + 9 `CONNECTIONS` blocks** — one of each per class, in
  SRD class order: Bard, Druid, Guardian, Ranger, Rogue, Seraph, Sorcerer, Warrior, Wizard.
- Each block = **1 constant intro line + exactly 3 question bullets** → **54 questions total**.
- Intro lines are constant boilerplate and are **dropped** from stored data:
  - Background: *"Answer any of the following background questions. You can also create your own questions."*
  - Connections: *"Ask your fellow players one of the following questions for their character to answer, or create your own questions."*
- Questions belong to the **class** (not subclass), confirming CBW-11 (fields on the class entry).

### 11.2 Approach — extend `scripts/extract-classes-subclasses.ts` (not a new script)
That script already defines each class's section boundaries (`heading` / `nextHeading`), runs
`pdftotext`, and owns the spacing-cleanup pipeline; the question blocks sit inside those same
class sections. Reuse it.

**Per-class parsing:**
1. Within the class's `[heading, nextHeading)` slice, locate the `BACKGROUND QUESTIONS` and
   `CONNECTIONS` markers.
2. For each marker: take following text, drop the constant intro line, split on `•`, take 3 questions.
3. **Truncate the 3rd question at section bleed-through.** Confirmed bleed cases: **Druid, Ranger,
   Seraph** connection blocks absorb the next section (running headers + e.g. `BEASTFORM OPTIONS`).
   Strip with a regex for the page-number/running-header pattern
   (`\d+\s+\d+\s+Daggerheart SRD( Daggerheart SRD)?…`) and any trailing ALL-CAPS heading.
4. Apply existing spacing `cleanupRules`; add rules for artifacts seen here ("communityyou",
   "foryou", "Aterrible", other joined words). Record cleanup labels in the review report.
5. **Assert exactly 3 questions per block per class** (hard fail otherwise) — guards against silent
   under/over-capture from bleed-through.

### 11.3 Storage shape (CBW-11 / CBW-19) — **LOCKED**
Questions are stored as arrays of **`{ id, text }`** with **deterministic IDs**, so the character
model's `background.answers[].questionId` / `connections.answers[].questionId` reference them stably
(robust to reordering/edits; survives custom/edited questions that carry no `questionId`):
```
backgroundQuestions: [ { id: "class.bard.background.1", text: "…" }, … ]   // exactly 3
connectionQuestions: [ { id: "class.bard.connection.1", text: "…" }, … ]   // exactly 3
```
ID scheme: `class.<slug>.background.<n>` and `class.<slug>.connection.<n>`, `n` = 1-based block order.

### 11.4 Schema change (`src/srd/schema.ts`)
Add to `ClassEntrySchema`:
```
const QuestionSchema = z.object({ id: z.string().min(1), text: z.string().min(1) });
// …
backgroundQuestions: z.array(QuestionSchema).length(3),
connectionQuestions: z.array(QuestionSchema).length(3),
```
`.length(3)` enforces the verified count; relax to `.min(1)` only if a future SRD varies.

### 11.5 Regeneration-safety & validation
- These are **extracted** (straight from `pdftotext`), so unlike the authored rule_references they
  need no `authoredRules` carry (ADR-0013) — but the parser must reproduce them **deterministically**.
- Promote regenerated output to `data/srd/fixtures/classes.json` (existing file; no new kind/route).
- Run `npm run validate:srd` + `npm run typecheck`; spot-check all 18 blocks against the PDF in the
  review report (the 3 bleed-through classes especially).

### 11.6 Size & boundaries
Small, localized: one script extended, one schema field pair, one fixture regeneration. **No new
entity kind, fixture file, or route.** The Experiences suggestion list (CBW-12) is a *separate*
small authored dataset, tracked independently — not part of this task.

---

## 12. Wizard Step & UX Flow (scoped)

Mirrors app conventions: Expo Router `Stack` (screens registered in `app/_layout.tsx`), plain RN +
`src/theme.ts` (no UI kit — project constraint), nested-directory routes, and reuse of
`src/compendium/components` (`Section`, `TagBadges`, `LinkedText`, `HighlightedText`).

### 12.1 Routes & screens (CBW-22 — per-step routes)
```
/characters                          → saved-character list (CBW-10): cards (name, class, Draft/Complete) + "New"
/characters/[id]/build               → step hub: overview of all steps + jump to any unlocked step
/characters/[id]/build/[step]        → one screen per step (slugs below)
/characters/[id]/build/review        → Review + "Complete" (writes status: complete)
/characters/[id]                     → read-only character sheet (v1 view of a completed character)
```
Step slugs (linear order): `class · heritage · traits · details · equipment · background ·
experiences · domains · connections · review`. (`companion` is nested in `class`, not its own route —
see §12.6.) Each is registered in the root `Stack`. Wizard state is the draft in the local store
(CBW-4/CBW-24); per-step routes read/write that draft, so the Android hardware Back button moves
between steps naturally.

### 12.2 Navigation model (CBW-3)
- **Linear** Back/Next, plus the **hub** for non-linear jumps to any unlocked step.
- **Identity** (name, pronouns, description) is **pinned** — editable at any time from a header
  affordance, **not** a gating step (per SRD "fill in at any point").
- **Step status** in the hub: `complete` ✓ / `current` / `available` / `locked`.
- **Unlock/dependency rules** (the only real prerequisites):
  - `class` is always available and effectively first.
  - `domains` requires a class (needs the class's two domains).
  - `equipment`'s class-item pick requires a class.
  - `companion` content shows only when subclass = Ranger Beastbound.
  - All other steps are independent but presented in SRD order.
- **Strict gating (CBW-2):** Next/Complete enabled only when the current step is valid; illegal
  options are filtered out or disabled, never overridable.

### 12.3 Per-step screen content (SRD step → screen)

| Slug | SRD step | Screen content |
|------|----------|----------------|
| `class` | 1 | Class picker (9); then subclass picker (2, takes Foundation); resolve creation `featureChoices` (e.g. Wizard number); **Beastbound → nested companion sub-flow (§12.6)**. |
| `heritage` | 2 | Ancestry picker with **single / mixed** toggle (CBW-7: mixed = top feature of primary + bottom of secondary, two distinct); community picker. |
| `traits` | 3 | Assign the fixed array **+2,+1,+1,+0,+0,−1** across the 6 traits (steppers/pickers); engine validates the exact multiset. |
| `details` | 4 | Mostly automatic — confirm Level 1, and show derived Evasion / HP / Stress 6 / Hope 2. Minimal interaction. |
| `equipment` | 5 | Tier-1 weapon(s) (primary; secondary only if primary one-handed); Tier-1 armor; **pick 1 of 2 class items**; **potion** (Health/Stamina); standard items auto-added; gold counters. |
| `background` | 6 | The class's **3 background questions** (from §11) as free-text prompts; allow edit/replace/add. |
| `experiences` | 7 | Two free-text Experiences (+2) with tappable SRD suggestions (CBW-12); show effective modifier (e.g. +3 if Clank). |
| `domains` | 8 | Pick **2** cards from the class's two domains, level ≤ 1; both enter the loadout. |
| `connections` | 9 | The class's **3 connection questions** as free-text prompts (deferred linking, CBW-1). |
| `review` | — | Full computed sheet (engine output incl. `appliedEffects` provenance) + **Complete**. |

### 12.4 Live derived summary (CBW-23 — compact, must not crowd content)
A **single-line, collapsed-by-default** sticky bar showing a few key derived values (e.g.
`Evasion · HP · Maj/Sev · Hope · Stress · Proficiency`); **tap to expand** a full breakdown with
provenance ("Evasion 11 = 10 +1 Simiah Nimble"). Minimal vertical footprint; if space is tight it
stays collapsed/hideable. Goal: make the engine's automation visible **without** taking space from
the step UI (user constraint).

### 12.5 Draft lifecycle & autosave (CBW-24)
"New" creates a draft character (`meta.status: "draft"`) in the local store; **every change is
autosaved** (debounced). Drafts appear in `/characters` labeled "Draft" and are fully resumable
after app close. Reaching **Complete** on Review sets `status: "complete"`. (Adds a `status` field to
`meta` in §5.)

### 12.6 Companion sub-flow (CBW-25 — nested after subclass pick)
When the chosen subclass is **Beastbound**, the `class` step expands inline (right after the subclass
choice) into the companion mini-flow: name + animal kind, Evasion (defaults 10), two Experiences
(+2 each), and attack (range Melee, die d6, physical/magic) — then the user continues to `heritage`.
Hidden entirely for every other subclass.

### 12.7 Components (new, plain RN per theme)
`OptionCard` (selectable list/grid item), `StepFooter` (Back/Next + validity), `StepHub` (status
overview), `StatSummaryBar` (the compact live summary), plus reuse of existing `Section`/`TagBadges`.
No UI kit (constraint).

### 12.8 Out of scope (v1)
Live multi-PC connection linking (CBW-1), play-state editing (CBW-15), level-up/advancement (CBW-9).
The `/characters/[id]` sheet is **read-only** in v1 (edit = reopen the wizard).
