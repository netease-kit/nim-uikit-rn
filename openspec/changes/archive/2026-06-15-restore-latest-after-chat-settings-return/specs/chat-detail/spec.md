## ADDED Requirements

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
