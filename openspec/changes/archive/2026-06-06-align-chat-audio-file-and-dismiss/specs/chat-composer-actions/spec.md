## ADDED Requirements

### Requirement: Voice Composer Dismissal From Blank Area

The chat page SHALL dismiss the idle voice recording operation area when the user taps outside the composer module.

#### Scenario: Blank tap closes idle voice composer

- **GIVEN** the chat composer is in voice input mode
- **AND** voice recording is not currently active, starting, or stopping
- **WHEN** the user taps a blank area outside the composer module
- **THEN** RN MUST switch the composer back to text input mode
- **AND** RN MUST hide the voice recording operation area
- **AND** RN MUST dismiss the keyboard

#### Scenario: Blank tap does not interrupt active recording

- **GIVEN** a voice recording is active, starting, or stopping
- **WHEN** the user taps a blank area outside the composer module
- **THEN** RN MUST NOT force-close the voice recording operation area from that tap
