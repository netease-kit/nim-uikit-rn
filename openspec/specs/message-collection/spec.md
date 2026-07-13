# message-collection Specification

## Purpose

TBD - created by archiving change port-im-kit-react-ui-h5. Update Purpose after archive.

## Requirements

### Requirement: Message Collection Actions

The chat module SHALL expose collect actions for eligible messages, keep the visible collect action label as `收藏` even when the source message has already been collected, and provide the success or failure feedback required by the tests. Collecting the same source message repeatedly MUST refresh the existing collection instead of showing an uncollect action from the chat message action panel.

#### Scenario: Collecting a message for the first time

- **WHEN** the user long-presses an eligible uncollected message
- **THEN** the action panel MUST show `收藏`
- **WHEN** the user taps `收藏`
- **THEN** the message MUST be added to the collection list

#### Scenario: Recollecting the same message

- **GIVEN** a message has already been collected
- **WHEN** the user long-presses that same message again
- **THEN** the action panel MUST still show `收藏`
- **WHEN** the user taps `收藏`
- **THEN** the collection list MUST contain only one entry for that source message
- **AND** that entry MUST move to the latest position
- **AND** that entry's collection time MUST be updated

### Requirement: Collection List Entry And Empty State

The app SHALL provide a collection page reachable from My, and that page SHALL render collected message entries with message content presentation aligned to the chat detail message bubble whenever the source message can be resolved or a stored message snapshot can be deserialized. The collection row SHALL present sender identity and collection metadata in a native-aligned form: sender avatar fallback labels MUST NOT use friend remarks or team nicknames and MUST use personal nickname before account ID, source text MUST use native-aligned P2P/team copy under the sender title, and collection time MUST be displayed at the bottom of the collection card. When a collection row is rendered from a stored message snapshot, later live-state changes to the original conversation message, including revoke state, MUST NOT replace the collected snapshot content. Text previews in collection rows MUST render supported UIKit emoji keys as emoji icons instead of plain text labels.

#### Scenario: Opening the collection page with resolvable messages

- **WHEN** the user opens the collection page and a collected source message can be resolved from its stored message reference
- **THEN** the collection row renders the message content using the same chat message bubble presentation as the conversation detail page
- **AND** text, rich emoji, image, video, audio, file, location, merged-forward, notification, and tips messages follow the same visual treatment as chat detail for their supported content
- **AND** tapping a collected audio message MUST play the audio in the collection page with the same playback animation as chat detail
- **AND** the collection row still shows collection-specific source and action controls outside the message bubble
- **AND** the sender avatar fallback label MUST resolve from personal nickname before account ID and MUST NOT use friend remark or team nickname
- **AND** the collection source MUST be shown under the sender title using native-aligned source copy
- **AND** the collection time MUST be shown at the bottom of the collection card

#### Scenario: Opening the collection page with snapshot-only messages

- **WHEN** the user opens the collection page and a collected source message cannot be resolved but the stored collection payload has sender or conversation snapshot fields
- **THEN** the collection row MUST use the stored native-compatible sender and conversation snapshot fields when available
- **AND** the sender avatar fallback label MUST still avoid friend remarks and team nicknames
- **AND** the source and collection time presentation MUST remain consistent with resolvable collection rows

#### Scenario: Source message is revoked after being collected

- **GIVEN** the user collected a message and the collection payload contains that message snapshot
- **AND** the original conversation message is revoked after collection
- **WHEN** the user opens My > Collection
- **THEN** the collection row MUST render the collected message snapshot content
- **AND** the collection row MUST NOT render the original message's revoke placeholder
- **AND** the conversation detail page MAY still render the original message as revoked

#### Scenario: Forwarding a collected message after its source is revoked

- **GIVEN** the user collected a message and the collection payload contains that message snapshot
- **AND** the original conversation message is revoked after collection
- **WHEN** the user forwards that collection entry from My > Collection
- **THEN** the app MUST forward using the collected message snapshot
- **AND** the app MUST NOT reject the forward because the original conversation message is currently revoked

