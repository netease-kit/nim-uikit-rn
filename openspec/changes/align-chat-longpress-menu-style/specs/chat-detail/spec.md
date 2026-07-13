## ADDED Requirements

### Requirement: Chat Detail Long Press Menu Must Match Floating Card Pattern

The chat detail screen SHALL display the message long press menu as a floating card anchored to the pressed message instead of a centered action sheet.

#### Scenario: Long pressing an inbound message

- **WHEN** the user long presses an inbound message bubble
- **THEN** the action menu MUST appear near that message
- **AND** the preview bubble MUST remain visually associated with the pressed message
- **AND** the menu MUST keep the action ordering and icon-based layout defined by the RN chat detail design reference

#### Scenario: Long pressing an outbound message near the screen edge

- **WHEN** the user long presses an outbound message close to the right edge or bottom area
- **THEN** the action menu MUST stay within the visible viewport
- **AND** the menu MUST align toward the pressed message side without overflowing the screen

#### Scenario: Selecting any message action

- **GIVEN** the message long press menu is visible
- **WHEN** the user taps any menu action
- **THEN** the menu MUST be hidden before the action continues
- **AND** any follow-up toast, confirmation dialog, composer focus, navigation, or network failure feedback MUST NOT be covered by the menu
