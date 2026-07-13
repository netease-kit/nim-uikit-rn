# chat-message-content Specification

## Purpose

TBD - created by archiving change port-im-kit-react-ui-h5. Update Purpose after archive.

## Requirements

### Requirement: Text And Emoji Messages

The chat module SHALL correctly send and render plain text, mixed-language text, special-character text, blank-space text, emoji-only, emoji-plus-text messages, and mention-highlighted text messages covered by the tests.

#### Scenario: Emoji followed by long text wraps inline

- **GIVEN** the chat detail page renders a text message that starts with or contains an emoji followed by text
- **AND** the combined emoji plus text content exceeds one visual line
- **WHEN** the message bubble lays out the content
- **THEN** the text after the emoji MUST continue from the remaining width on the emoji line when space is available
- **AND** only the overflow portion MUST wrap to the next line
- **AND** RN MUST NOT move the entire following text segment to the next line as a block
- **AND** emoji and adjacent text MUST use a consistent vertical alignment on the first and wrapped lines

#### Scenario: Duplicate mention from draft and reply remains highlighted

- **GIVEN** a team-chat composer already contains a selected mention for user A
- **AND** the user replies to a message sent by user A, causing another `@A` mention to be inserted
- **WHEN** the message is sent and rendered in the chat timeline
- **THEN** both visible `@A` mentions SHALL be highlighted
- **AND** the second mention SHALL remain highlighted even when it is at the end of the sent text

### Requirement: Link-Like And Code-Like Text

The chat module SHALL render link-like and code-like textual messages without corrupting their visible content.

#### Scenario: Sending hyperlink-like text

- **WHEN** the user sends text that looks like a link or code snippet
- **THEN** the displayed message content remains intact and readable

### Requirement: Composer And Auxiliary Panels

The chat page SHALL provide the placeholder copy, emoji panel, more-actions half sheet, and camera,
album, and file entry points required by the tests.

#### Scenario: Opening composer auxiliary panels

- **WHEN** the user opens emoji or more-actions controls from the composer
- **THEN** the page shows the expected panel content and entry affordances

#### Scenario: Opening the chat album entry

- **WHEN** the user taps the chat composer image entry while photo-library permission has not yet been granted
- **THEN** the app MUST enter the system photo-library permission flow directly without showing an app-defined media-choice dialog first
- **AND** after permission is granted it MUST open the system photo picker from the same tap flow
- **AND** after permission is denied it MUST keep the user on the current chat surface

### Requirement: Attachment Message Types

The chat module SHALL send and render image, video, file, voice-like, location-like, and downloaded-attachment rows with the size, count, format, preview, and reopen behavior required by the tests.

#### Scenario: Rendering or opening remote attachment URLs from HTTPS-capable NOS hosts

- **WHEN** the RN app receives an image, video, or file attachment whose remote `url` uses `http` for an HTTPS-capable NOS host
- **THEN** rendering, previewing, downloading, or opening that attachment MUST use the equivalent `https` URL
- **AND** the app MUST NOT require broad insecure network loading for that attachment to work on iOS

#### Scenario: Other-client local paths do not override remote attachment URLs

- **WHEN** the RN app receives a video or file attachment containing both a remote `url` and a non-local sender-side `path`
- **THEN** rendering, previewing, downloading, or opening the attachment MUST use the remote `url`
- **AND** local `file://` or `content://` paths MAY still be used before remote URLs for attachments that are available on the current device

#### Scenario: Saving merged-forward media with extensionless URL

- **GIVEN** the user opens an image or video message from merged-forward detail
- **AND** the media attachment URL does not expose a filename extension
- **WHEN** the user taps the media viewer download button
- **THEN** RN MUST save the media without failing with a missing extension error
- **AND** RN MUST use attachment name, attachment extension, or media type fallback to create a local filename with an extension

#### Scenario: iOS HEIC image selection is allowed

- **GIVEN** the chat detail page runs on iOS
- **WHEN** the user selects an image asset whose filename extension is `heic`, `heif`, `tiff`, or `tif`
- **THEN** RN MUST allow the asset to continue into the image-message send flow
- **AND** RN MUST NOT show the unsupported-format toast before sending

