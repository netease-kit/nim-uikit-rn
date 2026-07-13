## MODIFIED Requirements

### Requirement: Chat New Message Notice Presentation

The chat detail page SHALL present the new-message notice on the right side with a down-arrow icon
and count-based copy when new messages arrive, and SHALL present the same shortcut as an icon-only
scroll-to-bottom affordance when the user is browsing older history without pending new messages.
When the user is browsing older history, incoming messages for the current conversation and
same-account messages synced from another endpoint SHALL NOT auto-scroll the timeline away from
the user's current history position or shift the visible history by the height of the newly
inserted messages. When the user leaves the chat detail route from the latest-message position to
chat settings, system media/file/camera entry points, or message-detail viewers and messages arrive
before the user returns, the page SHALL render those newly arrived latest messages in the timeline
while preserving the user's previous visual position instead of jumping directly to the latest
message. While the user is browsing older history, tapping composer controls including the text
input, voice input, emoji input, image/video input, and more input SHALL scroll the chat timeline to
the latest message before applying the composer state change. The new-message notice count SHALL
decrease as the newly arrived messages become viewable during manual scrolling. The shortcut SHALL
be rendered inside the composer dock and positioned absolutely relative to that composer module
rather than relying on page-level fixed mode-specific bottom offsets. Lightweight chat-page toast
messages SHALL use the same composer-relative placement pattern so they are not covered by the
input module.

#### Scenario: Incoming messages arrive while user is away from bottom

- **GIVEN** the user is viewing a chat detail page and is not near the latest message
- **WHEN** one or more incoming messages arrive
- **THEN** the page SHALL NOT automatically scroll to the latest message
- **AND** the currently visible historical messages SHALL remain visually anchored without intermediate flicker
- **AND** the page SHALL show the new-message notice on the right side
- **AND** the notice SHALL show a down-arrow icon before the text
- **AND** the notice text SHALL include the accumulated number of newly arrived messages

#### Scenario: Same-account messages sync from another endpoint while user is away from bottom

- **GIVEN** the user is viewing a chat detail page and is not near the latest message
- **WHEN** a message sent by the same account from another endpoint syncs into this page
- **THEN** the page SHALL NOT automatically scroll to the latest message
- **AND** the currently visible historical messages SHALL remain visually anchored without intermediate flicker
- **AND** the synced message SHALL contribute to the new-message notice count

#### Scenario: New messages arrive while user is outside the chat detail route

- **GIVEN** the user is at the latest-message position in a chat detail page
- **AND** the user opens chat settings, a system media/file/camera entry point, or a message-detail viewer from that chat
- **WHEN** one or more messages arrive for the same conversation before the user returns
- **THEN** returning to the chat detail page SHALL NOT jump directly to those newly arrived messages
- **AND** the page SHALL show the new-message notice and down-arrow shortcut
- **AND** the notice text SHALL include the accumulated number of newly arrived messages

#### Scenario: Manual scrolling reaches newly arrived messages gradually

- **GIVEN** the user is browsing older history in a chat detail page
- **AND** multiple new messages arrive and are represented by a new-message notice count
- **WHEN** the user manually scrolls toward the newly arrived messages
- **THEN** the page SHALL NOT jump directly to the latest message
- **AND** the newly arrived messages SHALL already exist in the timeline data
- **AND** the currently visible historical messages SHALL remain visually anchored as the timeline content size changes
- **AND** the new-message notice count SHALL decrease as newly arrived messages become viewable

#### Scenario: User scrolls upward to browse history

- **GIVEN** the user is viewing a chat detail page at the latest message
- **WHEN** the user scrolls upward and the latest message is no longer near the viewport bottom
- **THEN** the page SHALL show a right-side down-arrow shortcut without new-message count text
- **AND** tapping the shortcut SHALL scroll the timeline back to the latest message

#### Scenario: User returns to bottom

- **GIVEN** the new-message notice or icon-only scroll shortcut is visible
- **WHEN** the user taps the notice or scrolls back to the bottom
- **THEN** the page SHALL hide the shortcut
- **AND** the accumulated notice count SHALL reset
- **AND** the latest messages SHALL be visible in the timeline

#### Scenario: Composer height changes while shortcut is visible

- **GIVEN** the new-message notice or icon-only scroll shortcut is visible
- **WHEN** the composer switches between text, voice, emoji, or panel states
- **THEN** the shortcut SHALL remain anchored above the composer module
- **AND** the shortcut SHALL NOT be covered by the input module

#### Scenario: Composer controls are tapped while user is browsing history

- **GIVEN** the user is browsing older history in a chat detail page
- **WHEN** the user taps the text input, voice input, emoji input, image/video input, or more input
- **THEN** the page SHALL scroll to the latest message
- **AND** the new-message notice or icon-only shortcut SHALL be hidden
- **AND** the composer state change SHALL proceed after the timeline is aligned to the latest message

#### Scenario: Chat page toast appears while composer is visible

- **GIVEN** the user is viewing a chat detail page with the composer visible
- **WHEN** the page shows a lightweight chat toast
- **THEN** the toast SHALL be rendered inside the composer dock
- **AND** the toast SHALL be positioned above the input module
- **AND** the toast SHALL NOT be covered by text, voice, emoji, or panel composer states
