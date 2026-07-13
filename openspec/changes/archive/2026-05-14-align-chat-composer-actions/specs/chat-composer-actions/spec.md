## ADDED Requirements

### Requirement: Chat Composer Primary Actions

The chat composer SHALL expose only four primary toolbar actions below the input field: voice, emoji, image, and more.

#### Scenario: Viewing the normal composer toolbar

- **WHEN** the user is in a chat conversation and message selection mode is not active
- **THEN** the toolbar below the input shows `语音`, `表情`, `图片`, and `更多`
- **AND** it does not show separate `文件`, `视频`, `原图`, or `原视频` primary toolbar actions

### Requirement: Chat Composer Media Picker Action

The image toolbar action SHALL let the user choose between normal image/video selection and original image/video selection before opening the system media picker.

#### Scenario: Choosing media from the image action

- **WHEN** the user taps the `图片` toolbar action
- **THEN** the app shows a choice between selecting `图片/视频` and selecting `原图/原视频`
- **AND** either choice opens the media picker for image and video assets
- **AND** selected images are sent as image messages and selected videos are sent as video messages using the selected original/normal quality mode

### Requirement: Chat Composer More Panel

The more toolbar action SHALL open an extension panel containing only shooting, location, and file actions.

#### Scenario: Opening the more panel

- **WHEN** the user taps the `更多` toolbar action
- **THEN** the extension panel shows `拍摄`, `位置`, and `文件`
- **AND** it does not show gallery, video, original image, or original video actions

#### Scenario: Using more panel actions

- **WHEN** the user taps `拍摄`
- **THEN** the app offers the existing `拍照` and `摄像` choices
- **WHEN** the user taps `位置` or `文件`
- **THEN** the app follows the existing location or file behavior and feedback path
