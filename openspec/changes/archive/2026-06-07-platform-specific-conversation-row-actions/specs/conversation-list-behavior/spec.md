## MODIFIED Requirements

### Requirement: Conversation Row Actions

The app SHALL expose one platform-appropriate conversation row action entry per platform while preserving row tap navigation.

#### Scenario: Android conversation rows use swipe actions

- **GIVEN** the conversation list runs on Android
- **WHEN** the user operates a conversation row
- **THEN** RN MUST expose pin and delete actions through the existing left-swipe row action surface
- **AND** RN MUST NOT open the conversation action sheet from a row long press
- **AND** tapping a closed row MUST continue to enter the chat

#### Scenario: iOS conversation rows use long-press actions

- **GIVEN** the conversation list runs on iOS
- **WHEN** the user operates a conversation row
- **THEN** RN MUST expose pin and delete actions through long press
- **AND** RN MUST NOT register the swipe action gesture or reveal swipe action buttons for that row
- **AND** tapping the row MUST continue to enter the chat
