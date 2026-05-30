# Sync Model Notes

## Current Direction

The app should support local access and cloud sync for user-owned content, while campaign play uses real-time online updates.

## Data Classes

### Static SRD Data

Reviewed canonical compendium data. This can be bundled with the app, cached locally, or updated through versioned data releases.

### User-Owned Data

Characters, preferences, and personal campaign-related data. This should be available locally and synced to the cloud.

### Campaign Data

Campaign membership, permissions, shared state, and live session state. This needs real-time synchronization.

## Backend

Use Supabase for cloud sync and real-time campaign state.

Relevant Supabase capabilities:

- Auth for user identity
- Postgres for durable character and campaign data
- Row Level Security for ownership and membership rules
- Realtime for live campaign updates

Realtime updates should avoid noisy high-frequency writes. Frequently changing UI-local state should not be synced unless it affects shared play.

## Implementation Status

- Auth foundation (slice 1, 2026-05-30): Supabase client with AsyncStorage-backed session
  persistence, config via `app.config.ts` + `.env` (`extra.supabaseUrl` / `extra.supabaseAnonKey`),
  an `AuthProvider`, a login-only screen (admin-managed email/password, ADR-0007), and a root route
  guard. Characters are still local (`src/character/store.ts`); no cloud sync yet.
- Decided sync policy for user-owned data: last-write-wins on `meta.updatedAt` (single-user personal
  scope). To be built in slice 2 alongside an `ownerId` field and a `characters` table with RLS.

## Open Questions

- Which local database should be used? (Currently AsyncStorage for characters.)
- How should sync conflicts be represented to users? (Slice 2 starts with last-write-wins.)
- What data can be edited offline?
- Which campaign state is persisted versus session-only?
