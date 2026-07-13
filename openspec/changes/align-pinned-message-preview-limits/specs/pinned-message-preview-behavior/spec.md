## MODIFIED Requirements

### Requirement: Pinned Message Preview Layout

The pinned message page SHALL render pinned messages as preview cards suitable for browsing from chat settings.

#### Scenario: Pinned reply hides quoted source

- **GIVEN** a pinned message is a reply message with a quoted source
- **WHEN** the pinned message card is rendered
- **THEN** the card does not show the quoted source content
- **AND** still shows the pinned message content itself

#### Scenario: Long pinned text is clamped

- **GIVEN** a pinned text or emoji message content exceeds three lines
- **WHEN** the pinned message card is rendered
- **THEN** the content is shown on at most three lines
- **AND** overflowing content is truncated with an ellipsis
