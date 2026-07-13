# Proposal

## Why

The friend verification unread badge can lag behind real-time events and can over-count repeated applications from the same applicant. This makes the Contacts tab and verification shortcut disagree with the expected verification workload the user still needs to review.

## What Changes

- Keep friend verification unread badges in sync with incoming add-application events even when the server list briefly lags behind.
- Keep friend verification unread badges in sync after offline periods, including the first login refresh after reconnect.
- Derive verification unread counts from local application read state and collapse multiple unread applications from the same applicant into a single unread badge unit.
- Preserve explicit local actions such as clear, accept, reject, and read while still reconciling with later full refreshes.

## Capabilities

### New Capabilities

### Modified Capabilities

- `contacts-home`: the Contacts shortcut badge must reflect the deduplicated unread verification applicant count
- `friend-verification-center`: unread verification counts must stay in sync with real-time events and count one unread unit per applicant

## Impact

- Affected code: `stores/FriendStore.ts`, `app/_layout.tsx`, `app/(tabs)/_layout.tsx`, `app/(tabs)/contacts.tsx`
- Affected validation: manual verification of first-arrival unread badge updates and repeated applications from the same applicant
