## Why

When the message tab still shows unread state, the user needs a fast way to jump to the nearest unread conversation instead of manually scanning the full list. This improves large-list usability and matches the expected unread-navigation behavior.

## What Changes

- make the bottom message tab unread red dot actionable
- when the user taps the message tab while unread conversations exist, request the conversation list to scroll to the nearest unread conversation
- support the same jump behavior both when already on the message tab and when returning from another tab

## Capabilities

### New Capabilities

- `message-tab-unread-jump`: Bottom message tab unread navigation behavior

### Modified Capabilities

- `conversation-list-behavior`: The conversation list can be repositioned to the nearest unread row from the bottom message tab

## Impact

- affected code: `app/(tabs)/_layout.tsx`, `app/(tabs)/index.tsx`, `stores/index.ts`
- affected systems: bottom tab navigation, conversation list scroll behavior
