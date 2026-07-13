## MODIFIED Requirements

### Requirement: Setting page exposes the cloud-conversation toggle

The `/user/setting` page MUST expose the cloud-conversation toggle with the Web-aligned copy while preserving the current RN settings surface.

#### Scenario: User changes the cloud-conversation toggle

- **WHEN** the user turns the cloud-conversation toggle on or off
- **THEN** the selected value is stored in local preferences immediately
- **AND** later NIM initialization and login flows MUST read that stored value as the effective `enableV2CloudConversation` setting
- **AND** the page MAY inform the user that the change takes effect after they log in again
- **AND** the toggle flow MUST NOT require an extra confirmation dialog unless a workbook testcase explicitly adds one
