# team-settings-and-members Specification

## Purpose

TBD - created by archiving change port-im-kit-react-ui-h5. Update Purpose after archive.

## Requirements

### Requirement: Team Setting Page Layout

The app SHALL provide team-setting pages with team metadata, member list, add-member entry, history or more-actions entry, reminder toggle, stick-top toggle, group-id display, and role-based management actions, while limiting team-wide mute controls to the owner role when the workbook requires that restriction.

#### Scenario: Opening team settings

- **WHEN** the user opens team settings from a team conversation
- **THEN** the page shows the required team-setting sections for the current role and team state

#### Scenario: Team settings initial load fails

- **WHEN** the team-setting page cannot load the initial team profile or member summary
- **THEN** the page shows a dedicated failure state with retry instead of treating the team as empty

#### Scenario: Opening team history

- **WHEN** the user taps the history entry from team settings
- **THEN** the app opens the history-record page for the current team conversation

#### Scenario: Team name row truncates long values

- **WHEN** the team settings page shows a long team name in the team-name configuration row
- **THEN** the value remains on a single line
- **AND** overflow text is truncated with an ellipsis

#### Scenario: Team name row opens direct editing

- **WHEN** the user taps the team-name configuration row from team settings
- **THEN** the app opens the team-name edit page directly
- **AND** the flow MUST NOT require entering the team-info page first

#### Scenario: RN recognizes native discussion markers

- **WHEN** RN loads a team created by Android or iOS native clients
- **AND** the team server extension contains the native discussion marker
- **THEN** RN displays discussion-group labels and discussion-group setting behavior for that team

#### Scenario: Native discussion conversation opens before local team cache is populated

- **WHEN** RN receives or lists a team conversation created by Android or iOS native clients
- **AND** the local RN team cache has not yet loaded that team
- **THEN** RN keeps the conversation visible and allows the user to enter chat detail
- **AND** RN SHALL NOT treat the missing local cache entry as a dismissed or left team

### Requirement: Team Member List And Avatar Navigation

The team-setting and team-member pages SHALL render member rows with nickname precedence, native-aligned member preview, role labels, avatar display, avatar-tap navigation, search, large-team rendering behavior, and initial-load failure recovery required by the tests. The full member list SHALL display friend alias before team nickname, team nickname before personal nickname, and personal nickname before account ID. The full member list SHALL refresh displayed member names and search matching when the highest-priority available name source changes, including friend alias, team nickname, and personal nickname.

#### Scenario: Team member list reflects display-name source changes

- **GIVEN** the user opens a full team member list
- **AND** member A has a team nickname
- **WHEN** the user opens A's friend card and changes the current highest-priority displayed name source
- **THEN** returning to the team member list MUST show A's updated display name
- **AND** searching the member list MUST match the updated displayed name

#### Scenario: Team member search matches visible display name

- **GIVEN** the user opens a full team member list
- **AND** a member row displays a name resolved from friend alias, team nickname, or personal nickname
- **WHEN** the user searches with text contained in that displayed name
- **THEN** the member MUST appear in the search results
- **AND** searching by the member account ID MUST continue to match the same member.

#### Scenario: Team member list falls back after display-name source deletion

- **GIVEN** member A has a friend alias and a team nickname
- **WHEN** the user deletes A's friend alias from A's friend card
- **THEN** returning to the team member list MUST show the next display name according to the member-list precedence

#### Scenario: Team settings member preview shows avatars only

- **WHEN** the team settings page renders the horizontal member preview
- **THEN** each existing member preview item MUST show the member avatar
- **AND** it MUST NOT show the member nickname below the avatar

#### Scenario: Team member list hides account id and normal role marker

- **WHEN** the full team member list renders a member row
- **THEN** the row MUST show the member display name using friend alias before team nickname, personal nickname, and account ID
- **AND** the row MUST NOT show the member account ID below the display name
- **AND** normal members MUST NOT show a member identity marker

#### Scenario: Team owner and manager badges match native style

- **WHEN** a full team member list row belongs to the team owner or a manager
- **THEN** the row MUST show the corresponding `群主` or `管理员` marker on the right side of the row
- **AND** the marker MUST use a native-aligned rounded bordered badge style

#### Scenario: Team nickname updates member rows in realtime

- **WHEN** a member's nickname in the current team is changed
- **THEN** the team settings member preview and full member list update to show the new team nickname without requiring page re-entry
- **AND** the displayed member name uses friend alias before team nickname, personal nickname, and account ID

#### Scenario: Discussion member list hides role and remove controls

- **WHEN** the full member list is opened for a discussion group
- **THEN** member rows SHALL NOT show the `群主` marker
- **AND** member rows SHALL NOT show the `管理员` marker
- **AND** member rows SHALL NOT show the `移除` action

#### Scenario: Advanced group member list keeps role and remove controls

- **WHEN** the full member list is opened for an advanced group
- **THEN** owner and manager rows SHALL keep their existing role marker behavior
- **AND** members that the current user is allowed to remove SHALL keep the existing `移除` action

### Requirement: Team Membership Changes

The team-setting pages SHALL refresh when members join, leave, or are removed, and SHALL distinguish the real-time update behavior required by advanced-team versus discussion-group test cases.

#### Scenario: Syncing team membership changes

- **WHEN** the team membership changes while the page is open
- **THEN** the visible member list and available actions update to the latest valid state

### Requirement: Team Governance And Exit Operations

The team-setting flow SHALL support add-member, leave, dismiss, kick, role-based remove-member operations, and their confirm, limit, offline, and cross-endpoint behaviors required by the tests.

#### Scenario: Leaving, dismissing, or removing members

- **WHEN** the user performs a permitted membership mutation from team settings or member list
- **THEN** the resulting team state, navigation, and confirmation behavior follow the workbook rules

### Requirement: Team-Wide Mute And Permission Changes

The team-setting flow SHALL support team-wide mute defaults, mute toggling, composer-state reactions, and role-permission changes that may happen mid-operation. The main group settings page MUST expose the group-wide chat-ban switch to the group owner and MUST NOT expose that owner-only switch to managers or normal members.

#### Scenario: Team permission changes while operating

- **WHEN** mute state or management permission changes while the user is composing or managing members
- **THEN** the setting page and chat composer converge to the latest permitted behavior

#### Scenario: Owner toggles group-wide chat ban from settings

- **WHEN** the group owner opens the main group settings page
- **THEN** the page shows a `群禁言` switch bound to the current team chat-ban mode
- **AND** toggling the switch updates the team chat-ban mode

#### Scenario: Non-owner cannot toggle group-wide chat ban from settings

- **WHEN** a manager or normal member opens the main group settings page
- **THEN** the page does not show the owner-only `群禁言` switch
