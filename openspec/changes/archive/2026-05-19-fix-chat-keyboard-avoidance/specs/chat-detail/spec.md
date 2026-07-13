## ADDED Requirements

### Requirement: Chat Detail Keyboard Avoidance On Android

The chat detail screen SHALL keep the composer fully visible when the Android software keyboard is shown.

#### Scenario: Focusing the chat composer on Android

- **WHEN** the user focuses the chat input on Android
- **THEN** the software keyboard MUST NOT cover the lower half of the composer
- **AND** the screen MUST avoid applying a second page-level keyboard height adjustment on top of Android system `resize`

### Requirement: Chat Detail Keyboard Avoidance On iOS

The chat detail screen SHALL continue to avoid the keyboard using the page-level offset required by the navigation header on iOS.

#### Scenario: Focusing the chat composer on iOS

- **WHEN** the user focuses the chat input on iOS
- **THEN** the composer MUST continue to move above the keyboard using the current header-aware page offset
