# contact-blacklist-and-teams Specification

## Purpose

TBD - created by archiving change port-im-kit-react-ui-h5. Update Purpose after archive.

## Requirements

### Requirement: Blacklist Management

The contacts module SHALL expose the blacklist list, blacklist empty state, row sorting, display-name precedence, add/remove blacklist actions, initial-load failure recovery with network-aware behavior, and the shared no-avatar fallback label order for blacklisted friends.

#### Scenario: Managing blacklist membership

- **WHEN** the user adds or removes a blacklist relation
- **THEN** the blacklist list and related friend surfaces refresh to the latest state

#### Scenario: Opening blacklist when loading fails

- **WHEN** the blacklist page cannot complete its initial load
- **THEN** the page distinguishes that failure from an empty blacklist and provides a retry action

#### Scenario: Opening blacklist from Contacts

- **WHEN** the user opens the blacklist page from the Contacts shortcut
- **THEN** the page completes a single initial-load pass for the current navigation entry
- **AND** the page remains interactive after the load settles

#### Scenario: Blacklisted friend display name resolves with contact priority

- **WHEN** a blacklist row renders a friend
- **THEN** the row title MUST prefer the friend's alias
- **AND** it MUST then prefer the friend's personal nickname
- **AND** it MUST finally fall back to the friend's `accid`

#### Scenario: Blacklisted friend has no avatar image

- **WHEN** a blacklist row renders a friend without a preset avatar image
- **THEN** the default avatar label MUST prefer the friend's alias
- **AND** it MUST then prefer the friend's personal nickname
- **AND** it MUST finally fall back to the friend's `accid`
- **AND** the rendered default avatar text MUST use the last two characters of the resolved label source

### Requirement: Blacklist Entry Points

The contacts module SHALL support adding to or removing from blacklist from both the blacklist picker flow and friend-card switches, including digital-human rows where the tests require them.

#### Scenario: Toggling blacklist membership from different entry points

- **WHEN** the user changes blacklist state from a picker or friend-card control
- **THEN** the resulting state is reflected consistently across contacts surfaces

#### Scenario: Blacklist picker excludes AI users and unavailable accounts

- **WHEN** the user opens the picker flow to add members into the blacklist
- **THEN** the selectable list MUST include current-account friends that are not already blacklisted
- **AND** the list MUST exclude AI users, self, and accounts that already belong to the blacklist

### Requirement: Joined Team List

The contacts module SHALL provide the joined-team list and joined-team search entry points with the required UI, ordering, route from a team row into the corresponding team conversation, initial-load failure recovery, and immediate chat entry after successful free-join applications.

#### Scenario: Opening an already-joined team from join-team search

- **GIVEN** the current account has already joined a group
- **WHEN** the user opens the join-group page and searches that group's ID
- **THEN** the result action MUST display `去聊天`
- **AND** the action MUST be enabled
- **WHEN** the user taps `去聊天`
- **THEN** the app MUST create or upsert the matching team conversation locally
- **AND** the app MUST open that team chat page

#### Scenario: Applying to join a non-joined team

- **GIVEN** the current account has not joined the searched group
- **WHEN** the join-group page renders the search result
- **THEN** the result action MUST keep the existing join/application behavior

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

### Requirement: Network And Cross-Endpoint Team Sync

The joined-team and blacklist surfaces SHALL converge after offline periods, reconnect, network switches, and cross-endpoint team exits or dismissals.

#### Scenario: Recovering contact lists after reconnect

- **WHEN** contact or team membership changes while the device is offline or on another endpoint
- **THEN** the local blacklist and joined-team lists converge to the latest valid server state

### Requirement: Joined Team Row Navigation Recovers After Return

The joined-team list rows SHALL be tappable after the user opens one team chat, returns to the joined-team list, and taps another team row.

#### Scenario: Open another joined team after returning from chat

- **GIVEN** the user is viewing the joined-team list
- **WHEN** the user opens one team chat, returns to the joined-team list, and taps any valid team row
- **THEN** the app MUST open the tapped team chat page
- **AND** the team rows MUST NOT remain disabled by the previous navigation lock
