## MODIFIED Requirements

### Requirement: Chat Location Message Send Flow

The chat detail screen SHALL allow the user to choose and send a location from the composer more panel.

#### Scenario: Native map picker preferred

- **GIVEN** the user is on Android or iOS and the native map picker module is available
- **WHEN** the user taps the location action
- **THEN** the app SHALL open the native Android AMap picker or iOS NEMapKit picker before using the RN fallback page
- **AND** the selected native POI result SHALL be sent as a location message with title, address, latitude, and longitude
- **AND** canceling the native picker SHALL NOT send a message
- **AND** native map providers SHALL read platform map keys from native build configuration instead of hard-coding keys in TypeScript or native page logic

#### Scenario: Open location picker

- **GIVEN** the user is logged in and viewing a conversation detail
- **WHEN** the user taps the location action
- **THEN** the app SHALL open a native location picker when available or the RN fallback location picker screen otherwise
- **AND** the app SHALL NOT send a location message until the user confirms the selected location

#### Scenario: Pick location with UIKit-aligned POI list

- **GIVEN** the user is on the location picker screen
- **WHEN** positioning, map movement, current-location reset, or keyword search completes
- **THEN** the app SHALL show a map plus a bottom search and POI result list aligned with the Android and iOS UIKit location-picker flow
- **AND** selecting a POI row SHALL move the map marker and make that POI the pending send target
- **AND** clearing search SHALL restore nearby results around the current location

#### Scenario: Android native location fallback

- **GIVEN** the user is on the Android native location picker
- **WHEN** the provider-specific SDK location attempt fails but app location permission is still granted
- **THEN** the app SHALL continue with system-location fallback before surfacing a terminal location-failure message
- **AND** if fallback still cannot resolve coordinates, the app SHALL keep search-based location selection available

#### Scenario: Send selected location

- **GIVEN** the user is on the location picker screen
- **WHEN** the user chooses a location and taps send
- **THEN** the app SHALL create a V2 location message with latitude, longitude, and an address string
- **AND** the app SHALL send it through the existing message send path so local sending, failure, retry, conversation preview, push preview, and read receipt behavior remain consistent with other message types

#### Scenario: Location permission denied

- **GIVEN** the user opens the location picker
- **WHEN** foreground location permission is denied
- **THEN** the app SHALL keep the user on the picker screen
- **AND** the app SHALL allow the user to manually enter latitude, longitude, and address

#### Scenario: Reverse geocoding unavailable

- **GIVEN** the user selects coordinates on the picker
- **WHEN** reverse geocoding fails or returns no address
- **THEN** the app SHALL still allow sending the location message
- **AND** the address SHALL fall back to a coordinate-based description
