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

## Open Questions

- Which local database should be used?
- How should sync conflicts be represented to users?
- What data can be edited offline?
- Which campaign state is persisted versus session-only?