#### Scenario: iOS HEIC MIME image selection is allowed

- **GIVEN** the chat detail page runs on iOS
- **WHEN** the image picker returns an image asset whose MIME type is `image/heic`, `image/heif`, or `image/tiff`
- **THEN** RN MUST allow the asset to continue into the image-message send flow
- **AND** RN MUST NOT show the unsupported-format toast before sending

#### Scenario: WebP image selection is allowed

- **GIVEN** the chat detail page runs on iOS or Android
- **WHEN** the user selects an image asset whose filename extension is `webp` or whose MIME type is `image/webp`
- **THEN** RN MUST allow the asset to continue into the image-message send flow
- **AND** RN MUST NOT show the unsupported-format toast before sending

#### Scenario: WebP file message opens as image preview

- **GIVEN** the chat detail page receives or opens a file message whose filename extension or attachment extension is `webp`
- **WHEN** the user taps that file message after the local file is available
- **THEN** RN MUST treat it as an image previewable file
- **AND** RN MUST open it through the in-app media viewer instead of the generic file open flow

#### Scenario: Android image selection keeps existing format support

- **GIVEN** the chat detail page runs on Android
- **WHEN** the user selects an image asset
- **THEN** RN MUST keep the existing jpg/jpeg/png/gif image format whitelist
- **AND** RN MUST expand Android image sending support to include WebP but MUST NOT expand it to iOS-only HEIC/HEIF/TIFF formats

### Requirement: Attachment Message Sending State

The chat message renderer SHALL present in-progress attachment sends with loading affordances and remove them after sending completes.

#### Scenario: File message shows loading while sending

- **GIVEN** the chat detail page renders an outgoing file message
- **WHEN** the file message sending state is `SENDING`
- **THEN** the file message MUST show an Android-aligned 20dp determinate circular progress indicator in the file icon/progress area
- **AND** it MUST show the Android-aligned 6dp x 9dp pause thumb inside the circular progress indicator
- **AND** the circular progress indicator MUST advance from the SDK upload progress callback instead of showing an indefinite spinner

#### Scenario: Video message shows loading while sending

- **GIVEN** the chat detail page renders an outgoing video message
- **WHEN** the video message sending state is `SENDING`
- **THEN** the video message MUST show an Android-aligned 42dp determinate circular progress indicator over the video preview
- **AND** it MUST show the Android-aligned 13dp x 18dp pause thumb inside the circular progress indicator
- **AND** the circular progress indicator MUST advance from the SDK upload progress callback instead of showing an indefinite spinner

#### Scenario: Image message shows native bubble-front sending loading while sending

- **GIVEN** the chat detail page renders an outgoing image message
- **WHEN** the image message sending state is `SENDING`
- **THEN** RN MUST show a message-level loading before the message bubble on iOS and Android
- **AND** the loading MUST use a native platform spinner style
- **AND** the normal image sending thumbnail loading MUST remain inside the image card

#### Scenario: Video message shows native bubble-front sending loading while sending

- **GIVEN** the chat detail page renders an outgoing video message
- **WHEN** the video message sending state is `SENDING`
- **THEN** RN MUST show a message-level loading before the message bubble on iOS and Android
- **AND** the loading MUST use a native platform spinner style
- **AND** the determinate circular upload progress MUST remain over the video preview

#### Scenario: File message shows native bubble-front sending loading on iOS only

- **GIVEN** the chat detail page renders an outgoing file message on iOS
- **WHEN** the file message sending state is `SENDING`
- **THEN** RN MUST show a 22dp gray native-style loading before the message bubble, vertically centered to the bubble
- **AND** the file icon area's determinate circular upload progress MUST remain visible

#### Scenario: File message keeps Android native sending-status exception

- **GIVEN** the chat detail page renders an outgoing file message on Android
- **WHEN** the file message sending state is `SENDING`
- **THEN** RN MUST NOT show the message-level loading before the message bubble
- **AND** the file icon area's determinate circular upload progress MUST remain visible

#### Scenario: Attachment sending loading disappears after success

- **GIVEN** the chat detail page renders an outgoing file or video message
- **WHEN** the message sending state changes from `SENDING` to `SUCCEEDED`
- **THEN** the sending loading indicator MUST disappear

