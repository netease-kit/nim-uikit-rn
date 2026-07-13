## MODIFIED Requirements

### Requirement: Login Feedback Accuracy

The login flow SHALL show the shared network-unavailable copy only when device connectivity is confirmed unavailable.

#### Scenario: Login request fails while device remains online

- **GIVEN** the device can still receive IM message sync or otherwise remains connected
- **WHEN** requesting an SMS code or submitting login fails
- **THEN** the app does not replace the failure with `当前网络不可用，请检查你的网络设置`
- **AND** the app preserves the original server or SDK error message when one exists

#### Scenario: Login request fails while device is confirmed offline

- **GIVEN** `NetInfo` reports the device disconnected or explicitly unreachable
- **WHEN** requesting an SMS code or submitting login fails
- **THEN** the app shows `当前网络不可用，请检查你的网络设置`
