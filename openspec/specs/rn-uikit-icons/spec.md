# rn-uikit-icons Specification

## Purpose

TBD - created by archiving change stabilize-rn-uikit-page-icons. Update Purpose after archive.

## Requirements

### Requirement: RN UIKit static page icons render from current bundle resources

RN UIKit local static page icons SHALL render from the current application bundle resources and SHALL NOT rely on an image caching path that can reuse stale icon bitmaps after Android APK overwrite installation.

#### Scenario: Android package is installed over an existing build

- **GIVEN** an Android device already has the app installed
- **WHEN** a new APK is installed over the existing app and RN pages render `UIKitIcon` icons
- **THEN** the icons SHALL use the current build's bundled local PNG resources
- **AND** the icons SHALL NOT display stale or mismatched images from a previous install
- **AND** the existing `UIKitIcon` icon names, size, width, height, tint, and style behavior SHALL remain compatible with current page call sites