#### Scenario: Collected text preview contains UIKit emoji keys

- **GIVEN** the user has a collected text or emoji message whose collection row preview contains supported UIKit emoji keys
- **WHEN** the user opens My > Collection
- **THEN** the collection row MUST display those supported emoji keys as their emoji icon style
- **AND** the row MUST NOT display the emoji key labels as plain text for supported emojis
- **AND** existing collection-card line limits MUST still apply

### Requirement: Collection Follow-Up Actions

The collection page SHALL expose overflow actions based on the collected message type.

#### Scenario: Overflow actions for a collected text message

- **GIVEN** the user opens My > Collection
- **AND** a collected message is a text message with copyable text content
- **WHEN** the user opens the collection-card overflow menu
- **THEN** the available actions MUST include `复制`, `删除`, and `转发`

#### Scenario: Overflow actions for a collected audio message

- **GIVEN** the user opens My > Collection
- **AND** a collected message is an audio message
- **WHEN** the user opens the collection-card overflow menu
- **THEN** the available actions MUST include `删除`
- **AND** the menu MUST NOT include `转发`

### Requirement: Collection Reply Message Preview

The collection page SHALL render collected reply messages without the quoted source preview.

#### Scenario: Collected reply message is shown in collection page

- **GIVEN** the user opens My > Collection
- **AND** a collected message is a reply message
- **WHEN** the collection card renders that message
- **THEN** the card SHALL show the reply message content itself
- **AND** the card SHALL NOT show the quoted source message preview

### Requirement: Collection Text Message Preview Line Limit

The collection page SHALL limit collected text-message previews in collection cards without limiting the opened message-detail page, and the opened collection text-message detail page SHALL present only the full text-and-emoji content itself with tooltip-style copy support.

#### Scenario: Collected text message is opened from collection

- **GIVEN** a collected text message is shown in My > Collection
- **WHEN** the user taps the collection card to open message detail
- **THEN** the opened page SHALL show the full message content without the collection-card three-line ellipsis constraint
- **AND** the opened page SHALL present the text-and-emoji content directly instead of wrapping it in a message bubble or separate copy-button card layout
- **AND** the opened page SHALL NOT show the message timestamp above the content

#### Scenario: Long-pressing a collected text message in message detail

- **GIVEN** the user opens a collected text message from My > Collection
- **WHEN** the user long-presses the message content
- **THEN** the page MUST expose a tooltip-style floating copy action above the message content with a downward arrow
- **AND** choosing copy MUST copy the text content and show the existing copy feedback

### Requirement: Collection Delete Action

The collection page SHALL expose a delete action for each collected message and require confirmation before deleting the collection.

#### Scenario: User cancels collection deletion

- **GIVEN** the user opens a collection card more-action menu
- **WHEN** the user taps the delete action and then taps cancel in the confirmation dialog
- **THEN** the confirmation dialog SHALL close
- **AND** the collection list SHALL remain unchanged

#### Scenario: User confirms collection deletion

- **GIVEN** the user opens a collection card more-action menu
- **WHEN** the user taps the delete action and confirms the dialog
- **THEN** the app SHALL delete that collection
- **AND** the app SHALL show a toast with the text `删除成功`
- **AND** the collection list SHALL update to remove that item

### Requirement: Cross-Device Message Collection Visibility

The collection page SHALL display message collections created by RN, Android, and iOS clients for the current account.

#### Scenario: Native-created collection appears in RN collection list

- **GIVEN** a message was collected on Android or iOS using the native message collection format
- **WHEN** the user opens My > Collection in RN
- **THEN** RN MUST query collections across all message collection types
- **AND** RN MUST parse the native collection payload
- **AND** RN MUST render the collected message in the collection list when the serialized message can be deserialized

#### Scenario: Legacy RN collection remains visible

- **GIVEN** a message was collected by an older RN build using the RN collection payload format
- **WHEN** the user opens My > Collection in RN
- **THEN** RN MUST continue to show that collection by resolving the stored message reference or stored preview
