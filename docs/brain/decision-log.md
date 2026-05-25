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
