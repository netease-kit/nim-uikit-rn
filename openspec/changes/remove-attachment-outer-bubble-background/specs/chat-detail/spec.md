## MODIFIED Requirements

### Requirement: Attachment-like messages do not render an extra outer bubble frame

Merged-forward, location, image, video, audio, and file messages MUST not render an additional outer chat-bubble background around their own content card.

#### Scenario: Attachment-like message is rendered

- **WHEN** the chat page renders a merged-forward, location, image, video, audio, or file message
- **THEN** the message does not show an extra outer bubble background frame
- **AND** the message keeps its own content card styling and layout

#### Scenario: Attachment-like message uses a unified card border

- **WHEN** the chat page renders a merged-forward, location, image, video, or file message
- **THEN** its own content card shows a `1px` solid border
- **AND** the border color is `#E2E5E8`

#### Scenario: Pinned attachment-like message does not add another outline

- **WHEN** a merged-forward, location, image, video, audio, or file message is in the pinned state
- **THEN** it does not render an extra pinned outline around the content card
- **AND** non-audio messages keep the normal `1px` `#E2E5E8` card border
- **AND** audio messages keep their original bubble background color without an added border
