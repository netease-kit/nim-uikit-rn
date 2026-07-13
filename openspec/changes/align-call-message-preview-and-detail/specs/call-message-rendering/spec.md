## ADDED Requirements

### Requirement: Call message preview text must use the shared call-record label

RN conversation and forwarding previews MUST render call messages with the shared call-record label instead of audio-call or video-call specific preview text.

#### Scenario: Viewing a call message in the conversation list

- **WHEN** the last message of a conversation is a call message
- **THEN** the preview text shows `[话单消息]` in Chinese
- **AND** the preview text shows `[Call Message]` in English

#### Scenario: Building a forwarded summary for a call message

- **WHEN** the user forwards or references a call message
- **THEN** the generated preview text uses the same shared call-record label

### Requirement: Chat detail must render call messages as a dedicated call-record row

RN chat detail MUST render call messages as a dedicated inline row that matches the Web call-record behavior.

#### Scenario: Viewing a canceled call message in chat detail

- **WHEN** the user opens chat detail and a call message has canceled status
- **THEN** the message row shows the call icon and localized canceled status text

#### Scenario: Viewing a completed call message in chat detail

- **WHEN** the user opens chat detail and a call message contains a positive duration
- **THEN** the message row shows the call icon, localized status text, and formatted duration
