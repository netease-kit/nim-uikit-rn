# Capability: Conversation Preview

## MODIFIED Requirements

### Requirement: Recalled last message preview shows recalled copy

The conversation list SHALL show recalled copy when the latest message in a conversation has been revoked.

#### Scenario: Latest conversation message is recalled

- **WHEN** the latest message in a conversation is recalled
- **THEN** the conversation subtitle MUST display `此消息已撤回`
- **AND** the subtitle MUST NOT fall back to `【未知消息体】`
- **AND** the subtitle MUST NOT fall back to an earlier visible message in that conversation
- **AND** the subtitle MUST NOT show a mention prefix for the recalled latest message
- **AND** the row ordering and time display MUST continue to use the recalled message timestamp
