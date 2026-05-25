# ADR-0012: Split Canonical SRD Data By Kind

Status: Accepted
Date: 2026-05-25

## Context

The project now has reviewed generated rule-reference candidates and is starting table extraction. Keeping all canonical SRD data in one JSON file will become harder to review, diff, and promote as extraction expands across entity kinds.

## Decision

Store reviewed canonical SRD data in kind-specific JSON files under `data/srd/fixtures/` instead of one monolithic `entries.json` file.

The app and validation scripts should combine those files into one collection before schema validation so cross-entry relationship checks still run across the full canonical dataset.

Reviewed generated candidates should be promoted after this split exists, not directly into a monolithic fixture file.

## Consequences

- Canonical data diffs are easier to review by entity kind.
- Promotion can target a single kind file.
- Validation must load and combine multiple files before applying `SrdEntryCollectionSchema`.
- Generated candidate files can stay separate by parser slice or entity kind during calibration.