#### Scenario: Bubble-front sending loading disappears after sending leaves sending state

- **GIVEN** the chat detail page renders an outgoing image, video, or iOS file message
- **WHEN** the message sending state changes from `SENDING` to `SUCCEEDED` or `FAILED`
- **THEN** the message-level loading before the message bubble MUST disappear
- **AND** the failed state MAY show the existing retry affordance instead

### Requirement: Attachment Message Download State

The chat message renderer SHALL present in-progress file and video downloads with determinate circular progress affordances aligned with the native UIKit implementations.

#### Scenario: File message shows loading while downloading

- **GIVEN** the chat detail page renders a file message whose remote attachment has not been downloaded locally
- **WHEN** the user taps the file message and the file download is in progress
- **THEN** the file message MUST show an Android-aligned 20dp determinate circular progress indicator in the file icon/progress area
- **AND** it MUST show the Android-aligned 6dp x 9dp pause thumb inside the circular progress indicator
- **AND** the circular progress indicator MUST advance from the file download progress callback instead of showing a static pause glyph

#### Scenario: File message opens inline from secondary message surfaces

- **GIVEN** a file message is rendered in merged-forward detail, collection list, or pinned-message list
- **WHEN** the user taps the file message
- **THEN** RN MUST keep the user on the current page
- **AND** RN MUST show file download progress on that file message bubble while downloading
- **AND** after download completes RN MUST open the local file directly through the platform file opener
- **AND** if the platform cannot open the file in-app RN MUST let the user choose an available external app when the platform supports an app chooser

#### Scenario: Video message shows loading while downloading

- **GIVEN** the chat detail page renders a video message whose remote attachment has not been downloaded locally
- **WHEN** the user taps the video message and the video download is in progress
- **THEN** the video message MUST show an Android-aligned 42dp determinate circular progress indicator over the video preview
- **AND** it MUST show the Android-aligned 13dp x 18dp pause thumb inside the circular progress indicator
- **AND** the circular progress indicator MUST advance from the video download progress callback instead of showing a static pause glyph

#### Scenario: Image message keeps native-aligned thumbnail loading

- **GIVEN** the chat detail page renders an image message
- **WHEN** the image thumbnail is loading or the image message is opened
- **THEN** the message bubble MUST NOT add a download circular progress indicator for image download

### Requirement: Notification, Tips, And Unknown Message Rendering

The chat module SHALL render notification, tips-style, unsupported-or-unknown message payloads, and reply-source previews with stable fallbacks required by the tests.

#### Scenario: Team nickname updates chat sender labels in realtime

- **WHEN** a member's nickname in the current team is changed
- **AND** the user is viewing a group chat containing messages from that member
- **THEN** the visible sender label for that member's group messages updates without requiring page re-entry
- **AND** the displayed sender name uses friend alias before team nickname, profile nickname, message-carried nickname, and account ID

#### Scenario: Reply source message is unavailable

- **GIVEN** a reply message references a source message
- **WHEN** the source message has been recalled, deleted, or is unavailable in the local message cache
- **THEN** RN MUST show the fallback copy `该消息已被撤回或删除`
- **AND** RN MUST NOT continue showing the source sender name in the reply preview title area

#### Scenario: Reply preview hydrates unloaded non-text source

- **GIVEN** a reply message references a source message that is an audio, file, image, video, location, custom, or other non-text message
- **AND** the source message exists in conversation history but is not in the local message cache because older history has not been loaded yet
- **WHEN** RN renders the reply message in chat detail
- **THEN** RN MUST fetch the missing source message by its reply refer
- **AND** RN MUST render the reply preview from the hydrated source message type
- **AND** RN MUST NOT show `该消息已被撤回或删除` solely because the source is outside the currently loaded history window

#### Scenario: Reply source message remains unavailable after hydration

- **GIVEN** a reply message references a source message
- **WHEN** RN cannot hydrate the source message because it has been recalled, deleted, or is unavailable from the SDK
- **THEN** RN MUST show the fallback copy `该消息已被撤回或删除`
- **AND** RN MUST NOT continue showing the source sender name in the reply preview title area

#### Scenario: Reply preview does not jump to a revoked or deleted source

