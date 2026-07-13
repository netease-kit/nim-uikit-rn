# Proposal

## Why

The Contacts tab shortcuts for verification messages, blacklist, and joined teams can freeze on iOS after the user taps them. The target screens repeatedly re-run their initial load effects, which prevents the transition from settling and blocks further interaction.

## What Changes

- Stabilize app translation hook outputs so screens can safely depend on `t` inside memoized callbacks and effects.
- Ensure the Contacts shortcuts can open verification messages, blacklist, and joined-team surfaces without getting stuck in a repeated initial-load loop.
- Remove temporary shortcut and list debug logging added during issue isolation.

## Capabilities

### New Capabilities

### Modified Capabilities

- `contacts-home`: contacts shortcuts must complete navigation into their target surfaces without freezing the UI
- `contact-blacklist-and-teams`: joined-team and blacklist pages must finish their initial load without repeated self-triggered refresh loops
- `friend-verification-center`: verification center must finish its initial load without repeated self-triggered refresh loops

## Impact

- Affected code: `hooks/useAppTranslation.ts`, `app/(tabs)/contacts.tsx`, `app/contacts/teamlist.tsx`, `app/contacts/blacklist.tsx`, `app/contacts/validlist.tsx`
- Affected validation: iOS Simulator verification for Contacts shortcuts and their target pages
