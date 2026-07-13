## MODIFIED Requirements

### Requirement: Chat Composer Media Picker Action

The image toolbar action SHALL take the user directly into the system photo-permission or
photo-picker flow required by the tests, while preserving the existing chat image/video send path.

#### Scenario: Choosing media from the image action

- **WHEN** the user taps the `图片` toolbar action before photo-library permission has been granted
- **THEN** the app MUST let the system permission flow appear directly instead of showing an app-defined media-choice dialog first
- **AND** once permission is granted it MUST open the system media picker for image and video assets from the same flow
- **AND** selected images are sent as image messages and selected videos are sent as video messages

#### Scenario: Re-entering the image action after permission is granted

- **WHEN** the user taps the `图片` toolbar action after photo-library permission has already been granted
- **THEN** the app MUST open the system media picker directly
