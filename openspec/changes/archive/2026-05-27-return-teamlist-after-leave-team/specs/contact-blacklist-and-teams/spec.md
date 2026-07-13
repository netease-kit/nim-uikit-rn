## MODIFIED Requirements

### Requirement: Stale Team Cleanup

The joined-team list SHALL remove teams that the user left or that were dismissed or removed from another endpoint, and team exit actions from settings SHALL remove the related conversation and return to the previous still-valid page in the navigation stack.

#### Scenario: Syncing after team exit or dismissal

- **WHEN** a joined team becomes invalid
- **THEN** the stale team is removed from the visible joined-team list after sync

#### Scenario: Leaving or dismissing from team settings

- **WHEN** the user leaves or dismisses a team from the team settings page
- **THEN** the app exits the team settings page
- **AND** it skips the now-invalid team chat page
- **AND** it returns to the previous still-valid page in the navigation stack
- **AND** the exited or dismissed team is absent from the list
- **AND** the corresponding local conversation is deleted with message data cleared
