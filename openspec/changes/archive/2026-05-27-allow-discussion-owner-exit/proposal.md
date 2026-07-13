## Why

Discussion groups are presented as lightweight groups where the creator can exit from the settings page. RN currently calls the normal advanced-team leave path for discussion owners, causing the SDK error `team owner quit not allowed`.

## What Changes

- Align discussion-owner exit behavior with Android.
- When the current user owns a discussion group, transfer ownership to another non-AI member and leave in one operation.
- If no eligible non-AI member exists, dismiss the discussion group instead.
- Keep normal group owner behavior unchanged: `解散群聊` still dismisses the group.

## Capabilities

### New Capabilities

### Modified Capabilities

- `discussion-settings`: Discussion owners can successfully use `退出讨论组`.

## Impact

- Affected code: `app/team/settings.tsx`, `stores/TeamStore.ts`
- Affected behavior: discussion-group owner exit from settings
- No API or dependency changes.
