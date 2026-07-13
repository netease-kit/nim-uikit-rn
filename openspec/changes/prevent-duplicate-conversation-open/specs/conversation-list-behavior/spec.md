## MODIFIED Requirements

### Requirement: Conversation Row Navigation

The conversation list SHALL open a chat detail page when the user taps a valid conversation row.

#### Scenario: Double tapping a conversation opens one detail page

- **GIVEN** a valid conversation row is visible in the conversation list
- **WHEN** the user quickly taps the row twice
- **THEN** the app opens only one chat detail page for that conversation
- **AND** no duplicate chat detail route is pushed for the second tap

#### Scenario: Returning to the list allows navigation again

- **GIVEN** the user opened a chat detail page from the conversation list
- **WHEN** the user returns to the conversation list
- **THEN** tapping a conversation row can open chat detail again
