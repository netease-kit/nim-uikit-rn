## MODIFIED Requirements

### Requirement: Chat Location Message Open And Resend

The chat detail screen SHALL preserve existing location-message display, detail opening, navigation, and resend behavior.

#### Scenario: Open a location message

- **GIVEN** a location message is visible in chat
- **WHEN** the user taps the location message bubble
- **THEN** the app SHALL open the location detail screen for that message

#### Scenario: Navigate from location detail

- **GIVEN** the user is viewing a location message detail with valid latitude and longitude
- **WHEN** the user taps the navigation button
- **THEN** the app SHALL try available native map targets first and SHALL continue to later candidates if an earlier target cannot be queried or opened
- **AND** on iOS the app SHALL be able to query supported third-party map schemes before opening them
- **AND** if no third-party map target opens, the app SHALL fall back to a system map or web map target that preserves the same coordinates and title

#### Scenario: Resend a failed location message

- **GIVEN** a sent-by-self location message failed
- **WHEN** the user retries the message
- **THEN** the app SHALL resend a location message with the original latitude, longitude, and address
