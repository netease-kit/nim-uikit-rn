## ADDED Requirements

### Requirement: Voice playback cache preserves attachment extension

RN voice playback SHALL cache remote voice attachments using the best available attachment extension metadata instead of forcing an `.m4a` fallback when the remote URL has no extension.

#### Scenario: AAC voice attachment without URL extension plays on iOS

- **GIVEN** a remote voice message attachment has metadata extension `aac`
- **AND** the remote URL path has no filename extension
- **WHEN** RN iOS downloads the attachment for in-app playback
- **THEN** the cached local file MUST use an `.aac` extension
- **AND** the player MUST load the cached file with a non-zero duration when the file itself is valid
- **AND** playback state MUST no longer remain stuck only because the cache filename used an incompatible fallback extension

#### Scenario: M4A voice attachment keeps existing behavior

- **GIVEN** a remote voice message attachment has metadata extension `m4a` or a filename ending in `.m4a`
- **WHEN** RN iOS downloads or reuses the attachment for in-app playback
- **THEN** the cached local file MUST keep the `.m4a` extension
- **AND** existing playback behavior MUST remain unchanged
