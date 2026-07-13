# chat-forwarding Specification

## Purpose

TBD - created by archiving change align-forward-source-title-display. Update Purpose after archive.

## Requirements

### Requirement: Batch Forward Confirmation Source Title

The system SHALL show the current source conversation title in merged-forward and one-by-one-forward confirmation previews. For P2P conversations the source title SHALL use friend remark, then user nickname, then account ID. For team conversations the source title SHALL use the team name.

#### Scenario: P2P batch forward confirmation with remark

- **WHEN** the user starts merged forwarding or one-by-one forwarding from a P2P chat whose peer has a friend remark
- **THEN** the confirmation preview uses the friend remark as the source conversation title

#### Scenario: P2P batch forward confirmation without remark

- **WHEN** the user starts merged forwarding or one-by-one forwarding from a P2P chat whose peer has no friend remark
- **THEN** the confirmation preview uses the peer user nickname, or the account ID when no nickname exists

#### Scenario: Team batch forward confirmation

- **WHEN** the user starts merged forwarding or one-by-one forwarding from a team chat
- **THEN** the confirmation preview uses the team name as the source conversation title

### Requirement: Merged Forward Payload Source Title

The system SHALL write merged-forward payload source titles without sender-local P2P friend remarks. For P2P conversations the payload title SHALL use user nickname, then account ID. For team conversations the payload title SHALL use the team name.

#### Scenario: P2P merged-forward payload with local remark

- **WHEN** the user sends a merged-forward message from a P2P chat whose peer has a friend remark
- **THEN** the sent merged-forward payload title uses the peer user nickname or account ID, not the friend remark

#### Scenario: Team merged-forward payload

- **WHEN** the user sends a merged-forward message from a team chat
- **THEN** the sent merged-forward payload title uses the team name

### Requirement: Forward Confirmation Keyboard Avoidance

The system SHALL keep the forward confirmation modal comment input visible and usable when the keyboard is open. This behavior SHALL apply to single-message forwarding, merged forwarding, and one-by-one forwarding because they share the same confirmation modal.

#### Scenario: Comment input with keyboard open

- **WHEN** the user opens the forward confirmation modal and focuses the comment input
- **THEN** the modal moves or resizes so the comment input is not covered by the keyboard

#### Scenario: Forward actions remain available

- **WHEN** the keyboard is open in the forward confirmation modal
- **THEN** the cancel and send actions remain visible and usable

### Requirement: Forward Confirmation Responsiveness

The forwarding flow SHALL close the confirmation modal and return to the source flow immediately after pre-send validation succeeds, without waiting for all forwarding send operations to finish.

#### Scenario: Serial forwarding multiple messages to multiple targets closes promptly

- **GIVEN** the user selects multiple messages for one-by-one forwarding
- **AND** the user selects one or more forwarding targets
- **WHEN** the user confirms sending in the forwarding confirmation modal
- **THEN** RN MUST validate target selection, supported message content, nested-forward constraints, and network availability before starting the send
- **AND** after validation succeeds RN MUST close the confirmation modal promptly
- **AND** RN MUST return to the source page without waiting for every forwarded message send operation to complete
- **AND** RN MUST continue sending the forwarded messages in the background

#### Scenario: Merged forwarding to multiple targets closes promptly

- **GIVEN** the user selects multiple messages for merged forwarding
- **AND** the user selects one or more forwarding targets
- **WHEN** the user confirms sending in the forwarding confirmation modal
- **THEN** RN MUST validate target selection, supported message content, nested-forward constraints, and network availability before starting the send
- **AND** after validation succeeds RN MUST close the confirmation modal promptly
- **AND** RN MUST return to the source page without waiting for every merged-forward send operation to complete
- **AND** RN MUST continue sending the merged-forward messages in the background

### Requirement: Failed Merged Forward Resend

The system SHALL allow users to resend failed standard merged-forward messages. Unknown custom messages that are not recognized as merged-forward messages SHALL remain unsupported for resend.

#### Scenario: Resend failed merged-forward message

- **WHEN** a user's merged-forward message is in the failed sending state
- **THEN** the user can trigger resend and the message is sent again as a merged-forward message

#### Scenario: Unknown custom message resend remains unsupported

- **WHEN** a failed custom message is not recognized as a merged-forward message
- **THEN** resend remains unsupported for that message

### Requirement: Forward Picker Recent Chat Order

The system SHALL show the forward picker's recent chat list in the same order as the conversation list, including pinned conversation priority and recent activity ordering.

#### Scenario: Recent chat order matches conversation list

- **WHEN** the user opens the forward target picker
- **THEN** the recent chat list uses the same conversation ordering as the main conversation list

### Requirement: Forward Picker Friend Order

The system SHALL show the forward picker's friend list in the same order as the contacts friend list, using the same display-name ordering and contacts pinyin-section expansion order.

#### Scenario: Friend order matches contacts

- **WHEN** the user opens the forward target picker and selects the friends tab
- **THEN** the friend list order matches the contacts friend list order

### Requirement: Forward Picker Uses Cloud Conversations

The system SHALL use the active cloud conversation list as the forward picker's recent chat source when cloud conversations are enabled. The picker SHALL NOT mix local conversations into recent chats in cloud conversation mode.

#### Scenario: Cloud conversation mode recent chats

- **WHEN** cloud conversations are enabled and the user opens the forward target picker
- **THEN** the recent chat list is built from the cloud conversation list

#### Scenario: Local conversation mode recent chats

- **WHEN** cloud conversations are disabled and the user opens the forward target picker
- **THEN** the recent chat list continues to use local conversation data

#### Scenario: Cloud conversation mode recent chats prefetch

- **GIVEN** cloud conversations are enabled
- **AND** the main conversation list has not loaded all historical conversations
- **WHEN** the user opens the forward target picker from a chat page and scrolls the Recent Chats tab toward the bottom
- **THEN** RN MUST prefetch the next cloud conversation page before the user reaches the end of the currently loaded recent chats
- **AND** newly loaded conversations MUST appear in the Recent Chats tab as selectable forwarding targets
- **AND** RN MUST NOT show a visible loading-more indicator for this prefetch
- **AND** RN MUST NOT require the user to return to the main conversation list and scroll it first

### Requirement: Forwarding Does Not Create Local Conversations In Cloud Mode

The system SHALL NOT create local conversations as a forwarding side effect when cloud conversations are enabled.

#### Scenario: Forward to cloud conversation target

- **WHEN** cloud conversations are enabled and the user confirms a forward target
- **THEN** forwarding proceeds without creating a local conversation record for that target
