# message-collection Change Spec

## MODIFIED Requirements

### Requirement: Collection Follow-Up Actions

The collection page SHALL expose overflow actions based on the collected message type.

#### Scenario: Overflow actions for a collected text message

- **GIVEN** the user opens My > Collection
- **AND** a collected message is a text message with copyable text content
- **WHEN** the user opens the collection-card overflow menu
- **THEN** the available actions MUST include `复制`, `删除`, and `转发`

#### Scenario: Overflow actions for a collected audio message

- **GIVEN** the user opens My > Collection
- **AND** a collected message is an audio message
- **WHEN** the user opens the collection-card overflow menu
- **THEN** the available actions MUST include `删除`
- **AND** the menu MUST NOT include `转发`
