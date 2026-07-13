## MODIFIED Requirements

### Requirement: Team Mention Messages

The chat module SHALL support Android-compatible mention composition, metadata, deletion, sending, receiving, and re-editing for text messages in team or discussion chats.

#### Scenario: Team mention selector opens without search

- **GIVEN** the user is composing in a team chat
- **WHEN** the user types `@`
- **THEN** RN opens the mention selector without a search input module
- **AND** RN directly shows the available `@所有人` candidate when allowed and the ordinary team-member candidates
