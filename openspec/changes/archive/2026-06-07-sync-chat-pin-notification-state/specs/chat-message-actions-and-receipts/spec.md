## MODIFIED Requirements

### Requirement: Message Action Panel

The chat module SHALL expose the long-press or action-panel operations required by the tests, including copy, reply, resend, revoke, delete, and pin or mark behaviors, SHALL vary the visible actions by message type and state, SHALL dismiss the action panel before showing a follow-up destructive confirmation dialog, and SHALL synchronize pin state changes from other users in real time.

#### Scenario: Remote user pins a visible message

- **GIVEN** user A and user B are both viewing the same chat detail conversation
- **WHEN** user A pins a message
- **THEN** user B's visible message row MUST update to the pinned visual state without leaving and re-entering the chat
- **AND** the pinned hint MUST show the pin operator according to the existing display rules

#### Scenario: Remote user unpins a visible message

- **GIVEN** user A and user B are both viewing the same chat detail conversation
- **AND** a message is currently shown as pinned
- **WHEN** user A unpins that message
- **THEN** user B's visible message row MUST remove the pinned visual state without leaving and re-entering the chat
