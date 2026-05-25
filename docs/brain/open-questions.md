# Open Questions

## Product

- Should the web app be a full first-class platform immediately, or can it begin as a companion/admin/data-review surface?
- Should the app eventually support multiple independent campaigns and groups, even if the initial release is personal use only?
- Should homebrew content be supported later?

## Legal And Licensing

- What are the exact obligations of the Darrington Press Community Gaming License for app distribution, attribution, and SRD text usage?
- Are there required notices or attribution text that must appear in-app?
- Are there restrictions on redistributing extracted SRD text inside a personal-use app?

## Accounts And Sync

- What data should be available without login?
- How should local-only characters behave before login or when sync fails?
- When should auth be upgraded from admin-managed users to custom SMTP, invites, OAuth, or another self-service flow?

## Offline Behavior

- Which screens must fully work offline?
- How should conflicts be resolved when offline edits sync later?
- Should campaign play fail closed when offline, or should some local-only session functions continue?

## Campaign Play

- Which campaign state must be persisted permanently?
- Which campaign state can be session-only?
- What actions require DM authority?
- How should permissions work for player-owned characters inside a campaign?

## Data

- Should canonical reviewed data remain one JSON file or be split by entity kind before full extraction?
- Do we need source page references for all SRD entries despite personal-use scope?
- When should reviewed generated candidates be promoted into canonical app data?
