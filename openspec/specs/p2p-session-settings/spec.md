# p2p-session-settings Specification

## Purpose
TBD - created by archiving change port-im-kit-react-ui-h5. Update Purpose after archive.
## Requirements
### Requirement: P2P Setting Page Layout

The app SHALL provide the single-chat setting page with the UI sections and entry points referenced by the tests, including avatar-and-name session metadata, invite-to-group plus affordance, mark, history-record, and more-action areas.

#### Scenario: Opening p2p settings

- **WHEN** the user opens the single-chat setting page
- **THEN** the page shows session metadata, reminders, stick-top, invite-to-group, mark, and history entry points

### Requirement: P2P Reminder And Stick-Top Toggles

The p2p setting page SHALL support reminder and stick-top toggles with repeated-tap, offline-failure, reconnect-consistency, and conversation-list synchronization behavior.

#### Scenario: Toggling p2p reminder or stick-top

- **WHEN** the user changes reminder or stick-top state
- **THEN** the final visible state matches the latest successful result

### Requirement: P2P Group-Invite Entry

The single-chat setting page SHALL route into the team-creation invite flow for friends and digital-human accounts where the tests require creating a discussion group or advanced team from p2p chat.

#### Scenario: Creating a team from p2p settings

- **WHEN** the user starts team creation from the p2p setting page
- **THEN** the app opens the supported picker and preserves the current conversation context

### Requirement: P2P More Actions

The single-chat setting page SHALL expose the supported more-actions surface and keep its actions consistent when relationship state or connectivity changes.

#### Scenario: Opening p2p more actions

- **WHEN** the user opens the more-actions entry from p2p settings
- **THEN** the page or sheet shows the expected action set for the current relationship state

### Requirement: P2P History Entry

The single-chat setting page SHALL route into the conversation-history page for the current p2p session.

#### Scenario: Opening p2p history

- **WHEN** the user taps the history entry from single-chat settings
- **THEN** the app opens the history-record page for the current conversation

