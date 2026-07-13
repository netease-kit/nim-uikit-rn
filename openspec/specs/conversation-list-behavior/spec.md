# conversation-list-behavior Specification

## Purpose

TBD - created by archiving change port-im-kit-react-ui-h5. Update Purpose after archive.

## Requirements

### Requirement: Conversation List Layout And Empty State

The app SHALL render the conversation list screen with copy that matches the active in-app language.

#### Scenario: English conversation list copy

- **GIVEN** the active in-app language is English
- **WHEN** the user views the conversation list screen
- **THEN** the conversation preview labels, empty state text, action labels, and safety notice copy SHALL be shown in English

### Requirement: Conversation Preview Rendering

The conversation list SHALL render preview text using the same latest-message summary rules as chat detail, including long-message exposure style, alignment, sender labeling, anti-fraud notice rows, and `@` markers where the tests require them. Team messages that mention the current user directly or through `ait_all` SHALL mark the row with `[有人@我]` only while the unread range for that conversation still contains at least one unread, non-recalled `@` message.

#### Scenario: Rendering conversation preview content

- **WHEN** conversations contain long text, muted messages, `@` mentions, or system-style updates
- **THEN** the preview row content and indicators follow the test-defined display rules

#### Scenario: Current user is mentioned in a team conversation

- **WHEN** a received team message contains `serverExtension.yxAitMsg` for the current account or `ait_all`
- **AND** the conversation is not the currently open chat
- **THEN** the conversation row preview MUST show the `[有人@我]` prefix before the latest-message preview
- **AND** opening or clearing the conversation MUST remove that mention prefix from the row

#### Scenario: Mentioned message becomes read

- **WHEN** the conversation still contains historical `@我` messages
- **AND** none of those `@我` messages remain inside the current unread range
- **THEN** the conversation row MUST NOT continue showing the `[有人@我]` prefix

#### Scenario: Later normal message is recalled after an unread mention

- **GIVEN** a team conversation has an unread `@我` message
- **AND** a later unread normal message is received
- **WHEN** the later normal message is recalled
- **THEN** the conversation row MUST continue showing the `[有人@我]` prefix
- **AND** the latest-message preview MAY show the recall text after the prefix
- **AND** both local conversation rendering and im-store-v2 conversation rendering MUST use the same result

#### Scenario: Loaded chat history fills missing row preview

- **WHEN** a conversation row has no source `lastMessage`
- **AND** the chat detail message cache for that conversation contains at least one message
- **THEN** the conversation row MUST render the latest cached message preview instead of `暂无消息`
- **AND** the row timestamp MUST use that latest cached message time when the source conversation has no newer timestamp

### Requirement: Conversation Ordering And State

The conversation module SHALL order rows by stick-top priority and activity time, support pagination, and keep unread, mute, and latest-preview state synchronized with conversation updates. When a user clears unread state for a conversation, the cleared state MUST be persisted per account and conversation so stale unread counts at or before the clear point do not reappear after reconnect, SDK resynchronization, process restart, or cloud-conversation pagination.

#### Scenario: Muted conversation unread shows bottom tab red dot

- **GIVEN** every unread conversation is muted or message-notification disabled
- **WHEN** at least one muted conversation has unread messages
- **THEN** the bottom Messages tab icon MUST show the unread red dot
- **AND** the conversation row MAY continue showing the muted dot style instead of a numeric unread badge
- **AND** the bottom tab red-dot decision MUST NOT exclude unread solely because the conversation is muted

#### Scenario: Messages tab press does not reposition conversation list

- **GIVEN** the user is viewing a non-Messages bottom tab
- **AND** the Messages tab shows an unread red dot
- **WHEN** the user taps the Messages tab
- **THEN** RN MUST switch to the Messages tab
- **AND** RN MUST NOT automatically scroll or jump the conversation list to a nearest unread conversation

#### Scenario: Cleared unread does not reappear after reconnect and restart

- **GIVEN** the user clears unread state for all conversations in the conversation list
- **AND** no newer messages arrive for those conversations
- **WHEN** the app disconnects, reconnects, is killed, and then starts again
- **THEN** those conversations MUST NOT show unread badges or mention markers from messages that were already cleared
- **AND** the Messages tab unread total MUST NOT include those cleared unread counts

