# Decision Log

## 2026-05-24 - Use Markdown Second Brain

Status: Accepted

Context:

The project needs durable memory before implementation begins.

Decision:

Use repo-local Markdown files under `docs/brain/` as the project second brain. Use ADRs for durable decisions and `decision-log.md` for smaller chronological decisions.

Consequences:

Project context remains versionable, readable, and easy to update without extra tooling.

## 2026-05-24 - Target iOS Android And Web

Status: Accepted

Context:

The app should be available across mobile and web clients.

Decision:

Target iOS, Android, and web.

Consequences:

The technical stack should favor shared code across these platforms.

## 2026-05-24 - Offline-First Direction

Status: Accepted

Context:

The app should work offline where possible, but live campaign play requires networked real-time updates.

Decision:

Design the app as offline-first for compendium and character ownership workflows, while treating playable campaign mode as online real-time functionality.

Consequences:

Local storage, sync, conflict handling, and cached SRD data are core architectural concerns.

## 2026-05-24 - User Accounts Required

Status: Accepted

Context:

Characters belong to users and must be distinguishable across devices and campaigns.

Decision:

User accounts are required.

Consequences:

Authentication, ownership rules, and cloud sync must be part of the architecture.

## 2026-05-24 - Personal Use Initial Scope

Status: Accepted

Context:

The initial project is not intended for public commercial distribution.

Decision:

Treat the project as personal use only for now.

Consequences:

Scope can remain focused, but license obligations must still be tracked and respected.

## 2026-05-24 - Use Official SRD PDF As Data Source

Status: Accepted

Context:

Daggerheart SRD content is available as a PDF.

Decision:

Use the official Daggerheart SRD PDF from Critical Role/Darrington Press as the primary data source.

Consequences:

The project needs a PDF extraction, normalization, and manual review workflow.

## 2026-05-24 - Preserve SRD Wording And Normalize Structure

Status: Accepted

Context:

The app needs accurate rules text and structured searchable data.

Decision:

Preserve original SRD wording for rules text while normalizing names, tags, mechanics, domains, tiers, and related fields into structured data.

Consequences:

Data records should separate display text from normalized metadata and rule relationships.

## 2026-05-24 - Extracted Data Must Be Reviewed

Status: Accepted

Context:

PDF extraction can introduce subtle errors.

Decision:

Treat extracted SRD data as untrusted until manually reviewed. Fix extraction mistakes immediately when found.

Consequences:

Canonical app data must have a review status, and ingestion should support correction workflows.

## 2026-05-24 - Use Expo React Native And TypeScript

Status: Accepted

Context:

The app must target iOS, Android, and web from one pragmatic codebase.

Decision:

Use Expo, React Native, TypeScript, and Expo Router for the app shell and navigation.

Consequences:

The project can share most UI and application logic across mobile and web while keeping a strong TypeScript foundation.

## 2026-05-24 - Use Supabase Backend

Status: Accepted

Context:

The app needs auth, user-owned data, cloud sync, Postgres data modeling, and realtime campaign updates. Supabase Free was checked and is suitable for the personal-use scope.

Decision:

Use Supabase as the backend, including Supabase Auth, Postgres, Realtime, and Row Level Security.

Consequences:

The app gets a familiar hosted backend with strong ownership modeling. Free-tier caveats remain: no automatic backups, project pausing after inactivity, storage limits, and auth email restrictions.

## 2026-05-24 - Use Zod For Runtime Validation

Status: Accepted

Context:

The project will process extracted PDF data, local data, backend payloads, and synced character/campaign state. TypeScript alone cannot validate runtime data.

Decision:

Use Zod for runtime schemas and validation.

Consequences:

SRD extraction, canonical data, app inputs, and sync payloads can be validated before being trusted.

## 2026-05-24 - Store Canonical SRD As Versioned JSON

Status: Accepted

Context:

The compendium should work offline and should not parse the SRD PDF at runtime.

Decision:

Store reviewed canonical SRD data as versioned JSON bundled locally with the app.

Consequences:

The compendium can be local-first. JSON data must be schema-validated and reviewed before becoming canonical.

## 2026-05-24 - Use Admin-Managed Email Password Auth

Status: Accepted

Context:

The project is personal use only. Supabase default auth emails are restricted without custom SMTP. The user is comfortable manually creating users and passwords in Supabase.

Decision:

Use Supabase email/password authentication with admin-managed accounts. Disable app signup and omit forgot-password flows initially.

