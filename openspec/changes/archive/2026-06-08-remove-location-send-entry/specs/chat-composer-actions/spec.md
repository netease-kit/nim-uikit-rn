## MODIFIED Requirements

### Requirement: Chat Composer More Panel

The more toolbar action SHALL open an extension panel containing only shooting and file actions.

#### Scenario: Opening the more panel

- **WHEN** the user taps the `更多` toolbar action
- **THEN** the extension panel shows `拍摄` and `文件`
- **AND** it does not show gallery, video, original image, original video, or location actions

#### Scenario: Using more panel actions

- **WHEN** the user taps `拍摄`
- **THEN** the app offers the existing `拍照` and `摄像` choices
- **WHEN** the user taps `文件`
- **THEN** the app follows the existing file behavior and feedback path
