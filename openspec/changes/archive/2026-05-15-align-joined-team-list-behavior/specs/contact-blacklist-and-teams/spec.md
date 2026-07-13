## MODIFIED Requirements

### Requirement: Joined Team List

The contacts module SHALL provide the joined-team list with the required UI, ordering, route from a team row into the corresponding team conversation, and initial-load failure recovery.

#### Scenario: Opening a joined team

- **WHEN** the user taps a team row in the joined-team list
- **THEN** the app opens the matching team conversation

#### Scenario: Opening joined-team list when loading fails

- **WHEN** the joined-team page cannot complete its initial list refresh
- **THEN** the page shows a dedicated failure state with retry instead of treating the result as empty

#### Scenario: Ordering joined teams

- **WHEN** the joined-team list renders multiple joined teams
- **THEN** teams are ordered by `createTime` descending so newer teams appear above older teams

#### Scenario: Refreshing joined teams after membership changes

- **WHEN** the current account creates a team, joins a team, is added to a team, leaves a team, or a joined team is dismissed
- **THEN** the joined-team list refreshes to reflect the latest joined teams

### Requirement: Stale Team Cleanup

The joined-team list SHALL remove teams that the user left or that were dismissed or removed from another endpoint, and team exit actions from settings SHALL return to the joined-team list with the related conversation removed.

#### Scenario: Syncing after team exit or dismissal

- **WHEN** a joined team becomes invalid
- **THEN** the stale team is removed from the visible joined-team list after sync

#### Scenario: Leaving or dismissing from team settings

- **WHEN** the user leaves or dismisses a team from the team settings page reached through a joined-team conversation
- **THEN** the app returns to the joined-team list
- **AND** the exited or dismissed team is absent from the list
- **AND** the corresponding local conversation is deleted with message data cleared