- **GIVEN** a reply message is visible in the chat timeline
- **AND** its source message has been revoked, deleted, or is unavailable locally
- **WHEN** the user taps the reply preview area
- **THEN** RN MUST keep the current scroll position
- **AND** RN MUST NOT jump or scroll to the old source-message position

#### Scenario: Reply preview shows file-message label

- **GIVEN** a reply message references a file message
- **WHEN** RN renders the reply preview
- **THEN** the reply preview content MUST display `[文件消息]`

### Requirement: Team Mention Messages

The chat module SHALL support Android-compatible mention composition, metadata, deletion, sending, receiving, re-editing, and member naming for text messages in team or discussion chats.

#### Scenario: Team mention selector excludes AI users

- **GIVEN** the user is composing in a team or discussion chat
- **AND** one or more AI users are available locally, including AI users that are also team members
- **WHEN** the user types `@`
- **THEN** the mention selector MUST NOT show AI users
- **AND** the mention selector MAY continue to show `@所有人` when allowed and ordinary team members

#### Scenario: Team mention selector opens without search

- **GIVEN** the user is composing in a team chat
- **WHEN** the user types `@`
- **THEN** RN opens the mention selector without a search input module
- **AND** RN directly shows the available `@所有人` candidate when allowed and the ordinary team-member candidates

#### Scenario: Team mention selector ignores friend alias

- **GIVEN** the user is composing in a team or discussion chat
- **AND** a team member has both a friend alias and a team nickname
- **WHEN** the user types `@`
- **THEN** the mention selector MUST show that member using team nickname before profile nickname and account ID
- **AND** the mention selector MUST NOT use the friend alias for that member
- **AND** selecting that member MUST insert the same alias-ignored display name into the composer mention text

#### Scenario: Mention picker shows non-friend nickname priority

- **GIVEN** a team chat contains a member who is not the current user's friend
- **WHEN** RN renders that member in the `@` mention picker
- **THEN** the display name MUST use the member's group nickname when present
- **AND** otherwise MUST use the member's personal profile nickname when present
- **AND** otherwise MUST fall back to the member account ID
- **AND** RN MUST NOT show the account ID as the primary display name solely because the member is not a friend

#### Scenario: P2P mention selector is disabled

- **GIVEN** the user is composing in a P2P chat
- **WHEN** the user types `@`
- **THEN** RN MUST NOT open the mention selector for AI users
- **AND** the typed `@` MUST remain plain composer text unless another non-AI mention capability explicitly supports it

#### Scenario: Sending and receiving mention text

- **WHEN** the user sends a text message that contains one or more intact tracked mentions
- **THEN** the message MUST include Android-compatible `serverExtension.yxAitMsg` metadata for each mentioned account and range
- **AND** sent and received mention text MUST render as highlighted mention content in the chat bubble

#### Scenario: Mention followed by short text stays inline

- **GIVEN** the chat detail page renders a text message such as `@xxx hi`
- **AND** the message line has enough remaining width after the mention
- **WHEN** RN Android lays out the text bubble
- **THEN** the trailing text MUST continue on the same visual line as the mention
- **AND** RN MUST NOT move the trailing Latin word to a separate line solely because the mention and trailing text have different styles

#### Scenario: Sending mention-only text

- **WHEN** the user sends a team or discussion text message whose visible content is only an intact tracked mention such as `@xxx` or `@所有人`
- **THEN** the outgoing message MUST still include Android-compatible `serverExtension.yxAitMsg` metadata for that mention
- **AND** the mentioned account or all-members mention MUST receive the same mention response as when additional text follows the mention

#### Scenario: iOS nine-key replacement triggers mention selector

- **GIVEN** the user is composing in a team or discussion chat on a physical iPhone
- **WHEN** the iOS numeric nine-key keyboard replaces a just-entered punctuation character such as `.` with `@`
- **THEN** the chat composer MUST open the mention member selector
- **AND** selecting a candidate MUST replace that `@` with the tracked mention token at the same text position

### Requirement: Reply Mention Prefix Metadata

The chat module SHALL treat the automatic reply mention prefix in team chats as a normal tracked mention when replying to another member.

#### Scenario: Replying to another team member

