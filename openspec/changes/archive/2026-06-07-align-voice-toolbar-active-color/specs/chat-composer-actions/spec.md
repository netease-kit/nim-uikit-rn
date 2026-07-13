## MODIFIED Requirements

### Requirement: Chat Composer Primary Actions

The chat composer SHALL expose only four primary toolbar actions below the input field: voice, emoji, image, and more.

#### Scenario: Viewing the normal composer toolbar

- **WHEN** the user is in a chat conversation and message selection mode is not active
- **THEN** the toolbar below the input shows `语音`, `表情`, `图片`, and `更多`
- **AND** it does not show separate `文件`, `视频`, `原图`, or `原视频` primary toolbar actions

#### Scenario: Voice toolbar action shows native active color

- **WHEN** the user switches the chat composer into voice input mode
- **THEN** the voice toolbar icon MUST use the native selected blue color `#337EFF`
- **AND** when voice input mode is inactive the voice toolbar icon MUST use the native unselected gray color `#656A72`
- **AND** other toolbar actions MUST keep their existing active and inactive tint behavior unless explicitly configured otherwise
