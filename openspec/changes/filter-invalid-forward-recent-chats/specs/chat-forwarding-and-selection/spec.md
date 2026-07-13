## ADDED Requirements

### Requirement: Recent Chat Targets Exclude Invalid Conversations

The forwarding target selection page SHALL exclude invalid conversations from the recent-chat section before rendering the list.

#### Scenario: Invalid recent chat target

- **WHEN** the forwarding target selection page builds the recent-chat section
- **THEN** p2p conversations whose target is no longer a friend and is not the current user MUST be excluded
- **AND** team conversations whose target team is no longer available locally MUST be excluded
- **AND** excluded conversations MUST NOT appear as disabled rows in the recent-chat section
