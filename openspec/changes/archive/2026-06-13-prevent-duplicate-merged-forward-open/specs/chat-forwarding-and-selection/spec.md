## MODIFIED Requirements

### Requirement: Merged Forward Detail Viewing

The chat module SHALL open merged-forward detail pages with the required title style, attachment previews, long-press behavior, offline fallback handling, duplicate-navigation prevention, and chat-detail-aligned message rendering.

#### Scenario: Rapid tapping a merged-forward message opens one detail page

- **GIVEN** a merged-forward message is visible in the chat detail timeline
- **WHEN** the user rapidly taps that merged-forward message multiple times before navigation completes
- **THEN** RN MUST push only one merged-forward detail page for that tap burst
- **AND** RN MUST NOT stack multiple identical merged-forward detail pages
