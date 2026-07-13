## MODIFIED Requirements

### Requirement: Offline Chat Surface Stability

The chat page SHALL remain navigable while offline, preserve local timeline content, and keep incoming remote state transitions consistent once connectivity returns.

#### Scenario: Staying on chat while network conditions change

- **WHEN** the user opens chat during offline, reconnect, or network-switch periods
- **THEN** the page keeps a stable timeline and surfaces the expected recovery behavior
- **AND** an already authenticated user MUST remain on the current chat detail route during transient offline states instead of being redirected to the home or login page solely because IM login status becomes disconnected
- **AND** when the device network is unavailable the chat detail page MUST show the offline banner copy `当前网络不可用，请检查你的网络设置`