- **WHEN** the user replies to another member's message in a team chat
- **THEN** the composer MUST prefix the reply with `@<display name> `
- **AND** sending the reply MUST include mention metadata for that prefixed member if the prefix remains intact

### Requirement: Audio And File Bubble Compact Alignment

The chat message bubble SHALL keep audio duration and file-name suffix content visually adjacent to their related primary content.

#### Scenario: Audio duration stays near the voice icon

- **WHEN** the chat page renders a voice message
- **THEN** RN MUST show the duration text next to the voice icon
- **AND** the icon-duration group MUST stay on the side closest to the sender avatar

#### Scenario: File extension stays adjacent to a non-overflowing file name

- **WHEN** the chat page renders a file message whose file name fits in the available width
- **THEN** RN MUST keep the file extension or type suffix directly after the file name
- **AND** RN MUST NOT stretch the file name row so that a blank gap appears between the name and suffix

#### Scenario: Long file name still preserves suffix

- **WHEN** the chat page renders a file message whose file name exceeds available width
- **THEN** RN MUST keep the preserved tail and file extension visible where possible
- **AND** RN MAY truncate the earlier file-name prefix with a tail ellipsis

### Requirement: iOS File Action Album Source

The chat file action SHALL allow iOS users to send both Files/iCloud content and photo-library content as file messages.

#### Scenario: iOS file action offers album and Files sources

- **GIVEN** the chat detail page runs on iOS
- **WHEN** the user taps the composer file action
- **THEN** RN MUST offer a choice between album content and Files/iCloud content
- **AND** choosing Files/iCloud MUST keep the existing document picker based file send flow

#### Scenario: iOS album content from file action sends as file messages

- **GIVEN** the chat detail page runs on iOS
- **WHEN** the user chooses album from the composer file action and selects photo-library photo or video assets
- **THEN** RN MUST send each selected asset with the file-message send path
- **AND** RN MUST NOT send those assets through the image-message or video-message send path
- **AND** RN MUST continue to enforce the existing file size limit for each selected asset

#### Scenario: Android file action remains document picker only

- **GIVEN** the chat detail page runs on Android
- **WHEN** the user taps the composer file action
- **THEN** RN MUST keep the existing document picker based file send flow
- **AND** RN MUST NOT add an album source chooser to the Android file action

### Requirement: iOS Downloaded File Opening

The chat module SHALL open downloaded file-message attachments on iOS through a native document sharing or preview flow that supports local sandbox files.

#### Scenario: iOS downloaded file opens after download

- **GIVEN** the chat detail page runs on iOS
- **AND** the user receives a file message whose attachment is remote
- **WHEN** the user taps the file message, waits for download completion, and taps to view the downloaded local file
- **THEN** RN MUST open the local file through an iOS document sharing or preview capable flow
- **AND** RN MUST NOT call URL-scheme opening directly on the local `file://` path
- **AND** RN MUST NOT show an `Unable to open URL` error for a downloaded local file solely because it is an app sandbox file

#### Scenario: iOS image file messages open in media viewer

- **GIVEN** the chat detail page runs on iOS
- **AND** the user receives a file message whose filename or extension is an iOS native-supported image file type
- **WHEN** the file is locally available or finishes downloading and the user taps to view it
- **THEN** RN MUST open the file in the in-app image viewer
- **AND** the image viewer MUST display the tapped file message's local or remote URI
- **AND** the image viewer MUST NOT replace it with the first normal image message in the same conversation
- **AND** RN MUST NOT show the generic file sharing sheet as the primary viewing surface

#### Scenario: iOS video file messages open in media viewer

- **GIVEN** the chat detail page runs on iOS
- **AND** the user receives a file message whose filename or extension is an iOS native-supported video file type
- **WHEN** the file is locally available or finishes downloading and the user taps to view it
- **THEN** RN MUST open the file in the in-app video viewer
- **AND** the video viewer MUST use a native iOS-capable player for local sandbox files and remote video URLs
- **AND** RN MUST NOT show the generic file sharing sheet as the primary viewing surface

#### Scenario: iOS video messages play in media viewer

