# im2-feature-implementation-skill Specification

## Purpose

TBD - created by archiving change formalize-im-foundation-skills. Update Purpose after archive.

## Requirements

### Requirement: Repo-specific IM implementation skill shall capture current repository implementation paths

The repository SHALL provide a repo-specific IM implementation skill that maps IM features onto the current `im2-rn-demo` route, store, service, and utility boundaries.

#### Scenario: User asks how a feature should be built in this repository

- **WHEN** a user asks how to implement an IM feature using the current repository’s conventions
- **THEN** the skill SHALL identify the relevant route files, stores, services, and utilities in this repository

### Requirement: Repo-specific IM implementation skill shall define module-level implementation references

The repo-specific IM implementation skill MUST include module-level implementation references for login, conversation, chat, friend, team, and settings flows.

#### Scenario: User asks about an existing module pattern

- **WHEN** the user asks how a module such as login or chat is currently implemented
- **THEN** the skill SHALL provide the owning files, state boundaries, common extension points, and minimum test surface for that module

### Requirement: Repo-specific IM implementation skill shall preserve repository-specific priority rules

The repo-specific IM implementation skill MUST preserve repository-specific source-of-truth rules for feature work.

#### Scenario: Test cases conflict with reference implementation

- **WHEN** test cases and a reference implementation disagree
- **THEN** the skill SHALL prioritize test cases over the reference implementation

#### Scenario: Reference implementation conflicts with repository boundaries

- **WHEN** a reference implementation conflicts with the current repository’s route, store, or service boundaries
- **THEN** the skill SHALL preserve the repository boundaries and explain how the feature should be adapted

### Requirement: Repo-specific IM implementation skill shall produce implementation-oriented outputs

The repo-specific IM implementation skill MUST produce implementation-oriented outputs rather than abstract summaries.

#### Scenario: User asks for a feature spec or implementation path

- **WHEN** the skill is triggered for a repository-specific feature request
- **THEN** the output SHALL include core implementation paths, implementation steps, test cases, acceptance criteria, and repository validation guidance
