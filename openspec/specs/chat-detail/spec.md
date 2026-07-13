# chat-detail Specification

## Purpose

TBD - created by archiving change fix-chat-keyboard-avoidance. Update Purpose after archive.

## Requirements

### Requirement: Chat Detail Keyboard Avoidance On Android

The chat detail screen SHALL keep the composer fully visible when the Android software keyboard is shown.

#### Scenario: Focusing the chat composer on Android

- **WHEN** the user focuses the chat input on Android
- **THEN** the software keyboard MUST NOT cover the lower half of the composer
- **AND** the screen MUST avoid applying a second page-level keyboard height adjustment on top of Android system `resize`

### Requirement: Chat Detail Keyboard Avoidance On iOS

The chat detail screen SHALL continue to avoid the keyboard using the page-level offset required by the navigation header on iOS.

#### Scenario: Focusing the chat composer on iOS

- **WHEN** the user focuses the chat input on iOS
- **THEN** the composer MUST continue to move above the keyboard using the current header-aware page offset

### Requirement: Chat Detail Identity Display

The chat detail screen SHALL render the current conversation identity and team message sender names using the shared UIKit appellation rules. In team chats, visible sender names SHALL refresh when the current highest-priority available name source changes, including friend alias, team nickname, and personal nickname.

#### Scenario: Team chat sender name reflects display-name source changes

- **GIVEN** a team chat message from friend A is visible
- **AND** A has a team nickname
- **WHEN** the user opens A's friend card from the message avatar and changes the current highest-priority displayed name source
- **THEN** returning to the team chat MUST show A's updated sender name

#### Scenario: Team chat sender name falls back after display-name source deletion

- **GIVEN** a team chat message from friend A is visible
- **AND** A has a friend alias and a team nickname
- **WHEN** the user opens A's friend card from the message avatar and deletes the friend alias
- **THEN** returning to the team chat MUST show the next sender name according to the existing precedence

#### Scenario: P2P chat header target nickname survives friend deletion and cold login

- **GIVEN** the user previously chatted with account A
- **AND** account A has a cloud user profile nickname
- **AND** account A has been deleted from the user's friend list
- **AND** the app has been uninstalled and reinstalled so local user caches are empty
- **WHEN** the user opens the historical P2P chat with account A
- **THEN** the chat header MUST resolve and display A's cloud profile nickname
- **AND** it MUST NOT fall back to displaying A's account ID while the profile can be fetched

#### Scenario: Reply quote sender prefers friend alias

- **GIVEN** the user is in a team chat
- **AND** the replied message sender has a friend remark, a team nickname, and a personal nickname
- **WHEN** RN shows that sender in the reply quote area
- **THEN** the reply quote sender label MUST use the friend remark first
- **AND** it MUST fall back in the order `群昵称 > 个人昵称 > accid`

#### Scenario: Team history sender avatar hydrates for non-friend members

- **GIVEN** the user is viewing a team chat detail page
- **AND** an older history page contains messages sent by a non-friend team member with a preset custom user avatar
- **WHEN** those historical messages become visible
- **THEN** RN MUST request the sender profile needed by the shared UIKit avatar resolver
- **AND** the sender avatar MUST converge to the preset custom avatar instead of the accid-generated fallback avatar

### Requirement: P2P Typing Indicator

The chat detail page SHALL show a peer typing indicator only while the peer is actively typing in a P2P conversation.

#### Scenario: Peer typing indicator expires after idle timeout

- **GIVEN** the chat detail page is showing a P2P conversation
- **WHEN** a peer typing notification with `typing=1` is received
- **THEN** the header subtitle MUST show the peer typing copy
- **AND** the peer typing copy MUST be hidden after 3 seconds without another peer typing notification
- **AND** receiving another `typing=1` notification before timeout MUST restart the 3-second timeout

#### Scenario: Local typing notification stops after local input becomes idle

- **GIVEN** the local user is typing in a P2P chat composer
- **WHEN** the composer text changes to a non-empty value
- **THEN** RN MUST send a `typing=1` custom notification
- **AND** if the composer text does not change again for 3 seconds, RN MUST send a `typing=0` custom notification
- **AND** RN MUST NOT keep sending `typing=1` solely because the composer still contains unsent text

