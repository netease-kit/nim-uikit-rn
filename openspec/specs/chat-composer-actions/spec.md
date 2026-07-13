# chat-composer-actions Specification

## Purpose

TBD - created by archiving change align-chat-composer-actions. Update Purpose after archive.

## Requirements

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

### Requirement: Chat Composer Media Picker Action

The image toolbar action SHALL take the user directly into the system photo-permission or
photo-picker flow required by the tests, while preserving the existing chat image/video send path.

#### Scenario: Choosing media from the image action

- **WHEN** the user taps the `图片` toolbar action before photo-library permission has been granted
- **THEN** the app MUST let the system permission flow appear directly instead of showing an app-defined media-choice dialog first
- **AND** once permission is granted it MUST open the system media picker for image and video assets from the same flow
- **AND** selected images are sent as image messages and selected videos are sent as video messages

#### Scenario: Re-entering the image action after permission is granted

- **WHEN** the user taps the `图片` toolbar action after photo-library permission has already been granted
- **THEN** the app MUST open the system media picker directly

#### Scenario: Re-entering the image action with limited photo access

- **WHEN** the user previously granted limited photo-library access
- **AND** the user taps the `图片` toolbar action again from chat detail
- **THEN** RN MUST open the existing authorized-media picker directly
- **AND** RN MUST NOT show an app-defined intermediate alert before entering that picker

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

#### Scenario: Oversized files from composer entries are rejected before upload

- **WHEN** the user uses the chat `图片`, `拍摄`, or `文件` entry to send an image, video, or file
- **AND** the resolved local file size is greater than 200M
- **THEN** the app MUST show the native-aligned file size limit toast
- **AND** the app MUST keep the oversized asset out of the SDK upload flow

### Requirement: Disabled composer visuals stay aligned with composer interaction state

The chat composer SHALL keep its visual state aligned with its interaction state.

#### Scenario: Composer becomes non-editable

- **WHEN** the composer is disabled by runtime chat state such as a team mute restriction
- **THEN** the composer MUST present a disabled-looking input surface instead of the normal editable visual

### Requirement: Chat Composer Stays Focused After Successful Text Send

The chat composer SHALL keep the text input focused after a successful text or reply send when the user was already typing in the composer.

#### Scenario: Sending text from focused composer

- **WHEN** the user is in a chat conversation with the text composer focused
- **AND** the user sends a non-empty text message or text reply successfully
- **THEN** the composer SHALL clear the sent draft
- **AND** the text input SHALL remain focused so the keyboard stays visible

#### Scenario: Sending is blocked or fails

- **WHEN** a text send is blocked by an empty draft, team mute, duplicate-send guard, or send failure
- **THEN** the composer SHALL preserve the existing feedback and focus behavior for that blocked or failed send path

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

### Requirement: Emoji Composer

The chat composer SHALL allow users to insert emoji from the emoji panel and SHALL render the sent emoji consistently in the message timeline.

#### Scenario: Emoji panel item renders consistently after send

- **GIVEN** the chat detail page shows the emoji panel
- **WHEN** the user taps any emoji item, including the fourth row fifth column item
- **AND** sends the message
- **THEN** the message timeline MUST render the same emoji image as the emoji item shown in the composer panel
- **AND** distinct emoji items MUST NOT share a localized token key that causes one mapping to overwrite another

### Requirement: Camera Video Recording Uses File Size Limit Only

The chat composer camera video action SHALL allow users to record video without an app-defined recording duration limit, and SHALL only block sending when the resulting video exceeds the configured file size limit.

#### Scenario: Recording longer than one minute

- **WHEN** the user opens the chat composer camera video action and records for longer than 60 seconds
- **THEN** RN MUST NOT automatically stop recording because of a 60 second or 120 second app-defined duration limit
- **AND** RN MUST preserve the recorded video's duration as message metadata after recording completes

#### Scenario: Sending recorded video within size limit

- **WHEN** the user completes a recorded video whose file size is within the 200MB send limit
- **THEN** RN MUST continue into the normal video-message send flow
- **AND** RN MUST NOT reject the video because of its duration

#### Scenario: Sending recorded video over size limit

- **WHEN** the user completes a recorded video whose file size is greater than the 200MB send limit
- **THEN** RN MUST block sending before upload
- **AND** RN MUST show the native-aligned file size limit toast

### Requirement: Chat media permission prompts must be user initiated

The iOS chat detail screen MUST NOT trigger the system photo-library permission prompt merely by entering the conversation.

#### Scenario: First opening chat detail without touching media actions

- **GIVEN** the user has not granted photo-library access yet
- **WHEN** the user opens a chat detail screen for the first time
- **THEN** the screen must render without showing the system photo-library permission dialog

#### Scenario: First tapping the image or video composer action

- **GIVEN** the user has not granted photo-library access yet
- **WHEN** the user taps the composer image/video action for the first time
- **THEN** the chat detail screen may request photo-library permission at that moment

#### Scenario: First choosing album from the file source sheet

- **GIVEN** the user has not granted photo-library access yet
- **WHEN** the user opens the file source sheet and taps the album option for the first time
- **THEN** the chat detail screen may request photo-library permission at that moment

#### Scenario: Limited library refresh listener only while picker is visible

- **GIVEN** the user has granted limited photo-library access on iOS
- **WHEN** the limited media picker is not currently visible
- **THEN** chat detail must not keep a photo-library change listener active solely because the page is mounted

### Requirement: Reply mention insertion must preserve existing draft order

When a team-chat composer already contains text, starting a reply from a member message MUST append the generated mention after the existing draft content instead of prepending it.

#### Scenario: Reply from a member after typing draft text

- **GIVEN** the conversation is a team chat
- **AND** the composer already contains user-entered text
- **WHEN** the user long-presses a member message and chooses reply
- **THEN** the generated `@member` mention must be inserted after the existing composer text
- **AND** the existing composer text order must remain unchanged

#### Scenario: Reply mention spacing after existing draft text

- **GIVEN** the conversation is a team chat
- **AND** the composer already contains user-entered text without trailing whitespace
- **WHEN** the user starts a reply from a member message
- **THEN** the composer must insert exactly one separator space before the generated `@member` mention
