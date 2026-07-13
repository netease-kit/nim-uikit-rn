# user-setting-page Specification

## Purpose

TBD - created by archiving change align-user-setting-with-web. Update Purpose after archive.

## Requirements

### Requirement: Setting page exposes the cloud-conversation toggle

The `/user/setting` page MUST expose the cloud-conversation toggle with the Web-aligned copy while preserving the current RN settings surface.

#### Scenario: User opens the setting page

- **WHEN** the user navigates to `/user/setting`
- **THEN** the page shows a switch row labeled `是否开启云端会话`
- **AND** the row remains visible alongside the current RN settings entries for notifications, earpiece mode, read receipts, appearance, language, and logout

#### Scenario: User changes the cloud-conversation toggle

- **WHEN** the user turns the cloud-conversation toggle on or off
- **THEN** the selected value is stored in local preferences
- **AND** later NIM initialization and login flows MUST read that stored value as the effective `enableV2CloudConversation` setting
- **AND** the page MAY inform the user that the change takes effect after they log in again

#### Scenario: User logs in again after changing the toggle

- **WHEN** the user changes `是否开启云端会话`
- **AND** later enters a new validated login session
- **THEN** the active NIM instance MUST be rebound into the RN `im-store-v2` bridge with the stored `enableV2CloudConversation` value
- **AND** the conversation list MUST read from the bridge store that matches the current mode instead of falling back to stale local conversation data

### Requirement: Setting page exposes system authorization management

The `/user/setting` page MUST expose a system authorization management entry alongside notification, cloud-conversation, read-receipt, language, and logout settings.

#### Scenario: User opens system authorization management

- **WHEN** the user navigates to `/user/setting`
- **THEN** the page shows a row labeled `系统授权管理`
- **AND** tapping the row routes to the system authorization management page
