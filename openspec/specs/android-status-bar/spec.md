# android-status-bar Specification

## Purpose

TBD - created by archiving change fix-android-status-bar-contrast. Update Purpose after archive.

## Requirements

### Requirement: Android Status Bar Contrast

The Android native status bar SHALL keep system status text and icons readable against the app's status bar background.

#### Scenario: Light status bar background uses dark content

- **GIVEN** the app is running on Android
- **WHEN** a page uses a white or light status bar background
- **THEN** the native status bar SHALL render time, signal, and battery indicators with dark content
- **AND** the status bar background SHALL remain visually aligned with the app's light page chrome