Consequences:

No auth email provider is required for MVP. Users cannot self-register or self-reset passwords until a later auth upgrade.

## 2026-05-24 - Run PDF Extraction Spike Before Full Parser

Status: Accepted

Context:

The SRD PDF is a major project risk. Starting only with handcrafted data could hide extraction issues, while building a full parser before the schema is proven could waste effort.

Decision:

Run a limited PDF extraction spike on representative SRD sections before the first compendium prototype. Then define an initial schema, create a tiny fixture dataset, build the prototype, and defer the full parser until the schema and prototype are proven.

Consequences:

The project learns about PDF extraction quality early while keeping the parser guided by app data needs.

## 2026-05-24 - Accept September 9 2025 SRD PDF As Current Source

Status: Accepted

Context:

The official Daggerheart SRD page currently links `Daggerheart-SRD-9-09-25.pdf` and labels it Daggerheart System Reference Document v1.0 with a September-9 changelog.

Decision:

Use the official September 9, 2025 SRD PDF as the current canonical source document for extraction and review.

Consequences:

The local source PDF lives at `data/source/Daggerheart-SRD-9-09-25.pdf`, and all extracted SRD data must be checked against this document unless a newer official source replaces it.

## 2026-05-24 - Use Initial Zod SRD Discriminated Union

Status: Accepted

Context:

The project needs an app-ready target shape before building the full PDF parser. The extraction spike showed that prose and structured data need validation and review metadata.

Decision:

Use a TypeScript/Zod discriminated union for initial SRD entries with shared base fields and kind-specific fields for `rule_reference`, `class`, `subclass`, `domain_card`, and `weapon`.

Consequences:

The first fixture can be validated with `npm run validate:srd`, and future parser work has a concrete JSON target.

## 2026-05-24 - Build First Prototype With Expo Router

Status: Accepted

Context:

The project needs a runnable app shell before building the first compendium prototype.

Decision:

Use Expo Router at the repository root with routes for home, compendium list/search/filter, and compendium detail. Use plain React Native components for the prototype and avoid adding a UI kit for now.

Consequences:

The prototype can validate navigation, local fixture loading, search, filters, and detail rendering before adding Supabase, character builder, campaign mode, or a design system.

## 2026-05-24 - Add SRD Relationship Links

Status: Accepted

Context:

The compendium needs convenient navigation between related entries, especially classes, subclasses, and relevant rules.

Decision:

Add a generic `relationships` field to SRD entries, validate that relationship targets exist, and render related entries on detail pages. Continue to keep mechanical references like `class.subclassIds` and `subclass.classId` and derive links from them.

Consequences:

Broken links fail fixture validation, and the prototype supports class-to-subclass, subclass-to-class, and entry-to-rule navigation without implementing inline rich-text links yet.

## 2026-05-25 - Align Entity Names With SRD Wording

Status: Accepted

Context:

The SRD uses `ancestry` and `community` for heritage and origin concepts. Earlier project notes used mixed terms such as species/background, creating ambiguity in schema and UI naming.

Decision:

Use official SRD wording for app and data entity names. Model these concepts as `ancestry` and `community`; do not introduce `species` or `background` as equivalent entity kinds.

Consequences:

Schema, fixtures, filters, UI labels, and docs should stay aligned with official SRD terminology. Background questions remain class/subclass content unless the SRD defines a separate background entity later.

## 2026-05-25 - Model Consumables As Loot Entries

Status: Accepted

Context:

The SRD defines loot as comprising consumables and reusable items. The compendium needs to distinguish single-use consumables from reusable loot without inventing a separate top-level SRD entity name.

Decision:

Use `loot` as the SRD entry kind for both reusable items and consumables. Add a normalized `lootType` field with `item` and `consumable` values.

Consequences:

The app preserves SRD terminology while still supporting filters, display, and future character inventory rules that need to know whether loot is consumed on use.

## 2026-05-25 - Schema Fixture Spike Complete

Status: Accepted

Context:

The compendium needed representative schema and fixture coverage across major SRD entry families before parser automation could be planned responsibly.

Decision:

Accept the expanded schema/fixture coverage as sufficient for parser automation planning. The representative fixture set passes `npm run validate:srd`, `npm run typecheck`, `npx expo-doctor`, and manual web review with `npm run web`.

Consequences:

Future work can move from schema discovery into parser automation planning and first-slice implementation. Parser output must still be treated as extracted and unreviewed until manually checked against the SRD PDF.

