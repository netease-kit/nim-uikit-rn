## MODIFIED Requirements

### Requirement: Conversation Mention Highlight

The app SHALL visually highlight `@me` indicators in the conversation list.

#### Scenario: Conversation receives an @me message

- **WHEN** the conversation list row indicates someone mentioned the current user
- **THEN** the app MUST display the prefix `有人@我`
- **AND** that prefix MUST use a red highlighted style
