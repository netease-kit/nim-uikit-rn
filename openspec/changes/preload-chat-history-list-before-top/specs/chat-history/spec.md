## MODIFIED Requirements

### Requirement: Chat history list preloads earlier messages before fully reaching the top

RN chat history list MUST request earlier messages before the user fully reaches the list top when more history is available.

#### Scenario: Scroll upward in chat history

- **WHEN** the user scrolls near the top of the chat history list and more history exists
- **THEN** the app automatically requests earlier messages before the top boundary is fully reached
- **AND** the manual load-more entry remains available as a fallback
