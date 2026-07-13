## MODIFIED Requirements

### Requirement: Session Settings Stick-Top Action Source

The app SHALL execute stick-top actions from settings pages against the cloud conversation store when cloud conversation mode is enabled.

#### Scenario: Toggle stick-top from settings in cloud mode

- **WHEN** `enableV2CloudConversation` is enabled
- **AND** the user toggles stick-top from the P2P or team settings page
- **THEN** the app MUST invoke the cloud `conversationStore`
- **AND** the resulting stick-top state MUST remain eligible for multi-end sync
