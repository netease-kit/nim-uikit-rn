# chat-forwarding-and-selection Specification

## Purpose

TBD - created by archiving change port-im-kit-react-ui-h5. Update Purpose after archive.

## Requirements

### Requirement: Multi-Select Entry And Limits

The chat module SHALL provide message multi-select mode with enter, exit, cancel, selection-count limits, and message-type eligibility rules required by the tests. Multi-select message deletion SHALL support deleting up to 50 selected messages in one action, SHALL reject only selections greater than 50, and SHALL use a batch deletion path so deleting many messages does not wait on one remote deletion request per message. The selected-message count SHALL be derived from unique visible message keys so duplicate local message rows do not inflate the count used by the delete-limit check. Chat multi-select mode SHALL NOT support per-message resend, including active failed-message retry affordances, but SHALL keep failed-message state indicators visible. In multi-select mode, only tapping the message bubble body itself SHALL toggle message selection; tapping other message-row subregions or child affordances SHALL have no effect.

#### Scenario: Failed message resend is unavailable in multi-select mode

- **GIVEN** the user is in chat multi-select mode
- **AND** the timeline contains a failed message from the current user
- **WHEN** the user taps the failed message row or its failed-state indicator
- **THEN** RN MUST toggle message selection only when the message bubble body itself is tapped
- **AND** tapping the failed-state indicator MUST have no effect
- **AND** RN MUST NOT resend the failed message
- **AND** RN MUST render the failed-message exclamation indicator as a visual state cue
- **AND** RN MUST NOT render an active failed-message retry affordance in multi-select mode

#### Scenario: Non-bubble affordances stay inactive in multi-select mode

- **GIVEN** the user is in chat multi-select mode
- **WHEN** the user taps a message avatar, reply reference area, rich-text link, friend-verification link, or read-receipt area
- **THEN** RN MUST NOT navigate, open detail, open link, or trigger any secondary action
- **AND** RN MUST NOT toggle message selection from those non-bubble subregions
- **AND** only tapping the message bubble body itself MAY toggle the selected state

### Requirement: Multi-Select Resilience

The multi-select flow SHALL remain stable when new messages arrive, selected messages are recalled or deleted, another endpoint mutates the same timeline, or network connectivity changes during selection.

#### Scenario: Multi-select state changes during live updates

- **WHEN** message state changes while the user is still in multi-select mode
- **THEN** the page keeps a valid selection model and prevents acting on invalidated rows

### Requirement: Forwarding Modes And Limits

The chat module SHALL support single-message forwarding, serial forwarding, and merged forwarding with the confirmation dialogs, message-count limits, ordering rules, and nested-merge limits required by the tests. The forwarding confirmation dialog SHALL render one selected target as avatar plus one-line target name after the avatar, SHALL render multiple selected targets as avatars only, SHALL show at most six target avatars with no seventh overflow item, and SHALL keep the conversation-record preview on one line by truncating only the source conversation title while preserving the fixed record suffix. When serial forwarding is started from chat multi-select mode and the selection contains unsupported message bodies, the page SHALL show the unsupported-forwarding tip, remove those unsupported messages from the selected set, and remain on the current multi-select chat page.

#### Scenario: Merged forward send failure exits multi-select

- **GIVEN** the user starts merged forwarding from chat message multi-select mode
- **AND** the selected target rejects the forwarded message because the sender is blocked, muted in the target group, or another send-time business rule fails
- **WHEN** the merged-forward send fails
- **THEN** RN MUST show only the generic `转发失败` toast
- **AND** RN MUST NOT show `系统异常，转发失败`
- **AND** RN MUST return to the source chat page
- **AND** the source chat page MUST exit multi-select mode with the selected message set cleared

#### Scenario: Serial forwarding removes unsupported selected messages with tip

- **GIVEN** the user is in chat multi-select mode
- **AND** the selected messages include voice messages, failed messages, call-record messages, or other unsupported message bodies
- **WHEN** the user taps one-by-one forwarding
- **THEN** the page SHALL show the tip `存在不可转发的消息体`
- **AND** the page SHALL remove those unsupported messages from the selected set
- **AND** the page SHALL remain in chat multi-select mode instead of continuing to the forwarding target picker

### Requirement: Forwarding Payload Fidelity

