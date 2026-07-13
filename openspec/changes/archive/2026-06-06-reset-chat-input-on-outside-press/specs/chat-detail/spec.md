## ADDED Requirements

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
