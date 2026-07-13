## ADDED Requirements

### Requirement: Team Mention Messages

The chat module SHALL support Android-compatible team mention composition, metadata, deletion, sending, receiving, and re-editing for text messages.

#### Scenario: Typing at sign opens member selector

- **WHEN** the user types `@` in a team chat composer
- **THEN** the app MUST open a member selector containing the current team members
- **AND** selecting a member MUST replace the typed `@` with `@<display name> `
- **AND** the inserted mention MUST be tracked with the selected member account and text range

#### Scenario: Long pressing another member avatar inserts mention

- **WHEN** the user long-presses another member avatar in a team chat timeline
- **THEN** the app MUST insert `@<display name> ` into the composer for that sender
- **AND** the inserted mention MUST be tracked with the sender account and text range
- **AND** long-pressing the current user's own avatar MUST NOT insert a mention

#### Scenario: Sending and receiving mention text

- **WHEN** the user sends a text message that contains one or more intact tracked mentions
- **THEN** the message MUST include Android-compatible `serverExtension.yxAitMsg` metadata for each mentioned account and range
- **AND** sent and received mention text MUST render as highlighted mention content in the chat bubble

#### Scenario: Deleting an inserted mention

- **WHEN** the user deletes at the end of an intact inserted mention
- **THEN** the app MUST remove the entire mention token instead of leaving a partial account display name
- **AND** the removed mention MUST NOT be included in the next sent message metadata

#### Scenario: Re-editing a mention message

- **WHEN** the user re-edits a recalled text message that contains mention metadata
- **THEN** the composer MUST restore the visible text and intact mention metadata
- **AND** sending the re-edited text MUST preserve only the mentions that remain intact after the user's edits

### Requirement: Reply Mention Prefix Metadata

The chat module SHALL treat the automatic reply mention prefix in team chats as a normal tracked mention when replying to another member.

#### Scenario: Replying to another team member

- **WHEN** the user replies to another member's message in a team chat
- **THEN** the composer MUST prefix the reply with `@<display name> `
- **AND** sending the reply MUST include mention metadata for that prefixed member if the prefix remains intact
