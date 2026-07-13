# Capability: Team Mention Candidates

## ADDED Requirements

### Requirement: Team mention sheet shows loaded group members

The app SHALL show regular team members in the team chat mention sheet whenever the team member list has loaded, regardless of whether AI user metadata has finished loading.

#### Scenario: AI metadata is still loading

- **GIVEN** the user is in a team chat
- **AND** the team member list has loaded
- **AND** AI user metadata has not finished loading
- **WHEN** the user opens the `@` mention sheet
- **THEN** the sheet SHALL include eligible regular team members
- **AND** the sheet MAY include the `@all` option when the current user has permission

#### Scenario: Member list is not loaded when opening mention sheet

- **GIVEN** the user is in a team chat
- **AND** the team member list has not loaded
- **WHEN** the user opens the `@` mention sheet
- **THEN** the app SHALL request the team member list
- **AND** the sheet SHALL update to include eligible regular team members after loading succeeds
