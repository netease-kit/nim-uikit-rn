## MODIFIED Requirements

### Requirement: Collection List Entry And Empty State

The app SHALL provide a collection page reachable from My, and that page SHALL render collected message entries with message content presentation aligned to the chat detail message bubble whenever the source message can be resolved.

#### Scenario: Opening the collection page with resolvable messages

- **WHEN** the user opens the collection page and a collected source message can be resolved from its stored message reference
- **THEN** the collection row renders the message content using the same chat message bubble presentation as the conversation detail page
- **AND** text, rich emoji, image, video, audio, file, location, merged-forward, notification, and tips messages follow the same visual treatment as chat detail for their supported content
- **AND** the collection row still shows collection-specific source and action controls outside the message bubble

#### Scenario: Opening the collection page when source message lookup is unavailable

- **WHEN** the collection page cannot resolve the original source message for a collection item
- **THEN** the collection row falls back to the stored collection preview and type helper
- **AND** the page remains usable for retry, remove, and forward failure handling without showing a blank row

#### Scenario: Collection bubble excludes chat-only interactions

- **WHEN** a collected message is rendered inside the collection page
- **THEN** read receipts, resend affordances, multi-select controls, and revoke re-edit actions are not shown from that passive collection row
- **AND** tapping supported message content still follows the existing collection message open behavior
