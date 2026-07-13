## MODIFIED Requirements

### Requirement: Conversation Row Actions

The app SHALL expose one platform-appropriate conversation row action entry per platform while preserving row tap navigation.

#### Scenario: Android conversation rows use swipe actions

- **GIVEN** the conversation list runs on Android
- **WHEN** the user left-swipes a conversation row and taps the pin or unpin action
- **THEN** RN MUST call the active conversation stick-top path for that conversation
- **AND** the row MUST update its stick-top state and ordering after the operation succeeds
- **AND** RN MUST NOT open the conversation action sheet from a row long press
- **AND** tapping a closed row MUST continue to enter the chat
