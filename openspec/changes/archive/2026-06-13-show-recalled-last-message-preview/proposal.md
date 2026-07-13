# Change: Show Recalled Last Message Preview

## Why

When the latest message in a conversation is recalled, the conversation list can still show the previous visible message as the subtitle in local conversation mode. This makes the row look as if the recalled message never happened.

## What Changes

- Keep the latest recalled message as the conversation preview source.
- Show the localized recalled-message copy in the conversation list subtitle.
- Preserve the recalled message timestamp for row ordering and time display.

## Impact

- Affects conversation list preview rendering after message recall.
- Does not change chat timeline recall rendering, unread count handling, or message deletion behavior.
