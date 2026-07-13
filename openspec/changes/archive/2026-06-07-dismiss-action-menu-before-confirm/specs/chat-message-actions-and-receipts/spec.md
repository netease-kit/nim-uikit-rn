## MODIFIED Requirements

### Requirement: Message Action Panel

The chat module SHALL expose the long-press or action-panel operations required by the tests, including copy, reply, resend, revoke, delete, and pin or mark behaviors, SHALL vary the visible actions by message type and state, and SHALL dismiss the action panel before showing a follow-up destructive confirmation dialog.

#### Scenario: Long-pressing a link inside a text message

- **GIVEN** the chat detail page renders a sent or received text message containing a webpage link
- **WHEN** the user long-presses the link text inside the message bubble
- **THEN** the app MUST show the existing message operation panel for that message
- **AND** it MUST NOT open the link in the browser from the long-press gesture

#### Scenario: Dismissing action panel before delete confirmation

- **GIVEN** the message operation panel is visible after the user long-presses a message
- **WHEN** the user taps Delete
- **THEN** RN MUST dismiss the message operation panel before showing the delete confirmation
- **AND** only the delete confirmation dialog remains visible

#### Scenario: Dismissing action panel before recall confirmation

- **GIVEN** the message operation panel is visible after the user long-presses a recall-eligible message
- **WHEN** the user taps Recall
- **THEN** RN MUST dismiss the message operation panel before showing the recall confirmation
- **AND** only the recall confirmation dialog remains visible
