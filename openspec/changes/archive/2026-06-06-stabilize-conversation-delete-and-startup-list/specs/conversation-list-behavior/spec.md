## MODIFIED Requirements

### Requirement: Conversation List Source Follows Active Conversation Mode

The conversation list SHALL use the active conversation mode's source of truth while preserving local fallback rows required by the current RN session.

#### Scenario: Deleted local placeholder does not reappear

- **WHEN** the user deletes a conversation from the home conversation list
- **THEN** RN MUST remove both the active SDK conversation source and the RN local placeholder for that conversation
- **AND** the deleted conversation MUST NOT reappear solely because local placeholders are merged into the home source

#### Scenario: Startup does not flash empty stale placeholders

- **WHEN** the app starts and the bound SDK conversation source is still refreshing
- **THEN** RN MUST NOT show local placeholder conversations that have no local message preview
- **AND** locally hidden or invalid-pruned conversations MUST stay hidden during startup and refresh
