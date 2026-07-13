## MODIFIED Requirements

### Requirement: Conversation Source Selection In Cloud Mode

The app SHALL prefer the cloud-conversation store when cloud conversation mode is enabled.

#### Scenario: Cloud conversation mode enabled

- **WHEN** `enableV2CloudConversation` is enabled in the active RootStore
- **THEN** the React Native conversation list MUST use the cloud `conversationStore` as its primary data source
- **AND** total unread counts MUST prefer the cloud conversation store as well
