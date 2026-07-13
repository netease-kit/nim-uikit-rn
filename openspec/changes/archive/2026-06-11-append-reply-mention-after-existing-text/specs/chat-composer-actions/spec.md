## ADDED Requirements

### Requirement: Reply mention insertion must preserve existing draft order

When a team-chat composer already contains text, starting a reply from a member message MUST append the generated mention after the existing draft content instead of prepending it.

#### Scenario: Reply from a member after typing draft text

- **GIVEN** the conversation is a team chat
- **AND** the composer already contains user-entered text
- **WHEN** the user long-presses a member message and chooses reply
- **THEN** the generated `@member` mention must be inserted after the existing composer text
- **AND** the existing composer text order must remain unchanged

#### Scenario: Reply mention spacing after existing draft text

- **GIVEN** the conversation is a team chat
- **AND** the composer already contains user-entered text without trailing whitespace
- **WHEN** the user starts a reply from a member message
- **THEN** the composer must insert exactly one separator space before the generated `@member` mention
