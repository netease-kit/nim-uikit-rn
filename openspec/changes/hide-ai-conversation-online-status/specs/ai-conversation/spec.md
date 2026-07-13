## MODIFIED Requirements

### Requirement: AI conversations do not show online status

RN AI conversations MUST NOT display online/offline status in conversation list or chat detail header.

#### Scenario: Show AI conversation in conversation list

- **WHEN** a conversation item belongs to an AI user
- **THEN** the conversation list item does not show online/offline status

#### Scenario: Open AI chat detail

- **WHEN** the user opens a P2P chat whose peer is an AI user
- **THEN** the chat header does not show online/offline status
- **AND** the AI account is excluded from online-status subscription for that header
