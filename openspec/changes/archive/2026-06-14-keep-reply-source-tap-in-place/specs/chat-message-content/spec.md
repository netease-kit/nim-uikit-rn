## ADDED Requirements

### Requirement: Reply Preview Tap Opens Source Message Detail

The chat module SHALL open a dedicated source-message detail page when the user taps the quoted source preview inside a reply message, without jumping or scrolling the chat timeline to the source-message position.

#### Scenario: Tapping text reply source preview

- **GIVEN** a reply message is visible in the chat timeline
- **AND** its quoted source message is an available text or emoji message
- **WHEN** the user taps the quoted source preview area
- **THEN** RN MUST open the source-message detail page
- **AND** RN MUST render only the quoted source message using the same message bubble style as chat detail
- **AND** RN MUST keep the source-message detail page message area padding consistent with chat detail
- **AND** RN MUST render the quoted source message on the left side regardless of whether it was sent by the current user
- **AND** if the quoted source message was sent by the current user, RN MUST display the sender name using priority group nickname, personal nickname, then account ID
- **AND** RN MUST show the full text-and-emoji source message content in that bubble
- **AND** RN MUST NOT jump or scroll the current chat timeline to the source-message position
- **AND** tapping the reply message content outside the quoted source preview MAY keep the existing message-content open behavior

#### Scenario: Tapping non-text reply source preview

- **GIVEN** a reply message is visible in the chat timeline
- **AND** its quoted source message is an available image, video, file, audio, location, merged-forward, custom, or other supported message type
- **WHEN** the user taps the quoted source preview area
- **THEN** RN MUST open the source-message detail page
- **AND** RN MUST render only the quoted source message using the same message bubble style as chat detail
- **AND** RN MUST keep the source-message detail page message area padding consistent with chat detail
- **AND** RN MUST render the quoted source message on the left side regardless of whether it was sent by the current user
- **AND** tapping the rendered source message bubble MAY open media preview, location detail, merged-forward detail, file download/open, or audio playback according to the existing chat-detail behavior for that message type
- **AND** RN MUST NOT jump or scroll the current chat timeline to the source-message position
- **AND** tapping the reply message content outside the quoted source preview MAY keep the existing message-content open behavior

#### Scenario: Tapping reply source preview starts download

- **GIVEN** the source-message detail page is showing a quoted source message
- **AND** the rendered source message requires a download before it can open
- **AND** the source message has not already been downloaded locally
- **WHEN** the user taps the rendered source message bubble for the first time
- **THEN** RN MUST show the toast text `正在下载`
- **AND** RN MUST start the existing download flow for that source message
- **AND** RN MUST NOT jump or scroll the current chat timeline to the source-message position
