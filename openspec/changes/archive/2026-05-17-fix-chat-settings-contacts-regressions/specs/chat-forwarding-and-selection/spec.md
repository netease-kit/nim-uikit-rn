## MODIFIED Requirements

### Requirement: Merged Forward Detail Viewing

The chat module SHALL open merged-forward detail pages with the required title style, attachment previews, long-press behavior, offline fallback handling, and chat-detail-aligned message rendering.

#### Scenario: Opening a merged forward detail page

- **WHEN** the user taps a merged-forward message
- **THEN** the detail page renders the expected message list and detail interactions without corrupting nested content
- **AND** each record uses the same RN UIKit message bubble styling as the chat detail timeline for the corresponding message type
- **AND** the detail page MUST NOT show a message composer or any send affordance
