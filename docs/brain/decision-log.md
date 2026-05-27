# Decision Log

## 2026-05-24 - Use Markdown Second Brain

Status: Accepted

Context: The project needs durable memory before implementation begins.

Decision: Use repo-local Markdown files under `docs/brain/` as the project second brain. Use ADRs for durable decisions and `decision-log.md` for smaller chronological decisions.

Consequences: Project context remains versionable, readable, and easy to update without extra tooling.

## 2026-05-24 - Target iOS Android And Web

Status: Accepted

Context: The app should be available across mobile and web clients.

Decision: Target iOS, Android, and web.

Consequences: The technical stack should favor shared code across these platforms.

## 2026-05-24 - Offline-First Direction

Status: Accepted

Context: The app should work offline where possible, but live campaign play requires networked real-time updates.

Decision: Design the app as offline-first for compendium and character ownership workflows, while treating playable campaign mode as online real-time functionality.

Consequences: Local storage, sync, conflict handling, and cached SRD data are core architectural concerns.

## 2026-05-24 - User Accounts Required

Status: Accepted

Context: Characters belong to users and must be distinguishable across devices and campaigns.

Decision: User accounts are required.

Consequences: Authentication, ownership rules, and cloud sync must be part of the architecture.

## 2026-05-24 - Personal Use Initial Scope

Status: Accepted

Context: The initial project is not intended for public commercial distribution.

Decision: Treat the project as personal use only for now.

Consequences: Scope can remain focused, but license obligations must still be tracked and respected.

## 2026-05-24 - Use Official SRD PDF As Data Source

Status: Accepted

Context: Daggerheart SRD content is available as a PDF.

Decision: Use the official Daggerheart SRD PDF from Critical Role/Darrington Press as the primary data source.

Consequences: The project needs a PDF extraction, normalization, and manual review workflow.

## 2026-05-24 - Preserve SRD Wording And Normalize Structure

Status: Accepted

Context: The app needs accurate rules text and structured searchable data.

Decision: Preserve original SRD wording for rules text while normalizing names, tags, mechanics, domains, tiers, and related fields into structured data.

Consequences: Data records should separate display text from normalized metadata and rule relationships.

## 2026-05-24 - Extracted Data Must Be Reviewed

Status: Accepted

Context: PDF extraction can introduce subtle errors.

Decision: Treat extracted SRD data as untrusted until manually reviewed. Fix extraction mistakes immediately when found.

Consequences: Canonical app data must have a review status, and ingestion should support correction workflows.

## 2026-05-24 - Use Expo React Native And TypeScript

Status: Accepted

Context: The app must target iOS, Android, and web from one pragmatic codebase.

Decision: Use Expo, React Native, TypeScript, and Expo Router for the app shell and navigation.

Consequences: The project can share most UI and application logic across mobile and web while keeping a strong TypeScript foundation.

## 2026-05-24 - Use Supabase Backend

Status: Accepted

Context: The app needs auth, user-owned data, cloud sync, Postgres data modeling, and realtime campaign updates. Supabase Free was checked and is suitable for the personal-use scope.

Decision: Use Supabase as the backend, including Supabase Auth, Postgres, Realtime, and Row Level Security.

Consequences: The app gets a familiar hosted backend with strong ownership modeling. Free-tier caveats remain: no automatic backups, project pausing after inactivity, storage limits, and auth email restrictions.

## 2026-05-24 - Use Zod For Runtime Validation

Status: Accepted

Context: The project will process extracted PDF data, local data, backend payloads, and synced character/campaign state. TypeScript alone cannot validate runtime data.

Decision: Use Zod for runtime schemas and validation.

Consequences: SRD extraction, canonical data, app inputs, and sync payloads can be validated before being trusted.

## 2026-05-24 - Store Canonical SRD As Versioned JSON

Status: Accepted

Context: The compendium should work offline and should not parse the SRD PDF at runtime.

Decision: Store reviewed canonical SRD data as versioned JSON bundled locally with the app.

Consequences: The compendium can be local-first. JSON data must be schema-validated and reviewed before becoming canonical.

## 2026-05-24 - Use Admin-Managed Email Password Auth

Status: Accepted

Context: The project is personal use only. Supabase default auth emails are restricted without custom SMTP. The user is comfortable manually creating users and passwords in Supabase.

Decision: Use Supabase email/password authentication with admin-managed accounts. Disable app signup and omit forgot-password flows initially.

Consequences: No auth email provider is required for MVP. Users cannot self-register or self-reset passwords until a later auth upgrade.

## 2026-05-24 - Run PDF Extraction Spike Before Full Parser

