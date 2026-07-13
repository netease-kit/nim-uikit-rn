## MODIFIED Requirements

### Requirement: Merged Forward Detail Viewing

The chat module SHALL open merged-forward detail pages with the required title style, attachment previews, long-press behavior, offline fallback handling, and chat-detail-aligned message rendering.

#### Scenario: Opening a merged forward detail page

- **WHEN** the user taps a merged-forward message
- **THEN** the detail page renders the expected message list and detail interactions without corrupting nested content
- **AND** each record uses the same RN UIKit message bubble styling as the chat detail timeline for the corresponding message type
- **AND** the navigation title MUST show the localized `聊天记录` chat-history title instead of the original conversation name
- **AND** the detail page MUST NOT show a message composer or any send affordance

#### Scenario: Rendering records with sender identity

- **WHEN** the merged-forward detail page renders any child message record
- **THEN** the row MUST show the original sender avatar
- **AND** the row MUST show the original sender name above the message bubble or placeholder bubble
- **AND** RN MUST prefer forwarded metadata keys `mergedMessageNickKey` and `mergedMessageAvatarKey` for that sender identity
- **AND** RN MUST fall back to the sender account when forwarded metadata is missing

#### Scenario: Tapping sender avatar in merged-forward detail

- **GIVEN** the merged-forward detail page renders a child message sender avatar
- **WHEN** the user taps that avatar
- **THEN** RN MUST NOT open the sender's profile or friend card
- **AND** message-content tap behavior in the same row MUST remain unchanged

#### Scenario: Rendering placeholder record content

- **WHEN** the merged-forward detail page renders an audio message or call-record message through a placeholder row
- **THEN** the placeholder bubble content and tap behavior MUST remain unchanged
