## ADDED Requirements

### Requirement: Team Creation From Conversation Flows

The app SHALL allow users to create advanced teams or discussion-group-equivalent flows from conversation-related entry points and route directly into the created conversation.

#### Scenario: Creating a team from the picker

- **WHEN** the user confirms a valid invitee set for team creation
- **THEN** the app creates the team and opens the resulting chat page

#### Scenario: Creating from single-chat settings

- **WHEN** the user enters the picker from a p2p settings page
- **THEN** the picker excludes self, the current p2p target, and blacklisted contacts from manual selection while still auto-including the current p2p target in the created team

### Requirement: Team Type And Initial Chat Presentation

The creation flow SHALL preserve whether the user is creating a discussion-style group or advanced team and SHALL render the resulting chat page with the expected system notification row and initial metadata.

#### Scenario: Opening a newly created team chat

- **WHEN** creation succeeds for a supported team type
- **THEN** the resulting chat page shows the expected title and creation notification content

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