#### Scenario: Typing indicator stops immediately on explicit end

- **GIVEN** the chat detail page is showing a P2P conversation
- **WHEN** the local user clears the composer, switches out of text mode, enters selection mode, leaves the conversation, or sends the draft
- **THEN** RN MUST send or preserve the existing `typing=0` end notification behavior

- **WHEN** a peer typing notification with `typing=0` is received
- **THEN** the header subtitle MUST stop showing the peer typing copy immediately

### Requirement: Chat Album Access Under Limited Permissions

The chat detail screen SHALL restrict limited photo-library access to only the media assets currently authorized by the system and SHALL display those media assets in a stable, native-aligned order across RN Android and RN iOS.

#### Scenario: Media picker order is stable across RN Android and RN iOS

- **WHEN** the user opens the chat detail media picker from the bottom input module
- **THEN** RN MUST display accessible photos and videos in latest-first order
- **AND** RN MUST use creation time as the primary ordering key
- **AND** RN MUST use modification time and a stable asset identity as fallback keys when creation time is missing or tied
- **AND** paginated loading MUST preserve that same order after appending more assets

#### Scenario: Limited media picker exposes add-more entry inside the grid

- **WHEN** the chat detail media picker is opened while photo-library access is limited
- **THEN** the picker MUST display the currently authorized assets
- **AND** the picker MUST place an `添加更多照片` entry as the first grid card
- **AND** tapping that card MUST open the system-backed path for expanding the authorized photo and video set
- **AND** after the authorization scope changes, the same picker MUST stay open and refresh against the latest authorized asset set
- **AND** newly granted assets MUST become available from the refreshed grid or its subsequent pagination without requiring the user to close and reopen the picker

### Requirement: Chat detail banner follows IM connection state

The chat detail page SHALL avoid showing the network-unavailable banner when the current user is authenticated and the IM SDK reports logged-in and connected.

#### Scenario: iPhone can send messages while NetInfo reports unavailable

- **WHEN** the authenticated user opens a chat detail page on a physical iPhone
- **AND** the IM SDK login status is logged in and connected
- **AND** messages can be sent successfully
- **THEN** the chat detail page does not show the network-unavailable banner

#### Scenario: IM connection is not ready

- **WHEN** the authenticated user opens a chat detail page
- **AND** the IM SDK is logged out or still connecting
- **THEN** the chat detail page shows the existing offline or connecting banner copy

### Requirement: Chat detail outside-composer presses reset input mode

RN chat-detail MUST treat taps outside the composer/input module as a request to return to text input mode and hide transient input chrome.

#### Scenario: Tap message area while a non-text input mode is active

- **WHEN** the user is on the chat detail page with voice input, emoji panel, or more panel active
- **AND** the user taps an area outside the composer/input module
- **THEN** the composer switches to text input mode
- **AND** emoji and more panels are hidden
- **AND** the system keyboard is dismissed

#### Scenario: Tap message area while the text keyboard is active

- **WHEN** the user is on the chat detail page with text input focused
- **AND** the user taps an area outside the composer/input module
- **THEN** the composer remains in text input mode
- **AND** the system keyboard is dismissed

### Requirement: Chat Avatar Profile Navigation

The chat detail page SHALL let users open the correct profile page from message avatars.

#### Scenario: Open self profile from own message avatar

- **WHEN** the user taps the avatar on a message sent by the current account
- **THEN** RN MUST open the current user's personal profile page
- **AND** the existing long-press avatar behavior MUST remain available where applicable

### Requirement: Chat Detail Top Banner

The chat detail screen SHALL render user-facing copy in the active in-app language across its RN page and RN UIKit adapter surfaces.

#### Scenario: English chat detail copy

- **GIVEN** the active in-app language is English
- **WHEN** the user opens the chat detail screen or its common RN child routes
- **THEN** safety reminders, common action labels, failure hints, and empty states SHALL be shown in English where English translations exist

### Requirement: Chat Detail Duplicate Navigation Protection

Protected chat-related navigation entries SHALL open at most one destination page for a single continuous interaction.

#### Scenario: Repeated taps while opening P2P settings

