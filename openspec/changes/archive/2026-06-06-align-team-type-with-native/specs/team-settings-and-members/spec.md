## MODIFIED Requirements

### Requirement: Team Setting Page Layout

The app SHALL provide team-setting pages with team metadata, member list, add-member entry, history or more-actions entry, reminder toggle, stick-top toggle, group-id display, and role-based management actions, while limiting team-wide mute controls to the owner role when the workbook requires that restriction.

#### Scenario: RN recognizes native discussion markers

- **WHEN** RN loads a team created by Android or iOS native clients
- **AND** the team server extension contains the native discussion marker
- **THEN** RN displays discussion-group labels and discussion-group setting behavior for that team

#### Scenario: Native discussion conversation opens before local team cache is populated

- **WHEN** RN receives or lists a team conversation created by Android or iOS native clients
- **AND** the local RN team cache has not yet loaded that team
- **THEN** RN keeps the conversation visible and allows the user to enter chat detail
- **AND** RN SHALL NOT treat the missing local cache entry as a dismissed or left team
