# Project Second Brain

This directory is the project memory for the Daggerheart companion app. It captures product intent, decisions, requirements, architecture notes, data notes, and unresolved questions.

Every meaningful decision should be reflected here before or alongside implementation. If a decision changes, update the relevant document and add a new entry to the decision log or a new ADR.

## Structure

- `next-steps.md`: current handoff and best next step for future sessions. Read this first.
- `product-vision.md`: high-level product direction and scope.
- `decision-log.md`: lightweight chronological decisions.
- `open-questions.md`: unresolved product, app, legal, architecture, and data questions.
- `glossary.md`: shared terminology.
- `decisions/`: architecture decision records for durable decisions.
- `requirements/`: feature requirements by product area.
- `architecture/`: technical direction and system design notes.
- `data/`: SRD ingestion, schema, parser planning, and validation notes.

## Decision Rule

Use the decision log for small decisions. Use an ADR for durable decisions that shape product, architecture, data, or workflow.

Decision entries should include:

- Date
- Status
- Context
- Decision
- Consequences

## Current Priorities

1. Read and update `next-steps.md` at the start and end of each session.
2. Preserve the product vision and initial constraints.
3. Extend the compendium and app features using the complete SRD data foundation.
4. Keep offline-first behavior and real-time campaign play as architectural drivers.
