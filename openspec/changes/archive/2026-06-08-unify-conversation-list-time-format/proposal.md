## Why

Conversation list timestamps currently use platform locale formatting. Different Android and iOS devices may render different separators, 12-hour/24-hour styles, or localized suffixes for the same conversation timestamp, making the list inconsistent across phones.

## What Changes

- Use a fixed conversation list timestamp formatter in RN.
- Show today's conversations as `HH:mm` in 24-hour time.
- Show conversations from the current year as `MM月dd日 HH:mm` in 24-hour time.
- Show conversations from earlier years as `yyyy年MM月dd日`.

## Impact

- Affected code: `app/(tabs)/index.tsx`
- Affected behavior: conversation list timestamp text
