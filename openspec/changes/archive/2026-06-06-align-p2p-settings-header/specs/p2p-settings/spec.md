## ADDED Requirements

### Requirement: P2P Settings Header Presentation

The P2P chat settings page SHALL present the peer entry using the same member-grid visual language as chat settings surfaces.

#### Scenario: Render peer entry and add entry

- **WHEN** the user opens a P2P chat settings page
- **THEN** the peer avatar SHALL be shown as a standalone member item
- **AND** the peer nickname SHALL be shown below the avatar
- **AND** the peer avatar size SHALL match the add entry icon size
- **AND** the add entry SHALL use the same dashed circular plus icon style as the team chat settings member-add entry
- **AND** tapping the peer item SHALL keep opening the peer profile card
- **AND** tapping the add entry SHALL keep opening the conversation picker seeded with the current peer
