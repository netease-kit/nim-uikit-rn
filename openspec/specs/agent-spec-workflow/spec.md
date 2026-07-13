# agent-spec-workflow Specification

## Purpose

TBD - created by archiving change define-agent-spec-workflow. Update Purpose after archive.

## Requirements

### Requirement: Repository Onboarding Docs Match The Actual Codebase

The repository SHALL maintain onboarding documentation that references only existing entrypoint files, code directories, and runnable commands for this Expo Router React Native IM demo.

#### Scenario: README setup guidance stays project-specific

- **WHEN** a contributor opens `README.md` for setup or startup guidance
- **THEN** the document describes the actual Expo, NIM, configuration, startup, and validation flow for this repository instead of generic starter-template instructions

#### Scenario: Agent onboarding from the shared guide

- **WHEN** an agent opens `AGENTS.md` for a fresh task
- **THEN** the guide directs it to `README.md`, `ARCHITECTURE.md`, the relevant files under `app/`, `stores/`, `constants/`, `app.json`, and `openspec/` instead of missing fullstack-specific paths

### Requirement: Workflow And Behavior Changes Are Spec-Gated

Agents SHALL create or update an OpenSpec change before implementing modifications that affect routes, user-visible flows, NIM runtime configuration, store behavior that changes user-visible state, or repository workflow expectations.

#### Scenario: Route or user-flow change

- **WHEN** a task changes screens under `app/`, navigation in layout files, login flow, conversation flow, or chat behavior
- **THEN** the agent creates or selects an active OpenSpec change before editing code

#### Scenario: Workflow documentation change

- **WHEN** a task changes `AGENTS.md`, `CLAUDE.md`, startup commands, or contributor workflow expectations
- **THEN** the agent updates an OpenSpec change before landing the documentation change

### Requirement: The Guide Maps Ownership To Real Files

The repository SHALL maintain a code-boundary document that maps navigation, configuration, state responsibilities, and change routing to the actual files that own them in this repository.

#### Scenario: Navigation ownership lookup

- **WHEN** a contributor needs to change routing or screen structure
- **THEN** `ARCHITECTURE.md` points to `app/_layout.tsx`, `app/(tabs)/_layout.tsx`, `app/login.tsx`, `app/(tabs)/index.tsx`, and `app/chat/[id].tsx`

#### Scenario: NIM state ownership lookup

- **WHEN** a contributor needs to change SDK initialization, conversations, messages, or AppKey configuration
- **THEN** `ARCHITECTURE.md` points to `stores/NIMStore.ts`, `stores/ConversationStore.ts`, `stores/MessageStore.ts`, and `constants/NIMConfig.ts`

### Requirement: Validation Guidance Uses Supported Commands

The agent guide SHALL list validation and startup commands that exist in this repository or are standard Expo and OpenSpec commands.

#### Scenario: Repository validation

- **WHEN** an agent finishes a documentation, routing, configuration, or store change
- **THEN** the guide instructs it to use relevant commands from `npm run lint`, `npm run format:check`, `npx tsc --noEmit`, `npx expo install --check`, and `OPENSPEC_TELEMETRY=0 openspec validate <change> --type change --no-interactive`

#### Scenario: Expo startup verification

- **WHEN** an agent needs to boot the app locally
- **THEN** the guide routes generic startup to `npm run start` and platform-specific startup to `npm run ios`, `npm run android`, or `npm run web`, without claiming frontend/backend health URLs that do not exist in this repository

### Requirement: iOS Startup Verification

User-visible iOS startup regressions SHALL be validated against the native simulator build when the change touches app assets, first-run copy, or root navigation behavior.

#### Scenario: Startup polish change affects iOS install or first screen

- **WHEN** a change updates iOS app icon assets, first-launch language defaults, or root stack back-button behavior
- **THEN** the change is verified on the iOS simulator in addition to static checks
