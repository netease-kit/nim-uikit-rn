## MODIFIED Requirements

### Requirement: File messages use differentiated type icons

RN file messages MUST display different file icons by file type, aligned with the Android implementation's icon categorization.

#### Scenario: Known office and media file types render dedicated icons

- **WHEN** the chat page renders a file message with a recognized extension such as Word, Excel, PPT, image, archive, audio, or video
- **THEN** the file message shows the corresponding dedicated file icon
- **AND** the icon resource is reused from the existing repository assets

#### Scenario: Unknown file types render fallback icon

- **WHEN** the chat page renders a file message whose extension is missing or not in the supported mapping
- **THEN** the file message shows the unknown file icon

#### Scenario: File type icon does not depend on localized text

- **WHEN** the app language changes between Chinese and English
- **THEN** the file message icon remains correct for the file type
- **AND** it does not rely on a text badge to identify the type
