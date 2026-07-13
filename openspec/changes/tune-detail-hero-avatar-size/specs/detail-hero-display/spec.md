## ADDED Requirements

### Requirement: Shared Detail Hero Avatar Size

Detail headers SHALL use a shared `64` avatar size to keep stronger hierarchy than list rows while remaining consistent across detail pages.

#### Scenario: Detail header uses shared 64 avatar size

- **GIVEN** the user opens a detail page with a hero-style header
- **WHEN** the header avatar is rendered
- **THEN** the avatar MUST use the shared `64` size
- **AND** it MUST remain visually larger than a conversation-list row avatar
