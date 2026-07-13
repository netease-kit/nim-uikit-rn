## ADDED Requirements

### Requirement: Agent local development uses fixed Metro port 8081

Agents working in this repository MUST treat Metro port `8081` as the fixed local development port.

#### Scenario: Finish a fix while Metro is already running

- **WHEN** Metro is already running on port `8081`
- **AND** an agent finishes a code fix intended for physical-device validation
- **THEN** the agent MUST NOT restart Metro or switch to another port only for closeout verification
- **AND** the agent SHOULD rely on Expo/React Native hot update to deliver the change to connected physical devices
- **AND** the agent MAY verify `http://localhost:8081/status` returns `packager-status:running`
