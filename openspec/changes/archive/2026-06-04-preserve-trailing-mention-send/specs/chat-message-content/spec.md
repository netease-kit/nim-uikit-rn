## MODIFIED Requirements

### Requirement: Team Mention Messages

The chat module SHALL support Android-compatible team mention composition, metadata, deletion, sending, receiving, and re-editing for text messages.

#### Scenario: Sending and receiving mention text

- **WHEN** the user sends a text message that contains one or more intact tracked mentions
- **THEN** the message MUST include Android-compatible `serverExtension.yxAitMsg` metadata for each mentioned account and range
- **AND** sent and received mention text MUST render as highlighted mention content in the chat bubble

#### Scenario: Sending mention-only text

- **WHEN** the user sends a team or discussion text message whose visible content is only an intact tracked mention such as `@xxx` or `@所有人`
- **THEN** the outgoing message MUST still include Android-compatible `serverExtension.yxAitMsg` metadata for that mention
- **AND** the mentioned account or all-members mention MUST receive the same mention response as when additional text follows the mention
