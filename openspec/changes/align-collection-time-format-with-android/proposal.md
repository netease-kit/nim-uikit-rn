## Why

The RN collection list currently renders collection timestamps with `Date.toLocaleString()`, so iOS and Android can show different separators, ordering, and 12/24-hour styles for the same collection entry. The collection page needs a fixed timestamp format that matches the Android native client.

## What Changes

- Replace locale-dependent collection-list timestamp rendering with a fixed formatter in RN.
- Replace locale-dependent timestamp rendering in pinned-message list, chat history list, merged-forward detail time dividers, and message preview pages with the same fixed formatter.
- Show today's collection time as `HH:mm` in 24-hour time.
- Show same-year non-today collection time as `MM月dd日 HH:mm`.
- Show cross-year collection time as `yyyy年MM月dd日`.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `message-collection`: collection-card timestamps use a fixed Android-aligned display format instead of device locale formatting.

## Impact

- Affects `app/user/collection.tsx`, `app/chat/pins.tsx`, `app/chat/history.tsx`, `app/chat/merged-forward-detail.tsx`, `app/chat/message-preview.tsx`, and the shared RN time-formatting utility.
- No SDK API, dependency, or navigation contract changes.
