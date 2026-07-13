## ADDED Requirements

### Requirement: Chat Voice Recording Cancel Gesture

The chat detail screen SHALL discard an active voice recording only when the user moves outside the circular record button's tolerated cancel boundary while holding the record button.

#### Scenario: Movement within tolerated edge area still sends

- **GIVEN** the user is recording a voice clip and the recording duration meets the minimum send duration
- **WHEN** the user's finger briefly moves near the visual edge of the circular record button but remains within the button radius plus the configured edge tolerance and then releases
- **THEN** the app SHALL send the voice message through the normal audio send path

#### Scenario: Release position determines final cancel state

- **GIVEN** the user is recording a voice clip and the touch has previously moved outside the tolerated cancel boundary
- **WHEN** the user moves back within the tolerated cancel boundary before releasing
- **THEN** the app SHALL send the voice message through the normal audio send path

#### Scenario: Movement outside tolerated circle discards

- **GIVEN** the user is recording a voice clip
- **WHEN** the user's finger moves outside the circular record button radius plus the configured edge tolerance while holding and then releases
- **THEN** the app SHALL discard the recording instead of sending a voice message

#### Scenario: Cancel hint follows tolerated boundary

- **GIVEN** the user is recording a voice clip
- **WHEN** the user's finger moves outside the circular record button radius plus the configured edge tolerance
- **THEN** the app SHALL show a release-to-cancel hint above the record button
- **WHEN** the user's finger moves back within the tolerated cancel boundary
- **THEN** the app SHALL restore the release-to-send hint above the record button
