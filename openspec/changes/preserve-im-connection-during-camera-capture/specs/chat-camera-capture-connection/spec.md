## ADDED Requirements

### Requirement: Camera Capture Must Preserve IM Connection

The RN Android chat detail page SHALL keep the IM runtime in foreground connection mode while the user is inside the native system camera launched for photo or video capture.

#### Scenario: Taking a photo from chat

- **GIVEN** the RN Android client is logged in and the IM connection is connected
- **WHEN** the user opens chat camera capture to take a photo and stays in the system camera for several seconds
- **THEN** the app MUST NOT report this temporary camera Activity transition as an IM background state
- **AND** returning to chat MUST NOT show the offline banner caused by this camera transition
- **AND** sending the captured photo MUST be allowed to proceed without a spurious IM-disconnected failure

#### Scenario: Recording a video from chat

- **GIVEN** the RN Android client is logged in and the IM connection is connected
- **WHEN** the user opens chat camera capture to record a video and stays in the system camera for several seconds
- **THEN** the app MUST NOT report this temporary camera Activity transition as an IM background state
- **AND** returning to chat MUST NOT show the offline banner caused by this camera transition
- **AND** sending the captured video MUST be allowed to proceed without a spurious IM-disconnected failure

#### Scenario: Camera capture ends

- **WHEN** native camera capture returns, is canceled, or throws an error
- **THEN** the camera capture foreground-preservation state MUST be cleared
- **AND** later real background transitions MUST continue to be reported to the NIM runtime
