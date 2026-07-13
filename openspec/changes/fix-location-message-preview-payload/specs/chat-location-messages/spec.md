## MODIFIED Requirements

### Requirement: Chat Location Message Send Flow

The chat detail screen SHALL allow the user to choose and send a location from the composer more panel.

#### Scenario: Send selected location

- **GIVEN** the user is on the location picker screen
- **WHEN** the user chooses a location and taps send
- **THEN** the app SHALL create a V2 location message with latitude, longitude, and an address string
- **AND** the app SHALL preserve the selected location title in `message.text` so Android and iOS native conversation previews can render the location title without reading `null`
- **AND** the app SHALL send it through the existing message send path so local sending, failure, retry, conversation preview, push preview, and read receipt behavior remain consistent with other message types

### Requirement: Chat Location Message Open And Resend

The chat detail screen SHALL preserve existing location-message display, detail opening, and resend behavior.

#### Scenario: Resend a failed location message

- **GIVEN** a sent-by-self location message failed
- **WHEN** the user retries the message
- **THEN** the app SHALL resend a location message with the original latitude, longitude, and address
- **AND** the app SHALL preserve the original location title in `message.text` when rebuilding the resend draft
