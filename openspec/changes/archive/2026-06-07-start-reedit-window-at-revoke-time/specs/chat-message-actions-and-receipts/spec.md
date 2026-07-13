## MODIFIED Requirements

### Requirement: Recall And Local Delete Behavior

The chat module SHALL support recall and local delete behaviors with the test-defined time limits, re-edit flows, list-preview updates, offline outcomes, and cross-endpoint synchronization. The two-minute recalled-message re-edit window SHALL start from the message revoke time, not from the original message send time, and expired recalled messages SHALL NOT expose the re-edit action after the user stays on, leaves, or re-enters the chat page.

#### Scenario: Recalling a message

- **WHEN** the user recalls a recall-eligible message
- **THEN** the timeline, conversation preview, and any dependent reply or mark state update according to the tests

#### Scenario: Re-editing shortly after recall

- **GIVEN** the user sent a text message more than two minutes ago
- **AND** the user recalled that message less than two minutes ago
- **WHEN** the user taps `重新编辑`
- **THEN** the app MUST allow re-editing that recalled message
- **AND** the app MUST restore the recalled text into the composer

#### Scenario: Re-editing after the recall edit window expires

- **GIVEN** the user recalled a text message more than two minutes ago
- **WHEN** the user is viewing the recalled message in the chat page
- **THEN** the app MUST NOT show the `重新编辑` action for that recalled message
- **AND** the app MUST keep the action hidden after leaving and re-entering the chat page
