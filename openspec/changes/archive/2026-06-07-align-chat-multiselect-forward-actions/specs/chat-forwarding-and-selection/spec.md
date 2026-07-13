## MODIFIED Requirements

### Requirement: Forwarding Modes And Limits

The chat module SHALL support single-message forwarding, serial forwarding, and merged forwarding with the confirmation dialogs, message-count limits, ordering rules, and nested-merge limits required by the tests.

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
