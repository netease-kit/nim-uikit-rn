## ADDED Requirements

### Requirement: Group Pickers Exclude AI Users

The RN group creation picker and team invite picker SHALL exclude AI users from selectable candidates.

#### Scenario: Create group picker only shows friends

- **GIVEN** the user opens the group creation picker
- **WHEN** the candidate list is rendered
- **THEN** AI users MUST NOT appear in the selectable list
- **AND** normal friend candidates MUST continue to appear

#### Scenario: Invite member picker only shows friends

- **GIVEN** the user opens the team invite picker
- **WHEN** the candidate list is rendered
- **THEN** AI users MUST NOT appear in the selectable list
- **AND** normal friend candidates MUST continue to appear
