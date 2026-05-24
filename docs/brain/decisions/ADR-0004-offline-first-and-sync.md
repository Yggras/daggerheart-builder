# ADR-0004: Offline-First And Sync

Status: Accepted
Date: 2026-05-24

## Context

The app should be useful offline, especially for reading compendium content and accessing character sheets. Campaign play, however, requires real-time updates across clients.

## Decision

Design the app as offline-first where possible, with local data for compendium and character workflows plus cloud sync for user-owned content.

Treat campaign play as real-time and online from the start.

## Consequences

- Local storage and sync are core architecture concerns.
- Conflict handling must be designed before editable synced data grows complex.
- Campaign state requires a backend that supports real-time updates.
- Backend selection should be based on authentication, sync, ownership rules, and real-time collaboration needs.
