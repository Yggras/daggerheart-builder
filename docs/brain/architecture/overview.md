# Architecture Overview

## Current Direction

The project is designed around three connected layers:

1. Structured SRD data foundation
2. Offline-first client application
3. Cloud backend for accounts, sync, and real-time campaign play

## Conceptual Shape

```
SRD PDF
  → Poppler extraction scripts
  → AI-assisted review
  → canonical reviewed JSON fixtures
  → bundled with the app

Client app
  → compendium (done)
  → character builder (not started)
  → character sheets (not started)
  → campaign play UI (not started)

Backend (not integrated yet)
  → authentication
  → user-owned characters
  → campaigns and membership
  → cloud sync
  → real-time campaign state
```

## Platform Direction

Target iOS, Android, and web with Expo, React Native, TypeScript, and Expo Router.

The app shell uses Expo Router at the repository root:

- `app/index.tsx` — home screen
- `app/compendium/index.tsx` — compendium kind overview
- `app/compendium/[kind]/index.tsx` — kind list with text search and chip filters
- `app/compendium/[kind]/[id].tsx` — entry detail screen

The app uses plain React Native components and local fixture data. A UI kit is intentionally deferred.

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

Supabase integration has not started. The compendium works entirely from local bundled data.

## Data Direction

Canonical SRD data is stored as reviewed versioned JSON, split into kind-specific files under `data/srd/fixtures/`. The app validates the combined fixture collection with Zod at startup through `src/srd/loadFixture.ts` and `src/srd/schema.ts`.

The SRD data extraction pipeline is complete (791 entries, 11 kinds). The compendium consumes local canonical data and does not call Supabase at runtime.

## Auth Direction

Use admin-managed Supabase email/password accounts for the MVP. App signup and forgot-password flows are out of scope until an auth email provider or another self-service auth method is added. Auth has not been integrated yet.
