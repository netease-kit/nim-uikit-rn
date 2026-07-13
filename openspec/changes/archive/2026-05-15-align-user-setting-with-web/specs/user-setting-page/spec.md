## ADDED Requirements

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