- **GIVEN** the chat detail page runs on iOS
- **WHEN** the user opens a normal video message or a downloaded video file message
- **THEN** RN MUST render the video through a native iOS-capable video player
- **AND** the player MUST support playback of the resolved local or remote video URI
- **AND** RN MUST NOT rely on a WebView HTML video element as the primary iOS playback surface

#### Scenario: Android downloaded file open path remains unchanged

- **GIVEN** the chat detail page runs on Android
- **WHEN** the user opens a downloaded file message attachment
- **THEN** RN MUST keep using the existing content-URI intent based file open flow

### Requirement: iOS Web Vue3 Video Playback Compatibility

The chat module SHALL preserve and apply video attachment extension metadata when opening videos in the iOS media viewer.

#### Scenario: Web Vue3 extensionless MOV video opens on iOS

- **GIVEN** the chat detail page runs on iOS
- **AND** the user receives a normal video message from Web Vue3 whose remote NOS `url` has no filename extension
- **AND** the video attachment carries `.mov` or `mov` extension metadata in `ext`, `name`, or parsed attachment metadata
- **WHEN** the user opens the video message
- **THEN** RN MUST cache or resolve the playable video URI with a video filename extension
- **AND** the media viewer MUST render the video through the native video player
- **AND** RN MUST NOT require the user to save the video from the viewer before local playback works.

### Requirement: Reply Preview Tap Opens Source Message Detail

The chat module SHALL open a dedicated source-message detail page when the user taps the quoted source preview inside a reply message, without jumping or scrolling the chat timeline to the source-message position.

#### Scenario: Tapping text reply source preview

- **GIVEN** a reply message is visible in the chat timeline
- **AND** its quoted source message is an available text or emoji message
- **WHEN** the user taps the quoted source preview area
- **THEN** RN MUST open the source-message detail page
- **AND** RN MUST render only the quoted source message using the same message bubble style as chat detail
- **AND** RN MUST keep the source-message detail page message area padding consistent with chat detail
- **AND** RN MUST render the quoted source message on the left side regardless of whether it was sent by the current user
- **AND** if the quoted source message was sent by the current user, RN MUST display the sender name using priority group nickname, personal nickname, then account ID
- **AND** RN MUST show the full text-and-emoji source message content in that bubble
- **AND** RN MUST NOT jump or scroll the current chat timeline to the source-message position
- **AND** tapping the reply message content outside the quoted source preview MAY keep the existing message-content open behavior

#### Scenario: Tapping non-text reply source preview

- **GIVEN** a reply message is visible in the chat timeline
- **AND** its quoted source message is an available image, video, file, audio, location, merged-forward, custom, or other supported message type
- **WHEN** the user taps the quoted source preview area
- **THEN** RN MUST open the source-message detail page
- **AND** RN MUST render only the quoted source message using the same message bubble style as chat detail
- **AND** RN MUST keep the source-message detail page message area padding consistent with chat detail
- **AND** RN MUST render the quoted source message on the left side regardless of whether it was sent by the current user
- **AND** tapping the rendered source message bubble MAY open media preview, location detail, merged-forward detail, file download/open, or audio playback according to the existing chat-detail behavior for that message type
- **AND** RN MUST NOT jump or scroll the current chat timeline to the source-message position
- **AND** tapping the reply message content outside the quoted source preview MAY keep the existing message-content open behavior

#### Scenario: Tapping reply source preview starts download

- **GIVEN** the source-message detail page is showing a quoted source message
- **AND** the rendered source message requires a download before it can open
- **AND** the source message has not already been downloaded locally
- **WHEN** the user taps the rendered source message bubble for the first time
- **THEN** RN MUST show the toast text `正在下载`
- **AND** RN MUST start the existing download flow for that source message
- **AND** RN MUST NOT jump or scroll the current chat timeline to the source-message position

#### Scenario: Source-message detail hides nested reply previews

- **GIVEN** the source-message detail page is showing a quoted source message
- **AND** that source message is itself a reply message with its own quoted-source preview
- **WHEN** RN renders the source-message detail bubble
- **THEN** RN MUST render only the resolved source message content on that page
- **AND** RN MUST NOT render the nested quoted-source preview block for that source message
- **AND** RN MAY keep existing message-content open behavior for the rendered source message content itself
