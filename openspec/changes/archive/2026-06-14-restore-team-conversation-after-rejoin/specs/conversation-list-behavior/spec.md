## MODIFIED Requirements

### Requirement: Team conversation removal after exit or dismissal

The conversation list SHALL remove team conversations after the current user leaves the team, leaves a discussion group, is removed from the team, or the team is dismissed. A removed team conversation MUST remain excluded while the current user is not a valid member, but MUST be restorable when the current user later rejoins the same valid team.

#### Scenario: Leaving a team removes the conversation

- **WHEN** the current user exits a team chat or discussion group from settings
- **THEN** the conversation list MUST remove that team conversation
- **AND** subsequent local or cloud conversation refreshes MUST NOT re-add the removed conversation merely because local conversation data still exists

#### Scenario: Team dismissal removes the conversation

- **WHEN** a team is dismissed by the current user or by another member while the app is running
- **THEN** the conversation list MUST remove that team conversation
- **AND** the row MUST NOT remain visible with only the team id as its title

#### Scenario: Rejoining a previously removed team restores the conversation

- **GIVEN** the current user left or was removed from team A
- **AND** the conversation for team A was removed from the conversation list
- **WHEN** the current user is invited back into team A or otherwise rejoins team A
- **THEN** the conversation list MUST allow team A's conversation to be shown again
- **AND** newer messages in team A MUST be able to update or create the team A conversation row

#### Scenario: Reopening a valid joined team can restore the conversation

- **GIVEN** a team conversation was locally removed after exit or dismissal
- **WHEN** the current user later has a valid joined team and explicitly opens it from contacts, search, or join result
- **THEN** the app MAY recreate and show that team conversation again
