## MODIFIED Requirements

### Requirement: Team Mention Messages

The chat module SHALL support Android-compatible mention composition, metadata, deletion, sending, receiving, re-editing, and member naming for text messages in team or discussion chats.

#### Scenario: Mention picker shows non-friend nickname priority

- **GIVEN** a team chat contains a member who is not the current user's friend
- **WHEN** RN renders that member in the `@` mention picker
- **THEN** the display name MUST use the member's group nickname when present
- **AND** otherwise MUST use the member's personal profile nickname when present
- **AND** otherwise MUST fall back to the member account ID
- **AND** RN MUST NOT show the account ID as the primary display name solely because the member is not a friend
