# ADR-0003: SRD Data Source

Status: Accepted
Date: 2026-05-24

## Context

The app needs Daggerheart rules content for the compendium, character builder, and campaign play features. The official SRD is available as a PDF.

## Decision

Use the official Daggerheart SRD PDF from Critical Role/Darrington Press as the primary data source. Track the Darrington Press Community Gaming License as the relevant license basis.

Preserve original SRD wording for rules text while normalizing data for search, filtering, rules logic, and relationships.

## Consequences

- The project needs a PDF extraction and review workflow.
- Extracted data must not become canonical until reviewed.
- License obligations and attribution requirements must remain open questions until verified.
- Runtime app behavior should consume structured app-owned data, not parse the PDF directly.
