## MODIFIED Requirements

### Requirement: Merged Forward Detail Viewing

The chat module SHALL open merged-forward detail pages with the required title style, attachment previews, long-press behavior, offline fallback handling, and chat-detail-aligned message rendering.

#### Scenario: Offline merged-forward detail load fails back to chat

- **GIVEN** the user is in a chat page with no network connectivity
- **WHEN** the user taps a merged-forward message whose detail payload is not available locally
- **THEN** RN MUST show the toast `信息获取失败`
- **AND** RN MUST navigate back to the previous chat page
- **AND** RN MUST NOT keep showing an indefinite loading state
- **AND** RN MUST NOT replace the toast with a `聊天记录不存在` empty-state page
