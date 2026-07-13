## ADDED Requirements

### Requirement: Team conversation removal after exit or dismissal

The conversation list SHALL remove team conversations after the current user leaves the team, leaves a discussion group, is removed from the team, or the team is dismissed.

#### Scenario: Leaving a team removes the conversation

- **WHEN** the current user exits a team chat or discussion group from settings
- **THEN** the conversation list MUST remove that team conversation
- **AND** subsequent local or cloud conversation refreshes MUST NOT re-add the removed conversation merely because local conversation data still exists

#### Scenario: Team dismissal removes the conversation

- **WHEN** a team is dismissed by the current user or by another member while the app is running
- **THEN** the conversation list MUST remove that team conversation
- **AND** the row MUST NOT remain visible with only the team id as its title

#### Scenario: Reopening a valid joined team can restore the conversation

- **GIVEN** a team conversation was locally removed after exit or dismissal
- **WHEN** the current user later has a valid joined team and explicitly opens it from contacts, search, or join result
- **THEN** the app MAY recreate and show that team conversation again
