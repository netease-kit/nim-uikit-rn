# chat-media-save Specification

## Purpose

Define chat image and video preview behavior for saving media to the system album and presenting opened media in the preview viewport.

## Requirements

### Requirement: Chat Media Save To System Album

The chat media preview SHALL save image and video messages to the system album on the current platform without surfacing native permission implementation errors to the user, and SHALL request the system media-library permission when a save is attempted from an unauthorized state.

#### Scenario: First unauthorized save requests system permission

- **GIVEN** the user opens an image or video in the chat media preview
- **AND** the app does not yet hold the required system media-library permission for saving
- **WHEN** the user taps the save action for the first time
- **THEN** RN MUST trigger the native system permission dialog from that save flow
- **AND** if the user grants permission, RN MUST continue the same save flow and show the existing save success feedback
- **AND** if the user denies permission, RN MUST keep the user on the current media preview page

#### Scenario: Previously denied save permission falls back to settings

- **GIVEN** the user opens an image or video in the chat media preview
- **AND** the required system media-library permission for saving was previously denied and can no longer be prompted directly
- **WHEN** the user taps the save action
- **THEN** RN MUST show the existing permission-denied guidance with a path to system settings
- **AND** RN MUST NOT silently fail the save action
