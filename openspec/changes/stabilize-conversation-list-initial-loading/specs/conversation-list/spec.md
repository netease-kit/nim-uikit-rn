## MODIFIED Requirements

### Requirement: Conversation List Initial Loading State

The app SHALL prefer a loading placeholder over the empty-state illustration until the first conversation-list fetch has settled.

#### Scenario: First list fetch is still in progress

- **WHEN** the user has logged in successfully and enters the conversation list for the first time
- **AND** the first conversation fetch has not yet produced data or a confirmed empty result
- **THEN** the page MUST show a loading placeholder instead of the empty-state illustration

#### Scenario: First list fetch confirms no conversations

- **WHEN** the initial conversation fetch has completed
- **AND** the conversation list remains empty
- **THEN** the page MUST stop showing the loading placeholder
- **AND** the page MUST render the normal empty-state illustration