Forwarded payloads SHALL preserve or intentionally transform reply state, `@` content, read-receipt settings, remarks, mark state, and attachment summaries exactly as the tests define for each forwarding mode. Single-message and serial forwarding of text messages containing `serverExtension.yxAitMsg` SHALL keep the visible mention text and compatible mention metadata so the forwarded bubble still renders mentions consistently.

#### Scenario: Forwarding messages with reply, `@`, or receipt metadata

- **WHEN** the selected messages include reply chains, mentions, marked rows, or read-receipt-sensitive content
- **THEN** the generated forwarded message follows the workbook's metadata-preservation rules

#### Scenario: Forwarding a text message with mention metadata

- **WHEN** the user forwards a text message that contains `serverExtension.yxAitMsg`
- **THEN** the forwarded message MUST preserve the visible `@` text and mention metadata for chat bubble rendering
- **AND** merged-forward summaries MUST keep the visible text content without introducing a new current-user mention marker in the target conversation unless the forwarded message is sent as a normal text payload with compatible mention metadata

### Requirement: Forward Target Selection

The forwarding flow SHALL provide recent-forward sessions, search, single-target selection, multi-target selection up to the supported limit, and stale-target rejection for invalid teams or P2P targets without a retained local conversation. The forwarding target page SHALL place Recent Forward as a top shortcut module above the Recent Chats, My Friends, and My Groups tabs when recent-forward targets exist, SHALL keep Recent Chats, My Friends, and My Groups as white-background tabs below the search field and recent-forward module, SHALL place the selected-conversations strip between the search field and recent-forward module in multi-select mode, SHALL highlight the active tab with highlighted text and a bottom color block, and SHALL render only the active tab's list while preserving existing search filtering and empty-state behavior for that category. Recent Chats, My Friends, and My Groups SHALL each maintain an independent vertical scroll position so scrolling one tab does not change the visible position of another tab. The Recent Forward module SHALL record locally confirmed forward targets before the remote send result returns, and SHALL continue to show a persisted P2P target even if forwarding to that target later fails because the current account is deleted or blocked by that peer. P2P conversations that remain in the local conversation list SHALL remain valid forwarding targets even when the peer account is no longer a friend.

#### Scenario: Failed P2P forwarding target remains in Recent Forward

- **GIVEN** the current account has been deleted or blocked by P2P account A
- **WHEN** the user forwards a message to account A and the send fails
- **AND** the user reopens the forwarding target page
- **THEN** the Recent Forward module MUST show account A
- **AND** selecting account A from Recent Forward MUST use account A's P2P conversation id
- **AND** the regular Recent Chats tab MAY continue to filter account A if no retained local conversation exists

### Requirement: Merged Forward Detail Viewing

The chat module SHALL open merged-forward detail pages with the required title style, attachment previews, long-press behavior, offline fallback handling, duplicate-navigation prevention, and chat-detail-aligned message rendering.

#### Scenario: Opening a merged forward detail page

- **WHEN** the user taps a merged-forward message
- **THEN** the detail page renders the expected message list and detail interactions without corrupting nested content
- **AND** each record uses the same RN UIKit message bubble styling as the chat detail timeline for the corresponding message type
- **AND** the navigation title MUST show the localized `聊天记录` chat-history title instead of the original conversation name
- **AND** the detail page MUST NOT show a message composer or any send affordance

#### Scenario: Rapid tapping a merged-forward message opens one detail page

- **GIVEN** a merged-forward message is visible in the chat detail timeline
- **WHEN** the user rapidly taps that merged-forward message multiple times before navigation completes
- **THEN** RN MUST push only one merged-forward detail page for that tap burst
- **AND** RN MUST NOT stack multiple identical merged-forward detail pages

#### Scenario: Rendering records with sender identity

- **WHEN** the merged-forward detail page renders any child message record
- **THEN** the row MUST show the original sender avatar
- **AND** the row MUST show the original sender name above the message bubble or placeholder bubble
- **AND** RN MUST prefer forwarded metadata keys `mergedMessageNickKey` and `mergedMessageAvatarKey` for that sender identity
- **AND** RN MUST fall back to the sender account when forwarded metadata is missing

#### Scenario: Rendering placeholder record content

- **WHEN** the merged-forward detail page renders an audio message or call-record message through a placeholder row
- **THEN** the placeholder bubble content and tap behavior MUST remain unchanged

#### Scenario: Rendering merged-forward card summary wrapping

