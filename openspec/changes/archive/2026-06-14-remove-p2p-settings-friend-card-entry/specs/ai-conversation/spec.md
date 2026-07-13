# Capability: AI Conversation

## MODIFIED Requirements

### Requirement: AI user profile entry opens the dedicated AI profile page

RN MUST route AI user profile entry points to a dedicated AI profile page instead of the normal friend-card page.

#### Scenario: Open AI profile from chat message avatar

- **WHEN** the user taps an AI user's avatar in chat detail
- **THEN** RN opens the dedicated AI profile page for that account
- **AND** it does not open the normal friend-card page

#### Scenario: Open AI profile from P2P settings

- **WHEN** the current P2P peer is an AI user
- **AND** the user taps the peer item in chat settings
- **THEN** RN opens the dedicated AI profile page for that account

#### Scenario: Open AI profile from my AI users list

- **WHEN** the user opens the my AI users list
- **AND** taps an AI user row
- **THEN** RN opens the dedicated AI profile page for that account
- **AND** it does not directly open the chat detail page
