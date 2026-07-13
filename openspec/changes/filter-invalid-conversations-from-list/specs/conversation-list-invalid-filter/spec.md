## ADDED Requirements

### Requirement: Conversation list must hide invalid team conversations

The RN conversation list MUST exclude team conversations that are no longer valid or effective.

#### Scenario: Viewing the message tab after a team becomes invalid

- **WHEN** the user opens the RN conversation list
- **THEN** invalid team conversations are not shown in the list
- **AND** valid conversations continue to render and behave normally
