## MODIFIED Requirements

### Requirement: Conversation List Reflects Mute State Changes

The RN conversation list MUST reflect the latest per-conversation mute state after a user changes message notification settings from chat-related settings screens.

#### Scenario: P2P mute setting updates conversation list state

- **WHEN** the user toggles message notification for a P2P conversation from the chat settings or friend card entry
- **THEN** the mute setting change must refresh the currently active conversation data source
- **AND** returning to the conversation list must show the updated mute indicator state for that conversation

#### Scenario: Team mute setting updates conversation list state

- **WHEN** the user toggles message notification for a team conversation from the team settings page
- **THEN** the mute setting change must refresh the currently active conversation data source
- **AND** returning to the conversation list must show the updated mute indicator state for that conversation

#### Scenario: Mute change event keeps current list source in sync

- **WHEN** the app receives a single-chat or team mute mode change event from the SDK
- **THEN** the RN app must refresh the currently active conversation data source used by the conversation list
- **AND** the conversation list mute indicator must not remain stale because only an inactive store was refreshed
