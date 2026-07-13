## Why

Smoke case `0356-群禁言` operates the chat-ban switch directly from the group settings page. The RN settings page currently hides that control under the secondary group-management page, so the main settings flow does not match the workbook.

## What Changes

- Show a group-wide chat-ban switch on the main group settings page for the group owner.
- Keep normal members and managers from seeing the owner-only group-wide chat-ban control on the main settings page.
- Reuse the existing team chat-ban mutation so the chat composer continues to react to the latest team mute state.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `team-settings-and-members`: Main group settings must expose the owner-only group-wide chat-ban switch required by the workbook.

## Impact

- Affected route: `app/team/settings.tsx`
- Affected state path: existing `TeamStore.setChatBannedMode()` and chat composer state refresh
- No dependency or runtime configuration changes
