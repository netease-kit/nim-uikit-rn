## ADDED Requirements

### Requirement: Chat Detail Must Not Enter A Render Update Loop

The chat detail screen SHALL avoid repeated state updates caused by unstable render-time dependencies.

#### Scenario: Opening a chat detail screen on device

- **WHEN** the user opens and interacts with the chat detail screen
- **THEN** the screen MUST NOT continuously trigger React `Maximum update depth exceeded`
- **AND** the header title, subtitle, and conversation-driven UI state MUST remain stable when their inputs have not changed
