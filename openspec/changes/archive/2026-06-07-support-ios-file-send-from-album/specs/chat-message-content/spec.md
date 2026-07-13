## ADDED Requirements

### Requirement: iOS File Action Album Source

The chat file action SHALL allow iOS users to send both Files/iCloud content and photo-library content as file messages.

#### Scenario: iOS file action offers album and Files sources

- **GIVEN** the chat detail page runs on iOS
- **WHEN** the user taps the composer file action
- **THEN** RN MUST offer a choice between album content and Files/iCloud content
- **AND** choosing Files/iCloud MUST keep the existing document picker based file send flow

#### Scenario: iOS album content from file action sends as file messages

- **GIVEN** the chat detail page runs on iOS
- **WHEN** the user chooses album from the composer file action and selects photo-library photo or video assets
- **THEN** RN MUST send each selected asset with the file-message send path
- **AND** RN MUST NOT send those assets through the image-message or video-message send path
- **AND** RN MUST continue to enforce the existing file size limit for each selected asset

#### Scenario: Android file action remains document picker only

- **GIVEN** the chat detail page runs on Android
- **WHEN** the user taps the composer file action
- **THEN** RN MUST keep the existing document picker based file send flow
- **AND** RN MUST NOT add an album source chooser to the Android file action
