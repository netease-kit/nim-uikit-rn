## MODIFIED Requirements

### Requirement: Text And Emoji Messages

The chat module SHALL correctly send and render plain text, mixed-language text, special-character
text, blank-space text, emoji-only, and emoji-plus-text messages covered by the tests.

#### Scenario: Sending text content variants

- **WHEN** the user sends supported text or emoji combinations
- **THEN** the message bubble preserves the expected visible content and layout

#### Scenario: Sending composer-selected emoji tokens

- **WHEN** the user inserts one or more supported emoji items from the composer panel and sends the
  message
- **THEN** the chat flow keeps the existing text-message send path, preserves the expected emoji
  token order, and renders supported emoji content consistently in the timeline

### Requirement: Composer And Auxiliary Panels

The chat page SHALL provide the placeholder copy, emoji panel, more-actions half sheet, and camera,
album, and file entry points required by the tests, while keeping the composer visible when the
mobile keyboard is open.

#### Scenario: Opening composer auxiliary panels

- **WHEN** the user opens emoji or more-actions controls from the composer
- **THEN** the page shows the expected panel content and entry affordances

#### Scenario: Editing emoji content from the composer panel

- **WHEN** the user opens the emoji panel and taps emoji, delete, or send controls
- **THEN** the composer inserts supported emoji tokens, deletes a whole trailing emoji token when
  appropriate, and allows send from the panel without hiding the message composer behind the keyboard

#### Scenario: Typing with the mobile keyboard open

- **WHEN** the user focuses the text input on a supported mobile target
- **THEN** the keyboard does not cover the composer input or send button, and the composer remains
  actionable while typing
