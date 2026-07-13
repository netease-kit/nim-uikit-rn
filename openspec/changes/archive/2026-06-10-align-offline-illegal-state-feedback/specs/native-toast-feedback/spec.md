## ADDED Requirements

### Requirement: Confirmed-Offline Illegal-State Errors MUST Use The Common Network Prompt

Shared toast error formatting SHALL map SDK `illegal state` text and error code `190002` to the common network prompt only when the app's latest network availability snapshot confirms that the device is offline. The app MUST NOT rewrite `illegal state` to a network prompt when the latest known network state is online or unknown.

#### Scenario: Confirmed offline illegal-state toast

- **WHEN** RN shared toast or shared error formatting receives an `illegal state` message or error code `190002`
- **AND** the latest known network state confirms the device is offline
- **THEN** the app shows `当前网络异常，请检查你的网络设置`

#### Scenario: Online or unknown illegal-state toast

- **WHEN** RN shared toast or shared error formatting receives an `illegal state` message or error code `190002`
- **AND** the latest known network state is online or unknown
- **THEN** the app does not force the message to the common offline prompt
- **AND** the app preserves the existing illegal-state error handling path
