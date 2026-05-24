# ADR-0006: Initial Tech Stack

Status: Accepted
Date: 2026-05-24

## Context

The app must target iOS, Android, and web while supporting offline-first compendium and character workflows, user accounts, cloud sync, and real-time campaign play. The project should use a pragmatic stack with low operational burden for personal use.

Supabase Free was reviewed against the project needs. Its current free limits are suitable for personal use: 2 active projects, 500 MB database per project, 50,000 monthly active users, 1 GB storage, 5 GB egress, 200 realtime peak connections, and 2 million realtime messages per month. Key caveats are no automatic backups, free project pausing after inactivity, storage limits, and restrictions around Supabase's default auth email provider.

## Decision

Use the following initial stack:

- App: Expo + React Native + TypeScript
- Routing: Expo Router
- Backend: Supabase
- Database: Supabase Postgres
- Auth: Supabase Auth
- Realtime: Supabase Realtime
- Validation: Zod
- Canonical SRD data: reviewed versioned JSON bundled locally
- Search: local search first, likely MiniSearch or Fuse.js; consider SQLite FTS later if needed
- Local/offline persistence: SQLite or equivalent local persistence layer, exact library still open

## Consequences

- The app can share most code across iOS, Android, and web.
- Supabase provides familiar auth, Postgres, ownership rules, and realtime support.
- Row Level Security policies must be designed early for user-owned data.
- The compendium should not require Supabase at runtime.
- Campaign realtime updates should be designed to avoid noisy message volume.
- Zod schemas should validate extracted SRD data, app data, and sync payloads at runtime.
- Free-tier caveats must be respected, especially backups, inactivity pausing, and auth email limitations.
