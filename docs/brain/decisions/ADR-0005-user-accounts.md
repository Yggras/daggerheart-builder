# ADR-0005: User Accounts

Status: Accepted
Date: 2026-05-24

## Context

Characters and campaigns belong to users. The app needs a way to distinguish ownership across devices and campaign participants.

## Decision

Require user accounts for owned content and cloud-backed functionality.

## Consequences

- Authentication is required.
- Characters, campaigns, and permissions must be modeled with user ownership.
- Some app surfaces may still be available without login, but this remains an open product decision.
