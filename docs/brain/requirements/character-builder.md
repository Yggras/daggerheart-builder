# Character Builder Requirements

## Purpose

Provide a guided step-by-step Daggerheart character creation flow based on structured SRD data.

## Functional Requirements

- Guide users through character creation in a wizard-like flow.
- Use canonical SRD data for selectable options.
- Save characters as user-owned data.
- Support local access and cloud sync.
- Preserve enough structured choices to support later editing and campaign play.

## Expected Steps

The exact steps are not final and must be derived from the SRD rules model.

Likely areas include:

- Character identity
- Species
- Class
- Subclass
- Domains
- Background
- Equipment
- Starting abilities or features
- Final review

## Data Requirements

- Builder choices should reference canonical SRD entity IDs.
- Derived character values should be reproducible from stored choices where feasible.
- Manual edits and derived values must be clearly distinguished.

## Open Questions

- How much validation should the builder enforce versus warn about?
- Should characters be editable offline before login?
- How should later level-up or advancement flows be represented?