- **WHEN** a merged-forward message card summary line contains a sender name and content that wraps to multiple visual lines
- **THEN** the wrapped continuation line MUST start from the card summary area's leading edge
- **AND** the wrapped continuation line MUST NOT remain indented under the content area after the sender name
- **AND** the sender name, separator, and content MUST still render as one readable summary string

#### Scenario: Opening native HTTP merged-forward detail URLs on iOS

- **GIVEN** an iOS native client sends a merged-forward message whose detail payload URL uses `http`
- **AND** the URL host supports HTTPS-compatible NOS access
- **WHEN** RN opens the merged-forward detail page on iOS
- **THEN** RN MUST download the detail payload through the equivalent `https` URL
- **AND** RN MUST NOT fail solely because the original payload URL used `http`

#### Scenario: Rendering marked records without pinned styling

- **GIVEN** a child message in a merged-forward detail page was marked in its original conversation
- **WHEN** RN renders that child message in the merged-forward detail page
- **THEN** the message bubble MUST use the same border, background, and spacing as an unmarked chat message
- **AND** RN MUST NOT show pinned-message yellow border, pinned background, or pinned badge styling in the merged-forward detail page

#### Scenario: Offline merged-forward detail load fails back to chat

- **GIVEN** the user is in a chat page with no network connectivity
- **WHEN** the user taps a merged-forward message whose detail payload is not available locally
- **THEN** RN MUST show the toast `信息获取失败`
- **AND** RN MUST navigate back to the previous chat page
- **AND** RN MUST NOT keep showing an indefinite loading state
- **AND** RN MUST NOT replace the toast with a `聊天记录不存在` empty-state page

### Requirement: Batch Delete Latest Positioning

The chat module SHALL keep the live chat detail timeline positioned at the remaining latest message after multi-select batch deletion removes the current latest message. Batch deletion of historical messages that does not include the current latest message SHALL NOT force the user away from the historical position they are viewing.

#### Scenario: Deleting latest selected messages

- **GIVEN** the user is in chat multi-select mode
- **AND** the selected messages include the current latest visible message
- **WHEN** the user confirms batch deletion and the messages are removed from the timeline
- **THEN** the chat detail page MUST show the remaining latest message position
- **AND** the page MUST NOT jump upward to older historical messages

#### Scenario: Deleting only historical selected messages

- **GIVEN** the user is in chat multi-select mode while viewing historical messages
- **AND** the selected messages do not include the current latest visible message
- **WHEN** the user confirms batch deletion and the messages are removed from the timeline
- **THEN** the chat detail page MUST preserve the user's historical viewing position
- **AND** the page MUST NOT force-scroll to the latest message

### Requirement: Current Chat Forward Returns To Latest

The chat module SHALL return the live chat timeline to the latest message after the user forwards messages into the same chat conversation they were browsing. This behavior SHALL apply even when the forwarded source messages came from older history and the user was not near the latest message before forwarding.

#### Scenario: Merged forwarding historical messages to the current chat

- **GIVEN** the user is viewing older history in a chat detail page
- **AND** the user multi-selects historical messages
- **WHEN** the user sends a merged forward to the same current conversation
- **THEN** the chat detail page MUST return to the latest message position after the forwarded message is inserted
- **AND** the user MUST NOT need to tap the scroll-down shortcut multiple times to reach the forwarded message

#### Scenario: Forwarding historical messages to another chat

- **GIVEN** the user is viewing older history in a source chat detail page
- **WHEN** the user forwards selected messages to a different target conversation
- **THEN** returning to the source chat MUST preserve the user's historical viewing position
- **AND** the source chat MUST NOT force-scroll to the latest message solely because forwarding completed elsewhere

### Requirement: Merged-forward summary emoji rendering

Merged-forward message cards SHALL render supported UIKit emoji keys in summary preview lines as emoji icons while preserving the existing summary text layout.

#### Scenario: Emoji message summary renders as icon

- **GIVEN** a merged-forward message card summary line contains a supported UIKit emoji key from an original emoji or text message
- **WHEN** the chat detail page renders the merged-forward message card
- **THEN** the summary line MUST render that emoji key as the corresponding UIKit emoji icon
- **AND** the summary line MUST NOT display the supported emoji key as plain text
- **AND** summary line measurement and line-clamp allocation MUST use the same emoji-icon rendering as the visible summary
- **AND** the sender name, separator, wrapping, and line-clamp behavior MUST remain readable and consistent with other merged-forward summary lines
