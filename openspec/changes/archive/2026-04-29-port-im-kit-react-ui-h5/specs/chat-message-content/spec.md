## ADDED Requirements

### Requirement: Text And Emoji Messages

The chat module SHALL correctly send and render plain text, mixed-language text, special-character text, blank-space text, emoji-only, and emoji-plus-text messages covered by the tests.

#### Scenario: Sending text content variants

- **WHEN** the user sends supported text or emoji combinations
- **THEN** the message bubble preserves the expected visible content and layout

### Requirement: Link-Like And Code-Like Text

The chat module SHALL render link-like and code-like textual messages without corrupting their visible content.

#### Scenario: Sending hyperlink-like text

- **WHEN** the user sends text that looks like a link or code snippet
- **THEN** the displayed message content remains intact and readable

### Requirement: Composer And Auxiliary Panels

The chat page SHALL provide the placeholder copy, emoji panel, more-actions half sheet, and camera, album, and file entry points required by the tests.

#### Scenario: Opening composer auxiliary panels

- **WHEN** the user opens emoji or more-actions controls from the composer
- **THEN** the page shows the expected panel content and entry affordances

### Requirement: Attachment Message Types

The chat module SHALL send and render image, video, file, voice-like, location-like, and downloaded-attachment rows with the size, count, format, preview, and reopen behavior required by the tests.

#### Scenario: Rendering attachment and notification messages

- **WHEN** the timeline contains supported attachment payloads
- **THEN** each row displays the expected thumbnail, summary, preview, or saved-file affordance

#### Scenario: Opening attachment details

- **WHEN** the user taps an image, video, file, voice-like, or location-like row
- **THEN** the app routes to the supported preview or open flow for that attachment type, surfaces stable failure feedback when the source cannot be opened, and keeps unsupported payloads on a stable fallback

#### Scenario: Copying message preview content

- **WHEN** the user copies text content from a supported message preview page
- **THEN** the app reports whether the copy succeeded instead of failing silently

#### Scenario: Downloading and replaying remote video

- **WHEN** the user first taps a remotely hosted video row that has not yet been downloaded locally
- **THEN** the app downloads the video, keeps the timeline stable, and requires a second tap to enter the playback surface with the local file

#### Scenario: Downloading and reopening a remote file

- **WHEN** the user first taps a remotely hosted file row that has not yet been downloaded locally
- **THEN** the app downloads the file, keeps the timeline stable, and requires a follow-up tap to enter the file open flow with the local copy

#### Scenario: Browsing historical images from media detail

- **WHEN** the user opens an image detail surface from chat history
- **THEN** the app supports viewing adjacent historical images in that conversation and keeps image zoom behavior stable

#### Scenario: Saving downloaded media or files

- **WHEN** the user chooses to save an image, video, or file from a supported detail surface
- **THEN** the app persists the attachment locally and exposes the expected follow-up open behavior

#### Scenario: Sending attachments with limits or permissions

- **WHEN** the user sends images, videos, or files through the supported picker flows
- **THEN** the app enforces the workbook's format, quantity, size, original-image, download, and permission rules

### Requirement: Notification, Tips, And Unknown Message Rendering

The chat module SHALL render notification, tips-style, and unsupported-or-unknown message payloads with stable fallbacks required by the tests.

#### Scenario: Rendering system-style messages

- **WHEN** the timeline contains team notifications, tips messages, or unknown payloads
- **THEN** each row uses the expected system-style presentation and sender-label behavior
