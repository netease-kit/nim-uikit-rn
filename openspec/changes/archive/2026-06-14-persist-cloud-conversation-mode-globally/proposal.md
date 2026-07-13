## Why

The cloud-conversation switch is currently applied per login account. After account 1 enables cloud conversations and account 2 logs in, account 2 can fall back to local conversations even though the product expectation is that this switch is a local persisted app preference.

## What Changes

- Treat the cloud-conversation switch as a global persisted preference instead of an account-bound preference.
- Keep account switching from overriding the stored global cloud-conversation mode.
- Keep existing NIM reconfiguration behavior when the global preference changes.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `conversation-list-behavior`: Active conversation mode preference must persist locally across login accounts.

## Impact

- Affected code: `stores/PreferenceStore.ts`, `stores/NIMStore.ts`, `app/user/setting.tsx`
- Affected behavior: cloud/local conversation mode selection across account switches
- No API, dependency, route, or SDK surface changes.
