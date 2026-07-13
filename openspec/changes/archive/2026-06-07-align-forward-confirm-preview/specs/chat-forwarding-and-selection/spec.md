## MODIFIED Requirements

### Requirement: Forwarding Modes And Limits

The chat module SHALL support single-message forwarding, serial forwarding, and merged forwarding with the confirmation dialogs, message-count limits, ordering rules, and nested-merge limits required by the tests. The forwarding confirmation dialog SHALL render one selected target as avatar plus one-line target name after the avatar, SHALL render multiple selected targets as avatars only, SHALL show at most six target avatars with no seventh overflow item, and SHALL keep the conversation-record preview on one line by truncating only the source conversation title while preserving the fixed record suffix.

#### Scenario: Forwarding selected messages

- **WHEN** the user chooses a supported forwarding mode for valid messages
- **THEN** the app applies the correct limit checks, confirmation copy, and output ordering for that forwarding mode

#### Scenario: Rendering multi-select forwarding actions

- **WHEN** the user enters chat message multi-select mode
- **THEN** the bottom action bar MUST show distinct native-aligned icons for merged forwarding, serial forwarding, and deletion
- **AND** merged forwarding and serial forwarding MUST NOT share the same generic forwarding icon
- **AND** selecting one or more messages MUST NOT tint those bottom action icons blue

#### Scenario: Selecting marked messages in multi-select mode

- **GIVEN** a visible chat message is marked
- **WHEN** the user enters chat message multi-select mode
- **THEN** the marked message MUST show the same selection checkbox as unmarked selectable messages
- **AND** the marked-message background MUST NOT cover or hide the selection checkbox

#### Scenario: Rendering unselected message checkboxes

- **WHEN** the user enters chat message multi-select mode
- **THEN** unselected selectable messages MUST keep the existing RN checkbox size
- **AND** the unchecked checkbox MUST NOT show an inner shadow or elevation artifact on Android

#### Scenario: Rendering forwarding confirmation target preview

- **GIVEN** the user has selected one forwarding target
- **WHEN** the forwarding confirmation dialog appears
- **THEN** the dialog MUST show the target avatar followed by the target name on the same line
- **AND** the target name MUST stay on one line and truncate with an ellipsis if it does not fit

#### Scenario: Rendering forwarding confirmation multiple targets

- **GIVEN** the user has selected multiple forwarding targets
- **WHEN** the forwarding confirmation dialog appears
- **THEN** the dialog MUST show target avatars only
- **AND** the dialog MUST show no more than six avatars
- **AND** the seventh selected target MUST NOT be shown as an avatar or overflow marker

#### Scenario: Rendering forwarding confirmation record preview

- **WHEN** the forwarding confirmation dialog shows conversation-record preview text
- **THEN** the preview MUST stay on one line
- **AND** an overlong source title MUST truncate with an ellipsis
- **AND** the fixed record suffix such as `的会话记录` MUST remain fully visible
