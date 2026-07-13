## ADDED Requirements

### Requirement: Chat Composer Stays Focused After Successful Text Send

The chat composer SHALL keep the text input focused after a successful text or reply send when the user was already typing in the composer.

#### Scenario: Sending text from focused composer

- **WHEN** the user is in a chat conversation with the text composer focused
- **AND** the user sends a non-empty text message or text reply successfully
- **THEN** the composer SHALL clear the sent draft
- **AND** the text input SHALL remain focused so the keyboard stays visible

#### Scenario: Sending is blocked or fails

- **WHEN** a text send is blocked by an empty draft, team mute, duplicate-send guard, or send failure
- **THEN** the composer SHALL preserve the existing feedback and focus behavior for that blocked or failed send path
