## MODIFIED Requirements

### Requirement: Reply Preview Tap Opens Source Message Detail

The chat module SHALL open a dedicated source-message detail page when the user taps the quoted source preview inside a reply message, without jumping or scrolling the chat timeline to the source-message position.

#### Scenario: Source-message detail hides nested reply previews

- **GIVEN** the source-message detail page is showing a quoted source message
- **AND** that source message is itself a reply message with its own quoted-source preview
- **WHEN** RN renders the source-message detail bubble
- **THEN** RN MUST render only the resolved source message content on that page
- **AND** RN MUST NOT render the nested quoted-source preview block for that source message
- **AND** RN MAY keep existing message-content open behavior for the rendered source message content itself
