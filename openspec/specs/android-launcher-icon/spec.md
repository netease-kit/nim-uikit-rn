# android-launcher-icon Specification

## Purpose

TBD - created to capture Android installed icon behavior. Update Purpose after archive.

## Requirements

### Requirement: Android installed icon matches the shared app icon

The Android installed application icon MUST use the same branded source artwork as the iOS installed application icon instead of the default Expo placeholder launcher icon.

#### Scenario: Installing the Android package

- **WHEN** the Android release package is installed on a device
- **THEN** the launcher icon shown on the device uses the shared NetEase IM icon artwork
- **AND** it does not show the default Expo placeholder icon
