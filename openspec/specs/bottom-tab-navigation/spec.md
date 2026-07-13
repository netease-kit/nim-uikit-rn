# bottom-tab-navigation Specification

## Purpose

TBD - created by archiving change fix-bottom-tab-label-clipping. Update Purpose after archive.

## Requirements

### Requirement: Bottom Tab Labels Remain Fully Visible

The bottom tab bar SHALL display tab labels without clipping on supported phone layouts.

#### Scenario: Viewing bottom tabs on compact or device-specific layouts

- **WHEN** the app renders the bottom tab bar on a supported phone layout
- **THEN** each tab label SHALL remain fully visible on one line
- **AND** the label SHALL stay visually centered under its tab icon
- **AND** unread indicators and existing tab navigation behavior SHALL be preserved

### Requirement: Cloud Pagination Preserves Messages Tab Unread Dot

The app SHALL show unread indicators on bottom-tab entry points when relevant unread state exists.

#### Scenario: Cloud pagination does not clear the messages tab dot prematurely

- **GIVEN** cloud conversation mode is enabled
- **AND** the app has total unread messages after login
- **AND** the first loaded conversation page does not yet contain the unread conversations that account for that total
- **WHEN** the user loads more conversation pages or the app auto-reconciles the cloud conversation pagination state
- **THEN** the bottom messages tab icon MUST keep its unread red dot until the visible conversation unread state is fully reconciled
- **AND** the app MUST NOT clear the messages tab dot only because an intermediate pagination state temporarily reports zero displayed unread conversations
