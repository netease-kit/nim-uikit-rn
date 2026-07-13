## MODIFIED Requirements

### Requirement: Chat detail read receipts follow UIKit presentation

The system SHALL render chat-detail message read receipts using the UIKit/H5 icon-and-progress presentation instead of plain text labels.

#### Scenario: P2P message receipt uses UIKit indicator

- **WHEN** the chat detail page renders a sent P2P message with read-receipt visibility enabled
- **THEN** it MUST show the UIKit read indicator
- **AND** it MUST use the full-read icon when the peer has read the message
- **AND** it MUST use the pending progress indicator when the peer has not read the message

#### Scenario: Team message receipt uses UIKit indicator

- **WHEN** the chat detail page renders a sent team message with read-receipt visibility enabled
- **THEN** it MUST show the UIKit read indicator
- **AND** it MUST map the team read and unread counts to the indicator progress

#### Scenario: Large teams hide the receipt indicator

- **WHEN** the chat detail page renders a sent team message for a team whose member count exceeds 100
- **THEN** it MUST hide the read-receipt indicator
- **AND** teams with 100 or fewer members MUST keep the UIKit indicator behavior

#### Scenario: Team receipt keeps detail navigation

- **WHEN** a sent team message has a UIKit read indicator
- **THEN** tapping the UIKit indicator MUST navigate to the message read-detail page
- **AND** the read-detail page MUST be registered in the root navigation stack so it is visible
- **AND** the navigation params MUST NOT reuse root-level push notification params that redirect to chat detail

#### Scenario: Fully read team message does not require detail navigation

- **WHEN** a sent team message has no unread members remaining
- **THEN** the chat detail page MUST show the full-read icon state
- **AND** tapping the full-read icon MUST navigate to the message read-detail page

#### Scenario: Empty read-member list uses testcase copy

- **WHEN** the read-detail page opens on the "已读" tab and there are no read members yet
- **THEN** it MUST show the empty-state title `全部成员未读`

#### Scenario: Read-detail header reserves status bar space

- **WHEN** the read-detail page renders on a device with a non-zero top safe-area inset
- **THEN** the page header MUST reserve the top safe-area height before the title row

#### Scenario: Read-receipt setting toggles receipt visibility for current messages

- **WHEN** the user turns the read-receipt setting off
- **THEN** the chat detail page MUST hide read-receipt indicators for sent messages, including messages that were already visible before the toggle changed
- **AND WHEN** the user turns the setting on again
- **THEN** the chat detail page MUST show the available read-receipt indicators again for those messages

#### Scenario: Sent-message receipt appears on the left side of the bubble

- **WHEN** the chat detail page renders a sent message receipt
- **THEN** the receipt indicator MUST appear on the left side of the sent-message bubble
- **AND** it MUST stay on the same row as the bubble instead of using a separate line
- **AND** it MUST align with the lower edge of the sent-message bubble content

#### Scenario: Resent team message refreshes receipt counts

- **GIVEN** a sent team message failed and is visible in the chat detail timeline
- **WHEN** the user resends that failed message and the resend succeeds
- **THEN** the chat detail page MUST refresh the resent message's team read-receipt counts
- **AND** the receipt indicator MUST resolve counts by either the original failed-message identifier or the resent-message identifier returned by the SDK

#### Scenario: Resent team message keeps read-detail navigation

- **GIVEN** a failed team message has been resent successfully
- **WHEN** the user taps the message read-receipt indicator before or after the latest count refresh finishes
- **THEN** the app MUST navigate to the message read-detail page with the resent message's conversation and message identifier
- **AND** the tap target MUST remain available for fully read team messages as well as partially read team messages

#### Scenario: Loading team history refreshes sent-message receipt counts

- **GIVEN** the user is viewing a team chat detail page
- **AND** the timeline loads an initial history page or an older history page that contains sent team messages from the current user
- **WHEN** those historical messages are rendered in the timeline
- **THEN** the app MUST refresh those messages' team read-receipt counts without requiring the user to open the read-detail page first
- **AND** the timeline's read-receipt indicators MUST converge to the latest read and unread counts for those historical messages