- **GIVEN** the user is viewing a P2P chat detail screen
- **WHEN** the user taps the header settings entry multiple times before the first navigation completes
- **THEN** the app MUST open only one P2P settings page

#### Scenario: Repeated taps while opening team settings

- **GIVEN** the user is viewing a team chat detail screen
- **WHEN** the user taps the header settings entry multiple times before the first navigation completes
- **THEN** the app MUST open only one team settings page

#### Scenario: Open settings again after returning

- **GIVEN** the user opened chat settings and returned to the chat detail screen
- **WHEN** the user taps the header settings entry again in a later interaction
- **THEN** the app MUST allow one new settings navigation

#### Scenario: Repeated taps on other protected entries

- **GIVEN** the user is on a protected chat-related list, detail, or settings screen
- **WHEN** the user taps the same protected navigation entry multiple times before the first navigation completes
- **THEN** the app MUST open only one destination page for that interaction

### Requirement: Composer Focus Scrolls To Latest Messages

The system SHALL scroll the chat message list to the latest messages when the user focuses the text composer while browsing historical messages. This behavior SHALL apply on iOS and Android.

#### Scenario: iOS composer focus while browsing history

- **WHEN** an iOS user is viewing historical messages and taps the chat text composer
- **THEN** the keyboard opens and the message list scrolls to the latest messages

#### Scenario: Incoming messages while browsing history

- **WHEN** the user is viewing historical messages and receives a new message without focusing the composer
- **THEN** the message list remains at the current historical position and shows the new message reminder

### Requirement: File messages use differentiated type icons

RN file messages MUST display different file icons by file type, aligned with the Android implementation's icon categorization.

#### Scenario: Known office and media file types render dedicated icons

- **WHEN** the chat page renders a file message with a recognized extension such as Word, Excel, PPT, image, archive, audio, or video
- **THEN** the file message shows the corresponding dedicated file icon
- **AND** the icon resource is reused from the existing repository assets

#### Scenario: Unknown file types render fallback icon

- **WHEN** the chat page renders a file message whose extension is missing or not in the supported mapping
- **THEN** the file message shows the unknown file icon

#### Scenario: File type icon does not depend on localized text

- **WHEN** the app language changes between Chinese and English
- **THEN** the file message icon remains correct for the file type
- **AND** it does not rely on a text badge to identify the type

### Requirement: Chat Detail Team Availability

The chat detail page SHALL validate the current team conversation before allowing the user to remain in the chat.

#### Scenario: Team is unavailable when opening chat detail

- **WHEN** the user opens a team chat detail page
- **AND** the team info query fails because the team was dismissed or the current user is no longer a member
- **THEN** RN MUST show a native confirmation alert with the unavailable-team message
- **AND** after confirmation RN MUST return to the conversation list
- **AND** RN MUST remove that conversation from the active conversation source

### Requirement: Media viewer does not expose original address entry

RN image and video viewers MUST NOT expose the original address to end users from the media detail experience.

#### Scenario: Image viewer hides original address action

- **WHEN** the user opens the chat image detail viewer
- **THEN** the page MUST NOT render an action that reveals or jumps to the original address
- **AND** the user MUST NOT be able to navigate from the image detail viewer to a raw original-address detail page

#### Scenario: Media viewer keeps non-sensitive actions

- **WHEN** the user opens the chat image or video detail viewer
- **THEN** the viewer MUST continue to provide its existing non-sensitive actions such as close and save
- **AND** removing the original-address entry MUST NOT affect normal media preview behavior

#### Scenario: Media viewer image renders without black screen

- **WHEN** the user opens a chat image detail viewer for a valid image message
- **THEN** the image content MUST render normally instead of remaining on a black screen
- **AND** horizontal paging or zoom container layout MUST NOT collapse the visible image area to zero height

#### Scenario: Media viewer image loading settles after first success

- **WHEN** the user opens an image that has already been loaded successfully in the current app session
- **THEN** the viewer SHOULD reuse the cached image result when available
- **AND** it MUST NOT keep showing a persistent loading overlay for that image after the image is already ready to display

#### Scenario: Android media viewer does not render valid image content as solid black

