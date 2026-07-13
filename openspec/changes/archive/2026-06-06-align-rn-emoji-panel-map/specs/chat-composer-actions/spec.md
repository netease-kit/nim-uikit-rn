## ADDED Requirements

### Requirement: Emoji Composer

The chat composer SHALL allow users to insert emoji from the emoji panel and SHALL render the sent emoji consistently in the message timeline.

#### Scenario: Emoji panel item renders consistently after send

- **GIVEN** the chat detail page shows the emoji panel
- **WHEN** the user taps any emoji item, including the fourth row fifth column item
- **AND** sends the message
- **THEN** the message timeline MUST render the same emoji image as the emoji item shown in the composer panel
- **AND** distinct emoji items MUST NOT share a localized token key that causes one mapping to overwrite another
