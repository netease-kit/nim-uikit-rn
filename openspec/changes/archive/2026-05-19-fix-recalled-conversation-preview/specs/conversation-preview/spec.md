## ADDED Requirements

### Requirement: Recalled last message preview shows recalled copy

The conversation list SHALL show recalled copy instead of unknown-message fallback when the latest message in a conversation has been revoked.

#### Scenario: Latest conversation message is recalled

- **WHEN** the latest message preview payload is marked as revoked
- **THEN** the conversation subtitle MUST display `此消息已撤回`
- **AND** the subtitle MUST NOT fall back to `【未知消息体】`