- **WHEN** the user opens a valid chat image detail viewer on Android
- **THEN** the visible image area MUST render the actual image content
- **AND** it MUST NOT degrade into a solid black image while the page itself remains visible

#### Scenario: iOS media viewer keeps valid image content visible

- **WHEN** the user opens a valid chat image detail viewer on iOS
- **THEN** the visible image area MUST render the actual image content
- **AND** the iOS image detail viewer MUST keep showing that image content during normal paging and reopen flows
- **AND** the iOS image detail viewer MUST NOT provide pinch-zoom or ScrollView-based zoom interaction

### Requirement: Chat Voice Playback Lifecycle

The chat detail screen SHALL stop active voice-message playback before the user leaves the chat timeline context for another route, media surface, or system picker.

#### Scenario: Opening chat media or detail surfaces stops voice playback

- **GIVEN** a voice message is currently playing in the chat detail timeline
- **WHEN** the user opens a video message, image preview, merged-forward detail, forwarding page, or conversation settings page
- **THEN** the active voice message MUST stop playback before the target surface is shown
- **AND** the chat timeline MUST no longer show that voice message as playing.

#### Scenario: Opening system pickers stops voice playback

- **GIVEN** a voice message is currently playing in the chat detail timeline
- **WHEN** the user opens the document picker, album/file picker, camera capture flow, or limited photo-library permission picker from the chat composer
- **THEN** the active voice message MUST stop playback before the system UI or picker flow begins.

#### Scenario: Tapping a voice message remains a playback control

- **GIVEN** the user remains in the chat detail timeline
- **WHEN** the user taps a voice message
- **THEN** the voice message MUST continue to use the existing play-or-stop toggle behavior.

### Requirement: Pinned Message Sender Uses Team Nickname In Team Chats

The chat detail module SHALL show the sender identity in the pinned-message list using the team-chat appellation context when the pinned message belongs to a team conversation.

#### Scenario: Pinned team message sender shows team nickname

- **GIVEN** the pinned-message list contains a message from a team conversation
- **WHEN** RN renders the sender avatar and sender name in that pinned-message row
- **THEN** RN MUST pass the team conversation context to the shared UIKit identity components
- **AND** the sender display name MUST follow the existing team-chat appellation rules, including team nickname priority

### Requirement: Returning From Chat Settings Preserves New Message Notice And Manual Scroll Access

When the user temporarily leaves a chat detail page from the latest-message position and returns after receiving new messages, the chat detail page SHALL preserve the new-message notice and SHALL allow manual scrolling to reveal those newly arrived messages.

#### Scenario: Return from settings after new incoming messages

- **GIVEN** the user is at the latest-message position in a chat detail page
- **AND** the user opens a chat-related settings page and leaves the chat detail page temporarily
- **AND** one or more incoming messages arrive before the user returns
- **WHEN** the user navigates back to the chat detail page
- **THEN** RN MUST keep showing the existing new-message notice for those newly arrived messages
- **AND** RN MUST NOT force-clear that notice solely because the user returned from settings
- **AND** when the user manually drags the timeline from the latest-message position, RN MUST reveal the deferred latest messages instead of leaving them trapped behind the paused presentation state
- **AND** the user MUST be able to manually scroll to the bottom and view those new messages normally

### Requirement: Manual Scroll Gradually Decrements New Message Notice

When the user is browsing history and receives multiple new messages, manual scrolling back toward the latest-message position SHALL reveal deferred new messages gradually so the new-message notice count decreases progressively with scrolling.

#### Scenario: Scroll toward deferred new messages

- **GIVEN** the user is browsing historical messages in chat detail
- **AND** multiple incoming messages arrive and are represented by the existing new-message notice
- **WHEN** the user manually scrolls downward toward the latest-message area
- **THEN** RN MUST reveal deferred latest messages progressively through the manual scroll path
- **AND** the `x条新消息` notice count MUST decrease progressively as those newly revealed messages become reachable by scrolling
- **AND** RN MUST NOT force an extra immediate jump-to-bottom alignment solely because the first deferred new message area became reachable by scrolling
- **AND** tapping the explicit new-message shortcut MAY still keep its existing direct jump-to-bottom behavior
