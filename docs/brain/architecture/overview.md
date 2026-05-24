# Architecture Overview

## Current Direction

The project should be designed around three connected layers:

1. Structured SRD data foundation
2. Offline-first client application
3. Cloud backend for accounts, sync, and real-time campaign play

## Conceptual Shape

```txt
SRD PDF
  -> extraction
  -> manual review
  -> canonical structured data
  -> local app data bundle/cache

Client app
  -> compendium
  -> character builder
  -> character sheets
  -> campaign play UI

Backend
  -> authentication
  -> user-owned characters
  -> campaigns and membership
  -> cloud sync
  -> real-time campaign state
```

## Platform Direction

Target iOS, Android, and web with Expo, React Native, TypeScript, and Expo Router.

The current app shell lives at the repository root using Expo Router:

- `app/index.tsx`
- `app/compendium/index.tsx`
- `app/compendium/[id].tsx`

The first prototype uses plain React Native components and local fixture data. A UI kit is intentionally deferred.

## Backend Direction

Use Supabase as the backend. It must support:

- User accounts
- Ownership and authorization rules
- Cloud sync
- Real-time campaign updates
- Reasonable integration with offline-first client behavior

Supabase components in scope:

- Supabase Auth
- Supabase Postgres
- Supabase Realtime
- Row Level Security policies

## Data Direction

Use reviewed versioned JSON for canonical SRD data. Validate runtime data with Zod. The compendium should consume local canonical data rather than calling Supabase for SRD content at runtime.

The current prototype loads `data/srd/fixtures/entries.json` through `src/srd/loadFixture.ts` and validates it with the Zod schema in `src/srd/schema.ts` before rendering.

## Auth Direction

Use admin-managed Supabase email/password accounts for the MVP. App signup and forgot-password flows are out of scope until an auth email provider or another self-service auth method is added.
