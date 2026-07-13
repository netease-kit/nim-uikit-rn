## MODIFIED Requirements

### Requirement: Recall And Local Delete Behavior

The chat module SHALL support recall and local delete behaviors with the test-defined time limits, re-edit flows, list-preview updates, offline outcomes, and cross-endpoint synchronization. The two-minute recalled-message re-edit window SHALL start from the message revoke time, not from the original message send time, and expired recalled messages SHALL NOT expose the re-edit action after the user stays on, leaves, re-enters, or restarts the chat page. Recalled-message notices SHALL be recovered from persisted message extension data after offline synchronization, history loading, and process restart so both current-user and peer recalls remain visible.

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

#### Scenario: Showing recall notices after offline synchronization

- **GIVEN** another user recalls a message while the current user is offline
- **WHEN** the current user logs in and opens the affected chat page
- **THEN** the recalled message notice MUST be shown in the chat timeline

#### Scenario: Showing recall notices and re-edit after process restart

- **GIVEN** the chat timeline contains recalled messages from the current user and from another user
- **WHEN** the app process is killed and the user reopens the chat page
- **THEN** all recalled-message notices MUST still be shown
- **AND** current-user recalled text messages MUST show `重新编辑` only while the persisted revoke time is still within the edit window
