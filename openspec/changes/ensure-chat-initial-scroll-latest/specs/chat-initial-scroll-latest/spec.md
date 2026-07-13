## ADDED Requirements

### Requirement: Chat detail defaults to the latest message

The system SHALL position the chat-detail message list at the latest message after the initial message content finishes rendering.

#### Scenario: First entry lands on latest message

- **WHEN** a user opens a conversation detail page with existing messages
- **THEN** the message list MUST default to the latest message position

#### Scenario: Conversation switch lands on latest message

- **WHEN** a user switches from one conversation detail page to another
- **THEN** the newly opened conversation MUST default to the latest message position

#### Scenario: User scroll is preserved after manual browsing

- **WHEN** the user has already manually scrolled away from the latest message
- **THEN** subsequent layout updates MUST NOT force the list back to the bottom unless normal new-message auto-scroll rules apply
