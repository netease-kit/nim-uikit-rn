# ios-local-metro-startup Specification

## Purpose

TBD - created by archiving change fix-ios-local-network-startup. Update Purpose after archive.

## Requirements

### Requirement: iOS physical devices can access local Metro

The iOS debug build SHALL declare the local network usage permission needed to load JavaScript from the local Metro server on a physical iPhone, and SHALL support an embedded Debug bundle fallback when local Metro access is unavailable.

#### Scenario: Debug build uses the active LAN address for Metro

- **GIVEN** the iOS debug app loads Metro using the generated `ip.txt`
- **AND** the Mac has multiple network interfaces or stale local interface addresses
- **WHEN** the app is built for a physical iPhone on port `8081`
- **THEN** the generated `ip.txt` MUST prefer the IP address of the current default route interface
- **AND** the physical iPhone MUST be able to resolve the Metro bundle URL from that generated address without waiting for manual IP edits

### Requirement: iOS physical device startup checks are documented

The repository agent guide SHALL document the physical iPhone startup checks needed to distinguish native installation success from local Metro JavaScript loading failure.

#### Scenario: Agent retries iPhone startup on port 8081

- **WHEN** an agent installs or launches the iOS target on a physical iPhone with Metro on port 8081
- **THEN** the agent guide describes checking same-network reachability, iOS Local Network permission, Metro status through the Mac LAN IP, Metro `iOS ... Bundled` output, and console evidence that React Native evaluated the JS bundle
