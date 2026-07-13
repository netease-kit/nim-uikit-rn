## ADDED Requirements

### Requirement: iOS physical devices can access local Metro

The iOS debug build SHALL declare the local network usage permission needed to load JavaScript from the local Metro server on a physical iPhone, and SHALL support an embedded Debug bundle fallback when local Metro access is unavailable.

#### Scenario: Debug build starts from local Metro

- **WHEN** the iOS debug app is installed on a physical iPhone and Metro is running on port 8081
- **THEN** iOS has the required permission declaration to prompt for and allow local Metro access

#### Scenario: Debug build falls back to embedded bundle

- **WHEN** the iOS debug app is installed with an embedded `main.jsbundle` and the physical iPhone cannot reach Metro
- **THEN** the app can load the embedded bundle instead of remaining on the native transition screen

### Requirement: iOS physical device startup checks are documented

The repository agent guide SHALL document the physical iPhone startup checks needed to distinguish native installation success from local Metro JavaScript loading failure.

#### Scenario: Agent retries iPhone startup on port 8081

- **WHEN** an agent installs or launches the iOS target on a physical iPhone with Metro on port 8081
- **THEN** the agent guide describes checking same-network reachability, iOS Local Network permission, Metro status through the Mac LAN IP, Metro `iOS ... Bundled` output, and console evidence that React Native evaluated the JS bundle
