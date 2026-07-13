# nim-offline-push-foundation Specification

## Purpose

Define the baseline requirement that the React Native IM demo keeps its `nim-web-sdk-ng`
dependency current enough to preserve offline push configuration compatibility before login.

## Requirements

### Requirement: Applying offline push config before login

The app SHALL keep its React Native NIM integration on a current `nim-web-sdk-ng` release and SHALL continue applying offline push configuration before login using SDK APIs that remain compatible with the upgraded dependency.

#### Scenario: Upgrading the NIM RN SDK dependency

- **WHEN** the project upgrades `nim-web-sdk-ng` to the latest published npm version
- **THEN** the repository updates both the declared dependency and lock file together
- **AND** the existing offline push configuration path remains type-compatible with the upgraded SDK APIs
