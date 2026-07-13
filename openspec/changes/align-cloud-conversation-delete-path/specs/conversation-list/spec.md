## MODIFIED Requirements

### Requirement: Conversation Actions Use Cloud Store In Cloud Mode

The app SHALL execute conversation-list actions against the cloud conversation store when cloud conversation mode is enabled.

#### Scenario: Delete conversation in cloud mode

- **WHEN** `enableV2CloudConversation` is enabled in the active RootStore
- **AND** the user deletes a conversation from the conversation list
- **THEN** the conversation list page MUST invoke the cloud `conversationStore`
- **AND** the delete behavior MUST follow cloud conversation semantics for relogin and multi-end sync
