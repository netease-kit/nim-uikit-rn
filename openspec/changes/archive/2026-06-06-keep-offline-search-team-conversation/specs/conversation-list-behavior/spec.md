## MODIFIED Requirements

### Requirement: Conversation List Source Follows Active Conversation Mode

The conversation list SHALL use the active conversation mode's source of truth while preserving local fallback rows required by the current RN session.

#### Scenario: Local placeholder conversation remains visible with im-store bound

- **WHEN** RN has a local placeholder conversation that is not yet present in the bound im-store conversation source
- **THEN** the home conversation list MUST include that local placeholder conversation
- **AND** once the bound im-store source contains the same conversation id, the bound source MUST take priority
