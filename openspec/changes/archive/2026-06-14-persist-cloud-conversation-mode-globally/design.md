## Context

`PreferenceStore` stores both `cloudConversationEnabled` and `cloudConversationEnabledByAccount`. `NIMStore.login()` calls `applyCloudConversationPreferenceForAccount(account)` before SDK configuration, and the settings screen writes through `setCloudConversationEnabledForAccount(account, value)`. This makes the runtime mode account-scoped.

## Decision

Use `cloudConversationEnabled` as the source of truth for the setting. Keep the legacy account-scoped field in the snapshot type only for stored-data compatibility, but stop reading it during normal mode resolution and stop writing it from the settings screen.

## Risks

- Existing users may have account-scoped values from an older build. During bootstrap, migrate a legacy all-cloud account map back to global cloud mode only when the stored global value was forced to local by the old account-switch flow.
- SDK mode changes still require NIM reconfiguration, so the setting write path must continue updating the global value before the next login or rebuild.
