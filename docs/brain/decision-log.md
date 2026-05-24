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
