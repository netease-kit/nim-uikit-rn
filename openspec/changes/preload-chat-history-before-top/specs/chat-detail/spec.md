## MODIFIED Requirements

### Requirement: Chat history pagination starts before the user fully reaches the top

RN chat-detail history pagination MUST begin before the user fully reaches the top boundary so that earlier messages can be fetched with less visible interruption during fast upward scrolling.

#### Scenario: Scroll upward toward older messages

- **WHEN** the user scrolls near the top of the chat history and older messages are still available
- **THEN** the app requests the next page of earlier messages before the list strictly reaches the top boundary
- **AND** duplicate pagination requests remain suppressed while a previous request is still in flight