## 2026-05-25 - Commit Small Generated Candidate Batches

Status: Accepted

Context:

Parser automation needs visible generated output for review, validation, and iteration, but full extraction may eventually produce large generated artifacts.

Decision:

Commit small generated candidate data batches for parser slices. Reconsider ignoring or regenerating bulk generated output once full extraction volume and review workflow are clearer.

Consequences:

Early parser output remains versioned and reviewable. Generated data must stay clearly marked as candidate data and must not be confused with reviewed canonical fixtures.

## 2026-05-25 - Reuse SRD Validator For Candidate Files

Status: Accepted

Context:

Both reviewed fixtures and generated candidate files must match the same `SrdEntryCollectionSchema` before app or review workflows trust their structure.

Decision:

Extend the existing SRD validation script so it can validate the default fixture file or an arbitrary SRD JSON path, rather than creating a separate validator implementation.

Consequences:

Validation logic stays centralized. Candidate validation can be exposed through package scripts while preserving the existing `npm run validate:srd` fixture workflow.

## 2026-05-25 - Use Risk-Based Candidate Review

Status: Accepted

Context:

Manually reviewing every generated SRD record with equal depth would not scale once parser automation expands beyond small slices. Early parser slices still need close review to calibrate extraction and cleanup behavior.

Decision:

Use full manual review for early calibration slices, then shift toward risk-based review: spot-check normal entries, fully review entries with parser warnings or suspicious tokens, and fully review high-risk mechanical content before promotion.

Consequences:

Parser output should include review notes or reports that identify cleanup actions and suspicious extraction artifacts. Automated validation remains mandatory for every generated batch, but validation does not replace human review for risky or flagged entries.

## 2026-05-25 - Accept First Report-Driven Rule Reference Batch

Status: Accepted

Context:

The first generated rule-reference batch covered 8 entries from `Hope & Fear` and adjacent combat rules. The generated review report identified cleanup actions and no suspicious tokens, and manual spot-check review found no flaws.

Decision:

Mark the 8 reviewed generated candidates as `reviewed` with review notes indicating report-driven manual review accepted the batch on 2026-05-25.

Consequences:

The parser now preserves accepted review state for those generated entries when rerun. Newly added generated entries remain `extracted` until reviewed.

## 2026-05-25 - Accept Second Report-Driven Rule Reference Batch

Status: Accepted

Context:

The second generated rule-reference batch added 8 page-21 prose entries covering resistance, multi-target attacks, multiple damage sources, range and movement, line of sight, and temporary tags. The generated review report identified cleanup actions and no suspicious tokens, and manual review found no flaws.

Decision:

Mark the second 8 generated candidates as `reviewed` with review notes indicating report-driven manual review accepted the batch on 2026-05-25.

Consequences:

All 16 generated rule-reference candidates are now reviewed and preserved as reviewed when the parser is rerun. The next parser slice should keep to prose-first `rule_reference` extraction, with Downtime as the recommended next target.

## 2026-05-25 - Accept Downtime Rule Reference Batch

Status: Accepted

Context:

The dedicated Downtime parser slice added 2 page-21 prose entries covering downtime moves and downtime consequences. The generated review report identified cleanup actions for the list-heavy Downtime entry, no suspicious tokens, and manual review found no flaws in either Downtime entry.

Decision:

Mark `rule.combat.downtime` and `rule.combat.downtime_consequences` as `reviewed` with review notes indicating report-driven manual review accepted the batch on 2026-05-25.

Consequences:

All 18 generated rule-reference candidates are now reviewed and preserved as reviewed when the parser is rerun. The next parser work should choose another small prose-first `rule_reference` slice before moving to table-heavy or entity-specific extraction.

## 2026-05-25 - Expand Prose Rule Reference Parser Before Tables

Status: Accepted

Context:

The parser is calibrated for small prose-first `rule_reference` sections, and the Downtime slice was accepted without flaws. The next SRD pages include another prose-heavy rules page followed immediately by equipment tables, which are a different extraction problem.

Decision:

Move moderately faster by adding the full physical page-22 prose slice for Death, Additional Rules, Leveling Up, and Multiclassing before starting table-heavy or entity-specific extraction. Enhance the generated review report with text lengths and previews to make risk-based review faster.

Consequences:

The parser now produces 33 generated rule-reference candidates: 18 reviewed candidates and 15 extracted page-22 candidates pending review. Equipment tables and structured entity extraction remain deferred until the larger prose slice is reviewed.