#### Scenario: Newer messages can show unread after a clear

- **GIVEN** the user cleared unread state for a conversation
- **WHEN** a message newer than the clear point arrives for that conversation
- **THEN** the conversation row MAY show unread state for that newer message
- **AND** the row MUST NOT restore unread state for messages at or before the clear point

#### Scenario: Cloud pagination does not flash stale unread rows

- **GIVEN** cloud conversation mode is enabled
- **AND** the Messages tab has no unread red dot because cloud total unread is zero
- **WHEN** the user scrolls the conversation list and older cloud conversations are paged in
- **THEN** newly loaded conversation rows MUST NOT temporarily show unread badges or mention markers from stale cleared unread state
- **AND** the Messages tab and conversation rows MUST remain consistent that there is no unread state

#### Scenario: Cloud pagination preserves real unread rows

- **GIVEN** cloud conversation mode is enabled
- **AND** cloud total unread is greater than zero
- **WHEN** cloud conversations are displayed or paged in
- **THEN** RN MUST continue applying the existing cleared-unread watermark logic
- **AND** conversations with messages newer than the clear point MAY still show unread state

### Requirement: Conversation Row Actions

The app SHALL expose one platform-appropriate conversation row action entry per platform while preserving row tap navigation.

#### Scenario: Android conversation rows use swipe actions

- **GIVEN** the conversation list runs on Android
- **WHEN** the user left-swipes a conversation row and taps the pin or unpin action
- **THEN** RN MUST call the active conversation stick-top path for that conversation
- **AND** the row MUST update its stick-top state and ordering after the operation succeeds
- **AND** RN MUST expose delete actions through the existing left-swipe row action surface
- **AND** RN MUST NOT open the conversation action sheet from a row long press
- **AND** tapping a closed row MUST continue to enter the chat

#### Scenario: iOS conversation rows use long-press actions

- **GIVEN** the conversation list runs on iOS
- **WHEN** the user operates a conversation row
- **THEN** RN MUST expose pin and delete actions through long press
- **AND** RN MUST NOT register the swipe action gesture or reveal swipe action buttons for that row
- **AND** tapping the row MUST continue to enter the chat

### Requirement: Offline And Multi-Endpoint Synchronization

The conversation module SHALL keep conversation rows usable during temporary network loss and SHALL converge row state after reconnect, account re-login, or another endpoint changes pin, mute, unread, deletion, or membership state. Team conversations that become invalid because the team was dismissed, the current user left, or the current user was removed MUST be pruned from the list before the user can re-enter them.

#### Scenario: Stale cloud team conversation is opened after offline dismissal

- **GIVEN** cloud conversation mode is enabled
- **AND** the current account was invited into team A
- **AND** the current account logs out before team A is dismissed
- **WHEN** the account logs in again, switches to cloud conversations, and opens the stale team A conversation row
- **THEN** RN MUST show a confirmation alert indicating the team has been dismissed or the user is no longer a member
- **AND** after confirmation RN MUST return to the conversation list
- **AND** RN MUST delete the active cloud conversation and remove any local fallback row for that conversation

### Requirement: Conversation List Source Follows Active Conversation Mode

The conversation list SHALL use the active conversation mode's source of truth while preserving local fallback rows required by the current RN session.

#### Scenario: Deleted local placeholder does not reappear

- **WHEN** the user deletes a conversation from the home conversation list
- **THEN** RN MUST remove both the active SDK conversation source and the RN local placeholder for that conversation
- **AND** the deleted conversation MUST NOT reappear solely because local placeholders are merged into the home source

#### Scenario: Startup does not flash empty stale placeholders

- **WHEN** the app starts and the bound SDK conversation source is still refreshing
- **THEN** RN MUST NOT show local placeholder conversations that have no local message preview
- **AND** locally hidden or invalid-pruned conversations MUST stay hidden during startup and refresh

### Requirement: Active Chat Keeps Conversation Unread State Cleared

The conversation list SHALL keep the unread badge cleared for a conversation while that conversation is actively open in the chat detail page.

#### Scenario: New message arrives in the currently open conversation

