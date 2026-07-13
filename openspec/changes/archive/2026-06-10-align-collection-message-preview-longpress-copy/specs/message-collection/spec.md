# message-collection Change Spec

## MODIFIED Requirements

### Requirement: Collection Text Message Preview Line Limit

The collection page SHALL limit collected text-message previews in collection cards without limiting the opened message-detail page, and the opened collection text-message detail page SHALL present only the full text-and-emoji content itself with tooltip-style copy support.

#### Scenario: Collected text message is opened from collection

- **GIVEN** a collected text message is shown in My > Collection
- **WHEN** the user taps the collection card to open message detail
- **THEN** the opened page SHALL show the full message content without the collection-card three-line ellipsis constraint
- **AND** the opened page SHALL present the text-and-emoji content directly instead of wrapping it in a message bubble or separate copy-button card layout
- **AND** the opened page SHALL NOT show the message timestamp above the content

#### Scenario: Long-pressing a collected text message in message detail

- **GIVEN** the user opens a collected text message from My > Collection
- **WHEN** the user long-presses the message content
- **THEN** the page MUST expose a tooltip-style floating copy action above the message content with a downward arrow
- **AND** choosing copy MUST copy the text content and show the existing copy feedback
