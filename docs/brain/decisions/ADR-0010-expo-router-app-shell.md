# ADR-0010: Expo Router App Shell

Status: Accepted
Date: 2026-05-24

## Context

The project needs a first runnable app prototype for iOS, Android, and web. The initial goal is not final design or backend integration; it is proving that reviewed SRD fixture data can be loaded, validated, searched, listed, and viewed offline.

## Decision

Use Expo Router for the initial app shell at the repository root.

Initial routes:

- `app/index.tsx`: home screen
- `app/compendium/index.tsx`: compendium list, search, and kind filters
- `app/compendium/[id].tsx`: compendium detail screen

Use plain React Native components for the prototype:

- `View`
- `Text`
- `TextInput`
- `Pressable`
- `FlatList`
- `ScrollView`

Do not add a UI kit yet.

## Consequences

- The app has a minimal runnable structure for mobile and web.
- The compendium prototype is driven by validated local fixture data.
- Supabase, character builder, campaign mode, and polished design system work remain out of scope for this slice.
- UI patterns can evolve after the data and navigation foundations are proven.
