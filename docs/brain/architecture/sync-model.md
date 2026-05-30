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
  guard.
- Continuous character sync (slice 2, 2026-05-30): characters sync automatically across a user's
  devices — no manual trigger. Design:
  - **Local truth stays AsyncStorage** (`src/character/store.ts`); the store emits change events
    (`subscribeToStore`) tagged `origin: "local" | "remote"`. `putCharacterRaw` applies a pulled row
    without bumping `updatedAt` (preserves remote timestamp for LWW).
  - **Table** `public.characters` (`supabase/schema.sql`): scalar columns for RLS/index + a `data`
    JSONB holding the full Character (source of truth on pull). Single `owner_all` RLS policy
    (`auth.uid() = owner_id`). Added to the `supabase_realtime` publication.
  - **Engine** (`src/character/sync/engine.ts`): persisted outbound queue
    (`daggerheart.sync.queue.v1`) so unsent changes survive restarts; drain retried on timer /
    Realtime reconnect / AppState-active; inbound Realtime `postgres_changes` filtered by `owner_id`,
    applying strictly-newer rows; initial bidirectional LWW reconcile on start.
  - **Conflict policy:** whole-document **last-write-wins** on `meta.updatedAt`.
  - **Deletes:** hard-delete the remote row at delete time (queued so offline deletes still
    propagate). Reconcile intentionally does not resurrect locally-deleted characters.
- **Known limitations:** simultaneous two-device edits can clobber one side (whole-doc LWW); no
  NetInfo — connectivity is inferred from timer/Realtime/AppState; live-play `playState` is not yet
  synced (will reuse this engine in a future slice).

## Open Questions

- Which local database should be used? (Currently AsyncStorage for characters.)
- Should sync conflicts ever be surfaced to users, or is silent last-write-wins sufficient long-term?
- Should deletes move to soft-delete tombstones to fully survive offline/multi-device?
- Which campaign state is persisted versus session-only?
