## Why

The repository now contains substantial IM skill knowledge, but it is only embodied in skill files and not yet formalized as a durable repository capability. Without an OpenSpec contract, future contributors cannot tell which skill artifacts are required, what outcomes they must produce, or how the cross-project IM foundation skill relates to the repo-specific implementation skill.

## What Changes

- Formalize a cross-project `im-feature-foundation` capability that defines how a new project can plan and implement IM features from zero, including architecture, data models, feature maps, workflow, code skeletons, and testing matrices.
- Formalize a repo-specific `im2-feature-implementation` capability that captures how this repository’s existing IM features are implemented and how future feature work should map onto the current route/store/service boundaries.
- Define the required artifacts and outputs for both skills so they always include core implementation paths and test cases, and so they can be extended consistently in future work.
- Document how the foundation skill and the project-specific skill complement each other: one establishes a portable IM development baseline, the other adapts that baseline to the current repository.

## Capabilities

### New Capabilities
- `im-feature-foundation-skill`: Defines the cross-project IM mother skill, including architecture blueprint, delivery workflow, data models, cross-platform adaptation, code skeleton templates, advanced feature packs, and baseline testing matrices.
- `im2-feature-implementation-skill`: Defines the repository-specific implementation skill that maps IM features onto the current `im2-rn-demo` codebase and its existing route/store/service boundaries.

### Modified Capabilities
- none

## Impact

- `skills/im-feature-foundation/*`
- `skills/im2-feature-implementation/*`
- `openspec/changes/formalize-im-foundation-skills/*`
- Future agent-driven feature planning and implementation workflow in this repository
