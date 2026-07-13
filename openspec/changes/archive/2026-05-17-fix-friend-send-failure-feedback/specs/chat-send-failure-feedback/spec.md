## ADDED Requirements

### Requirement: Friend-Deleted Send Failure Prompt

The chat detail page SHALL show a single friend-deleted verification prompt when a p2p message send fails with `104404`.

#### Scenario: Failed outgoing message to a deleted or unsupported relation

- **WHEN** the app marks an outgoing p2p message as send-failed with error code `104404`
- **THEN** the timeline MUST append a single `好友关系已解除，如需沟通，请申请好友验证` tips prompt with verification entry
- **AND** the failed message bubble MUST NOT display a second inline prompt with the same meaning

### Requirement: AI Account Send Uses AI Config

The chat detail page SHALL use AI send configuration for direct conversations with AI accounts.

#### Scenario: Sending text to an AI account

- **WHEN** the user sends a text message in a direct conversation whose target account is an AI account
- **THEN** the send request MUST include `aiConfig.accountId` with that AI account
- **AND** the text send request MUST include `aiConfig.content`
- **AND** the client SHOULD include recent text context aligned with the existing Web implementation

#### Scenario: Sending non-text to an AI account

- **WHEN** the user sends a non-text message in a direct conversation whose target account is an AI account
- **THEN** the send request MUST still identify the AI account via `aiConfig.accountId`

## MODIFIED Requirements

### Requirement: Verification Entry Uses Stable Friend Card Feedback

The friend verification entry opened from chat send failure SHALL not crash while surfacing follow-up relation errors, and SHALL avoid exposing unsupported add-friend actions for AI accounts.

#### Scenario: Opening verification for a normal user

- **WHEN** the user opens the friend card from the failed-message verification entry for a non-friend normal account
- **THEN** the card MAY continue to show the standard add-friend action
- **AND** any mutation failure shown from that card MUST degrade to a safe string message instead of crashing on native error payload types

#### Scenario: Opening verification for an AI account

- **WHEN** the user opens the friend card from the failed-message verification entry for an AI account
- **THEN** the card MUST NOT expose the ordinary add-friend action
- **AND** the card MUST remain stable without attempting to route the user into the unsupported normal-friend application flow
