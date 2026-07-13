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