- **WHEN** the user is viewing a chat detail page for a conversation
- **AND** a new message for that same conversation is received
- **THEN** the app MUST immediately clear the unread state for that conversation in the active conversation store
- **AND** returning to the conversation list MUST NOT show a red dot or unread count for that message

### Requirement: Offline Banner Accuracy

The conversation list SHALL show an offline warning only when network connectivity is confirmed unavailable.

#### Scenario: iOS reports transient unknown reachability

- **GIVEN** the device network is connected
- **AND** the platform has not yet resolved `isInternetReachable`
- **WHEN** the conversation list renders
- **THEN** the app does not show the offline warning banner

#### Scenario: Network is confirmed unavailable

- **GIVEN** the device is disconnected or the platform explicitly reports internet reachability unavailable
- **WHEN** the conversation list renders
- **THEN** the app shows the shared offline warning copy

### Requirement: Team conversation removal after exit or dismissal

The conversation list SHALL remove team conversations after the current user leaves the team, leaves a discussion group, is removed from the team, or the team is dismissed. A removed team conversation MUST remain excluded while the current user is not a valid member, but MUST be restorable when the current user later rejoins the same valid team.

#### Scenario: Deleted conversation receives a new message

- **GIVEN** the user deletes a P2P or still-valid team conversation from the conversation list
- **WHEN** a new message for that conversation is received
- **THEN** RN MUST remove the ordinary local hidden marker for that conversation
- **AND** the conversation row MUST be allowed to appear again with the new latest-message preview
- **AND** RN MUST NOT restore conversations excluded because the team was dismissed, left, or otherwise invalid for the current user

#### Scenario: Leaving a team removes the conversation

- **WHEN** the current user exits a team chat or discussion group from settings
- **THEN** the conversation list MUST remove that team conversation
- **AND** subsequent local or cloud conversation refreshes MUST NOT re-add the removed conversation merely because local conversation data still exists

#### Scenario: Team dismissal removes the conversation

- **WHEN** a team is dismissed by the current user or by another member while the app is running
- **THEN** the conversation list MUST remove that team conversation
- **AND** the row MUST NOT remain visible with only the team id as its title

#### Scenario: Rejoining a previously removed team restores the conversation

- **GIVEN** the current user left or was removed from team A
- **AND** the conversation for team A was removed from the conversation list
- **WHEN** the current user is invited back into team A or otherwise rejoins team A
- **THEN** the conversation list MUST allow team A's conversation to be shown again
- **AND** newer messages in team A MUST be able to update or create the team A conversation row

#### Scenario: Reopening a valid joined team can restore the conversation

- **GIVEN** a team conversation was locally removed after exit or dismissal
- **WHEN** the current user later has a valid joined team and explicitly opens it from contacts, search, or join result
- **THEN** the app MAY recreate and show that team conversation again

### Requirement: Conversation Mode Preference Is Global

The conversation module SHALL treat the local/cloud conversation mode switch as a local persisted app preference shared across IM login accounts. The selected mode SHALL NOT be scoped to, reset by, or overridden by the currently logged-in account.

#### Scenario: Account switch keeps cloud conversation mode

- **GIVEN** account A is logged in
- **AND** the user switches the conversation mode preference to cloud conversations
- **WHEN** the user logs out and logs in as account B on the same app installation
- **THEN** account B MUST initialize with cloud conversations enabled
- **AND** account B MUST NOT fall back to local conversations because it has no account-specific preference

#### Scenario: Account switch keeps local conversation mode

- **GIVEN** account A is logged in
- **AND** the user switches the conversation mode preference to local conversations
- **WHEN** the user logs out and logs in as account B on the same app installation
- **THEN** account B MUST initialize with local conversations enabled
- **AND** account B MUST NOT force cloud conversations because of account B identity

### Requirement: Conversation Online Status Refresh

The system SHALL refresh P2P friend online/offline status in the conversation list when subscribed user status changes are received.

#### Scenario: Android friend status updates conversation list

- **GIVEN** the conversation list runs on Android
- **AND** a P2P friend row is subscribed through the shared UIKit user-status source
- **WHEN** that friend logs in or logs out
- **THEN** the conversation row online indicator MUST update from the received user-status change without requiring a manual refresh
