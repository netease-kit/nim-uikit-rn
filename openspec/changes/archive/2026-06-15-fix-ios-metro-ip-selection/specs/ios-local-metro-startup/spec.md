## MODIFIED Requirements

### Requirement: iOS physical devices can access local Metro

The iOS debug build SHALL declare the local network usage permission needed to load JavaScript from the local Metro server on a physical iPhone, and SHALL support an embedded Debug bundle fallback when local Metro access is unavailable.

#### Scenario: Debug build uses the active LAN address for Metro

- **GIVEN** the iOS debug app loads Metro using the generated `ip.txt`
- **AND** the Mac has multiple network interfaces or stale local interface addresses
- **WHEN** the app is built for a physical iPhone on port `8081`
- **THEN** the generated `ip.txt` MUST prefer the IP address of the current default route interface
- **AND** the physical iPhone MUST be able to resolve the Metro bundle URL from that generated address without waiting for manual IP edits