Status: Accepted

Context: The SRD PDF is a major project risk. Starting only with handcrafted data could hide extraction issues, while building a full parser before the schema is proven could waste effort.

Decision: Run a limited PDF extraction spike on representative SRD sections before the first compendium prototype. Then define an initial schema, create a tiny fixture dataset, build the prototype, and defer the full parser until the schema and prototype are proven.

Consequences: The project learns about PDF extraction quality early while keeping the parser guided by app data needs.

## 2026-05-24 - Accept September 9 2025 SRD PDF As Current Source

Status: Accepted

Context: The official Daggerheart SRD page currently links `Daggerheart-SRD-9-09-25.pdf` and labels it Daggerheart System Reference Document v1.0 with a September-9 changelog.

Decision: Use the official September 9, 2025 SRD PDF as the current canonical source document for extraction and review.

Consequences: The local source PDF lives at `data/source/Daggerheart-SRD-9-09-25.pdf`, and all extracted SRD data must be checked against this document unless a newer official source replaces it.

## 2026-05-24 - Use Initial Zod SRD Discriminated Union

Status: Accepted

Context: The project needs an app-ready target shape before building the full PDF parser. The extraction spike showed that prose and structured data need validation and review metadata.

Decision: Use a TypeScript/Zod discriminated union for initial SRD entries with shared base fields and kind-specific fields.

Consequences: Fixtures can be validated with `npm run validate:srd`, and parser work has a concrete JSON target.

## 2026-05-24 - Build First Prototype With Expo Router

Status: Accepted

Context: The project needs a runnable app shell before building the first compendium prototype.

Decision: Use Expo Router at the repository root with routes for home, compendium list/search/filter, and compendium detail. Use plain React Native components for the prototype and avoid adding a UI kit for now.

Consequences: The prototype can validate navigation, local fixture loading, search, filters, and detail rendering before adding Supabase, character builder, campaign mode, or a design system.

## 2026-05-24 - Add SRD Relationship Links

Status: Accepted

Context: The compendium needs convenient navigation between related entries, especially classes, subclasses, and relevant rules.

Decision: Add a generic `relationships` field to SRD entries, validate that relationship targets exist, and render related entries on detail pages. Continue to keep mechanical references like `class.subclassIds` and `subclass.classId` and derive links from them.

Consequences: Broken links fail fixture validation, and the compendium supports class-to-subclass, subclass-to-class, and entry-to-rule navigation without implementing inline rich-text links yet.

## 2026-05-25 - Align Entity Names With SRD Wording

Status: Accepted

Context: The SRD uses `ancestry` and `community` for heritage and origin concepts. Earlier project notes used mixed terms such as species/background.

Decision: Use official SRD wording for all app and data entity names (`ancestry`, `community`, `domain_card`, etc.).

Consequences: Schema, fixtures, filters, UI labels, and docs stay aligned with official SRD terminology.

## 2026-05-25 - Model Consumables As Loot Entries

Status: Accepted

Context: The SRD defines loot as comprising consumables and reusable items. The compendium needs to distinguish them without a separate top-level entity kind.

Decision: Use `loot` as the SRD entry kind for both reusable items and consumables. Add a normalized `lootType` field with `item` and `consumable` values.

Consequences: The app preserves SRD terminology while still supporting loot-type filters and future character inventory rules.

## 2026-05-25 - Commit Small Generated Candidate Batches

Status: Accepted

Context: Parser automation needs visible generated output for review, validation, and iteration, but full extraction may eventually produce large generated artifacts.

Decision: Commit small generated candidate data batches for parser slices. Reconsider ignoring or regenerating bulk generated output once full extraction volume and review workflow are clearer.

Consequences: Early parser output remains versioned and reviewable. Generated data must stay clearly marked and must not be confused with reviewed canonical fixtures.

## 2026-05-25 - Reuse SRD Validator For Candidate Files

Status: Accepted

Context: Both reviewed fixtures and generated candidate files must match the same `SrdEntryCollectionSchema`.

Decision: Extend the existing SRD validation script so it can validate the default fixture file or an arbitrary SRD JSON path. When validating a candidates file, merge with fixture context so cross-kind ID references resolve correctly.

Consequences: Validation logic stays centralized. Candidate validation is exposed through package scripts while preserving the existing `npm run validate:srd` workflow.

## 2026-05-25 - Use Risk-Based Candidate Review

Status: Accepted

Context: Manually reviewing every generated SRD record with equal depth would not scale.

Decision: Use full manual review for early calibration slices, then shift toward risk-based review: spot-check normal entries, fully review entries with parser warnings or suspicious tokens.

