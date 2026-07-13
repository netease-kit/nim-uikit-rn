## MODIFIED Requirements

### Requirement: Conversation list source follows active conversation mode

The app SHALL keep the homepage conversation list aligned with the active conversation mode after login.

#### Scenario: Cloud mode is enabled for the current login session

- **WHEN** the current bound RootStore has `enableV2CloudConversation` enabled
- **THEN** the homepage conversation list MUST use the bound bridge conversation data as its source of truth
- **AND** pull-to-refresh and pagination MUST continue against that active bridge conversation store
- **AND** an empty bridge result MUST NOT cause the page to show stale local conversation cache from an earlier mode
