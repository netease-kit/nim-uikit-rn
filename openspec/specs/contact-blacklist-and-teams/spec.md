# contact-blacklist-and-teams Specification

## Purpose
TBD - created by archiving change port-im-kit-react-ui-h5. Update Purpose after archive.
## Requirements
### Requirement: Blacklist Management

The contacts module SHALL expose the blacklist list, blacklist empty state, row sorting, display-name precedence, add/remove blacklist actions, and initial-load failure recovery with network-aware behavior.

#### Scenario: Managing blacklist membership

- **WHEN** the user adds or removes a blacklist relation
- **THEN** the blacklist list and related friend surfaces refresh to the latest state

#### Scenario: Opening blacklist when loading fails

- **WHEN** the blacklist page cannot complete its initial load
- **THEN** the page distinguishes that failure from an empty blacklist and provides a retry action

### Requirement: Blacklist Entry Points

The contacts module SHALL support adding to or removing from blacklist from both the blacklist picker flow and friend-card switches, including digital-human rows where the tests require them.

#### Scenario: Toggling blacklist membership from different entry points

- **WHEN** the user changes blacklist state from a picker or friend-card control
- **THEN** the resulting state is reflected consistently across contacts surfaces

### Requirement: Joined Team List

The contacts module SHALL provide the joined-team list with the required UI, ordering, route from a team row into the corresponding team conversation, and initial-load failure recovery.

#### Scenario: Opening a joined team

- **WHEN** the user taps a team row in the joined-team list
- **THEN** the app opens the matching team conversation

#### Scenario: Opening joined-team list when loading fails

- **WHEN** the joined-team page cannot complete its initial list refresh
- **THEN** the page shows a dedicated failure state with retry instead of treating the result as empty

### Requirement: Stale Team Cleanup

The joined-team list SHALL remove teams that the user left or that were dismissed or removed from another endpoint.

#### Scenario: Syncing after team exit or dismissal

- **WHEN** a joined team becomes invalid
- **THEN** the stale team is removed from the visible joined-team list after sync

### Requirement: Network And Cross-Endpoint Team Sync

The joined-team and blacklist surfaces SHALL converge after offline periods, reconnect, network switches, and cross-endpoint team exits or dismissals.

#### Scenario: Recovering contact lists after reconnect

- **WHEN** contact or team membership changes while the device is offline or on another endpoint
- **THEN** the local blacklist and joined-team lists converge to the latest valid server state

