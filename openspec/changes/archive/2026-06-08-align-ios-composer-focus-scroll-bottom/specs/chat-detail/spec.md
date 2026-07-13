## ADDED Requirements

### Requirement: Composer Focus Scrolls To Latest Messages

The system SHALL scroll the chat message list to the latest messages when the user focuses the text composer while browsing historical messages. This behavior SHALL apply on iOS and Android.

#### Scenario: iOS composer focus while browsing history

- **WHEN** an iOS user is viewing historical messages and taps the chat text composer
- **THEN** the keyboard opens and the message list scrolls to the latest messages

#### Scenario: Incoming messages while browsing history

- **WHEN** the user is viewing historical messages and receives a new message without focusing the composer
- **THEN** the message list remains at the current historical position and shows the new message reminder
