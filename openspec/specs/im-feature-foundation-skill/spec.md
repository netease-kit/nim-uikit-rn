# im-feature-foundation-skill Specification

## Purpose
TBD - created by archiving change formalize-im-foundation-skills. Update Purpose after archive.
## Requirements
### Requirement: Cross-project IM foundation skill shall define zero-to-one IM planning baseline
The repository SHALL provide a cross-project IM foundation skill that can guide a new project from zero to one without depending on a reference implementation.

#### Scenario: User asks for a new IM project plan
- **WHEN** a user asks how to build IM features in a new project without a reference project
- **THEN** the skill SHALL provide an architecture baseline, feature scope, module contracts, core implementation paths, and test cases

### Requirement: Cross-project IM foundation skill shall include reusable architecture and modeling references
The cross-project IM foundation skill MUST include reusable references for architecture blueprint, feature map, data models, SDK abstraction, delivery workflow, and testing matrix.

#### Scenario: User needs foundational IM design
- **WHEN** the skill is used for a new IM project
- **THEN** the skill SHALL be able to derive output from reusable reference artifacts instead of assuming repository-specific code exists

### Requirement: Cross-project IM foundation skill shall cover MVP and advanced feature packs
The cross-project IM foundation skill MUST cover both MVP IM capability planning and advanced IM capability planning.

#### Scenario: User asks for MVP feature set
- **WHEN** the user requests a minimal IM implementation
- **THEN** the skill SHALL provide a baseline that includes login, session list, and chat as the minimum closed loop

#### Scenario: User asks for advanced IM capabilities
- **WHEN** the user requests advanced message, media, relationship, team, or notification features
- **THEN** the skill SHALL provide core implementation paths and test cases for those feature packs

### Requirement: Cross-project IM foundation skill shall support cross-platform adaptation and project skeleton guidance
The cross-project IM foundation skill MUST define how route, storage, notification, file, permission, and network concerns adapt across platforms, and it MUST provide a first-pass code skeleton plus starter file templates for new projects.

#### Scenario: User asks for a cross-platform IM architecture
- **WHEN** the user requests a cross-platform IM plan
- **THEN** the skill SHALL identify the required adapters and provide a recommended code skeleton and minimum validation checklist

#### Scenario: User asks for starter files instead of only architecture
- **WHEN** the user requests the first code files for login, session, and chat flows
- **THEN** the skill SHALL provide starter service, store, and page templates along with the minimum call relationships between them

### Requirement: Cross-project IM foundation skill shall provide portable packaging guidance
The cross-project IM foundation skill MUST provide a portable packaging layer so the skill can be exported and installed into another repository without manually reconstructing its contents.

#### Scenario: User wants to move the skill to another repository
- **WHEN** a user asks to package or migrate the IM mother skill
- **THEN** the repository SHALL provide a portable package description, installation guidance, and an export mechanism for the skill directory

