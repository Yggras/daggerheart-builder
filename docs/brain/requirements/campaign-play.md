# Campaign Play Requirements

## Purpose

Support live Daggerheart play with character sheets, DM view, campaign membership, and real-time updates across connected clients.

## Functional Requirements

- Show playable character sheets.
- Provide a DM-oriented view.
- Sync relevant campaign state in real time.
- Associate campaigns, characters, and permissions with user accounts.
- Support multiple clients observing updated state during play.

## Real-Time Requirements

- Campaign play should be real-time from the start.
- Online connectivity is expected for shared live play.
- Offline behavior for campaign play is limited and still undefined.

## Data Requirements

- Characters remain user-owned.
- Campaign membership and permissions must be explicit.
- Persisted state and session-only state must be distinguished.

## Open Questions

- Which actions are player-controlled, DM-controlled, or shared?
- What campaign state must persist after a session?
- Should temporary session state be saved automatically?
- How should conflicts or simultaneous edits be resolved?