## 2026-05-25 - Accept Page 22 Prose Rule Reference Batch

Status: Accepted

Context:

The expanded page-22 prose parser slice added 15 entries covering Death, Additional Rules, Leveling Up, and Multiclassing. The generated review report identified cleanup actions, no suspicious tokens, and manual review found no flaws.

Decision:

Mark the 15 page-22 generated candidates as `reviewed` with review notes indicating report-driven manual review accepted the batch on 2026-05-25.

Consequences:

All 33 generated rule-reference candidates are now reviewed and preserved as reviewed when the parser is rerun. The next parser work should plan a narrow table-extraction spike before producing equipment or other entity candidates.

## 2026-05-25 - Resolve SRD Data Workflow Questions

Status: Accepted

Context:

The project needs clearer rules for source references, generated artifacts, promotion timing, canonical data layout, and review effort before table extraction expands.

Decision:

Show source page references only in review or admin surfaces, not the normal compendium UI. Regenerate extraction output when the source SRD changes. Split canonical reviewed SRD data by entity kind before promoting reviewed generated candidates. Treat license obligations as non-blocking for personal use, but revisit them before any distribution. Minimize manual review by applying conservative parser cleanup and using reports to flag risky rows.

Consequences:

The normal app UI should hide source references for now, while source metadata remains in data and reports. The first promotion target should be split canonical fixture files. Generated table outputs should stay separate by kind with dedicated review reports during calibration.

## 2026-05-25 - Defer Structured Mechanical Effects

Status: Accepted

Context:

Armor table extraction produces feature text such as `Flexible: +1 to Evasion` and `Very Heavy: -2 to Evasion; -1 to Agility`. A future character builder will need some of these bonuses as processable values, but modeling every conditional feature now would risk building a premature rules engine.

Decision:

Preserve SRD feature text as the current source of truth. Later, add optional normalized mechanical effects for simple static modifiers, such as Evasion, trait, and Spellcast Roll bonuses or penalties. Leave complex, triggered, conditional, or narrative effects as text until the character builder needs them.

Consequences:

The current armor parser can remain text-first. A future schema/parser slice should add a small `effects` model for obvious static modifiers before character-builder calculations depend on equipment data.

## 2026-05-25 - Accept And Promote Reviewed Generated Candidates

Status: Accepted

Context:

All 33 generated rule-reference candidates were reviewed, and the armor parser produced 34 armor candidates with no parser warnings. The user spot-checked armor rows and found no flaws. Canonical fixture data is now split by kind, making promotion targeted and reviewable.

Decision:

Promote reviewed rule-reference candidates into `data/srd/fixtures/rule-references.json`. Mark the 34 armor candidates as `reviewed`, preserve that review state in `scripts/extract-armor.ts`, and promote them into `data/srd/fixtures/armor.json`.

Consequences:

Canonical fixtures now contain the reviewed prose rule-reference slice and the full reviewed armor table. The next parser work should use the armor parser/report pattern for a separate weapon table spike before any bulk equipment extraction.

## 2026-05-25 - Add First Weapon Table Parser Spike

Status: Accepted

Context:

Armor table extraction proved the table parser/report pattern. Weapon tables are larger and include more wrapped names and feature text, so they should be extracted in a narrow slice before bulk equipment extraction.

Decision:

Add `scripts/extract-weapons.ts` to generate the Tier 1 primary weapon table from physical PDF page 23 into `data/srd/generated/weapons.candidates.json`, with a dedicated report at `data/srd/generated/weapons-review-report.md`. Keep generated weapon candidates marked `extracted` until reviewed.

Consequences:

The parser now produces a separate 25-entry weapon candidate batch for risk-based review. Weapon extraction beyond Tier 1 primary weapons remains deferred until this slice is accepted.

## 2026-05-25 - Accept Tier 1 Primary Weapon Batch

Status: Accepted

Context:

The first weapon parser spike generated 25 Tier 1 primary weapon candidates from physical PDF page 23. The generated review report showed no parser warnings, and manual review/spot-checking found no flaws so far.

Decision:

Mark the 25 Tier 1 primary weapon candidates as `reviewed`, preserve that review state in `scripts/extract-weapons.ts`, and promote them into `data/srd/fixtures/weapons.json`.

Consequences:

Canonical fixtures now contain the reviewed Tier 1 primary weapon table. The next weapon parser work should expand to the next narrow weapon slice, likely Tier 2 primary weapons, before attempting full weapon extraction.
