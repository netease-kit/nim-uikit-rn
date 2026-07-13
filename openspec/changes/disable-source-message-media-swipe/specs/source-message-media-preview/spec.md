## ADDED Requirements

### Requirement: Source message image preview is single-item

The system SHALL open image media from the source-message detail page as a single-item preview that does not include other images from the same conversation.

#### Scenario: Open image from source message detail

- **WHEN** the user opens an image message from the source-message detail page
- **THEN** the media viewer displays only that image
- **AND** horizontal swiping does not reveal other images from the conversation

#### Scenario: Open image from normal conversation context

- **WHEN** the user opens an image from a normal conversation media entry point
- **THEN** the media viewer preserves the existing conversation image sequence behavior
