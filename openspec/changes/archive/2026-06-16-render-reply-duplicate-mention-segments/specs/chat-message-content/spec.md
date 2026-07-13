## MODIFIED Requirements

### Requirement: Text And Emoji Messages

The chat module SHALL correctly send and render plain text, mixed-language text, special-character text, blank-space text, emoji-only, emoji-plus-text messages, and mention-highlighted text messages covered by the tests.

#### Scenario: Duplicate mention from draft and reply remains highlighted

- **GIVEN** a team-chat composer already contains a selected mention for user A
- **AND** the user replies to a message sent by user A, causing another `@A` mention to be inserted
- **WHEN** the message is sent and rendered in the chat timeline
- **THEN** both visible `@A` mentions SHALL be highlighted
- **AND** the second mention SHALL remain highlighted even when it is at the end of the sent text
