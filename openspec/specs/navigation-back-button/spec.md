# navigation-back-button Specification

## Purpose

TBD - created by archiving change align-back-button-icon. Update Purpose after archive.

## Requirements

### Requirement: RN pages use a unified back button icon

The React Native app SHALL use a unified back button visual on pages with a navigation header.

#### Scenario: Navigating to a headered page on Android

- **WHEN** the user opens a page with a visible navigation header on Android
- **THEN** the back button MUST use the iOS-style left arrow icon instead of the Android system default arrow
- **AND** the icon MUST NOT use blue highlight styling

#### Scenario: Navigating to a headered page on iOS

- **WHEN** the user opens a page with a visible navigation header on iOS
- **THEN** the back button MUST keep the same iOS-style left arrow visual
- **AND** the icon MUST use the same neutral color as Android
