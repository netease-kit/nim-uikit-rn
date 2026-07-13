# team-create-entry Specification

## Purpose

TBD - created by archiving change port-im-kit-react-ui-h5. Update Purpose after archive.

## Requirements

### Requirement: Team Creation From Conversation Flows

The app SHALL allow users to create advanced teams or discussion-group-equivalent flows from conversation-related entry points and route directly into the created conversation.

#### Scenario: Creating a team from the picker

- **WHEN** the user confirms a valid invitee set for team creation
- **THEN** the app creates the team and opens the resulting chat page

#### Scenario: Creating from single-chat settings

- **WHEN** the user enters the picker from a p2p settings page
- **THEN** the picker excludes self, the current p2p target, and blacklisted contacts from manual selection while still auto-including the current p2p target in the created team

#### Scenario: Inviting members into an existing team

- **WHEN** the user opens the member-picker flow for an existing team
- **THEN** the selectable list MUST include current-account friends and configured AI users
- **AND** the list MUST exclude self, blacklisted friends, and accounts that are already members of that team

### Requirement: Team Type And Initial Chat Presentation

The creation flow SHALL preserve whether the user is creating a discussion-style group or advanced team, SHALL create new teams with invitee approval disabled by default, SHALL create new teams with applicant join approval disabled by default, and SHALL render the resulting chat page with the expected system notification row and initial metadata.

#### Scenario: Opening a newly created team chat

- **WHEN** creation succeeds for a supported team type
- **THEN** the resulting chat page shows the expected title and creation notification content

#### Scenario: Default invitee approval mode for new teams

- **WHEN** the user creates a new team from the supported creation flow
- **THEN** the created team uses `不需要被邀请者同意` as the default invitee approval mode

#### Scenario: Default applicant join mode for new teams

- **WHEN** the user creates a new group chat or discussion group from the supported creation flow
- **THEN** the created team MUST allow applicants to join freely without owner or manager approval

#### Scenario: Created team type is recognized by native clients

- **WHEN** RN creates a discussion group
- **THEN** the created team uses the same SDK team type and discussion marker as Android and iOS native clients
- **AND** Android and iOS native clients recognize it as a discussion group
- **WHEN** RN creates an advanced group
- **THEN** the created team uses the same SDK team type as Android and iOS native clients
- **AND** RN does not write the discussion marker for the advanced group

### Requirement: Team Creation Limits And Throttling

The team-creation flow SHALL enforce empty-selection checks, repeated-create throttling, per-create invite limits, and the overall member-cap rules required by the tests.

#### Scenario: Creating with invalid selection

- **WHEN** the user attempts to create a team with empty or over-limit selection
- **THEN** the app blocks creation and shows the expected validation state

#### Scenario: Creating with repeated taps

- **WHEN** the user taps the create action multiple times before the first request settles
- **THEN** the app prevents duplicate team creation and keeps one authoritative result

### Requirement: Team Creation Failure Recovery

The team-creation flow SHALL preserve local selection state and failure feedback for offline, reconnect, and network-switch scenarios.

#### Scenario: Creating a team while offline

- **WHEN** the user attempts team creation without connectivity
- **THEN** the app surfaces failure and allows retry without losing current selection context
