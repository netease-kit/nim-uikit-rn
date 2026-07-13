## MODIFIED Requirements

### Requirement: Joined Team List

The contacts module SHALL provide the joined-team list with the required UI, ordering, route from a team row into the corresponding team conversation, initial-load failure recovery, and immediate chat entry after successful free-join applications.

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

#### Scenario: Opening joined-team list from Contacts

- **WHEN** the user opens the joined-team page from the Contacts shortcut
- **THEN** the page completes a single initial-load pass for the current navigation entry
- **AND** the page remains interactive after the load settles

#### Scenario: Applying to join a free-join team

- **WHEN** the user applies to join a group chat or discussion group whose join mode is free
- **THEN** the app MUST add the team to local joined-team state
- **AND** the app MUST create the matching team conversation
- **AND** the app MUST open that team chat instead of showing application-sent feedback
