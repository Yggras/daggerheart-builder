# ADR-0001: Second Brain

Status: Accepted
Date: 2026-05-24

## Context

The project is starting from scratch and will involve many product, data, legal, and architecture decisions. The user wants a second brain that works as durable project memory. Every decision must be reflected in this memory.

## Decision

Use Markdown files in `docs/brain/` as the repo-local second brain.

Use:

- `decision-log.md` for small chronological decisions.
- `decisions/ADR-*.md` for durable architecture, product, workflow, and data decisions.
- Requirements, architecture, and data folders for evolving project notes.

## Consequences

- Project memory is versionable and easy to read.
- No additional tooling is required.
- Future implementation work must update this memory when decisions are made or changed.