Consequences: Parser output should include review reports that flag risky rows. Automated validation remains mandatory but does not replace review for flagged entries.

## 2026-05-25 - Defer Structured Mechanical Effects

Status: Accepted

Context: Armor and other entries have feature text like `+1 to Evasion`. A future character builder will need some of these as processable values, but modeling every feature now would risk building a premature rules engine.

Decision: Preserve SRD feature text as the current source of truth. Later, add optional normalized mechanical effects for simple static modifiers (Evasion, trait, Spellcast Roll). Leave complex or narrative effects as text until the character builder needs them.

Consequences: The current parsers remain text-first. A future schema slice should add a small `effects` model before character-builder calculations depend on equipment data.

## 2026-05-25 - Split Canonical SRD Data By Kind

Status: Accepted

Context: Promoting all generated candidates into one large fixture file would make diffs large and review slow.

Decision: Split canonical reviewed SRD data into kind-specific JSON files under `data/srd/fixtures/` before promoting any reviewed generated candidates.

Consequences: Promotion is targeted and reviewable per entity kind. Each fixture file can be validated and diffed independently.

## 2026-05-26 - Use AI-Assisted Source Verification For Parser Review

Status: Accepted

Context: Manual user review of every generated SRD parser batch was slowing parser completion.

Decision: Use AI-assisted source verification as an accepted review gate for generated SRD candidates. The agent may mark candidates as `reviewed` when schema validation, parser reports, deterministic reruns, and source-PDF verification pass. Parser warnings, suspicious artifacts, relationship issues, and high-risk mechanical fields must still be resolved before promotion.

Consequences: Generated candidate review reports and `review.notes` must record AI-assisted verification evidence. Canonical fixture promotion remains limited to reviewed or corrected entries.

## 2026-05-26 - Support Special Environment Difficulty

Status: Accepted

Context: Some environment entries list `Difficulty: Special` rather than a fixed number.

Decision: Allow environment `difficulty` to be either a positive integer or the literal value `"special"`. Preserve the source explanation in `text.original` and feature text.

Consequences: Environment extraction can remain source-faithful. App display code must treat environment difficulty as display data, not a guaranteed number.

## 2026-05-26 - Support Physical Or Magic Damage And Variable Attack Modifiers

Status: Accepted

Context: Full adversary extraction encountered `phy/mag` damage (matching the weapon edge case) and at least one attack modifier expressed as a dice expression such as `+2d4`.

Decision: Allow adversary attack damage type to use the normalized value `physical_or_magic`. Allow adversary attack modifiers to be either an integer or a dice-expression string.

Consequences: Adversary stat blocks preserve source meaning without collapsing ambiguous values. Display code must format attack modifiers as display values rather than assuming numeric.

## 2026-05-26 - SRD Extraction Phase Complete

Status: Accepted

Context: All 11 entity kind parsers were implemented and all generated candidates were accepted through risk-based review and AI-assisted source verification.

Decision: Accept the full extraction pipeline as complete. All 783 entries across 11 entity kinds are promoted to canonical split fixtures under `data/srd/fixtures/`. No remaining extraction work is needed until the SRD updates or new entity kinds are identified.

Final fixture counts:
- `rule-references.json` — 34 entries
- `armor.json` — 34 entries
- `weapons.json` — 204 entries
- `loot.json` — 120 entries (60 items, 60 consumables)
- `ancestries.json` — 18 entries
- `communities.json` — 9 entries
- `classes.json` — 9 entries
- `subclasses.json` — 18 entries
- `domain-cards.json` — 189 entries
- `adversaries.json` — 129 entries
- `environments.json` — 19 entries

Consequences: The SRD data foundation is complete and stable. Future parser work is only needed if the SRD PDF updates.

## 2026-05-27 - Compendium UI Refactored To Nested Routing

Status: Accepted

Context: The original compendium used a flat `[id]` route for all entry types. As the number of entity kinds grew to 11, the list screen became a single undifferentiated view and the route structure did not reflect the kind-then-entry hierarchy.

Decision: Replace the flat `app/compendium/[id].tsx` route with a nested `app/compendium/[kind]/` directory containing:
- `index.tsx` — kind list screen with text search and kind-specific chip filters (tier, role, environment type, weapon category, domain, loot type)
- `[id].tsx` — entry detail screen

Update the compendium overview (`app/compendium/index.tsx`) to show one card per entity kind linking into the new nested structure.

Consequences: Navigation is now overview → kind list → detail. Each entity kind has its own filtered list. All 11 kinds have complete detail rendering. Tested and working on Android.
