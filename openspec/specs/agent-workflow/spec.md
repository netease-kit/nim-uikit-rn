# agent-workflow Specification

## Purpose

TBD - created by archiving change document-reference-implementations. Update Purpose after archive.

## Requirements

### Requirement: Reference Implementation Paths

The repository agent guide SHALL document the local sibling reference implementations for Web, Android, and iOS IM UIKit behavior.

#### Scenario: Agent needs to compare platform behavior

- **WHEN** an agent needs to align behavior with existing IM UIKit implementations
- **THEN** `AGENTS.md` lists the Web, Android, and iOS reference implementation paths
- **AND** the guide states that the default reference branch is `master` unless a task explicitly says otherwise

### Requirement: Agent local development uses fixed Metro port 8081

Agents working in this repository MUST treat Metro port `8081` as the fixed local development port.

#### Scenario: Finish a fix while Metro is already running

- **WHEN** Metro is already running on port `8081`
- **AND** an agent finishes a code fix intended for physical-device validation
- **THEN** the agent MUST NOT restart Metro or switch to another port only for closeout verification
- **AND** the agent SHOULD rely on Expo/React Native hot update to deliver the change to connected physical devices
- **AND** the agent MAY verify `http://localhost:8081/status` returns `packager-status:running`
