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

The p2p setting page SHALL support reminder and stick-top toggles with repeated-tap, offline-failure, reconnect-consistency, and conversation-list synchronization behavior, and it MUST NOT duplicate blacklist controls that belong to the friend card flow. When the user is offline and changes either toggle from the single-chat settings page, the app SHALL block the mutation and show the common offline prompt `当前网络异常，请检查你的网络设置` instead of surfacing raw SDK errors such as `illegal state`.

#### Scenario: Toggling p2p reminder or stick-top

- **WHEN** the user changes reminder or stick-top state while the network is available
- **THEN** the final visible state matches the latest successful result

#### Scenario: Offline toggle shows common network prompt

- **WHEN** the user changes the reminder or stick-top toggle while the device is offline
- **THEN** the app does not apply the requested toggle mutation
- **AND** the app shows `当前网络异常，请检查你的网络设置`
- **AND** the app does not surface raw SDK text such as `illegal state`

#### Scenario: P2P settings hide blacklist controls

- **WHEN** the user opens the single-chat setting page
- **THEN** the page must show reminder and stick-top controls for the current conversation
- **AND** it must not show the blacklist switch

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
