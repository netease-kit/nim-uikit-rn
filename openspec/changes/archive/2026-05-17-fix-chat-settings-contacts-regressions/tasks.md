## 1. Spec And Shared Utilities

- [x] 1.1 Validate the OpenSpec change contract for chat, contacts, settings, and permissions.
- [x] 1.2 Add localized strings for offline status, permission management, reply-source location, and AI-user contacts.
- [x] 1.3 Extend permission utilities to read/request camera, album, microphone, and notification states for settings management.

## 2. Chat Message Rendering

- [x] 2.1 Extend `UIKitChatMessageBubble` with read-only and highlight options suitable for merged-forward detail and source-location feedback.
- [x] 2.2 Update merged-forward detail to render chat-style bubbles and remove the composer.
- [x] 2.3 Update reply-reference taps to scroll to and highlight the source message instead of opening message preview.
- [x] 2.4 Update history and pinned-message pages to use read-only chat bubbles while preserving page actions.
- [x] 2.5 Check other message display pages and keep them aligned with the chat-detail bubble baseline where appropriate.

## 3. Settings And Contacts

- [x] 3.1 Add the system authorization management route and link it from Settings.
- [x] 3.2 Add the Contacts `我的数字人` shortcut and AI-user list route.

## 4. Validation

- [x] 4.1 Run OpenSpec validation.
- [x] 4.2 Run format check, lint, and TypeScript checks.
- [x] 4.3 Start the affected Expo target and record startup result.
