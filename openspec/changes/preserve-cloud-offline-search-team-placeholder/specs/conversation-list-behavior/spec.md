## MODIFIED Requirements

### Requirement: Conversation List Source Follows Active Conversation Mode

The conversation list SHALL use the active conversation mode's source of truth while preserving local fallback rows required by the current RN session. In cloud conversation mode, a valid local fallback row MAY be displayed only while the corresponding cloud conversation is missing.

#### Scenario: Deleted local placeholder does not reappear

- **WHEN** the user deletes a conversation from the home conversation list
- **THEN** RN MUST remove both the active SDK conversation source and the RN local placeholder for that conversation
- **AND** the deleted conversation MUST NOT reappear solely because local placeholders are merged into the home source

#### Scenario: Startup does not flash empty stale placeholders

- **WHEN** the app starts and the bound SDK conversation source is still refreshing
- **THEN** RN MUST NOT show local placeholder conversations that have no local message preview
- **AND** locally hidden or invalid-pruned conversations MUST stay hidden during startup and refresh

#### Scenario: Cloud-mode offline search placeholder remains visible until cloud row exists

- **WHEN** cloud conversation mode is enabled
- **AND** a valid team conversation was opened from offline search with cached team metadata
- **AND** the cloud conversation list does not yet contain that conversation
- **THEN** RN MUST include the local fallback row in the home conversation list
- **AND** the row title MUST use the cached team name instead of the raw team id
- **AND** the row MUST NOT be treated as pinned unless a real cloud conversation reports it as pinned

#### Scenario: Cloud-mode fallback row remains unpinned until cloud pin succeeds

- **WHEN** cloud conversation mode is enabled
- **AND** a local fallback row is displayed because the cloud conversation list does not yet contain that conversation
- **THEN** RN MUST render the fallback row as not pinned
- **AND** RN MUST NOT place the fallback row in the pinned section

#### Scenario: List pin creates the cloud conversation before pinning

- **WHEN** cloud conversation mode is enabled
- **AND** the user returned directly to the conversation list after opening a searched team offline and sending a local message
- **AND** the user taps the row pin action for that conversation after reconnecting
- **THEN** RN MUST attempt to create or materialize the cloud conversation
- **AND** RN MUST call the cloud conversation pin mutation only after that create/materialize attempt succeeds
- **AND** a resource-already-exists result from cloud conversation creation MUST be treated as success

#### Scenario: Cloud refresh does not delete valid offline-search fallback

- **WHEN** cloud conversation mode refreshes the cloud conversation list
- **AND** a valid local fallback row exists for a team conversation opened from offline search
- **AND** the cloud refresh does not return that conversation
- **THEN** RN MUST keep the local fallback row available for chat navigation and failed-message retry
- **AND** RN MUST NOT remove the fallback solely because the cloud conversation does not exist yet
