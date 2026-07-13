## MODIFIED Requirements

### Requirement: Chat New Message Notice Presentation

The chat detail page SHALL present the new-message notice on the right side with a down-arrow icon
and count-based copy when new messages arrive, and SHALL present the same shortcut as an icon-only
scroll-to-bottom affordance when the user is browsing older history without pending new messages.
When the user is browsing older history, incoming messages for the current conversation SHALL NOT
auto-scroll the timeline away from the user's current history position or shift the visible history
by the height of the newly inserted messages. Same-account messages synced from another endpoint
SHALL render in the timeline but SHALL NOT contribute to the new-message notice count. Newly
arrived messages that are later revoked SHALL be removed from the new-message notice count. When
the user leaves the chat detail route from the latest-message position to chat settings, system
media/file/camera entry points, or message-detail viewers and messages arrive before the user
returns, the page SHALL render those newly arrived latest messages in the timeline while preserving
the user's previous visual position instead of jumping directly to the latest message. While the
user is browsing older history, tapping composer controls including the text input, voice input,
emoji input, image/video input, and more input SHALL scroll the chat timeline to the latest message
before applying the composer state change. The new-message notice count SHALL decrease as the newly
arrived messages become viewable during manual scrolling or become revoked. The shortcut SHALL be
rendered inside the composer dock and positioned absolutely relative to that composer module rather
than relying on page-level fixed mode-specific bottom offsets. Lightweight chat-page toast messages
SHALL use the same composer-relative placement pattern so they are not covered by the input module.

#### Scenario: Same-account messages sync from another endpoint while user is away from bottom

- **GIVEN** the user is viewing a chat detail page and is not near the latest message
- **WHEN** a message sent by the same account from another endpoint syncs into this page
- **THEN** the page SHALL NOT automatically scroll to the latest message
- **AND** the currently visible historical messages SHALL remain visually anchored without intermediate flicker
- **AND** the synced message SHALL render in the timeline
- **AND** the synced message SHALL NOT contribute to the new-message notice count

#### Scenario: Newly arrived notice message is revoked while user is browsing history

- **GIVEN** the user is browsing older history in a chat detail page
- **AND** multiple newly arrived messages are represented by a new-message notice count
- **WHEN** one of those newly arrived messages is revoked before the user scrolls to it
- **THEN** the revoked message SHALL be removed from the new-message notice count
- **AND** if other newly arrived messages remain, the notice count SHALL update to the remaining count
- **AND** if no newly arrived messages remain, the count-based notice SHALL disappear and only the icon-only scroll-to-bottom shortcut SHALL remain visible
