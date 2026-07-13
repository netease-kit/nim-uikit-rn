## MODIFIED Requirements

### Requirement: Text And Emoji Messages

The chat module SHALL correctly send and render plain text, mixed-language text, special-character text, blank-space text, emoji-only, and emoji-plus-text messages covered by the tests.

#### Scenario: Emoji followed by long text wraps inline

- **GIVEN** the chat detail page renders a text message that starts with or contains an emoji followed by text
- **AND** the combined emoji plus text content exceeds one visual line
- **WHEN** the message bubble lays out the content
- **THEN** the text after the emoji MUST continue from the remaining width on the emoji line when space is available
- **AND** only the overflow portion MUST wrap to the next line
- **AND** RN MUST NOT move the entire following text segment to the next line as a block
- **AND** emoji and adjacent text MUST use a consistent vertical alignment on the first and wrapped lines
